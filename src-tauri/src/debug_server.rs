use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::VecDeque;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Manager, State as TauriState};
use tokio::sync::{oneshot, Mutex, RwLock};
use uuid::Uuid;

const DEFAULT_PORT: u16 = 47788;
const LOG_BUFFER_CAPACITY: usize = 2000;
const TRIGGER_TIMEOUT_SECS: u64 = 30;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DebugLogEntry {
    pub at: u64,
    pub level: String,
    pub args: Vec<String>,
    pub source: Option<String>,
}

#[derive(Default)]
pub struct DebugInner {
    pub state: Option<Value>,
    pub state_at: u64,
    pub logs: VecDeque<DebugLogEntry>,
    pub started_at: u64,
}

pub struct DebugState {
    pub inner: RwLock<DebugInner>,
    pub pending: Mutex<std::collections::HashMap<String, oneshot::Sender<Value>>>,
}

impl DebugState {
    pub fn new() -> Arc<Self> {
        Arc::new(Self {
            inner: RwLock::new(DebugInner {
                started_at: now_ms(),
                ..Default::default()
            }),
            pending: Mutex::new(std::collections::HashMap::new()),
        })
    }
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

#[tauri::command]
pub async fn harbor_debug_push_state(
    state: TauriState<'_, Arc<DebugState>>,
    snapshot: Value,
) -> Result<(), String> {
    let mut g = state.inner.write().await;
    g.state = Some(snapshot);
    g.state_at = now_ms();
    Ok(())
}

#[tauri::command]
pub async fn harbor_debug_push_log(
    state: TauriState<'_, Arc<DebugState>>,
    level: String,
    args: Vec<String>,
    source: Option<String>,
) -> Result<(), String> {
    let mut g = state.inner.write().await;
    if g.logs.len() >= LOG_BUFFER_CAPACITY {
        g.logs.pop_front();
    }
    g.logs.push_back(DebugLogEntry {
        at: now_ms(),
        level,
        args,
        source,
    });
    Ok(())
}

#[tauri::command]
pub async fn harbor_debug_resolve(
    state: TauriState<'_, Arc<DebugState>>,
    request_id: String,
    result: Value,
) -> Result<(), String> {
    let mut pending = state.pending.lock().await;
    if let Some(tx) = pending.remove(&request_id) {
        let _ = tx.send(result);
    }
    Ok(())
}

#[tauri::command]
pub fn harbor_debug_is_enabled() -> bool {
    std::env::var("HARBOR_DEBUG").unwrap_or_default() == "1"
}

#[derive(Clone)]
struct ServerState {
    debug: Arc<DebugState>,
    app: AppHandle,
}

pub fn maybe_start(app: &AppHandle, debug_state: Arc<DebugState>) {
    if std::env::var("HARBOR_DEBUG").unwrap_or_default() != "1" {
        return;
    }
    let port = std::env::var("HARBOR_DEBUG_PORT")
        .ok()
        .and_then(|s| s.parse::<u16>().ok())
        .unwrap_or(DEFAULT_PORT);
    let app_handle = app.clone();
    let server_state = ServerState {
        debug: debug_state,
        app: app_handle,
    };
    tauri::async_runtime::spawn(async move {
        if let Err(e) = run_server(server_state, port).await {
            eprintln!("[harbor::debug] server error: {}", e);
        }
    });
    eprintln!("[harbor::debug] HTTP server bound to 127.0.0.1:{}", port);
}

async fn run_server(state: ServerState, port: u16) -> Result<(), String> {
    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .route("/state", get(get_state))
        .route("/console", get(get_console))
        .route("/screenshot", get(get_screenshot))
        .route("/pipeline", get(trigger_pipeline))
        .route("/invoke", post(trigger_invoke))
        .route("/window", get(get_window_info))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(("127.0.0.1", port))
        .await
        .map_err(|e| format!("bind: {}", e))?;
    axum::serve(listener, app)
        .await
        .map_err(|e| format!("serve: {}", e))?;
    Ok(())
}

async fn root() -> impl IntoResponse {
    Json(json!({
        "name": "harbor-debug",
        "version": 1,
        "endpoints": [
            "GET  /health",
            "GET  /state",
            "GET  /console?limit=200&since=<ms>&level=<info|warn|error>",
            "GET  /screenshot",
            "GET  /pipeline?metaId=<id>&season=<n>&episode=<n>",
            "POST /invoke  body={cmd, args}",
            "GET  /window"
        ]
    }))
}

async fn health(State(s): State<ServerState>) -> impl IntoResponse {
    let g = s.debug.inner.read().await;
    let uptime_sec = (now_ms() - g.started_at) / 1000;
    Json(json!({
        "ok": true,
        "version": 1,
        "uptimeSec": uptime_sec,
        "stateAt": g.state_at,
        "stateAvailable": g.state.is_some(),
        "logCount": g.logs.len(),
    }))
}

async fn get_state(State(s): State<ServerState>) -> impl IntoResponse {
    let g = s.debug.inner.read().await;
    match &g.state {
        Some(v) => Json(json!({ "ok": true, "at": g.state_at, "state": v })).into_response(),
        None => (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(json!({ "ok": false, "error": "no-state-yet" })),
        )
            .into_response(),
    }
}

#[derive(Deserialize)]
struct ConsoleQuery {
    limit: Option<usize>,
    since: Option<u64>,
    level: Option<String>,
}

async fn get_console(
    Query(q): Query<ConsoleQuery>,
    State(s): State<ServerState>,
) -> impl IntoResponse {
    let g = s.debug.inner.read().await;
    let limit = q.limit.unwrap_or(200).min(LOG_BUFFER_CAPACITY);
    let since = q.since.unwrap_or(0);
    let level_filter = q.level.as_deref();
    let mut out: Vec<&DebugLogEntry> = g
        .logs
        .iter()
        .filter(|e| e.at >= since)
        .filter(|e| match level_filter {
            Some(l) => e.level == l,
            None => true,
        })
        .collect();
    if out.len() > limit {
        out = out.split_off(out.len() - limit);
    }
    Json(json!({
        "ok": true,
        "count": out.len(),
        "logs": out,
    }))
}

async fn get_window_info(State(s): State<ServerState>) -> impl IntoResponse {
    let win = match s.app.get_webview_window("main") {
        Some(w) => w,
        None => {
            return (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(json!({ "ok": false, "error": "no-main-window" })),
            )
                .into_response();
        }
    };
    let pos = win.outer_position().ok();
    let size = win.outer_size().ok();
    let inner = win.inner_size().ok();
    let visible = win.is_visible().unwrap_or(false);
    let focused = win.is_focused().unwrap_or(false);
    let fullscreen = win.is_fullscreen().unwrap_or(false);
    Json(json!({
        "ok": true,
        "outerPos": pos.map(|p| json!({ "x": p.x, "y": p.y })),
        "outerSize": size.map(|s| json!({ "w": s.width, "h": s.height })),
        "innerSize": inner.map(|s| json!({ "w": s.width, "h": s.height })),
        "visible": visible,
        "focused": focused,
        "fullscreen": fullscreen,
    }))
    .into_response()
}

async fn get_screenshot(State(s): State<ServerState>) -> impl IntoResponse {
    let win = match s.app.get_webview_window("main") {
        Some(w) => w,
        None => {
            return (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(json!({ "ok": false, "error": "no-main-window" })),
            )
                .into_response();
        }
    };
    match capture_window(&win).await {
        Ok(b64) => Json(json!({ "ok": true, "format": "png", "base64": b64 })).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "ok": false, "error": e })),
        )
            .into_response(),
    }
}

