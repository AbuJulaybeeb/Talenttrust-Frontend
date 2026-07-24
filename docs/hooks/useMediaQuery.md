# useMediaQuery

A small, SSR-safe React hook for checking whether a CSS media query currently matches. It starts with a stable `false` value on the server and updates on the client after the component mounts.

## Location

`src/hooks/useMediaQuery.ts`

## Usage

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function ThemeBadge() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <p>
      {prefersDark ? 'Dark mode' : 'Light mode'}
      {prefersReducedMotion ? ' with reduced motion' : ''}
    </p>
  );
}
```

## API Reference

### `useMediaQuery(query)`

#### Parameters

| Parameter | Type | Description |
|---|---|---|
| `query` | `string` | A valid CSS media query string, such as `'(prefers-color-scheme: dark)'` or `'(min-width: 1024px)'`. |

#### Returns

| Return value | Type | Description |
|---|---|---|
| `matches` | `boolean` | `true` when the media query currently matches, `false` otherwise. |

## SSR Notes

1. The hook returns `false` on the server and in environments where `window.matchMedia` is unavailable.
2. The real media-query value is read in a client `useEffect`, which keeps the initial server render and first client render aligned.
3. The `change` listener is removed during cleanup so the hook does not leak subscriptions when components unmount.

## Testing

Unit tests are defined in `src/hooks/__tests__/useMediaQuery.test.ts`.

To run the unit tests:
```bash
npm test src/hooks/__tests__/useMediaQuery.test.ts
```
