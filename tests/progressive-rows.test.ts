// @ts-expect-error Node test types are intentionally outside the browser-only tsconfig.
import assert from "node:assert/strict";
// @ts-expect-error Node test types are intentionally outside the browser-only tsconfig.
import test from "node:test";
import { upsertOrdered } from "../src/lib/progressive-rows.ts";

test("catalog rows render as requests settle while preserving configured order", () => {
  const order = ["hero", "popular", "new"];
  let rows: Array<{ key: string; value: number }> = [];

  rows = upsertOrdered(rows, { key: "new", value: 3 }, order);
  assert.deepEqual(
    rows.map((row) => row.key),
    ["new"],
  );

  rows = upsertOrdered(rows, { key: "hero", value: 1 }, order);
  assert.deepEqual(
    rows.map((row) => row.key),
    ["hero", "new"],
  );

  rows = upsertOrdered(rows, { key: "new", value: 4 }, order);
  assert.deepEqual(rows, [
    { key: "hero", value: 1 },
    { key: "new", value: 4 },
  ]);
});
