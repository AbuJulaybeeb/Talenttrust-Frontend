# Routing and Layout Architecture

This document describes the Next.js App Router routing structure and layout composition as implemented in the TalentTrust Frontend repository. It covers the complete route tree, provider hierarchy, special files, dynamic segments, and accessibility patterns for route navigation.

## Next.js Version and Routing Model

The application is built on **Next.js 16.2.11** using the App Router paradigm. In the App Router model, routes are defined by the file system structure within the `src/app/` directory. Each folder represents a route segment, and special files like `page.tsx`, `layout.tsx`, `loading.tsx`, and `error.tsx` define the UI and behavior for that route.

## Route Tree

The following table describes every route currently implemented in the application. Each route corresponds to an actual `page.tsx` file in the `src/app/` directory.

| Route Path | File Path | Description | Layout | Loading State | Error Boundary |
|------------|-----------|-------------|---------|---------------|----------------|
| `/` | `src/app/page.tsx` | Home / Landing page with login form demo and toast demo | Root layout | None | Root error boundary |
| `/contracts` | `src/app/contracts/page.tsx` | Contracts list (uses local storage stub) | Root layout | `src/app/contracts/loading.tsx` | Root error boundary |
| `/contracts/[id]` | `src/app/contracts/[id]/page.tsx` | Contract details with milestones, progress, and actions | Root layout | `src/app/contracts/[id]/loading.tsx` | Root error boundary |
| `/milestones` | `src/app/milestones/page.tsx` | Milestones list with status filtering | Root layout | `src/app/milestones/loading.tsx` | Root error boundary |
| `/reputation` | `src/app/reputation/page.tsx` | User reputation display (placeholder with empty state) | Root layout | `src/app/reputation/loading.tsx` | Root error boundary |
| `/wallet` | `src/app/wallet/page.tsx` | Wallet connection and management | Root layout | `src/app/wallet/loading.tsx` | Root error boundary |

## Root Layout

The root layout is defined in `src/app/layout.tsx` and wraps all routes in the application. It establishes the HTML document structure, mounts the global provider stack, and includes the route announcement component for accessibility.

### HTML Structure

```tsx
<html lang="en" suppressHydrationMismatch>
  <body>
    <PreferencesProvider>
      <ToastProvider>
        <WalletProvider>
          <RouteAnnouncer />
          <Navbar />
          <main tabIndex={-1}>
            {children}
          </main>
        </WalletProvider>
      </ToastProvider>
    </PreferencesProvider>
  </body>
</html>
```

The `suppressHydrationMismatch` attribute on the `<html>` element prevents hydration warnings caused by theme-switching logic that modifies the DOM before React hydrates.

The `<main>` landmark has `tabIndex={-1}` to allow programmatic focus on route changes (used by `RouteAnnouncer`).

### Metadata Configuration

The root layout exports a `metadata` object that defines:
- Page title: "TalentTrust"
- Meta description: "Secure freelance payments on blockchain"
- Open Graph metadata for social sharing
- Viewport configuration for responsive design

### Provider Stack

Providers are nested in a specific order to ensure dependencies are available when needed:

1. **PreferencesProvider** (outermost)
2. **ToastProvider**
3. **WalletProvider** (innermost)
4. **RouteAnnouncer** (sibling to main content, not a provider)

See the **Provider Inventory** section below for details on each provider.

## Nested Layouts

Currently, there are no nested `layout.tsx` files in the route structure. All routes share the single root layout defined in `src/app/layout.tsx`.

## Provider Inventory

The following table lists every provider mounted in the application, in order from outermost to innermost:

| Provider Name | Import Path | Layout Where Mounted | Purpose |
|---------------|-------------|----------------------|---------|
| `PreferencesProvider` | `@/lib/preferences` | Root layout (`src/app/layout.tsx`) | Manages user-level preferences including locale, currency format, theme, and toast duration. Provides `usePreferences()` hook for consuming components. Hydrates preferences from `localStorage` on mount and persists changes. |
| `ToastProvider` | `@/components/toast/toast-provider` | Root layout (`src/app/layout.tsx`) | Provides the global notification system for success and error messages. Exposes `useToast()` hook with `showSuccess()`, `showError()`, and `dismissToast()` methods. Renders toast viewport with `aria-live` regions for accessibility. Limits visible toasts to 4 at once (`MAX_VISIBLE_TOASTS`) with severity-based queuing. |
| `WalletProvider` | `@/contexts/WalletContext` | Root layout (`src/app/layout.tsx`) | Manages Stellar wallet connection state via Freighter browser extension. Provides `useWallet()` hook exposing `{ address, isConnecting, error, connect, disconnect }`. Persists connected address in `localStorage` and rehydrates on page load. Optionally supports idle timeout for automatic disconnection on shared machines. |

### Provider Dependencies

- `WalletProvider` depends on `ToastProvider` to display connection errors and session expiration notices
- `WalletProvider` depends on `PreferencesProvider` to access user locale and currency for formatting amounts
- `ToastProvider` depends on `PreferencesProvider` to access toast duration preference

This dependency order is reflected in the nesting structure: `PreferencesProvider` wraps `ToastProvider`, which wraps `WalletProvider`.

