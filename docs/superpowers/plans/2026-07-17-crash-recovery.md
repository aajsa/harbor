# Crash Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Detect a previous native panic or unclean shutdown and show Harbor's existing opt-in error report page after restart.

**Architecture:** A focused Rust module owns the marker, panic file, startup classification, and one Tauri command. `ErrorView` consumes that command once and maps the result into its existing local error state.

**Tech Stack:** Rust standard library, Tauri 2 commands, React 19, TypeScript node tests.

## Global Constraints

- Keep one report capped at 64 KiB.
- Do not upload in the background.
- Reuse the existing `ErrorView` and `Submit report` flow.
- Keep platform-specific behavior out of the frontend.

---

### Task 1: Native Crash Lifecycle

**Files:**

- Create: `src-tauri/src/crash_report.rs`
- Modify: `src-tauri/src/lib.rs`

**Interfaces:**

- Produces: `initialize(&AppHandle)`, `mark_clean_exit()`, and `take_startup_crash_report() -> Option<StartupCrashReport>`.

- [ ] **Step 1: Write failing Rust tests**

Add unit tests that create a temporary crash directory and verify panic report classification, marker-only classification, report truncation, one-time consumption, and clean marker deletion.

- [ ] **Step 2: Verify the tests fail**

Run: `cargo test --manifest-path src-tauri/Cargo.toml crash_report::tests`

Expected: FAIL because `crash_report` does not exist.

- [ ] **Step 3: Implement the minimal module**

Use one `OnceLock<Mutex<Option<StartupCrashReport>>>`, one `OnceLock<PathBuf>` for the marker, a 64 KiB bounded JSON writer, and a panic hook that preserves Rust's previous hook.

- [ ] **Step 4: Integrate startup and shutdown**

Call `crash_report::initialize` first in Tauri setup, call `mark_clean_exit` from `shutdown_services`, and register `take_startup_crash_report` in `generate_handler!`.

- [ ] **Step 5: Verify native behavior**

Run: `cargo test --manifest-path src-tauri/Cargo.toml crash_report::tests`

Expected: all crash recovery tests pass.

### Task 2: Startup Recovery UI

**Files:**

- Create: `src/lib/startup-crash.ts`
- Modify: `src/components/error-view.tsx`
- Test: `tests/startup-crash.test.ts`

**Interfaces:**

- Consumes: native `StartupCrashReport` with `kind`, `version`, `platform`, `message`, `location`, and `backtrace`.
- Produces: `startupCrashToHarborError(report) -> HarborError`.

- [ ] **Step 1: Write failing frontend tests**

Test panic copy and generic unclean-shutdown copy, including technical detail and fatal=false behavior.

- [ ] **Step 2: Verify the tests fail**

Run: `node --test tests/startup-crash.test.ts`

Expected: FAIL because `startup-crash.ts` does not exist.

- [ ] **Step 3: Implement report mapping**

Return concise user-facing English copy and preserve native details only in the technical report body.

- [ ] **Step 4: Load once from ErrorView**

Invoke `take_startup_crash_report` after listeners are installed, set the mapped error locally, and ignore command failures or non-Tauri web builds.

- [ ] **Step 5: Verify frontend behavior**

Run: `node --test tests/startup-crash.test.ts && vp run typecheck`

Expected: tests and typecheck pass.

### Task 3: Final Verification and PR Update

**Files:**

- Verify all files changed by Tasks 1-2.

- [ ] **Step 1: Run project checks**

Run `vp check` on changed files, `pnpm test`, `pnpm build`, `cargo check --manifest-path src-tauri/Cargo.toml`, and both Rust test suites.

- [ ] **Step 2: Commit and push**

Commit with `fix(crash): report previous native failures` and push `fix/reliability-lifecycle` so PR #898 updates.
