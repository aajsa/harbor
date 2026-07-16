# Performance Resource Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bound Harbor's metadata request fan-out and guarantee ownership cleanup for thumbnail `mpv` workers on Windows, macOS, and Linux.

**Architecture:** A reusable TypeScript scheduler limits and coalesces provider work before it crosses the Tauri boundary. TMDB uses Harbor's existing shared Rust HTTP client, whose semaphore becomes platform-independent, while thumbnail processes become kill-on-drop children with deterministic reap cleanup.

**Tech Stack:** React 19, TypeScript, Node test runner, Tauri 2, Rust, Tokio, reqwest.

## Global Constraints

- Preserve metadata badges, poster providers, and thumbnail previews.
- Support Windows, macOS, and Linux without platform-specific process scanning.
- Do not merge this branch into `main`.
- Do not modify the liquid-glass work from the user's other branch.
- Follow red-green TDD for new TypeScript behavior.

---

### Task 1: Reusable request scheduler

**Files:**

- Create: `src/lib/request-scheduler.ts`
- Create: `tests/request-scheduler.test.ts`

**Interfaces:**

- Produces: `createRequestScheduler(options)` returning `schedule<T>(key, task)`, `pauseFor(ms)`, and `snapshot()`.
- `snapshot()` reports `{ active, queued, inFlight }` for diagnostics without exposing mutable internals.

- [ ] **Step 1: Write failing scheduler tests**

Create tests that hold deferred promises and assert:

```ts
const scheduler = createRequestScheduler({ concurrency: 2 });
const first = scheduler.schedule("first", () => deferredA.promise);
const duplicate = scheduler.schedule("first", () => Promise.resolve("wrong"));
const second = scheduler.schedule("second", () => deferredB.promise);
const third = scheduler.schedule("third", () => Promise.resolve("third"));

assert.equal(first, duplicate);
assert.deepEqual(scheduler.snapshot(), { active: 2, queued: 1, inFlight: 3 });
```

Add separate assertions that a rejected job releases capacity and that `pauseFor(20)` prevents queued work from starting until the pause expires.

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm test -- tests/request-scheduler.test.ts`

Expected: FAIL because `src/lib/request-scheduler.ts` does not exist.

- [ ] **Step 3: Implement the minimal scheduler**

Implement a FIFO queue with this public shape:

```ts
export type RequestScheduler = {
  schedule<T>(key: string, task: () => Promise<T>): Promise<T>;
  pauseFor(milliseconds: number): void;
  snapshot(): { active: number; queued: number; inFlight: number };
};

export function createRequestScheduler(options: { concurrency: number }): RequestScheduler;
```

Store one promise per key, delete it in settlement cleanup, decrement `active` in `finally`, and resume draining through one pause timer. Reject invalid concurrency at construction.

- [ ] **Step 4: Run focused and full tests**

Run: `pnpm test -- tests/request-scheduler.test.ts`

Expected: scheduler tests PASS.

Run: `pnpm test`

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/request-scheduler.ts tests/request-scheduler.test.ts
git commit -m "feat: add bounded request scheduler"
```

### Task 2: Route TMDB through bounded shared HTTP

**Files:**

- Modify: `src/lib/providers/tmdb/tmdb-client.ts`
- Modify: `src-tauri/src/http_fetch.rs`
- Create: `tests/http-resource-limit.test.ts`

**Interfaces:**

- Consumes: `createRequestScheduler({ concurrency: 6 })` from Task 1.
- Preserves: `get<T>(key, path, params): Promise<T | null>`.
- Preserves: Tauri command `harbor_fetch(args): Result<HarborFetchResponse, String>`.

- [ ] **Step 1: Add failing transport-boundary assertions**

Create `tests/http-resource-limit.test.ts`. Read the TMDB client and Rust HTTP source and assert that TMDB imports `safeFetch` and the request scheduler, does not import `@tauri-apps/plugin-http`, and Rust does not contain an OS-specific fetch-limit gate. This guards the architectural boundary that the profiler identified.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- tests/http-resource-limit.test.ts`

Expected: FAIL because TMDB still imports the Tauri HTTP plugin and Rust still limits only Linux.

- [ ] **Step 3: Change TMDB transport and retry coordination**

In `tmdb-client.ts`:

```ts
import { createRequestScheduler } from "@/lib/request-scheduler";
import { safeFetch } from "@/lib/safe-fetch";

