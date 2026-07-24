/**
 * @jest-environment node
 *
 * SSR ("no window") test for src/lib/safeStorage.ts, isolated into its own
 * `node`-environment file. jest-environment-jsdom 30 made the global
 * `window` a non-configurable accessor, so `delete global.window` (the
 * technique previously used in safeStorage.test.ts) now throws instead of
 * emulating SSR. The plain `node` test environment has no `window` at all,
 * which is exactly the condition being tested.
 */

test("degrades to in-memory fallback in SSR (no window)", () => {
  const { setItem: ssrSet, getItem: ssrGet } = require("../safeStorage");
  expect(ssrSet("ssr-key", "ssr-val")).toBe(true);
  expect(ssrGet("ssr-key")).toBe("ssr-val");
});
