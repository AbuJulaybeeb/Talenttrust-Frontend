import {
  getItem,
  MAX_VALUE_BYTES,
  setItem,
  removeItem,
  resetCache,
} from "../safeStorage";
import { setErrorReporter } from "../errorReporter";

describe("safeStorage", () => {
  let originalLocalStorage: Storage;
  let originalWindow: typeof window & typeof globalThis;
  let consoleWarnSpy: jest.SpyInstance;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
    originalWindow = global.window;
    originalNodeEnv = process.env.NODE_ENV;
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    resetCache();
    jest.resetModules();
  });

  afterEach(() => {
    global.window = originalWindow;
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    (process.env as any).NODE_ENV = originalNodeEnv;
    delete process.env.NEXT_PUBLIC_SAFE_STORAGE_MAX_VALUE_BYTES;
    setErrorReporter(null);
    consoleWarnSpy.mockRestore();
  });

  it("behaves normally when localStorage is fully functional", () => {
    expect(setItem("test-key", "test-value")).toBe(true);
    expect(getItem("test-key")).toBe("test-value");
    expect(window.localStorage.getItem("test-key")).toBe("test-value");

    removeItem("test-key");
    expect(getItem("test-key")).toBeNull();
    expect(window.localStorage.getItem("test-key")).toBeNull();
  });

  // "degrades to in-memory fallback in SSR (no window)" moved to
  // safeStorage.ssr.test.ts under the `node` test environment: jsdom 30 made
  // the global `window` a non-configurable accessor, so `delete
  // global.window` can no longer simulate SSR from within this jsdom file.

  it("degrades to in-memory fallback when localStorage is disabled (throws on access)", () => {
    // Simulate disabled storage by throwing on localStorage access
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("SecurityError: The operation is insecure.");
      },
      configurable: true,
    });

    jest.isolateModules(() => {
      const {
        setItem: disabledSet,
        getItem: disabledGet,
      } = require("../safeStorage");
      expect(disabledSet("disabled-key", "disabled-val")).toBe(true);
      expect(disabledGet("disabled-key")).toBe("disabled-val");
    });
  });

  it("handles quota exceeded error on write and falls back to in-memory", () => {
    const setItemMock = jest.fn().mockImplementation((key) => {
      if (key === "__storage_test__") {
        return;
      }
      throw new Error("QuotaExceededError: The quota has been exceeded.");
    });

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: () => null,
        setItem: setItemMock,
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      },
      configurable: true,
      writable: true,
    });

    jest.isolateModules(() => {
      const {
        setItem: quotaSet,
        getItem: quotaGet,
      } = require("../safeStorage");
      expect(quotaSet("quota-key", "quota-val")).toBe(true);
      expect(setItemMock).toHaveBeenCalledWith("quota-key", "quota-val");
      expect(quotaGet("quota-key")).toBe("quota-val");
    });
  });

  it("handles errors during reading and falls back to in-memory", () => {
    const getItemMock = jest.fn().mockImplementation(() => {
      throw new Error("SecurityError: Read forbidden.");
    });

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: getItemMock,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      },
      configurable: true,
      writable: true,
    });

    jest.isolateModules(() => {
      const { setItem: readSet, getItem: readGet } = require("../safeStorage");
      expect(readSet("read-key", "read-val")).toBe(true);
      expect(readGet("read-key")).toBe("read-val");
      expect(getItemMock).toHaveBeenCalledWith("read-key");
    });
  });

  it("logs warning at most once in development and never in production", () => {
    // 1. In production, no warnings should be logged
    (process.env as any).NODE_ENV = "production";

    // Simulate disabled storage
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("SecurityError");
      },
      configurable: true,
    });

    jest.isolateModules(() => {
      const { getItem: prodGet } = require("../safeStorage");
      prodGet("any-key");
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    // 2. In development, warning is logged at most once
    (process.env as any).NODE_ENV = "development";

    jest.isolateModules(() => {
      const { getItem: devGet } = require("../safeStorage");
      devGet("any-key");
      devGet("another-key");
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("accepts values below and exactly at the configured byte cap", () => {
    const underCapValue = "a".repeat(MAX_VALUE_BYTES / 2 - 1);
    const exactCapValue = "b".repeat(MAX_VALUE_BYTES / 2);

    expect(setItem("under-cap-key", underCapValue)).toBe(true);
    expect(setItem("exact-cap-key", exactCapValue)).toBe(true);

    expect(window.localStorage.getItem("under-cap-key")).toBe(underCapValue);
    expect(window.localStorage.getItem("exact-cap-key")).toBe(exactCapValue);
  });

  it("rejects oversized values before localStorage.setItem is called", () => {
    const reportSpy = jest.fn();
    setErrorReporter(reportSpy);
    const setItemMock = jest.fn();
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: () => null,
        setItem: setItemMock,
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
      },
      configurable: true,
      writable: true,
    });
    const oversizedValue = "x".repeat(MAX_VALUE_BYTES / 2 + 1);

    resetCache();
    expect(setItem("oversized-key", oversizedValue)).toBe(false);

    expect(setItemMock).not.toHaveBeenCalled();
    expect(getItem("oversized-key")).toBeNull();
    expect(reportSpy).toHaveBeenCalledWith(
      expect.any(Error),
      "safeStorage.setItem",
      "warn",
      expect.objectContaining({
        key: "oversized-key",
        maxValueBytes: MAX_VALUE_BYTES,
        valueBytes: MAX_VALUE_BYTES + 2,
      }),
    );
  });

  it("rejects multibyte values using the UTF-16 byte estimate", () => {
    const reportSpy = jest.fn();
    setErrorReporter(reportSpy);
    const exactCapMultibyteValue = "界".repeat(MAX_VALUE_BYTES / 2);
    const oversizedMultibyteValue = `${exactCapMultibyteValue}界`;

    expect(setItem("multibyte-exact-key", exactCapMultibyteValue)).toBe(true);
    expect(setItem("multibyte-oversized-key", oversizedMultibyteValue)).toBe(
      false,
    );
    expect(window.localStorage.getItem("multibyte-exact-key")).toBe(
      exactCapMultibyteValue,
    );
    expect(window.localStorage.getItem("multibyte-oversized-key")).toBeNull();
    expect(reportSpy).toHaveBeenCalledWith(
      expect.any(Error),
      "safeStorage.setItem",
      "warn",
      expect.objectContaining({
        key: "multibyte-oversized-key",
        valueBytes: MAX_VALUE_BYTES + 2,
      }),
    );
  });

  it("allows the max value cap to be overridden by environment configuration", () => {
    process.env.NEXT_PUBLIC_SAFE_STORAGE_MAX_VALUE_BYTES = "8";

    jest.isolateModules(() => {
      const {
        MAX_VALUE_BYTES: overriddenMaxValueBytes,
        setItem: cappedSet,
        getItem: cappedGet,
      } = require("../safeStorage");
      expect(overriddenMaxValueBytes).toBe(8);
      expect(cappedSet("small-key", "1234")).toBe(true);
      expect(cappedSet("large-key", "12345")).toBe(false);
      expect(cappedGet("small-key")).toBe("1234");
      expect(cappedGet("large-key")).toBeNull();
    });
  });
});
