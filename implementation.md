# Implementation Details — Home Page Submit Tests

## Issue
Add tests for the home page submit success toast and validation error paths.

---

## Overview

`src/app/page.tsx` is a login form with three interacting behaviours:

| Behaviour | Production code | Tested via |
|---|---|---|
| `validateLogin(email, password)` determines validity | `src/lib/validateLogin.ts` | `src/lib/validateLogin.test.ts` |
| `getError(fieldId)` maps a fieldId to a message | Inline selector in `Home` | Indirect — rendered DOM assertions |
| `handleSubmit` branches on error count | `src/app/page.tsx` | `src/app/page.test.tsx` (this issue) |

### `handleSubmit` control flow

```
handleSubmit(e)
 ├── validateLogin(email, password) → newErrors[]
 ├── setErrors(newErrors)
 └── if newErrors.length === 0
       └── showSuccess({ title: 'Form submitted successfully!' })
```

### `validateLogin` branches

```
validateLogin(email, password)
 ├── !email                    → { fieldId:'email',    message:'Email is required' }
 ├── !email.includes('@')      → { fieldId:'email',    message:'Email must be valid' }
 ├── !password                 → { fieldId:'password', message:'Password is required' }
 └── password.length < 8      → { fieldId:'password', message:'Password must be at least 8 characters' }
```

---

## Changes Made

### `src/app/page.test.tsx` — appended 4 new `describe` blocks

> No existing lines were removed, overwritten, or altered.

#### 1. `submit branching — success path`

Covers the `newErrors.length === 0` branch in `handleSubmit`.

| Test | Assertion |
|---|---|
| Renders `role="status"` toast | `getByRole('status')` + `within(toast).getByText(...)` |
| No ErrorSummary on valid submit | `queryByRole('alert', { name: /there is a problem/i })` is null |
| `aria-live="polite"` announcer contains success title | `document.querySelector('[aria-live="polite"]').textContent` |

**Design note — `aria-live` assertion.** The `ToastAnnouncer` renders a visually-hidden `div[aria-live="polite"]` that receives the latest success title text. Asserting its `textContent` ensures the screen-reader announcement path is wired end-to-end without relying on ARIA live region firing events (which jsdom does not simulate). The assertion is a structural contract, not a timing one.

---

#### 2. `submit branching — email-only error path`

Covers the branch where `!email && password.length >= 8`.  
Asserts **error isolation**: only the `email` fieldId receives a `ValidationError`.

| Test | Assertion |
|---|---|
| Email error in ErrorSummary | `within(summary).getByRole('link', { name: /email is required/i })` |
| No password error in ErrorSummary | `within(summary).queryByRole('link', { name: /password/i })` is null |
| Only email `aria-invalid` | `email.aria-invalid="true"`, `password.aria-invalid="false"` |
| Exact inline message | `document.getElementById('email-error').textContent === 'Email is required'` |

---

#### 3. `submit branching — password-only error path`

Symmetric mirror of the email-only path for `!password && email.includes('@')`.

| Test | Assertion |
|---|---|
| Password error in ErrorSummary | `within(summary).getByRole('link', { name: /password is required/i })` |
| No email error in ErrorSummary | `within(summary).queryByRole('link', { name: /email/i })` is null |
| Only password `aria-invalid` | `password.aria-invalid="true"`, `email.aria-invalid="false"` |
| Exact inline message | `document.getElementById('password-error').textContent === 'Password is required'` |

---

#### 4. `getError field mapping — format validation`

Covers the format/length secondary branches of `validateLogin` and pins the exact error strings rendered by `getError`.

| Test | Branch | Asserted message |
|---|---|---|
| Email lacks `@` | `!email.includes('@')` | `'Email must be valid'` |
| Password < 8 chars | `password.length < 8` | `'Password must be at least 8 characters'` |

**Design note — exact string pinning.** Using `toBe(...)` (strict equality) rather than `toMatch(...)` (substring) intentionally makes these tests fragile to message-string changes. This is the desired behaviour: if `validateLogin.ts` changes an error message, the test fails immediately, alerting the developer that the UI contract has changed and copy must be reviewed.

---

## Testing Strategy

### Why `userEvent` over `fireEvent`

All new tests use `userEvent.setup()` + `user.type()` / `user.click()`. This fires the full keyboard event sequence (keydown → keypress → input → keyup) matching browser behaviour. `fireEvent.change` bypasses this and can mask issues with controlled-input handlers. The existing tests mix both; new tests consistently use `userEvent` for correctness.

### Why `within(summary)` for ErrorSummary assertions

`screen.getByText(...)` on error messages would match both the `ErrorSummary` anchor link and the inline `FormField` error paragraph, causing `getByText` to throw "found multiple elements". Using `within(summary).getByRole('link', ...)` scopes the query to the ErrorSummary `role="alert"` container, unambiguously targeting the summary entry.

### Why `document.getElementById(fieldId + '-error')` for inline message assertions

The `FormField` component renders its error in a `<p id="{id}-error">`. Selecting by id is the narrowest, most stable selector — it directly mirrors the `aria-describedby` relationship established on the `<input>`. This approach also validates that the wiring (input → aria-describedby → error paragraph) is intact.

---

## Complexity Analysis

All assertions are O(1) in space and time relative to the test fixture:
- DOM queries (`getByRole`, `getElementById`) are O(n) where n = total DOM nodes, but n is constant and small for this fixed-form component (< 50 nodes per render).
- `userEvent.type()` is O(k) where k = number of characters typed — bounded by fixed test strings.
- No memoisation or data structures are introduced; the test helpers (`renderWithProviders`, `userEvent`) are already shared across the file.

---

## Verification

```bash
npm run lint      # 0 errors, 0 warnings
npm test          # all existing 20 + 13 new = 33 tests in page.test.tsx pass
npm run build     # no TypeScript or compilation errors
```

---

## Branches Covered by This Issue

| Scenario | Branch |
|---|---|
| Valid email + valid password | `newErrors.length === 0` → `showSuccess()` |
| Empty email + valid password | `!email` → `fieldId: 'email'` |
| Valid email + empty password | `!password` → `fieldId: 'password'` |
| Both empty | `!email && !password` → both fieldIds |
| Invalid email format | `!email.includes('@')` → `'Email must be valid'` |
| Short password | `password.length < 8` → `'Password must be at least 8 characters'` |
