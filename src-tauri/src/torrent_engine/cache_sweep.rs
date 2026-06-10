use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

const GIB: u64 = 1024 * 1024 * 1024;
pub const CAP_BYTES: u64 = 10 * GIB;

pub fn run(dir: &Path, cap: u64) {
    let Ok(entries) = fs::read_dir(dir) else { return };
    let mut items: Vec<(PathBuf, SystemTime, u64)> = entries
        .flatten()
        .filter_map(|e| {
            let md = e.metadata().ok()?;
            let modified = md.modified().unwrap_or(SystemTime::UNIX_EPOCH);
            let size = if md.is_dir() { tree_size(&e.path()) } else { md.len() };
            Some((e.path(), modified, size))
        })
        .collect();
    let mut total: u64 = items.iter().map(|(_, _, s)| *s).sum();
    if total <= cap {
        return;
    }
    eprintln!(
        "[torrent-engine] cache at {:.2} GiB exceeds {:.0} GiB cap, sweeping oldest first",
        total as f64 / GIB as f64,
        cap as f64 / GIB as f64
    );
    items.sort_by_key(|(_, modified, _)| *modified);
    for (path, _, size) in items {
        if total <= cap {
            break;
        }
        let removed = if path.is_dir() {
            fs::remove_dir_all(&path).is_ok()
        } else {
            fs::remove_file(&path).is_ok()
        };
        if removed {
            total = total.saturating_sub(size);
            eprintln!(
                "[torrent-engine] swept {} ({:.2} GiB)",
                path.display(),
                size as f64 / GIB as f64
            );
        }
    }
}

fn tree_size(path: &Path) -> u64 {
    let Ok(entries) = fs::read_dir(path) else { return 0 };
    entries
        .flatten()
        .filter_map(|e| {
            let md = e.metadata().ok()?;
            Some(if md.is_dir() { tree_size(&e.path()) } else { md.len() })
        })
        .sum()
}