#[cfg(windows)]
async fn capture_window(win: &tauri::WebviewWindow) -> Result<String, String> {
    use base64::{engine::general_purpose, Engine as _};
    use windows::Win32::Foundation::HWND;
    use windows::Win32::Graphics::Gdi::{
        BitBlt, CreateCompatibleBitmap, CreateCompatibleDC, DeleteDC, DeleteObject, GetDC,
        GetDIBits, ReleaseDC, SelectObject, BI_RGB, BITMAPINFO, BITMAPINFOHEADER,
        DIB_RGB_COLORS, SRCCOPY,
    };
    let hwnd = win.hwnd().map_err(|e| format!("hwnd: {}", e))?;
    let size = win.inner_size().map_err(|e| format!("size: {}", e))?;
    let w = size.width as i32;
    let h = size.height as i32;
    if w <= 0 || h <= 0 {
        return Err("invalid window size".to_string());
    }
    unsafe {
        let hdc_window = GetDC(Some(HWND(hwnd.0 as *mut _)));
        if hdc_window.is_invalid() {
            return Err("GetDC failed".to_string());
        }
        let hdc_mem = CreateCompatibleDC(Some(hdc_window));
        let bmp = CreateCompatibleBitmap(hdc_window, w, h);
        let _old = SelectObject(hdc_mem, bmp.into());
        let _ = BitBlt(hdc_mem, 0, 0, w, h, Some(hdc_window), 0, 0, SRCCOPY);

        let mut bmp_info = BITMAPINFO {
            bmiHeader: BITMAPINFOHEADER {
                biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                biWidth: w,
                biHeight: -h,
                biPlanes: 1,
                biBitCount: 32,
                biCompression: BI_RGB.0,
                biSizeImage: 0,
                biXPelsPerMeter: 0,
                biYPelsPerMeter: 0,
                biClrUsed: 0,
                biClrImportant: 0,
            },
            bmiColors: [Default::default(); 1],
        };
        let stride = (w * 4) as usize;
        let mut pixels = vec![0u8; stride * h as usize];
        let _ = GetDIBits(
            hdc_mem,
            bmp,
            0,
            h as u32,
            Some(pixels.as_mut_ptr() as *mut _),
            &mut bmp_info as *mut _,
            DIB_RGB_COLORS,
        );

        let _ = DeleteObject(bmp.into());
        let _ = DeleteDC(hdc_mem);
        ReleaseDC(Some(HWND(hwnd.0 as *mut _)), hdc_window);

        let mut rgba = Vec::with_capacity((w * h * 4) as usize);
        for chunk in pixels.chunks_exact(4) {
            rgba.push(chunk[2]);
            rgba.push(chunk[1]);
            rgba.push(chunk[0]);
            rgba.push(chunk[3]);
        }

        let mut png_bytes: Vec<u8> = Vec::new();
        {
            let mut encoder = png::Encoder::new(&mut png_bytes, w as u32, h as u32);
            encoder.set_color(png::ColorType::Rgba);
            encoder.set_depth(png::BitDepth::Eight);
            let mut writer = encoder.write_header().map_err(|e| format!("png header: {}", e))?;
            writer
                .write_image_data(&rgba)
                .map_err(|e| format!("png write: {}", e))?;
        }
        Ok(general_purpose::STANDARD.encode(&png_bytes))
    }
}

