'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import EmptyState from '../../components/EmptyState';
import { ContractCreationForm } from '../../components/ContractCreationForm';
import { listContracts, saveContract } from '@/lib/repository';
import type { Contract } from '@/types/domain';

const ANNOUNCEMENT_DELAY_MS = 250;

export function getContractsAnnouncementMessage(contracts: Contract[], previousContracts: Contract[]) {
  if (contracts.length === 0) {
    return 'No contracts found.';
  }

  const currentCount = contracts.length;
  const previousCount = previousContracts.length;
  const countDifference = currentCount - previousCount;

  if (countDifference > 0) {
    return `${currentCount} contract${currentCount === 1 ? '' : 's'} available`;
  }

  if (countDifference < 0) {
    return `${currentCount} contract${currentCount === 1 ? '' : 's'} available`;
  }

  return `${currentCount} contract${currentCount === 1 ? '' : 's'} available`;
}

const ContractsPage: React.FC = () => {
  // Initialise from localStorage on first render; subsequent saves trigger
  // a state update so the list reflects newly added items immediately.
  const [contracts, setContracts] = useState<Contract[]>(() => listContracts());
  const [showForm, setShowForm] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const previousContractsRef = useRef<Contract[]>(contracts);
  const announcementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Opens the contract creation form modal.
   */
  const handleCreateContract = useCallback(() => {
    setShowForm(true);
  }, []);

  /**
   * Handles form submission by persisting the contract and refreshing the list.
   */
  const handleSubmitContract = useCallback((contract: Contract) => {
    saveContract(contract);
    // Re-read storage so the component reflects the persisted state.
    setContracts(listContracts());
    setShowForm(false);
  }, []);

  useEffect(() => {
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }

    if (contracts === previousContractsRef.current) {
      return undefined;
    }

    const nextAnnouncement = getContractsAnnouncementMessage(contracts, previousContractsRef.current);
    announcementTimeoutRef.current = setTimeout(() => {
      setAnnouncement(nextAnnouncement);
      previousContractsRef.current = contracts;
    }, ANNOUNCEMENT_DELAY_MS);

    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, [contracts]);

  /**
   * Closes the contract creation form modal.
   */
  const handleCancelForm = useCallback(() => {
    setShowForm(false);
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Contracts</h1>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {!showForm && contracts.length === 0 && (
        <EmptyState
          illustration="contracts"
          title="No contracts found"
          description="You haven't created any contracts yet. Start by creating your first contract to begin freelancing securely."
          actionLabel="Create Contract"
          onAction={handleCreateContract}
        />
      )}

      {!showForm && contracts.length > 0 && (
        <>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={handleCreateContract}
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Create Contract
            </button>
          </div>
          {/* TODO: Replace with a proper ContractSummary list component. */}
          <ul className="space-y-4">
            {contracts.map((contract, idx) => (
              <li
                key={`${contract.contractName}-${idx}`}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold text-slate-900">{contract.contractName}</p>
                <p className="text-sm text-slate-500">
                  {contract.status} · Created {contract.createdAt}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      {showForm && (
        <div className="mb-8">
          <ContractCreationForm
            onSubmit={handleSubmitContract}
            onCancel={handleCancelForm}
          />
        </div>
      )}
    </main>
  );
};

export default ContractsPage;

