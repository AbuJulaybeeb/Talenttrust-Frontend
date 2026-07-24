/**
 * @fileoverview Targeted unit tests for the formatAmount function covering:
 *   - NGN locale override (forces NGN currency and en-NG locale)
 *   - Compact notation (produces compact strings and respects caller currency)
 *   - Provider-less fallback behavior.
 */
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { usePreferences, PreferencesProvider } from "../preferences";

describe("formatAmount – NGN locale override", () => {
  test("forces NGN currency and en-NG locale regardless of caller currency", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PreferencesProvider>{children}</PreferencesProvider>
    );
    const { result } = renderHook(() => usePreferences(), { wrapper });

    act(() => {
      result.current.updatePreference("amountFormat", "ngn");
    });

    const formatted = result.current.formatAmount(12345, "USD");
    // Should contain NGN symbol or code
    expect(formatted).toMatch(/₦|NGN/);
    // Verify locale formatting (comma separator) – simple regex check
    expect(formatted).toMatch(/\d{1,3}(,\d{3})*\.\d{2}/);
  });
});

describe("formatAmount – compact notation", () => {
  test("produces compact strings while keeping original currency", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <PreferencesProvider>{children}</PreferencesProvider>
    );
    const { result } = renderHook(() => usePreferences(), { wrapper });

    act(() => {
      result.current.updatePreference("amountFormat", "compact");
    });

    const usdCompact = result.current.formatAmount(1500000, "USD");
    const ngnCompact = result.current.formatAmount(1500000, "NGN");
    // Expect compact representation like 1.5M (or locale‑specific variant)
    expect(usdCompact).toMatch(/1\.5[MK]?/i);
    expect(ngnCompact).toMatch(/1\.5[MK]?/i);
    // Currency symbols should still be present
    expect(usdCompact).toContain("$");
    expect(ngnCompact).toMatch(/₦|NGN/);
  });
});

describe("formatAmount – provider-less fallback", () => {
  test("formats correctly when usePreferences is called outside a provider", () => {
    const { result } = renderHook(() => usePreferences());
    const fallback = result.current.formatAmount(99.99, "USD");
    expect(fallback).toBe("$99.99");
  });
});
