// @ts-expect-error Node test types are intentionally outside the browser-only tsconfig.
import assert from "node:assert/strict";
// @ts-expect-error Node test types are intentionally outside the browser-only tsconfig.
import test from "node:test";
import { startupCrashToHarborError } from "../src/lib/startup-crash.ts";

test("native panic recovery uses the existing opt-in error report experience", () => {
  const error = startupCrashToHarborError({
    kind: "panic",
    version: "1.2.3",
    platform: "macos",
    message: "boom",
    location: "src/main.rs:7:2",
    backtrace: "trace",
  });

  assert.equal(error.code, "NativePanic");
  assert.equal(error.title, "Previous native crash");
  assert.match(error.message, /crashed the last time/i);
  assert.match(error.detail ?? "", /Version: 1.2.3/);
  assert.match(error.detail ?? "", /Platform: macos/);
  assert.match(error.detail ?? "", /boom/);
  assert.match(error.detail ?? "", /trace/);
  assert.equal(error.fatal, false);
});

test("marker-only recovery explains an unclean shutdown without inventing a crash", () => {
  const error = startupCrashToHarborError({
    kind: "unclean",
    version: "1.2.3",
    platform: "linux",
    message: null,
    location: null,
    backtrace: null,
  });

  assert.equal(error.code, "UncleanShutdown");
  assert.equal(error.title, "Previous unclean shutdown");
  assert.match(error.message, /did not close correctly/i);
  assert.doesNotMatch(error.message, /crashed/i);
  assert.equal(error.fatal, false);
});
