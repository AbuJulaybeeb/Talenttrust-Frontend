import { reportError, setErrorReporter } from '../errorReporter';

describe('errorReporter', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    setErrorReporter(null); // Reset to default reporter
    (process.env as any).NODE_ENV = 'test';
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    (process.env as any).NODE_ENV = originalEnv;
  });

  describe('default reporter – level behavior', () => {
    it('logs to console.error when no level is provided (backward compatible)', () => {
      const error = new Error('Test error');
      reportError(error, 'TestContext');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[TestContext]', error);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('logs to console.error when level is "error"', () => {
      const error = new Error('Error level');
      reportError(error, 'Ctx', 'error');

      expect(consoleErrorSpy).toHaveBeenCalledWith('[Ctx]', error);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('logs to console.warn when level is "warn"', () => {
      const error = new Error('Warning');
      reportError(error, 'Ctx', 'warn');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Ctx]', error);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('default reporter – metadata', () => {
    it('passes metadata alongside the error when meta is provided', () => {
      const error = new Error('With meta');
      const meta = { userId: 'u1', amount: 100 };
      reportError(error, 'Ctx', 'error', meta);

      expect(consoleErrorSpy).toHaveBeenCalledWith('[Ctx]', error, meta);
    });

    it('does not include meta when none is given', () => {
      reportError('string error', 'Ctx', 'warn');

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Ctx]', 'string error');
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        '[Ctx]', 'string error', expect.anything(),
      );
    });

    it('passes metadata with warn level', () => {
      const meta = { route: '/milestones' };
      reportError('timeout', 'Ctx', 'warn', meta);

      expect(consoleWarnSpy).toHaveBeenCalledWith('[Ctx]', 'timeout', meta);
    });
  });

  describe('production mode', () => {
    beforeEach(() => {
      (process.env as any).NODE_ENV = 'production';
    });

    it('does not log anything for error level', () => {
      reportError(new Error('prod'), 'Ctx', 'error');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('does not log anything for warn level', () => {
      reportError('prod warn', 'Ctx', 'warn');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('does not log metadata in production', () => {
      reportError(new Error('prod'), 'Ctx', 'error', { secret: 'should-not-appear' });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('does not log anything when no level or meta is provided', () => {
      reportError(new Error('prod plain'), 'Ctx');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('custom reporter', () => {
    it('calls a custom injected reporter with (error, context)', () => {
      const mockReporter = jest.fn();
      setErrorReporter(mockReporter);

      const error = new Error('Custom error');
      reportError(error, 'CustomContext');

      expect(mockReporter).toHaveBeenCalledTimes(1);
      expect(mockReporter).toHaveBeenCalledWith(error, 'CustomContext', undefined, undefined);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('calls custom reporter with level and meta', () => {
      const mockReporter = jest.fn();
      setErrorReporter(mockReporter);

      const error = new Error('Rich error');
      const meta = { invoiceId: 'inv-42' };
      reportError(error, 'Invoices', 'warn', meta);

      expect(mockReporter).toHaveBeenCalledTimes(1);
      expect(mockReporter).toHaveBeenCalledWith(error, 'Invoices', 'warn', meta);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('passes metadata to custom reporter with error level', () => {
      const mockReporter = jest.fn();
      setErrorReporter(mockReporter);

      reportError('fail', 'Pay', 'error', { code: 500 });
      expect(mockReporter).toHaveBeenCalledWith('fail', 'Pay', 'error', { code: 500 });
    });
  });

  describe('reporter exception safety', () => {
    it('safely handles custom reporter exceptions and logs them to console in non-production', () => {
      const buggyReporter: any = () => {
        throw new Error('Bug in reporter');
      };
      setErrorReporter(buggyReporter);

      const error = new Error('Reported error');

      // Should not throw / crash the application
      expect(() => {
        reportError(error, 'BuggyContext');
      }).not.toThrow();

      // In development/test, it should log the reporter error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error within injected error reporter:',
        expect.any(Error),
      );
    });

    it('safely handles custom reporter exceptions as no-op in production', () => {
      (process.env as any).NODE_ENV = 'production';
      const buggyReporter: any = () => {
        throw new Error('Bug in reporter');
      };
      setErrorReporter(buggyReporter);

      const error = new Error('Reported error');

      expect(() => {
        reportError(error, 'BuggyContext');
      }).not.toThrow();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('setErrorReporter(null) resets to default', () => {
    it('resets to default after custom reporter is set', () => {
      setErrorReporter(jest.fn());
      setErrorReporter(null);

      reportError('err', 'AfterReset');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[AfterReset]', 'err');
    });
  });
});
