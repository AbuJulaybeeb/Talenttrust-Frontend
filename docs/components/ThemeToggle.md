# ThemeToggle Component

`ThemeToggle` is a small inline button that allows the user to switch between light and dark themes.

## Description
- Renders a button with an accessible label that indicates the action (e.g., "Switch to dark theme").
- The button displays a **sun** icon when the current theme is dark and a **moon** icon when the current theme is light.
- Clicking the button updates the `preferences.theme` value (`'light'` ↔ `'dark'`) via the `usePreferences` hook.
- The component only renders on the client after hydration to avoid SSR mismatches.

## Props
The component does **not** accept any props. It relies entirely on the global `preferences` context.

## State & Behavior
- **Mounted state** – The component delays rendering until `mounted` is `true` (set in a `useEffect`).
- **Theme detection** – Determines whether the current theme is dark via `preferences.theme === 'dark'`.
- **Toggle logic** – `next` is calculated as the opposite of the current theme.
- **Label** – Changes dynamically to reflect the next action.

## Minimal Usage Example
```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      {/* Other header content */}
      <ThemeToggle />
    </header>
  );
}
```

The component will automatically respect the user's stored preference and update the UI accordingly.