## Route Groups

No route groups (directories with parentheses, e.g., `(group)`) are currently used in the route structure.

## Dynamic Segments

The application uses one dynamic route segment:

| Dynamic Segment | Route Path | Parameter Name | Parameter Purpose |
|-----------------|------------|----------------|-------------------|
| `[id]` | `/contracts/[id]` | `id` | Contract identifier used to fetch and display a specific contract's details, including milestones, progress, and available actions. The `id` value is extracted from the route params and passed to data-fetching functions. |

### Usage Example

```tsx
// In src/app/contracts/[id]/page.tsx
export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Use id to fetch contract data
}
```

## Special Files

The following special files are used to enhance the user experience and handle error states:

| Special File | Location(s) | Purpose |
|--------------|-------------|---------|
| `loading.tsx` | `src/app/contracts/loading.tsx` | Loading skeleton for contracts list route |
| `loading.tsx` | `src/app/contracts/[id]/loading.tsx` | Loading skeleton for contract details route |
| `loading.tsx` | `src/app/milestones/loading.tsx` | Loading skeleton for milestones list route |
| `loading.tsx` | `src/app/reputation/loading.tsx` | Loading skeleton for reputation route |
| `loading.tsx` | `src/app/wallet/loading.tsx` | Loading skeleton for wallet route |
| `error.tsx` | `src/app/error.tsx` | Error boundary for all routes, catches runtime errors and displays fallback UI with recovery options |
| `global-error.tsx` | `src/app/global-error.tsx` | Global error boundary that catches errors in the root layout itself, including provider initialization failures |
| `not-found.tsx` | `src/app/not-found.tsx` | 404 page displayed when a route does not match any defined page |

### Loading States

Each loading component renders a skeleton UI that approximates the layout of the final page content. This provides visual feedback during data fetching and avoids layout shift when content loads.

### Error Boundaries

- **`error.tsx`**: Catches errors thrown by page components and nested components. Provides a "Try again" button that calls `reset()` to re-render the route.
- **`global-error.tsx`**: Catches errors in the root layout, including provider failures. This is the last-resort error boundary. It must redefine the `<html>` and `<body>` tags because the root layout's HTML structure is not rendered when this boundary catches an error.

## Route Announcement

The application implements a `RouteAnnouncer` component to improve screen reader user experience during client-side navigation.

### Implementation

| Aspect | Details |
|--------|---------|
| Component | `RouteAnnouncer` |
| File Path | `src/components/RouteAnnouncer.tsx` |
| Mounted In | Root layout (`src/app/layout.tsx`) |
| Accessibility Attributes | `role="status"`, `aria-atomic="true"`, visually hidden with `.sr-only` class |
| Live Region Type | Polite (`aria-live="polite"` is implicit for `role="status"`) |

### Behavior

On every `pathname` change detected via `usePathname()`:

1. **Focus Management**: The `<main>` landmark is programmatically focused using `main.focus()`. This allows keyboard users to immediately interact with the new page content without tabbing through the navigation again.

2. **Page Title Announcement**: The component reads the text content of the first `<h1>` element on the page and announces "Navigated to [page title]" through the `role="status"` live region. If no `<h1>` is found, it falls back to "Navigated to Page: [pathname]".

### Example Announcement

When navigating from `/contracts` to `/contracts/123`:
- The `<main>` element receives focus
- The live region announces: "Navigated to Contract Details" (assuming the page contains `<h1>Contract Details</h1>`)

### Accessibility Notes

- The live region is visually hidden (`.sr-only`) but announced by screen readers
- The `role="status"` with implicit `aria-live="polite"` ensures announcements do not interrupt the user
- Focus management ensures keyboard users can immediately navigate the new page content
- This pattern follows Next.js accessibility best practices for client-side navigation

## Limitations and Known Gaps

- **No nested layouts**: All routes share a single root layout. If certain routes require additional layout composition (e.g., a dashboard layout with sidebar), nested `layout.tsx` files will need to be added to those route segments.

- **No route groups**: The application does not currently use route groups to share layouts among a subset of routes or to organize routes without affecting the URL structure.

- **Limited dynamic segments**: Only one dynamic segment (`[id]`) is currently implemented. If additional dynamic or catch-all segments are needed (e.g., `/contracts/[id]/milestones/[milestoneId]` or `/docs/[...slug]`), they must be added as new directories.

- **No parallel routes or intercepting routes**: Advanced App Router features like parallel routes (`@folder`) and intercepting routes (`(.)folder`) are not currently used. These could be beneficial for modals or split views in the future.

- **No route handlers**: The `src/app/` directory does not contain any `route.ts` files that define API endpoints. All data operations currently use client-side logic and local storage stubs. When backend integration is implemented, route handlers may be added to proxy API requests or implement server-side logic.

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Accessibility Documentation](https://nextjs.org/docs/architecture/accessibility)
- [Provider Stack Details](../src/app/layout.tsx)
- [Data Model and Persistence](./data-model.md)
- [Preferences Provider Guide](./preferences.md)
- [Wallet Session Management](./contexts/wallet-session.md)
