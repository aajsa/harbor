# Manual Picker Search Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure Manual Picker always leaves its searching presentation and shows partial results or a retryable terminal state.

**Architecture:** Bound add-on manifest hydration inside add-on discovery so one unresponsive manifest cannot prevent the picker pipeline from starting. Retain each original add-on when hydration fails or times out, allowing existing stream request timeouts and partial-result handling to continue unchanged.

**Tech Stack:** React, TypeScript, Vitest project tooling, VitePlus (`vp`)

## Global Constraints

- Do not change Instant Play behavior.
- Do not modify stream ranking, selection, debrid selection, or player source switching.
- Do not add unit tests; the user will verify the Manual Picker interactively.
- Run `vp check` for changed files and `vp run typecheck` after TypeScript changes.

---

### Task 1: Bound Add-on Manifest Hydration

**Files:**

- Modify: `src/views/play-picker/use-addons.ts`

**Interfaces:**

- Consumes: `fetchManifestAt(url): Promise<AddonManifest | null>` and the existing `Addon[]` discovery list.
- Produces: `resolveManifests(addons): Promise<Addon[]>` that settles even when one manifest request never settles.

- [x] **Step 1: Add a bounded manifest fallback**

Add a small helper that races manifest loading against a timeout and returns the original add-on when loading fails or exceeds the bound. Apply it independently to each add-on so successful manifest responses remain usable.

- [x] **Step 2: Preserve cancellation and pipeline behavior**

Keep the existing cancellation checks before state updates and leave `usePipelineResult`, stream ranking, partial results, and Instant Play untouched.

- [x] **Step 3: Run required checks**

Run `vp check src/views/play-picker/use-addons.ts` and expect no warnings or errors. Run `vp run typecheck` and expect a zero exit status.

- [x] **Step 4: Commit the implementation**

Stage `src/views/play-picker/use-addons.ts` and this plan, then commit with `fix: bound manual picker addon discovery`.
