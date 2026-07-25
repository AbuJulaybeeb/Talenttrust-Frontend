import { useState, useEffect } from 'react';

export const NAV_ROUTES = [
  { href: '/contracts', label: 'Contracts' },
  { href: '/milestones', label: 'Milestones' },
  { href: '/reputation', label: 'Reputation' },
] as const;

export function useNavigation() {
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<Error | null>(null);

  useEffect(() => {
    // Mimics a fast load/hydration settlement
    setIsLoading(false);
  }, []);

  return { routes: NAV_ROUTES, isLoading, error };
}
