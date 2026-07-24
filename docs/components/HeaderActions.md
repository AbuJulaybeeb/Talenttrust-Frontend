# HeaderActions

## Purpose

`HeaderActions` provides a fully responsive wrapper for the global header action area. It collapses wallet-specific actions behind a mobile disclosure control on narrow viewports to prevent horizontal overflow while preserving keyboard and screen-reader accessibility.

On larger screens, the component renders the wallet actions inline without a toggle, so desktop users retain direct access to the `WalletConnectButton` while mobile users benefit from a collapsible interface.

## Component Interface

```tsx
export default function HeaderActions(): React.JSX.Element
```

**No props required** — the component manages its own disclosure state internally via `useState`.

## Breakpoints

| Screen width | Behavior |
|--------------|----------|
| **Below `sm` (< 640px)** | Wallet actions collapse behind a toggle button with hamburger/close icon. The `ThemeToggle` remains visible. |
| **`sm` and above (≥ 640px)** | The disclosure toggle is hidden (`sm:hidden`). The wallet actions panel becomes visible (`sm:block`) and renders inline. |

## Accessibility

The component is fully accessible to keyboard and assistive-technology users:

### Disclosure button
- Native `<button>` element with `type="button"`.
- `aria-expanded="false"` when collapsed, `"true"` when open.
- `aria-controls="header-wallet-actions"` points to the controlled panel's `id`.
- Visually hidden `<span className="sr-only">` label:
  - Collapsed: **"Open wallet actions"**
  - Expanded: **"Close wallet actions"**
- Decorative SVG icon (`aria-hidden="true"`) swaps between hamburger (`M4 7h16...`) and close (`M6 18L18 6...`) paths.
- Keyboard-focusable with visible `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`.

### Controlled panel
- `role="region"` with `aria-label="Wallet actions"`.
- `id="header-wallet-actions"` matches the toggle's `aria-controls`.
- Conditionally shows (`block`) or hides (`hidden`) based on disclosure state.
- On larger screens, the panel is always visible (`sm:block`) and the toggle is hidden (`sm:hidden`), so the disclosure pattern degrades gracefully.

### Keyboard navigation
- `Enter` and `Space` both toggle the disclosure.
- Focus ring appears on both the toggle button and the nested `WalletConnectButton` / `ThemeToggle`.

### Screen-reader announcements
- The sr-only label swap ensures VoiceOver, NVDA, and JAWS users know the toggle's current purpose without relying on visual icons.
- The panel's `role="region"` and `aria-label` allow assistive-tech users to navigate to it directly via landmarks.

## Visual States

### Collapsed (mobile)
```
[ 🌙 Theme ]  [ ☰ sr-only: "Open wallet actions" ]
```
- The `WalletConnectButton` is hidden behind the panel.
- Only the `ThemeToggle` and the hamburger disclosure button are visible.

### Expanded (mobile)
```
[ 🌙 Theme ]  [ ✕ sr-only: "Close wallet actions" ]

┌────────────────────────────────────┐
│  [ Connect Wallet ]                │
└────────────────────────────────────┘
```
- The panel slides open (the `hidden` class is removed).
- The SVG icon changes to an "X" (close icon).
- The sr-only label swaps to **"Close wallet actions"**.

### Desktop (≥ `sm`)
```
[ 🌙 Theme ]  [ Connect Wallet ]
```
- The disclosure toggle is hidden (`sm:hidden`).
- The panel is always visible (`sm:block`), and the `WalletConnectButton` renders inline.
- The hamburger/close icon is never shown.

## Implementation Details

### State management
```tsx
const [isOpen, setIsOpen] = useState(false);
const menuId = 'header-wallet-actions';
```
- `isOpen` controls the panel's visibility and the toggle's `aria-expanded`.
- `menuId` is a stable string that wires `aria-controls` to the panel's `id`.

### Responsive classes
- The disclosure button carries `sm:hidden` so it's only visible on narrow viewports.
- The panel carries `hidden sm:block` by default — on mobile it starts hidden and toggles between `hidden`/`block` via conditional class logic; on desktop it's always `block`.

### Icon swap logic
The SVG `<path>` `d` attribute swaps based on `isOpen`:
```tsx
<path d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
```
- Collapsed: Three horizontal lines (hamburger).
- Expanded: Diagonal "X" (close icon).

### Click handler
```tsx
onClick={() => setIsOpen((current) => !current)}
```
Flips the boolean without relying on stale closure state.

## Usage

### In the root layout

Mount `HeaderActions` in `src/app/layout.tsx` alongside the site logo and navigation:

