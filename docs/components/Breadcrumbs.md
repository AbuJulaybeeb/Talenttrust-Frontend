# Breadcrumbs Component

The `Breadcrumbs` component provides accessible, data-driven hierarchical navigation for the application. It helps users understand where the current page sits within the application structure and allows them to navigate back to ancestor pages.

## Features

- **Data-Driven**: Accepts an array of items `(label, href?)`.
- **Accessible (a11y)**:
  - Uses `<nav aria-label="Breadcrumb">` to define the navigation landmark.
  - Groups links inside an ordered list (`<ol>`).
  - Marks the current page crumb with `aria-current="page"`.
  - Visual separators are hidden from assistive technologies using `aria-hidden="true"`.
- **Premium Design & Aesthetics**:
  - Focus indicators use the Tailwind utility classes consistent with the theme-token focus rings (`focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2`).
  - Automatically truncates long crumb labels with `truncate max-w-[16rem]` to prevent layout regressions on smaller viewports.

---

## Props & API

The component accepts `BreadcrumbsProps`:

```typescript
export type BreadcrumbItem = {
  /** Visible label for this crumb. */
  label: string;
  /**
   * Navigation target. When provided the crumb renders as a Next.js `<Link>`.
   * Omit for the final crumb, which renders as plain text with `aria-current="page"`.
   */
  href?: string;
};

export type BreadcrumbsProps = {
  /** Ordered list of crumbs from root to current page. */
  items: BreadcrumbItem[];
};
```

---

## Usage Example

### Basic Usage

To render a breadcrumb navigation trail:

```tsx
import Breadcrumbs from '@/components/Breadcrumbs';

export default function Page() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Dashboard', href: '/' },
        { label: 'Contracts', href: '/contracts' },
        { label: 'Contract #42' }, // The last item has no href and represents the current page
      ]}
    />
  );
}
```

---

## Accessibility Checklists

- [x] Landmarked: Wrapped in `<nav>` with `aria-label="Breadcrumb"`.
- [x] Structured: Uses `<ol>` and `<li>` to present the hierarchy in a structured list.
- [x] Contextualized: The last item representing the current page uses `aria-current="page"`.
- [x] Unobtrusive Separators: Separators (`/`) use `aria-hidden="true"` and are hidden from screen readers.
