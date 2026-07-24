'use client';

import React, { useState, useCallback } from 'react';
import EmptyState from '../../components/EmptyState';
import { ContractCreationForm } from '../../components/ContractCreationForm';
import { listContracts, saveContract } from '@/lib/repository';
import type { Contract } from '@/types/domain';

const PAGE_SIZE = 5;

const ContractsPage: React.FC = () => {
  // Initialise from localStorage on first render; subsequent saves trigger
  // a state update so the list reflects newly added items immediately.
  const [contracts, setContracts] = useState<Contract[]>(() => listContracts());
  const [showForm, setShowForm] = useState(false);

  // Pagination, search, and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Filtered contracts
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.contractName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reset pagination to first page when search or filter changes
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, statusFilter]);

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

  /**
   * Loads the next batch of contracts.
   */
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredContracts.length));
  }, [filteredContracts.length]);

  const hasMore = visibleCount < filteredContracts.length;

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Contracts</h1>

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

          <div className="mb-4 text-sm text-slate-500" aria-live="polite">
            Showing {Math.min(visibleCount, filteredContracts.length)} of {filteredContracts.length} contract{filteredContracts.length === 1 ? '' : 's'}
          </div>

          {filteredContracts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 rounded-3xl border border-dashed border-slate-200 bg-white p-6 shadow-sm">
              No contracts match your search or filter.
            </div>
          ) : (
            <>
              <ul className="space-y-4">
                {filteredContracts.slice(0, visibleCount).map((contract, idx) => (
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

              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    aria-label="Load more contracts"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
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