#[cfg(not(windows))]
async fn capture_window(_win: &tauri::WebviewWindow) -> Result<String, String> {
    Err("screenshot only implemented on Windows".to_string())
}

#[derive(Deserialize)]
struct PipelineQuery {
    #[serde(rename = "metaId")]
    meta_id: String,
    #[serde(rename = "mediaType")]
    media_type: Option<String>,
    season: Option<i32>,
    episode: Option<i32>,
}

async fn trigger_pipeline(
    Query(q): Query<PipelineQuery>,
    State(s): State<ServerState>,
) -> impl IntoResponse {
    let request_id = Uuid::new_v4().to_string();
    let (tx, rx) = oneshot::channel::<Value>();
    {
        let mut pending = s.debug.pending.lock().await;
        pending.insert(request_id.clone(), tx);
    }
    let payload = json!({
        "requestId": request_id,
        "metaId": q.meta_id,
        "mediaType": q.media_type.unwrap_or_else(|| "movie".to_string()),
        "season": q.season,
        "episode": q.episode,
    });
    if let Err(e) = s.app.emit("harbor-debug://pipeline", payload) {
        let mut pending = s.debug.pending.lock().await;
        pending.remove(&request_id);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "ok": false, "error": format!("emit: {}", e) })),
        )
            .into_response();
    }
    match tokio::time::timeout(std::time::Duration::from_secs(TRIGGER_TIMEOUT_SECS), rx).await {
        Ok(Ok(value)) => Json(json!({ "ok": true, "result": value })).into_response(),
        Ok(Err(_)) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "ok": false, "error": "channel-dropped" })),
        )
            .into_response(),
        Err(_) => {
            let mut pending = s.debug.pending.lock().await;
            pending.remove(&request_id);
            (
                StatusCode::GATEWAY_TIMEOUT,
                Json(json!({ "ok": false, "error": "frontend-timeout" })),
            )
                .into_response()
        }
    }
}

#[derive(Deserialize)]
struct InvokeBody {
    cmd: String,
    args: Option<Value>,
}

async fn trigger_invoke(
    State(s): State<ServerState>,
    Json(body): Json<InvokeBody>,
) -> impl IntoResponse {
    let request_id = Uuid::new_v4().to_string();
    let (tx, rx) = oneshot::channel::<Value>();
    {
        let mut pending = s.debug.pending.lock().await;
        pending.insert(request_id.clone(), tx);
    }
    let payload = json!({
        "requestId": request_id,
        "cmd": body.cmd,
        "args": body.args.unwrap_or(Value::Null),
    });
    if let Err(e) = s.app.emit("harbor-debug://invoke", payload) {
        let mut pending = s.debug.pending.lock().await;
        pending.remove(&request_id);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "ok": false, "error": format!("emit: {}", e) })),
        )
            .into_response();
    }
    match tokio::time::timeout(std::time::Duration::from_secs(TRIGGER_TIMEOUT_SECS), rx).await {
        Ok(Ok(value)) => Json(json!({ "ok": true, "result": value })).into_response(),
        Ok(Err(_)) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "ok": false, "error": "channel-dropped" })),
        )
            .into_response(),
        Err(_) => {
            let mut pending = s.debug.pending.lock().await;
            pending.remove(&request_id);
            (
                StatusCode::GATEWAY_TIMEOUT,
                Json(json!({ "ok": false, "error": "frontend-timeout" })),
            )
                .into_response()
        }
    }
}
