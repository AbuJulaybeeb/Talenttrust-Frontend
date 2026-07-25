'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import EmptyState from '../../components/EmptyState';
import Card from '../../components/Card';
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

  /** Client-side filtered contracts derived from the search and status filters. */
  const filteredContracts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return contracts.filter((contract) => {
      const matchesSearch =
        normalizedSearch === '' ||
        contract.contractName.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'All' || contract.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchTerm, statusFilter]);
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
      <h1 className="text-2xl font-bold mb-6">
        Contracts
      </h1>
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
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="relative flex-1">
                <label htmlFor="search-contracts" className="sr-only">Search contracts</label>
                <input
                  id="search-contracts"
                  type="search"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

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
              <li key={`${contract.contractName}-${idx}`}>
                <Card>
                  <p className="font-semibold text-slate-900">{contract.contractName}</p>
                  <p className="text-sm text-slate-500">
                    {contract.status} · Created {contract.createdAt}
                  </p>
                </Card>
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

