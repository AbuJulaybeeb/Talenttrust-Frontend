/**
 * Severity level for reported errors.
 */
export type ErrorLevel = 'warn' | 'error';

/**
 * Custom error reporter function.
 *
 * @param error   - The error or value to report.
 * @param context - A short human-readable label describing where the error occurred.
 * @param level   - Optional severity level ('warn' | 'error'). Defaults to 'error'.
 * @param meta    - Optional structured metadata attached to the report.
 */
export type ErrorReporter = (
  error: unknown,
  context: string,
  level?: ErrorLevel,
  meta?: Record<string, unknown>,
) => void;

const defaultReporter: ErrorReporter = (error, context, level, meta) => {
  if (process.env.NODE_ENV !== 'production') {
    const logger = level === 'warn' ? console.warn : console.error;
    if (meta !== undefined) {
      logger(`[${context}]`, error, meta);
    } else {
      logger(`[${context}]`, error);
    }
  }
};

let activeReporter: ErrorReporter = defaultReporter;

/**
 * Reports an error with context, an optional severity level, and optional metadata.
 *
 * Default behavior:
 * - Development/Test environments: Outputs to console.warn (level='warn') or
 *   console.error (level='error' or omitted), with metadata if provided.
 * - Production: No-op.
 *
 * Can be overridden by calling {@link setErrorReporter}.
 *
 * @param error   - The error or value to report.
 * @param context - A short human-readable label describing where the error occurred.
 * @param level   - Optional severity level. Defaults to 'error'.
 * @param meta    - Optional structured metadata attached to the report.
 */
export function reportError(
  error: unknown,
  context: string,
  level?: ErrorLevel,
  meta?: Record<string, unknown>,
): void {
  try {
    activeReporter(error, context, level, meta);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error within injected error reporter:', err);
    }
  }
}

/**
 * Inject a custom error reporter, or pass null to reset to default.
 */
export function setErrorReporter(reporter: ErrorReporter | null): void {
  activeReporter = reporter || defaultReporter;
}