const tmdbRequests = createRequestScheduler({ concurrency: 6 });
```

Replace the direct `@tauri-apps/plugin-http` call with:

```ts
return tmdbRequests.schedule(url, () =>
  safeFetch(url, { method: "GET", headers: { Accept: "application/json" } }),
);
```

When a response is `429` or `5xx`, call `tmdbRequests.pauseFor(backoffMs)` before the bounded retry. Preserve the existing null/error behavior and four-attempt maximum.

In `http_fetch.rs`, remove the OS gate and always acquire one permit from the process-wide semaphore:

```rust
async fn acquire_fetch_permit() -> Result<SemaphorePermit<'static>, String> {
    fetch_semaphore()
        .acquire()
        .await
        .map_err(|error| format!("semaphore: {error}"))
}
```

Keep the existing static `reqwest::Client`, pooling configuration, and timeout.

- [ ] **Step 4: Verify TypeScript and Rust**

Run: `pnpm test`

Expected: all tests PASS.

Run: `vp run typecheck`

Expected: exit 0.

Run: `cargo check --manifest-path src-tauri/Cargo.toml`

Expected: exit 0 with no new warnings.

- [ ] **Step 5: Commit**

```bash
git add src/lib/providers/tmdb/tmdb-client.ts src-tauri/src/http_fetch.rs tests/http-resource-limit.test.ts
git commit -m "fix: bound desktop metadata requests"
```

### Task 3: Own and reap thumbnail workers

**Files:**

- Modify: `src-tauri/src/thumbs.rs`

**Interfaces:**

- Preserves Tauri commands: `thumbs_set_url`, `thumbs_spawn_eager`, `thumbs_get`, and `thumbs_stop`.
- Strengthens invariant: each `Shadow` exclusively owns one child that cannot outlive the owner during normal cleanup.

- [ ] **Step 1: Capture the lifecycle failure as a source-level regression test**

Create `tests/native-resource-lifecycle.test.ts` that reads `src-tauri/src/thumbs.rs` and initially asserts the required ownership calls:

```ts
assert.match(source, /kill_on_drop\(true\)/);
assert.match(source, /child\.wait\(\)\.await/);
```

This seam guards the exact cross-platform Tokio contract because process-liveness integration tests would require different OS APIs and introduce flaky timing.

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm test -- tests/native-resource-lifecycle.test.ts`

Expected: FAIL because both ownership guarantees are absent.

- [ ] **Step 3: Implement deterministic child cleanup**

When configuring the thumbnail command, add:

```rust
cmd.kill_on_drop(true);
```

In `drop_shadow`, send graceful quit, wait briefly, force termination only if `try_wait()` says the child is still running, then reap it:

```rust
if shadow.child.try_wait().ok().flatten().is_none() {
    let _ = shadow.child.start_kill();
}
let _ = shadow.child.wait().await;
```

Continue removing the IPC socket and cache directory after the child has exited.

- [ ] **Step 4: Verify focused tests and Rust**

Run: `pnpm test -- tests/native-resource-lifecycle.test.ts`

Expected: PASS.

Run: `cargo check --manifest-path src-tauri/Cargo.toml`

Expected: exit 0 with no new warnings.

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/thumbs.rs tests/native-resource-lifecycle.test.ts
git commit -m "fix: terminate thumbnail workers with Harbor"
```

### Task 4: Final verification and macOS performance check

**Files:**

- Modify only if a verification failure directly requires it.

**Interfaces:**

- Produces evidence for tests, static checks, CPU/memory behavior, socket fan-out, and thumbnail cleanup.

- [ ] **Step 1: Run repository-required checks**

Run:

```bash
vp check src/lib/request-scheduler.ts tests/request-scheduler.test.ts \
  src/lib/providers/tmdb/tmdb-client.ts src-tauri/src/http_fetch.rs tests/http-resource-limit.test.ts \
  src-tauri/src/thumbs.rs tests/native-resource-lifecycle.test.ts
vp run typecheck
cargo check --manifest-path src-tauri/Cargo.toml
pnpm test
```

Expected: every command exits 0 with no introduced warning or error.

- [ ] **Step 2: Launch and sample Harbor**

Run Harbor from this worktree, perform one cold home load, and capture `ps`, `lsof`, and a five-second `sample` report. Confirm the process does not reproduce the hundreds of simultaneous TMDB plugin connections or multi-gigabyte growth observed in the baseline.

- [ ] **Step 3: Verify thumbnail shutdown**

Start one trickplay preview, close Harbor normally, then run:

```bash
ps -axo pid,ppid,etime,command | rg 'harbor-thumbs-' | rg -v rg
```

Expected: no thumbnail process created by this run remains.

- [ ] **Step 4: Review branch state**

Run: `git status --short && git log --oneline main..HEAD`

Expected: clean worktree and only the design, plan, and focused implementation commits. Do not merge.
