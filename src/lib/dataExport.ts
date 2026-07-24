/**
 * @file dataExport.ts
 *
 * Builds and downloads a JSON export of all namespaced TalentTrust app data
 * currently persisted in the browser, so users can back it up or move it to
 * another browser/device.
 *
 * Design principles:
 * - **Reads via the safe storage wrapper** (`src/lib/safeStorage.ts`) — never
 *   touches `window.localStorage` directly — so the export benefits from the
 *   same SSR guards and defensive error handling as every other read in the
 *   app.
 * - **Scoped to known app-data keys only.** Only the keys the app itself
 *   writes (`repository.ts`'s `talenttrust_app_data` and `preferences.tsx`'s
 *   `talenttrust-user-preferences`) are included. Unrelated keys that may
 *   exist in the same origin's storage (e.g. `loginThrottle.ts`'s transient,
 *   non-user-facing security counters, or anything written by a third party
 *   script) are never read or exported.
 * - **Never throws.** A missing key is simply omitted; a corrupt (non-JSON)
 *   stored value for a known key is skipped and reported via the central
 *   error reporter rather than aborting the whole export.
 */

import { getItem } from './safeStorage';
import { STORAGE_KEY as APP_DATA_STORAGE_KEY } from './repository';
import { STORAGE_KEY as PREFERENCES_STORAGE_KEY } from './preferences';
import { reportError } from './errorReporter';

/** Bumped whenever the shape of {@link AppDataExport} changes in a
 * backwards-incompatible way, so a future import feature can branch on it. */
export const EXPORT_FORMAT_VERSION = 1;

/**
 * Every namespaced localStorage key considered part of the user's
 * exportable app data, sourced directly from the modules that own them so
 * this list can never drift out of sync with the actual storage keys in use.
 */
export const EXPORTABLE_KEYS: readonly string[] = [
  APP_DATA_STORAGE_KEY,
  PREFERENCES_STORAGE_KEY,
];

/** Shape of the JSON document produced by {@link buildAppDataExport}. */
export interface AppDataExport {
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
}

/**
 * Reads every {@link EXPORTABLE_KEYS} entry through the safe storage
 * wrapper, parses each stored JSON value, and assembles a single exportable
 * document.
 *
 * - A key with no stored value is omitted from `data` entirely.
 * - A key whose stored value cannot be parsed as JSON is skipped (and the
 *   failure reported via `reportError`) rather than aborting the export.
 * - When nothing is persisted yet, `data` is an empty object — callers get a
 *   valid, well-formed (if empty) document rather than an error.
 *
 * @param now - Injectable clock, primarily for deterministic tests.
 * @returns The assembled export document.
 *
 * @example
 * ```ts
 * const exportDoc = buildAppDataExport();
 * // → { version: 1, exportedAt: '2026-...', data: { talenttrust_app_data: {...} } }
 * ```
 */
export function buildAppDataExport(now: () => Date = () => new Date()): AppDataExport {
  const data: Record<string, unknown> = {};

  for (const key of EXPORTABLE_KEYS) {
    const raw = getItem(key);
    if (raw === null) continue;

    try {
      data[key] = JSON.parse(raw);
    } catch (err) {
      reportError(err, `[dataExport] Skipping corrupt value for key "${key}".`, 'warn', {
        key,
      });
    }
  }

  return {
    version: EXPORT_FORMAT_VERSION,
    exportedAt: now().toISOString(),
    data,
  };
}

/**
 * Serialises an {@link AppDataExport} document to a pretty-printed JSON
 * string suitable for writing to a file.
 */
export function serializeAppDataExport(exportDoc: AppDataExport): string {
  return JSON.stringify(exportDoc, null, 2);
}

/**
 * Derives a timestamped, filesystem-safe filename for an export document,
 * e.g. `talenttrust-data-export-2026-07-23T10-15-00-000Z.json`.
 */
export function buildExportFilename(exportDoc: AppDataExport): string {
  const safeTimestamp = exportDoc.exportedAt.replace(/[:.]/g, '-');
  return `talenttrust-data-export-${safeTimestamp}.json`;
}

/**
 * Triggers a browser "Save File" download of the given text content.
 *
 * No-op outside a browser context (SSR / non-DOM test environments) since
 * there is no document to attach a download link to.
 *
 * @param filename - The suggested filename for the downloaded file.
 * @param content - The file's text content.
 * @param mimeType - The MIME type used for the generated `Blob`.
 */
export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string = 'application/json',
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Convenience helper that builds, serialises, and downloads the full app
 * data export as a timestamped JSON file in one call. This is what the
 * Settings "Export data" control invokes.
 *
 * @param now - Injectable clock, primarily for deterministic tests.
 * @returns The export document that was downloaded, so callers (e.g. UI code)
 *   can inspect it or surface a summary without re-reading storage.
 */
export function exportAppDataAsJson(now: () => Date = () => new Date()): AppDataExport {
  const exportDoc = buildAppDataExport(now);
  downloadTextFile(buildExportFilename(exportDoc), serializeAppDataExport(exportDoc));
  return exportDoc;
}
