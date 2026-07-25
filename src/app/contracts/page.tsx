'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import EmptyState from '../../components/EmptyState';
import { ContractCreationForm } from '../../components/ContractCreationForm';
import ContractStatusFilter, {
  type ContractStatusValue,
} from '@/components/contracts/ContractStatusFilter';
import { listContracts, saveContract } from '@/lib/repository';
import type { Contract } from '@/types/domain';

const ContractsPage: React.FC = () => {
  // Initialise from localStorage on first render; subsequent saves trigger
  // a state update so the list reflects newly added items immediately.
  const [contracts, setContracts] = useState<Contract[]>(() => listContracts());
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ContractStatusValue>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  /** Client-side filtered contracts derived from the active status filter and search term. */
  const filteredContracts = useMemo(() => {
    let result = contracts;
    if (statusFilter !== 'All') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.contractName.toLowerCase().includes(term) ||
          c.status.toLowerCase().includes(term),
      );
    }
    return result;
  }, [contracts, statusFilter, searchTerm]);

  const countSummary =
    statusFilter === 'All'
      ? `Showing ${filteredContracts.length} of ${contracts.length} contract${contracts.length !== 1 ? 's' : ''}`
      : `Showing ${filteredContracts.length} of ${contracts.length} ${statusFilter.toLowerCase()} contract${contracts.length !== 1 ? 's' : ''}`;

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

  /**
   * Closes the contract creation form modal.
   */
  const handleCancelForm = useCallback(() => {
    setShowForm(false);
  }, []);

  return (
    <main className="min-h-screen p-8">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold mb-6 focus-visible:outline-none">
        Contracts
      </h1>

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
            <div className="flex flex-1 flex-col sm:flex-row gap-4">
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
              <div className="w-full sm:w-48">
                <label htmlFor="filter-status" className="sr-only">Filter by status</label>
                <select
                  id="filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCreateContract}
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Create Contract
            </button>
          </div>

          <p
            className="text-sm text-slate-600 mb-4"
            aria-live="polite"
            aria-atomic="true"
          >
            {countSummary}
          </p>

          <ContractStatusFilter
            selected={statusFilter}
            onChange={setStatusFilter}
            resultCount={filteredContracts.length}
          />

          {filteredContracts.length === 0 ? (
            <p className="text-sm text-slate-500">No contracts match the selected filter.</p>
          ) : (
            <ul className="space-y-4">
              {filteredContracts.map((contract, idx) => (
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
          )}
        </>
      )}

      {showForm && (
        <ContractCreationForm
          onSubmit={handleSubmitContract}
          onCancel={handleCancelForm}
        />
      )}
    </main>
  );
};

export default ContractsPage;