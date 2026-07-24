# MilestonesList Component

## Overview

The `MilestonesList` component displays the list of milestones associated with a contract. It renders each milestone's status, payout amount, and due date. The component includes an accessible search and sort toolbar to help users find and organize milestones efficiently.

## Search and Sort Toolbar

The component provides a toolbar above the milestones list with search and sort functionality:

### Search Input

- **Label**: "Search milestones" (visually hidden, accessible via screen reader)
- **Placeholder**: "Search milestones..."
- **Behavior**: Filters milestones by title using case-insensitive matching
- **Partial Matches**: Supports partial string matching (e.g., "phase" matches "Design Phase", "Development Phase")
- **Empty Query**: Shows all milestones when the search query is empty or whitespace-only
- **No Matches**: Displays a friendly "No milestones match your search" message with a "Clear search" button

### Sort Select

- **Label**: "Sort by:"
- **Options**:
  - Due date (earliest first) - `dueDate-asc`
  - Due date (latest first) - `dueDate-desc`
  - Payout (lowest first) - `payout-asc`
  - Payout (highest first) - `payout-desc`
- **Due Date Handling**: Milestones without due dates are placed at the end when sorting by due date
- **Tie Handling**: When milestones have identical values, their relative order is preserved

### Accessibility Features

- **Live Region**: An `aria-live="polite"` region announces the filtered result count to assistive technology
- **Count Announcement**: Shows "Showing X of Y milestones" when filtering is active
- **Labelled Controls**: Both search input and sort select have proper labels
- **Keyboard Navigation**: All controls are fully keyboard accessible
- **Focus Management**: Clear search button restores focus appropriately

### Helper Functions

The component exports two helper functions for testing and reuse:

- `filterMilestonesByTitle(milestones, query)`: Filters milestones by title (case-insensitive)
- `sortMilestones(milestones, sortOption)`: Sorts milestones by due date or payout

Both functions are pure and do not mutate the original array.

## Due-Soon Reminder Banner

An accessible, dismissible banner is surfaced above the milestones list when there are milestones approaching their deadlines. This banner alerts both freelancers and clients about imminent payout dates, ensuring time-sensitive work is not missed.

### Features

- **Configurable Window**: Surfaces milestones due within a configurable timeframe defined by a named constant (default: `7` days).
- **Status Exclusions**: Excludes milestones that are already in terminal statuses (`Paid` or `Completed`).
- **Date Handling**: Uses a robust local-time date parser to prevent UTC-to-local shifts, ensuring that boundaries are computed accurately against local calendar days.
- **Keyboard accessibility**:
  - The banner container has `role="status"` to announce updates to screen readers.
  - Links inside the banner target the specific milestone element ID (`#milestone-${id}`) to allow users to jump or scroll directly to the milestone card.
  - Focus is programmatically restored to the scrollable milestones list container when the banner is dismissed, preventing loss of keyboard focus (WCAG 2.1.1).

## Implementation Details

- **File**: [src/components/MilestonesList.tsx](file:///c:/Users/USER/Desktop/Talenttrust-Frontend/src/components/MilestonesList.tsx)
- **Helper**: [src/lib/dueSoon.ts](file:///c:/Users/USER/Desktop/Talenttrust-Frontend/src/lib/dueSoon.ts)
- **Constant**: `REMINDER_WINDOW_DAYS = 7`

## Testing

Comprehensive test coverage is provided in [MilestonesList.test.tsx](file:///c:/Users/USER/Desktop/Talenttrust-Frontend/src/components/__tests__/MilestonesList.test.tsx):
- Renders banner when due-soon milestones exist.
- Correct pluralization (e.g., "1 milestone is due..." vs "2 milestones are due...").
- Exclusion of terminal statuses.
- Proper handling of due-date boundaries (exactly today, exactly 7 days from now).
- Graceful skipping of invalid/unparseable due date strings.
- Dismiss interaction and focus restoration checking.
- Accessibility validation using `axe`.

Run tests with:
```bash
npx jest src/components/__tests__/MilestonesList.test.tsx
```

## URL Status Filtering

The milestones page synchronizes the active status filter with the URL query parameter `?status=`.

- **Initial State**: Read from the `?status=` URL query parameter using `useSearchParams`. Defaults to `'All'` if omitted or invalid.
- **Filter Changes**: When a user selects a filter option, `router.replace` updates the URL query string without creating extra history entries.
- **Accessibility**: Preserves the `aria-live` announcement for screen readers on filter change.
