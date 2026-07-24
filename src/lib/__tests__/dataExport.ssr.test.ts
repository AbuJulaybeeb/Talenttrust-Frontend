/**
 * @jest-environment node
 *
 * SSR-context tests for src/lib/dataExport.ts.
 *
 * Isolated into their own `node`-environment file (matching
 * repository.ssr.test.ts) so `typeof window === 'undefined'` /
 * `typeof document === 'undefined'` are real rather than simulated, since
 * jest-environment-jsdom 30 made the global `window` non-configurable.
 */

import { buildAppDataExport, downloadTextFile } from '../dataExport';

describe('dataExport (SSR)', () => {
  it('buildAppDataExport yields an empty document when there is no window', () => {
    const fixedNow = () => new Date('2026-07-23T10:15:00.000Z');
    const exportDoc = buildAppDataExport(fixedNow);

    expect(exportDoc.data).toEqual({});
    expect(exportDoc.exportedAt).toBe('2026-07-23T10:15:00.000Z');
  });

  it('downloadTextFile is a no-op and never throws when there is no window/document', () => {
    expect(() => downloadTextFile('export.json', '{}')).not.toThrow();
  });
});
