# Client-Side Persistence

## Overview

TalentTrust stores user-created contracts and milestones in the browser's `localStorage` so that data survives page navigations and refreshes without requiring a backend or authentication at this stage of the product.

All persistence logic is centralised in `src/lib/repository.ts`.

---

## Storage Namespace

| Key                    | Location              | Format      |
| ---------------------- | --------------------- | ----------- |
| `talenttrust_app_data` | `window.localStorage` | JSON string |

A single key houses both data collections under one object, avoiding key proliferation and making it straightforward to clear all app data in one call (`localStorage.removeItem('talenttrust_app_data')`).

---

## Data Shape

```ts
interface AppData {
  contracts: Contract[]; // from src/components/ContractSummary
  milestones: Milestone[]; // from src/components/MilestonesList
}
```

### Contract fields

| Field            | Type              | Notes                                                        |
| ---------------- | ----------------- | ------------------------------------------------------------ |
| `contractName`   | `string`          | User-facing display name                                     |
| `parties`        | `ContractParty[]` | Label + wallet address pairs                                 |
| `totalValue`     | `number`          | Numeric amount (no currency symbol)                          |
| `currency`       | `string`          | ISO 4217 code, e.g. `"USD"`                                  |
| `status`         | `StatusType`      | One of: `Active`, `Completed`, `Disputed`, `Pending`, `Paid` |
| `createdAt`      | `string`          | Human-readable date string                                   |
| `milestoneCount` | `number`          | Count of linked milestones                                   |

### Milestone fields

| Field      | Type                  | Notes                                                        |
| ---------- | --------------------- | ------------------------------------------------------------ |
| `id`       | `string`              | Caller-assigned unique identifier                            |
| `title`    | `string`              | User-facing display name                                     |
| `status`   | `StatusType`          | One of: `Active`, `Completed`, `Disputed`, `Pending`, `Paid` |
| `payout`   | `number`              | Numeric amount                                               |
| `currency` | `string`              | ISO 4217 code                                                |
| `dueDate`  | `string \| undefined` | Optional human-readable due date                             |

---

## Security Profile

- **Zero PII collected.** No names, emails, passwords, or personal identifiers are stored. `parties[].address` contains blockchain wallet addresses (public keys), which are already publicly visible on-chain.
- **Client-only.** Data never leaves the device via this module. `localStorage` is scoped to the origin (`http(s)://hostname:port`) and is inaccessible to other origins.
- **No encryption at rest.** `localStorage` is plain-text. Avoid storing sensitive secrets (private keys, session tokens) here. This module stores only display-level metadata.
- **XSS surface.** Like all `localStorage` usage, stored values are readable by any script running in the same origin. The application relies on standard XSS mitigations (CSP headers configured in `next.config.js`, input sanitisation) to prevent malicious reads.
- **Per-value size cap.** `src/lib/safeStorage.ts` rejects individual writes larger than `MAX_VALUE_BYTES` before calling `localStorage.setItem`. The default cap is 128 KiB using a UTF-16 byte estimate (`value.length * 2`), which leaves room for current contracts, milestones, wallet rehydration, and preference payloads while preventing runaway blobs from crowding out the origin quota. Oversized writes are reported through `errorReporter` and return `false`.

To tune the cap for a deployment, set:

```bash
NEXT_PUBLIC_SAFE_STORAGE_MAX_VALUE_BYTES=131072
```

Invalid, missing, zero, or negative values fall back to the 128 KiB default.

---

## SSR Safety

All `localStorage` and `window` accesses in `repository.ts` are guarded by:

```ts
if (typeof window === "undefined") return fallback;
```

This prevents crashes during Next.js server-side rendering and static generation, where `window` does not exist.

---

## Data Recovery Behaviour

| Condition                                                              | Behaviour                                                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Key not present in `localStorage`                                      | Returns `[]` for both lists                                                                          |
| Key present but value is empty string                                  | Returns `[]` for both lists                                                                          |
| Key present but value is invalid JSON                                  | Logs `console.warn('[repository] ...')`, returns `[]`                                                |
| Key present, valid JSON, but missing `contracts`/`milestones` field    | Missing field defaults to `[]`; other field is returned intact                                       |
| `localStorage.getItem` throws (e.g. storage blocked by browser policy) | Logs `console.warn`, returns `[]`, never throws                                                      |
| `localStorage.setItem` throws (e.g. quota exceeded)                    | Logs `console.warn`, never throws; in-memory state in the calling component remains correct          |
| `safeStorage.setItem` receives an oversized value                      | Reports a warning through `errorReporter`, returns `false`, and does not call `localStorage.setItem` |

---

## Public API

```ts
// src/lib/repository.ts

listContracts(): Contract[]
saveContract(contract: Contract): void

listMilestones(): Milestone[]
saveMilestone(milestone: Milestone): void
```

All functions are **synchronous** and have **no React dependencies**, making them safe to call from component initialisers (`useState(() => listContracts())`), event handlers, and unit tests alike.

---

## UI Data Sources

The Milestones page at `src/app/milestones/page.tsx` now renders from `listMilestones()` in `src/lib/repository.ts` after the client mounts. This keeps the page aligned with persisted user-created milestones while avoiding hydration mismatches during prerendering.

When the repository returns no milestones, the page falls back to its existing `SAMPLE_MILESTONES` seed data so the default demo experience remains intact.

---

## Exporting Data

Users can download a JSON backup of everything persisted for TalentTrust via
**Settings → Data → Export data as JSON**. This is implemented in
`src/lib/dataExport.ts` and:

- Reads only the app's own namespaced keys — `talenttrust_app_data` (this
  module) and `talenttrust-user-preferences` (`src/lib/preferences.tsx`) —
  through the `safeStorage` wrapper. Unrelated keys (e.g. the login-throttle
  counters in `src/lib/loginThrottle.ts`) are never read or included.
- Omits a key entirely when nothing is stored for it, so an empty store still
  produces a valid document (`{ version, exportedAt, data: {} }`).
- Skips (and reports via `errorReporter`, without throwing) any individual
  key whose stored value isn't valid JSON, so one corrupt entry can't block
  the rest of the export.

```ts
import { exportAppDataAsJson } from '@/lib/dataExport';

// Builds the export, triggers a JSON file download, and returns the document.
const exportDoc = exportAppDataAsJson();
```

---

## Clearing Stored Data

To wipe all persisted data (e.g. for testing or a "reset" feature):

```ts
window.localStorage.removeItem("talenttrust_app_data");
```

Or to clear everything in the browser:

```ts
window.localStorage.clear(); // removes ALL keys for this origin
```