```tsx
import HeaderActions from '@/components/HeaderActions';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PreferencesProvider>
          <ToastProvider>
            <WalletProvider>
              <div className="flex min-h-screen flex-col">
                <header className="sticky top-0 z-40 ...">
                  <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold tracking-tight text-slate-900">
                        TalentTrust
                      </span>
                    </div>
                    <Navbar />
                    <HeaderActions />
                  </div>
                </header>
                <main className="flex-1">{children}</main>
              </div>
            </WalletProvider>
          </ToastProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
```

### Standalone usage

While designed for the global header, `HeaderActions` can be reused in any layout that needs responsive wallet-action access:

```tsx
import HeaderActions from '@/components/HeaderActions';

function CustomHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex items-center justify-between p-4">
        <h1>Custom Section</h1>
        <HeaderActions />
      </div>
    </header>
  );
}
```

## Testing

Two test files cover this component:

- **`src/components/__tests__/HeaderActions.test.tsx`** — stubs `WalletConnectButton` with a static placeholder to isolate the disclosure mechanics (toggle, ARIA wiring, keyboard, axe).
- **`src/components/__tests__/HeaderActions.wallet-states.test.tsx`** — renders the *real* `WalletConnectButton` against a mocked `WalletContext` for both the connected (address pill + copy/disconnect buttons) and disconnected (Connect Wallet button) states, so the connected-state markup is proven to actually fit inside the disclosure rather than just asserting a stand-in renders. It also asserts the `sm:hidden` / `sm:block` responsive classes directly, since jsdom has no layout engine and can't measure rendered pixel widths — verifying the "no overflow at 320px" requirement in a real browser (or via a visual-regression/E2E tool) remains a manual/CI-follow-up check.

Together they provide 100% line and branch coverage on `HeaderActions.tsx`:

### Coverage areas
1. **Initial render** — verifies the toggle, panel, `ThemeToggle`, and `WalletConnectButton` all mount.
2. **ARIA wiring** — asserts `aria-controls` matches the panel `id`, and `aria-expanded` flips correctly.
3. **SR-only label swap** — confirms the accessible name changes from "Open wallet actions" to "Close wallet actions" and back.
4. **Panel visibility** — checks the `hidden` class toggles on/off as the disclosure opens and closes.
5. **Keyboard activation** — tests `Enter` and `Space` key toggles via `@testing-library/user-event`.
6. **Repeated cycles** — ensures 10 rapid toggles don't corrupt state.
7. **jest-axe accessibility** — runs axe-core checks on both collapsed and expanded states.
8. **Unmount** — confirms the component cleans up without throwing.

### Running the tests

```bash
npm test -- HeaderActions
```

Expected output:
```
PASS  src/components/__tests__/HeaderActions.test.tsx
  HeaderActions — initial render
    ✓ renders the disclosure toggle button in the collapsed state
    ✓ renders the controlled wallet-actions panel
    ✓ renders ThemeToggle on mount
    ✓ renders WalletConnectButton on mount
    ✓ panel starts in the hidden state (carries "hidden" class)
  HeaderActions — ARIA attribute wiring
    ✓ aria-controls on the toggle equals the panel element id
    ✓ panel id is "header-wallet-actions"
    ...
  HeaderActions — accessibility (jest-axe)
    ✓ has no axe violations in the collapsed (initial) state
    ✓ has no axe violations in the expanded (open) state
    ✓ has no axe violations after toggling closed again

Test Suites: 1 passed, 1 total
Tests:       38 passed, 38 total
```

## Design Notes

### Why use a disclosure pattern instead of a dropdown menu?
- The disclosure pattern (`aria-expanded` + `aria-controls`) is semantically lighter than a full menu (`role="menu"` + `menuitem`).
- The wallet actions don't require arrow-key navigation or menu semantics — they're a simple show/hide toggle.

### Why render the panel even when collapsed?
- The panel uses CSS (`hidden` → `display: none`) to hide itself, so it's not visible or interactive when collapsed.
- Keeping it in the DOM avoids re-mounting the `WalletConnectButton` on each toggle, preserving any internal component state.
- On larger screens (`sm:block`), the panel is always visible and the toggle is hidden, so the disclosure pattern degrades gracefully to a standard inline layout.

### Why not use `<details>` and `<summary>`?
- Native `<details>` doesn't provide a stable API for controlling the open/closed state from external events (e.g., closing on outside click, which may be added later).
- The custom disclosure gives full control over the toggle icon, sr-only label swap, and CSS transitions.

## Related Components

- **[`ThemeToggle`](./ThemeToggle.md)** — Inline button rendered inside `HeaderActions` to switch between light/dark themes.
- **[`WalletConnectButton`](./WalletConnectButton.md)** — Wallet connection control rendered inside the disclosure panel.
- **[`Navbar`](./Navbar.md)** — Main navigation links rendered alongside `HeaderActions` in the global header.

## Further Reading

- [WAI-ARIA Authoring Practices: Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
- [MDN: `aria-expanded`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded)
- [MDN: `aria-controls`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-controls)
