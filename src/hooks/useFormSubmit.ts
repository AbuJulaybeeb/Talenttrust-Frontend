import { useCallback } from 'react';
import { useToast } from '@/components/toast/toast-provider';
import { reportError } from '@/lib/errorReporter';

/**
 * A shared hook to wrap form submit handlers.
 * It catches both synchronous and asynchronous unexpected errors,
 * logs them via the existing error reporter, and shows a global error toast.
 * It does not interfere with normal validation flows unless they throw.
 *
 * @param submitHandler - The form submission callback (e.g., handles the save/network request)
 * @param context - A string identifying the form context for error reporting
 */
export function useFormSubmit<T extends (...args: any[]) => any>(
  submitHandler: T,
  context: string = 'FormSubmit'
) {
  const { showError } = useToast();

  return useCallback(
    async (...args: Parameters<T>) => {
      try {
        const result = submitHandler(...args);
        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        reportError(error, context);
        showError({
          title: 'An unexpected error occurred',
          description: error instanceof Error ? error.message : 'Please try again later.',
        });
      }
    },
    [submitHandler, showError, context]
  ) as (...args: Parameters<T>) => void;
}
