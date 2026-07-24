import {
  buildAppDataExport,
  buildExportFilename,
  downloadTextFile,
  exportAppDataAsJson,
  serializeAppDataExport,
  EXPORT_FORMAT_VERSION,
  EXPORTABLE_KEYS,
} from '../dataExport';
import { STORAGE_KEY as APP_DATA_STORAGE_KEY } from '../repository';
import { STORAGE_KEY as PREFERENCES_STORAGE_KEY } from '../preferences';
import { setErrorReporter } from '../errorReporter';
import { resetCache } from '../safeStorage';

const FIXED_DATE = new Date('2026-07-23T10:15:00.000Z');
const fixedNow = () => FIXED_DATE;

describe('dataExport', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetCache();
    setErrorReporter(null);
  });

  afterEach(() => {
    setErrorReporter(null);
  });

  describe('EXPORTABLE_KEYS', () => {
    it('is sourced from the real storage keys owned by repository and preferences', () => {
      expect(EXPORTABLE_KEYS).toEqual([APP_DATA_STORAGE_KEY, PREFERENCES_STORAGE_KEY]);
    });

    it('does not include unrelated keys such as login throttle counters', () => {
      expect(EXPORTABLE_KEYS).not.toContain('login_throttle_attempts');
      expect(EXPORTABLE_KEYS).not.toContain('login_throttle_cooldown');
    });
  });

  describe('buildAppDataExport', () => {
    it('yields an empty data document when the store is empty', () => {
      const exportDoc = buildAppDataExport(fixedNow);

      expect(exportDoc).toEqual({
        version: EXPORT_FORMAT_VERSION,
        exportedAt: FIXED_DATE.toISOString(),
        data: {},
      });
    });

    it('includes every stored, namespaced key', () => {
      const appData = { contracts: [{ contractName: 'Design Sprint' }], milestones: [] };
      const preferencesData = { theme: 'dark', amountFormat: 'usd' };

      window.localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(appData));
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferencesData));

      const exportDoc = buildAppDataExport(fixedNow);

      expect(exportDoc.data[APP_DATA_STORAGE_KEY]).toEqual(appData);
      expect(exportDoc.data[PREFERENCES_STORAGE_KEY]).toEqual(preferencesData);
      expect(Object.keys(exportDoc.data)).toHaveLength(2);
    });

    it('reads through the safe storage wrapper rather than localStorage directly', () => {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ theme: 'light' }));

      const exportDoc = buildAppDataExport(fixedNow);

      expect(exportDoc.data[PREFERENCES_STORAGE_KEY]).toEqual({ theme: 'light' });
    });

    it('omits a key entirely when nothing is stored for it', () => {
      window.localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify({ contracts: [], milestones: [] }));
      // PREFERENCES_STORAGE_KEY intentionally left unset.

      const exportDoc = buildAppDataExport(fixedNow);

      expect(Object.keys(exportDoc.data)).toEqual([APP_DATA_STORAGE_KEY]);
    });

    it('skips a corrupt stored value and reports it, without aborting the export', () => {
      const reportSpy = jest.fn();
      setErrorReporter(reportSpy);

      window.localStorage.setItem(APP_DATA_STORAGE_KEY, '{not valid json');
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ theme: 'dark' }));

      const exportDoc = buildAppDataExport(fixedNow);

      expect(exportDoc.data[APP_DATA_STORAGE_KEY]).toBeUndefined();
      expect(exportDoc.data[PREFERENCES_STORAGE_KEY]).toEqual({ theme: 'dark' });
      expect(reportSpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining(APP_DATA_STORAGE_KEY),
        'warn',
        expect.objectContaining({ key: APP_DATA_STORAGE_KEY }),
      );
    });

    it('skips every corrupt key and still yields a valid (if partly empty) document', () => {
      window.localStorage.setItem(APP_DATA_STORAGE_KEY, 'not json at all');
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, '{"unterminated": ');

      const exportDoc = buildAppDataExport(fixedNow);

      expect(exportDoc.data).toEqual({});
      expect(exportDoc.version).toBe(EXPORT_FORMAT_VERSION);
    });

    it('uses the current time when no clock is injected', () => {
      const before = Date.now();
      const exportDoc = buildAppDataExport();
      const after = Date.now();

      const exportedAtMs = new Date(exportDoc.exportedAt).getTime();
      expect(exportedAtMs).toBeGreaterThanOrEqual(before);
      expect(exportedAtMs).toBeLessThanOrEqual(after);
    });
  });

  describe('serializeAppDataExport', () => {
    it('produces pretty-printed, parseable JSON matching the source document', () => {
      const exportDoc = buildAppDataExport(fixedNow);
      const json = serializeAppDataExport(exportDoc);

      expect(json).toContain('\n');
      expect(JSON.parse(json)).toEqual(exportDoc);
    });
  });

  describe('buildExportFilename', () => {
    it('derives a filesystem-safe, timestamped .json filename', () => {
      const exportDoc = buildAppDataExport(fixedNow);
      const filename = buildExportFilename(exportDoc);

      expect(filename).toBe('talenttrust-data-export-2026-07-23T10-15-00-000Z.json');
      expect(filename).not.toMatch(/[:]/);
    });
  });

  describe('downloadTextFile', () => {
    let createObjectURLSpy: jest.SpyInstance;
    let revokeObjectURLSpy: jest.SpyInstance;

    beforeEach(() => {
      createObjectURLSpy = jest.fn().mockReturnValue('blob:mock-url');
      revokeObjectURLSpy = jest.fn();
      Object.defineProperty(window.URL, 'createObjectURL', {
        value: createObjectURLSpy,
        configurable: true,
      });
      Object.defineProperty(window.URL, 'revokeObjectURL', {
        value: revokeObjectURLSpy,
        configurable: true,
      });
    });

    it('creates and clicks a download link, then revokes the object URL', () => {
      const clickSpy = jest.fn();
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const el = originalCreateElement(tagName);
          if (tagName === 'a') {
            el.click = clickSpy;
          }
          return el;
        });

      downloadTextFile('export.json', '{"a":1}');

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');

      createElementSpy.mockRestore();
    });
  });

  describe('exportAppDataAsJson', () => {
    beforeEach(() => {
      Object.defineProperty(window.URL, 'createObjectURL', {
        value: jest.fn().mockReturnValue('blob:mock-url'),
        configurable: true,
      });
      Object.defineProperty(window.URL, 'revokeObjectURL', {
        value: jest.fn(),
        configurable: true,
      });
    });

    it('builds and downloads the export, returning the export document', () => {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ theme: 'dark' }));

      const clickSpy = jest.fn();
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const el = originalCreateElement(tagName);
          if (tagName === 'a') el.click = clickSpy;
          return el;
        });

      const exportDoc = exportAppDataAsJson(fixedNow);

      expect(exportDoc.data[PREFERENCES_STORAGE_KEY]).toEqual({ theme: 'dark' });
      expect(clickSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });

    it('handles an empty store gracefully, still triggering a download of an empty document', () => {
      const clickSpy = jest.fn();
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const el = originalCreateElement(tagName);
          if (tagName === 'a') el.click = clickSpy;
          return el;
        });

      const exportDoc = exportAppDataAsJson(fixedNow);

      expect(exportDoc.data).toEqual({});
      expect(clickSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });

    it('uses the current time and still downloads when no clock is injected', () => {
      const clickSpy = jest.fn();
      const originalCreateElement = document.createElement.bind(document);
      const createElementSpy = jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: string) => {
          const el = originalCreateElement(tagName);
          if (tagName === 'a') el.click = clickSpy;
          return el;
        });

      const before = Date.now();
      const exportDoc = exportAppDataAsJson();
      const after = Date.now();

      const exportedAtMs = new Date(exportDoc.exportedAt).getTime();
      expect(exportedAtMs).toBeGreaterThanOrEqual(before);
      expect(exportedAtMs).toBeLessThanOrEqual(after);
      expect(clickSpy).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });
  });
});
