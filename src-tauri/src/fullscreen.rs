use tauri::{AppHandle, Emitter, Manager, State};

pub struct FullscreenState;

impl FullscreenState {
    pub fn new() -> Self {
        Self
    }
}

#[tauri::command]
pub async fn window_fullscreen_enter(
    app: AppHandle,
    _state: State<'_, FullscreenState>,
) -> Result<(), String> {
    let main = app
        .get_webview_window("main")
        .ok_or_else(|| "main window missing".to_string())?;

    let already_fs = main.is_fullscreen().unwrap_or(false);
    if !already_fs {
        main.set_fullscreen(true)
            .map_err(|e| format!("set_fullscreen(true): {}", e))?;
    }
    let _ = main.set_focus();
    let _ = app.emit_to("main", "fs://entered", ());
    Ok(())
}

#[tauri::command]
pub async fn window_fullscreen_exit(
    app: AppHandle,
    _state: State<'_, FullscreenState>,
) -> Result<(), String> {
    let main = app
        .get_webview_window("main")
        .ok_or_else(|| "main window missing".to_string())?;

    let is_fs = main.is_fullscreen().unwrap_or(false);
    if is_fs {
        main.set_fullscreen(false)
            .map_err(|e| format!("set_fullscreen(false): {}", e))?;
    }
    let _ = app.emit_to("main", "fs://exited", ());
    Ok(())
}
