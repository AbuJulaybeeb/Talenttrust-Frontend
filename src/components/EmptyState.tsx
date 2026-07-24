'use client';

import React, { useId } from 'react';

export type EmptyStateVariant = 'contracts' | 'milestones' | 'reputation' | 'wallet';

interface EmptyStateProps {
  icon?: React.ReactNode;
  illustration?: EmptyStateVariant;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const illustrationClassNames: Record<EmptyStateVariant, string> = {
  contracts: 'bg-blue-50 text-blue-700 ring-blue-100',
  milestones: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  reputation: 'bg-amber-50 text-amber-700 ring-amber-100',
  wallet: 'bg-violet-50 text-violet-700 ring-violet-100',
};

const illustrations: Record<EmptyStateVariant, React.ReactNode> = {
  contracts: (
    <svg className="h-16 w-16" fill="none" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="14" y="12" width="36" height="44" rx="6" stroke="currentColor" strokeWidth="4" />
      <path d="M23 26h18M23 36h18M23 46h12" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
    </svg>
  ),
  milestones: (
    <svg className="h-16 w-16" fill="none" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M18 18h28M18 32h28M18 46h28" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      <circle cx="18" cy="18" r="6" fill="currentColor" />
      <circle cx="18" cy="32" r="6" fill="currentColor" opacity="0.75" />
      <circle cx="18" cy="46" r="6" fill="currentColor" opacity="0.45" />
    </svg>
  ),
  reputation: (
    <svg className="h-16 w-16" fill="none" viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M32 10l6.2 12.6 13.9 2-10 9.8 2.4 13.8L32 41.7 19.6 48.2l2.4-13.8-10-9.8 13.9-2L32 10z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path d="M24 54h16" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
    </svg>
  ),
  wallet: (
    <svg className="h-16 w-16" fill="none" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="16" width="48" height="36" rx="6" stroke="currentColor" strokeWidth="4" />
      <rect x="24" y="28" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="3" />
      <circle cx="34" cy="34" r="2" fill="currentColor" />
      <path d="M8 26h4a4 4 0 014 4v0a4 4 0 01-4 4H8" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  ),
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const titleId = useId();
  const renderedIllustration = illustration ? illustrations[illustration] : undefined;

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-8 text-center sm:px-8 sm:py-10"
      role="region"
      aria-labelledby={titleId}
    >
      {(icon || renderedIllustration) && (
        <div
          className={`mb-5 inline-flex h-24 w-24 items-center justify-center rounded-2xl ring-1 ${
            illustration ? illustrationClassNames[illustration] : 'bg-slate-50 text-slate-500 ring-slate-200'
          }`}
          aria-hidden="true"
        >
          {icon ?? renderedIllustration}
        </div>
      )}
      <h2
        id={titleId}
        className="mb-2 max-w-xl text-xl font-semibold text-gray-950"
      >
        {title}
      </h2>
      <p className="mb-5 max-w-md text-sm leading-6 text-gray-700 sm:text-base">{description}</p>
      {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
        <div className="flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
              aria-label={actionLabel}
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="rounded-md border border-gray-400 bg-white px-4 py-2.5 text-sm font-semibold text-gray-950 transition-colors hover:border-gray-600 hover:bg-gray-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
              aria-label={secondaryActionLabel}
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default EmptyState;
