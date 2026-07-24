import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContractsPage from '../page';
import ContractsLoading from '../loading';
import * as repository from '@/lib/repository';

import * as stellarAddress from '@/lib/stellarAddress';


// Mock dependencies
jest.mock('@/lib/repository', () => {
  const actual = jest.requireActual('@/lib/repository');

  return {
    ...actual,
    listContracts: jest.fn(actual.listContracts),
    saveContract: jest.fn(actual.saveContract),
  };
});
jest.mock('@/lib/stellarAddress');

const mockListContracts = repository.listContracts as jest.MockedFunction<
  typeof repository.listContracts
>;
const mockSaveContract = repository.saveContract as jest.MockedFunction<
  typeof repository.saveContract
>;
const mockIsValidStellarAddress = stellarAddress.isValidStellarAddress as jest.MockedFunction<
  typeof stellarAddress.isValidStellarAddress
>;

const VALID_ADDRESS = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H';

describe('ContractsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockListContracts.mockReturnValue([]);
    mockIsValidStellarAddress.mockImplementation((addr: string | null | undefined) => addr === VALID_ADDRESS);
  });

  describe('Loading State', () => {
    it('renders a loading skeleton with accessible status, busy main landmark and list label', () => {
      render(<ContractsLoading />);

      expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('status')).toHaveTextContent(/loading contracts/i);
      expect(screen.getByLabelText('Loading contract list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });
  });

  describe('Empty State', () => {
    it('renders EmptyState when contracts array is empty', () => {
      render(<ContractsPage />);

      expect(screen.getByText('No contracts found')).toBeInTheDocument();
      expect(screen.getByText('You haven\'t created any contracts yet. Start by creating your first contract to begin freelancing securely.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Contract' })).toBeInTheDocument();
    });

    it('opens form when create contract button is clicked in empty state', () => {
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/create new contract/i)).toBeInTheDocument();
    });
  });

  describe('Contract List Display', () => {
    it('renders list of contracts when contracts exist', () => {
      const mockContracts = [
        {
          contractName: 'Website Redesign',
          parties: [
            { label: 'Client', address: VALID_ADDRESS },
            { label: 'Freelancer', address: VALID_ADDRESS },
          ],
          totalValue: 5000,
          currency: 'USD',
          status: 'Active' as const,
          createdAt: 'Jan 15, 2025',
          milestoneCount: 3,
        },
        {
          contractName: 'Mobile App Development',
          parties: [
            { label: 'Client', address: VALID_ADDRESS },
            { label: 'Developer', address: VALID_ADDRESS },
          ],
          totalValue: 10000,
          currency: 'EUR',
          status: 'Pending' as const,
          createdAt: 'Feb 1, 2025',
          milestoneCount: 5,
        },
      ];

      mockListContracts.mockReturnValue(mockContracts);
      render(<ContractsPage />);

      expect(screen.getByText('Website Redesign')).toBeInTheDocument();
      expect(screen.getByText('Mobile App Development')).toBeInTheDocument();
      expect(screen.getByText(/active.*jan 15, 2025/i)).toBeInTheDocument();
      expect(screen.getByText(/pending.*feb 1, 2025/i)).toBeInTheDocument();
    });

    it('does not show empty state when contracts exist', () => {
      const mockContracts = [
        {
          contractName: 'Test Contract',
          parties: [
            { label: 'Client', address: VALID_ADDRESS },
            { label: 'Freelancer', address: VALID_ADDRESS },
          ],
          totalValue: 1000,
          currency: 'USD',
          status: 'Pending' as const,
          createdAt: 'Jan 1, 2025',
          milestoneCount: 1,
        },
      ];

      mockListContracts.mockReturnValue(mockContracts);
      render(<ContractsPage />);

      expect(screen.queryByText(/no contracts found/i)).not.toBeInTheDocument();
    });
  });

  describe('Contract Creation Form', () => {
    it('does not show form initially', () => {
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows form when create button is clicked', () => {
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('closes form when cancel is clicked', async () => {
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('validates required fields before submission', async () => {
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      // Open form
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      // Try to submit empty form
      fireEvent.click(screen.getByRole('button', { name: /create contract/i, hidden: false }));

      await waitFor(() => {
        expect(screen.getByRole('alert', { name: /there is a problem/i })).toBeInTheDocument();
      });

      expect(mockSaveContract).not.toHaveBeenCalled();
    });

    it('validates Stellar addresses before submission', async () => {
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      // Open form
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      // Fill in form with invalid address
      fireEvent.change(screen.getByLabelText(/contract name/i), {
        target: { value: 'Test Contract' },
      });
      fireEvent.change(screen.getByLabelText(/total value/i), {
        target: { value: '5000' },
      });

      const partyLabels = screen.getAllByPlaceholderText(/e\.g\., client, freelancer/i);
      const partyAddresses = screen.getAllByPlaceholderText(/GXXXXXXXXXX/i);

      fireEvent.change(partyLabels[0], { target: { value: 'Client' } });
      fireEvent.change(partyAddresses[0], { target: { value: 'INVALID_ADDRESS' } });

      fireEvent.change(partyLabels[1], { target: { value: 'Freelancer' } });
      fireEvent.change(partyAddresses[1], { target: { value: VALID_ADDRESS } });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /create contract/i, hidden: false }));

      await waitFor(() => {
        expect(screen.getAllByText(/party 1 address must be a valid stellar address/i)[0]).toBeInTheDocument();
      });
      expect(mockSaveContract).not.toHaveBeenCalled();
    });
  });

  describe('Contract Persistence', () => {
    it('saves contract and refreshes list on successful submission', async () => {
      // Start with empty list
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      // Open form
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText(/contract name/i), {
        target: { value: 'New Contract' },
      });
      fireEvent.change(screen.getByLabelText(/total value/i), {
        target: { value: '7500' },
      });
      fireEvent.change(screen.getByLabelText(/currency/i), {
        target: { value: 'EUR' },
      });

      const partyLabels = screen.getAllByPlaceholderText(/e\.g\., client, freelancer/i);
      const partyAddresses = screen.getAllByPlaceholderText(/GXXXXXXXXXX/i);

      fireEvent.change(partyLabels[0], { target: { value: 'Client Corp' } });
      fireEvent.change(partyAddresses[0], { target: { value: VALID_ADDRESS } });

      fireEvent.change(partyLabels[1], { target: { value: 'Designer' } });
      fireEvent.change(partyAddresses[1], { target: { value: VALID_ADDRESS } });

      // Mock the updated list after save
      const newContract = {
        contractName: 'New Contract',
        parties: [
          { label: 'Client Corp', address: VALID_ADDRESS },
          { label: 'Designer', address: VALID_ADDRESS },
        ],
        totalValue: 7500,
        currency: 'EUR',
        status: 'Pending' as const,
        createdAt: 'Jan 1, 2025',
        milestoneCount: 0,
      };
      mockListContracts.mockReturnValue([newContract]);

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /create contract/i, hidden: false }));

      await waitFor(() => {
        expect(mockSaveContract).toHaveBeenCalledTimes(1);
      });

      // Verify saveContract was called with correct data
      expect(mockSaveContract).toHaveBeenCalledWith(
        expect.objectContaining({
          contractName: 'New Contract',
          totalValue: 7500,
          currency: 'EUR',
          status: 'Pending',
          milestoneCount: 0,
          parties: [
            { label: 'Client Corp', address: VALID_ADDRESS },
            { label: 'Designer', address: VALID_ADDRESS },
          ],
        })
      );

      // Verify listContracts was called to refresh
      expect(mockListContracts).toHaveBeenCalled();
    });

    it('closes form after successful submission', async () => {
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      // Open form
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Fill in valid form data
      fireEvent.change(screen.getByLabelText(/contract name/i), {
        target: { value: 'Test Contract' },
      });
      fireEvent.change(screen.getByLabelText(/total value/i), {
        target: { value: '1000' },
      });

      const partyLabels = screen.getAllByPlaceholderText(/e\.g\., client, freelancer/i);
      const partyAddresses = screen.getAllByPlaceholderText(/GXXXXXXXXXX/i);

      fireEvent.change(partyLabels[0], { target: { value: 'Party 1' } });
      fireEvent.change(partyAddresses[0], { target: { value: VALID_ADDRESS } });

      fireEvent.change(partyLabels[1], { target: { value: 'Party 2' } });
      fireEvent.change(partyAddresses[1], { target: { value: VALID_ADDRESS } });

      // Mock updated list
      mockListContracts.mockReturnValue([
        {
          contractName: 'Test Contract',
          parties: [
            { label: 'Party 1', address: VALID_ADDRESS },
            { label: 'Party 2', address: VALID_ADDRESS },
          ],
          totalValue: 1000,
          currency: 'USD',
          status: 'Pending' as const,
          createdAt: 'Jan 1, 2025',
          milestoneCount: 0,
        },
      ]);

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /create contract/i, hidden: false }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('displays newly created contract in the list', async () => {
      // Start with empty list
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      // Open and submit form
      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      fireEvent.change(screen.getByLabelText(/contract name/i), {
        target: { value: 'My First Contract' },
      });
      fireEvent.change(screen.getByLabelText(/total value/i), {
        target: { value: '2500' },
      });

      const partyLabels = screen.getAllByPlaceholderText(/e\.g\., client, freelancer/i);
      const partyAddresses = screen.getAllByPlaceholderText(/GXXXXXXXXXX/i);

      fireEvent.change(partyLabels[0], { target: { value: 'Client' } });
      fireEvent.change(partyAddresses[0], { target: { value: VALID_ADDRESS } });

      fireEvent.change(partyLabels[1], { target: { value: 'Worker' } });
      fireEvent.change(partyAddresses[1], { target: { value: VALID_ADDRESS } });

      // Update mock to return the new contract
      const createdContract = {
        contractName: 'My First Contract',
        parties: [
          { label: 'Client', address: VALID_ADDRESS },
          { label: 'Worker', address: VALID_ADDRESS },
        ],
        totalValue: 2500,
        currency: 'USD',
        status: 'Pending' as const,
        createdAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        milestoneCount: 0,
      };
      mockListContracts.mockReturnValue([createdContract]);

      fireEvent.click(screen.getByRole('button', { name: /create contract/i, hidden: false }));

      await waitFor(() => {
        expect(screen.getByText('My First Contract')).toBeInTheDocument();
      });

      expect(screen.queryByText(/no contracts found/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Requirements', () => {
    it('requires at least two parties', async () => {
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      fireEvent.click(screen.getByRole('button', { name: /create contract/i }));

      // Fill only one party
      fireEvent.change(screen.getByLabelText(/contract name/i), {
        target: { value: 'Test' },
      });
      fireEvent.change(screen.getByLabelText(/total value/i), {
        target: { value: '1000' },
      });

      const partyLabels = screen.getAllByPlaceholderText(/e\.g\., client, freelancer/i);
      const partyAddresses = screen.getAllByPlaceholderText(/GXXXXXXXXXX/i);

      fireEvent.change(partyLabels[0], { target: { value: 'Client' } });
      fireEvent.change(partyAddresses[0], { target: { value: VALID_ADDRESS } });

      fireEvent.click(screen.getByRole('button', { name: /create contract/i, hidden: false }));

      await waitFor(() => {
        expect(screen.getAllByText(/at least two parties are required/i)[0]).toBeInTheDocument();
      });
    });
  });

  describe('Page Structure', () => {
    it('renders page heading', () => {
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      expect(screen.getByRole('heading', { name: 'Contracts', level: 1 })).toBeInTheDocument();
    });

    it('renders main landmark', () => {
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('opens contract creation form with keyboard Enter on the action button', async () => {
      const user = userEvent.setup();
      mockListContracts.mockReturnValue([]);
      render(<ContractsPage />);

      const createButton = screen.getByRole('button', { name: /create contract/i });
      createButton.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByRole('dialog', { name: /create new contract/i })).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'create-contract-title');
      expect(screen.getByRole('heading', { name: /create new contract/i })).toHaveAttribute('id', 'create-contract-title');
    });
  });

  it('renders persisted contracts when storage already contains data', () => {
    const existingContracts = [
      {
        contractName: 'Existing Contract',
        parties: [],
        totalValue: 1000,
        currency: 'USD',
        status: 'Active' as const,
        createdAt: 'Apr 20, 2026',
        milestoneCount: 1,
      },
    ];
    mockListContracts.mockReturnValue(existingContracts);

    render(<ContractsPage />);

    expect(screen.getByText('Existing Contract')).toBeInTheDocument();
    expect(screen.getByText(/Active · Created Apr 20, 2026/)).toBeInTheDocument();
  });

  it('calls saveContract and refreshes contracts on form submission', async () => {
    mockListContracts.mockReturnValue([]);
    render(<ContractsPage />);

    // Open the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Contract' }));

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/contract name/i), {
      target: { value: 'My New Contract' },
    });
    fireEvent.change(screen.getByLabelText(/total value/i), {
      target: { value: '1000' },
    });
    const partyLabels = screen.getAllByPlaceholderText(/e\.g\., client, freelancer/i);
    const partyAddresses = screen.getAllByPlaceholderText(/GXXXXXXXXXX/i);
    fireEvent.change(partyLabels[0], { target: { value: 'Client' } });
    fireEvent.change(partyAddresses[0], { target: { value: VALID_ADDRESS } });
    fireEvent.change(partyLabels[1], { target: { value: 'Freelancer' } });
    fireEvent.change(partyAddresses[1], { target: { value: VALID_ADDRESS } });

    const newContract = {
      contractName: 'My New Contract',
      parties: [
        { label: 'Client', address: VALID_ADDRESS },
        { label: 'Freelancer', address: VALID_ADDRESS },
      ],
      totalValue: 1000,
      currency: 'USD',
      status: 'Pending' as const,
      createdAt: 'Jan 1, 2025',
      milestoneCount: 0,
    };
    mockListContracts.mockReturnValue([newContract]);

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create contract/i, hidden: false }));

    await waitFor(() => {
      expect(mockSaveContract).toHaveBeenCalledTimes(1);
    });

    expect(mockListContracts).toHaveBeenCalled();
  });

  describe('Pagination & Filtering', () => {
    const buildMockContracts = (count: number) => {
      return Array.from({ length: count }, (_, i) => ({
        contractName: `Contract ${i + 1}`,
        parties: [],
        totalValue: 1000 * (i + 1),
        currency: 'USD',
        status: i % 2 === 0 ? ('Active' as const) : ('Pending' as const),
        createdAt: 'Jan 1, 2025',
        milestoneCount: 0,
      }));
    };

    it('renders initial page of contracts correctly (PAGE_SIZE = 5)', () => {
      mockListContracts.mockReturnValue(buildMockContracts(12));
      render(<ContractsPage />);

      // Verify that only the first 5 contracts are rendered
      expect(screen.getByText('Contract 1')).toBeInTheDocument();
      expect(screen.getByText('Contract 5')).toBeInTheDocument();
      expect(screen.queryByText('Contract 6')).not.toBeInTheDocument();

      // Verify page status text
      expect(screen.getByText('Showing 5 of 12 contracts')).toBeInTheDocument();

      // Verify "Load More" button is visible
      const loadMoreBtn = screen.getByRole('button', { name: /load more/i });
      expect(loadMoreBtn).toBeInTheDocument();
    });

    it('reveals the next batch of contracts when Load More is clicked', () => {
      mockListContracts.mockReturnValue(buildMockContracts(12));
      render(<ContractsPage />);

      const loadMoreBtn = screen.getByRole('button', { name: /load more/i });
      fireEvent.click(loadMoreBtn);

      // Now contracts 1-10 should be visible
      expect(screen.getByText('Contract 6')).toBeInTheDocument();
      expect(screen.getByText('Contract 10')).toBeInTheDocument();
      expect(screen.queryByText('Contract 11')).not.toBeInTheDocument();
      expect(screen.getByText('Showing 10 of 12 contracts')).toBeInTheDocument();

      // Click Load More again to load the remaining 2
      fireEvent.click(loadMoreBtn);
      expect(screen.getByText('Contract 11')).toBeInTheDocument();
      expect(screen.getByText('Contract 12')).toBeInTheDocument();
      expect(screen.getByText('Showing 12 of 12 contracts')).toBeInTheDocument();

      // "Load More" button should be removed from document as no more contracts are left
      expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
    });

    it('resets pagination to page one when search query changes', () => {
      mockListContracts.mockReturnValue(buildMockContracts(12));
      render(<ContractsPage />);

      // Click load more to show 10 contracts
      fireEvent.click(screen.getByRole('button', { name: /load more/i }));
      expect(screen.getByText('Contract 10')).toBeInTheDocument();

      // Change search term
      const searchInput = screen.getByPlaceholderText(/search contracts\.\.\./i);
      fireEvent.change(searchInput, { target: { value: 'Contract' } });

      // Count resets back to PAGE_SIZE (5)
      expect(screen.getByText('Showing 5 of 12 contracts')).toBeInTheDocument();
    });

    it('resets pagination to page one when status filter changes', () => {
      mockListContracts.mockReturnValue(buildMockContracts(12));
      render(<ContractsPage />);

      // Click load more to show 10 contracts
      fireEvent.click(screen.getByRole('button', { name: /load more/i }));
      expect(screen.getByText('Contract 10')).toBeInTheDocument();

      // Change status filter
      const filterSelect = screen.getByLabelText(/filter by status/i);
      fireEvent.change(filterSelect, { target: { value: 'Active' } });

      // There are 6 active contracts (i % 2 === 0: 1, 3, 5, 7, 9, 11)
      // Since it resets to page one, only 5 of 6 are shown
      expect(screen.getByText('Showing 5 of 6 contracts')).toBeInTheDocument();
    });

    it('handles edge case: fewer contracts than one page', () => {
      mockListContracts.mockReturnValue(buildMockContracts(3));
      render(<ContractsPage />);

      expect(screen.getByText('Contract 1')).toBeInTheDocument();
      expect(screen.getByText('Contract 3')).toBeInTheDocument();
      expect(screen.getByText('Showing 3 of 3 contracts')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
    });

    it('handles edge case: exact page boundary', () => {
      mockListContracts.mockReturnValue(buildMockContracts(5));
      render(<ContractsPage />);

      expect(screen.getByText('Contract 1')).toBeInTheDocument();
      expect(screen.getByText('Contract 5')).toBeInTheDocument();
      expect(screen.getByText('Showing 5 of 5 contracts')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
    });

    it('handles empty filtered results', () => {
      mockListContracts.mockReturnValue(buildMockContracts(5));
      render(<ContractsPage />);

      const searchInput = screen.getByPlaceholderText(/search contracts\.\.\./i);
      fireEvent.change(searchInput, { target: { value: 'Non-existent' } });

      expect(screen.getByText('No contracts match your search or filter.')).toBeInTheDocument();
      expect(screen.getByText('Showing 0 of 0 contracts')).toBeInTheDocument();
    });
  });
});