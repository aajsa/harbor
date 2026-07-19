use std::process::{ExitStatus, Output, Stdio};
use std::time::Duration;
use tokio::io::AsyncReadExt;

pub async fn terminate_descendants(pid: u32) {
    #[cfg(unix)]
    {
        // yt-dlp may have a direct ffmpeg child. Target only children of the
        // Harbor-owned PID; never use a name-based process sweep.
        let mut command = tokio::process::Command::new("pkill");
        command.args(["-KILL", "-P", &pid.to_string()]);
        let _ = tokio::time::timeout(Duration::from_secs(2), command.status()).await;
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        let mut command = tokio::process::Command::new("taskkill");
        command
            .args(["/PID", &pid.to_string(), "/T", "/F"])
            .creation_flags(0x0800_0000);
        let _ = tokio::time::timeout(Duration::from_secs(2), command.status()).await;
    }
}

pub async fn output_with_timeout(
    command: &mut tokio::process::Command,
    timeout: Duration,
) -> Result<Output, String> {
    output_with_timeout_inner(command, timeout, None).await
}

pub async fn output_with_timeout_or_cancel(
    command: &mut tokio::process::Command,
    timeout: Duration,
    cancellation: &tokio_util::sync::CancellationToken,
) -> Result<Output, String> {
    output_with_timeout_inner(command, timeout, Some(cancellation)).await
}

async fn output_with_timeout_inner(
    command: &mut tokio::process::Command,
    timeout: Duration,
    cancellation: Option<&tokio_util::sync::CancellationToken>,
) -> Result<Output, String> {
    command
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);
    let mut child = command.spawn().map_err(|error| format!("spawn: {error}"))?;
    let mut stdout = child.stdout.take().ok_or("child stdout missing")?;
    let mut stderr = child.stderr.take().ok_or("child stderr missing")?;
    let stdout_task = tokio::spawn(async move {
        let mut bytes = Vec::new();
        stdout.read_to_end(&mut bytes).await.map(|_| bytes)
    });
    let stderr_task = tokio::spawn(async move {
        let mut bytes = Vec::new();
        stderr.read_to_end(&mut bytes).await.map(|_| bytes)
    });

    enum Completion {
        Exited(std::io::Result<ExitStatus>),
        TimedOut,
        Cancelled,
    }
    let completion = if let Some(cancellation) = cancellation {
        tokio::select! {
            result = child.wait() => Completion::Exited(result),
            _ = tokio::time::sleep(timeout) => Completion::TimedOut,
            _ = cancellation.cancelled() => Completion::Cancelled,
        }
    } else {
        tokio::select! {
            result = child.wait() => Completion::Exited(result),
            _ = tokio::time::sleep(timeout) => Completion::TimedOut,
        }
    };
    let status: ExitStatus = match completion {
        Completion::Exited(result) => result.map_err(|error| format!("wait: {error}"))?,
        Completion::TimedOut | Completion::Cancelled => {
            if let Some(pid) = child.id() {
                terminate_descendants(pid).await;
            }
            if child.kill().await.is_err() {
                let _ = child.wait().await;
            }
            let _ = stdout_task.await;
            let _ = stderr_task.await;
            return match completion {
                Completion::TimedOut => Err(format!("timed out after {} ms", timeout.as_millis())),
                Completion::Cancelled => Err("cancelled".to_string()),
                Completion::Exited(_) => unreachable!(),
            };
        }
    };
    let stdout = stdout_task
        .await
        .map_err(|error| format!("stdout join: {error}"))?
        .map_err(|error| format!("stdout read: {error}"))?;
    let stderr = stderr_task
        .await
        .map_err(|error| format!("stderr join: {error}"))?
        .map_err(|error| format!("stderr read: {error}"))?;
    Ok(Output {
        status,
        stdout,
        stderr,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{Duration, Instant};

    #[cfg(unix)]
    #[tokio::test]
    async fn timeout_kills_and_reaps_child() {
        let mut command = tokio::process::Command::new("sh");
        command.arg("-c").arg("sleep 30");
        let started = Instant::now();

        let error = output_with_timeout(&mut command, Duration::from_millis(50))
            .await
            .expect_err("slow child must time out");

        assert!(error.contains("timed out"));
        assert!(started.elapsed() < Duration::from_secs(2));
    }

    #[cfg(unix)]
    #[tokio::test]
    async fn cancellation_kills_and_reaps_child() {
        let cancellation = tokio_util::sync::CancellationToken::new();
        let trigger = cancellation.clone();
        tokio::spawn(async move {
            tokio::time::sleep(Duration::from_millis(50)).await;
            trigger.cancel();
        });
        let mut command = tokio::process::Command::new("sh");
        command.arg("-c").arg("sleep 30");

        let error =
            output_with_timeout_or_cancel(&mut command, Duration::from_secs(30), &cancellation)
                .await
                .expect_err("cancelled child must stop");

        assert_eq!(error, "cancelled");
    }

    #[cfg(unix)]
    #[tokio::test]
    async fn timeout_terminates_direct_descendants() {
        let marker_path =
            std::env::temp_dir().join(format!("harbor-process-tree-{}.pid", uuid::Uuid::new_v4()));
        let marker_arg = marker_path.to_string_lossy().to_string();
        let mut command = tokio::process::Command::new("sh");
        command
            .arg("-c")
            .arg(format!("sleep 30 & echo $! > '{}' && wait", marker_arg));

        output_with_timeout(&mut command, Duration::from_millis(100))
            .await
            .expect_err("process tree must time out");

        let child_pid: i32 = std::fs::read_to_string(&marker_path)
            .expect("read child pid")
            .trim()
            .parse()
            .expect("parse child pid");
        let process_state = std::process::Command::new("ps")
            .args(["-o", "state=", "-p", &child_pid.to_string()])
            .output()
            .expect("inspect descendant state");
        let state = String::from_utf8_lossy(&process_state.stdout);
        // A killed descendant can remain as a zombie until the runner's init
        // process reaps it. Zombies are terminated and execute no work, even
        // though kill(pid, 0) still reports that their PID exists.
        let running = state
            .trim()
            .chars()
            .next()
            .is_some_and(|state| state != 'Z');
        let _ = std::fs::remove_file(marker_path);
        assert!(!running, "descendant process survived timeout: {state}");
    }
}
