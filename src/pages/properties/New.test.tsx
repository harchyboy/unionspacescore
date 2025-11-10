import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyNew } from './New';

// Mock the useCreateProperty hook
vi.mock('../../api/properties', () => ({
  useCreateProperty: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      id: 'new-property-id',
      name: 'Test Property',
      addressLine: '123 Test St',
      postcode: 'SW1A 1AA',
      city: 'London',
      country: 'United Kingdom',
      amenities: [],
      marketing: {
        visibility: 'Private',
        status: 'Draft',
        fitOut: 'Shell',
      },
      units: [],
    }),
    isPending: false,
  }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('PropertyNew', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with step 1', () => {
    renderWithProviders(<PropertyNew />);

    expect(screen.getByText('Add Property')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
    expect(screen.getByText('Basics')).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PropertyNew />);

    const submitButton = screen.getByText('Next');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/City is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Postcode is required/i)).toBeInTheDocument();
    });
  });

  it('allows navigation between steps', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PropertyNew />);

    // Fill in required fields
    await user.type(screen.getByLabelText(/Property Name/i), 'Test Property');
    await user.type(screen.getByLabelText(/Address Line/i), '123 Test St');
    await user.type(screen.getByLabelText(/City/i), 'London');
    await user.type(screen.getByLabelText(/Postcode/i), 'SW1A 1AA');

    // Submit step 1
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    // Should be on step 2
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 8')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
    });

    // Go back
    const prevButton = screen.getByText('Previous');
    await user.click(prevButton);

    // Should be back on step 1
    await waitFor(() => {
      expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
    });
  });

  it('shows progress bar', () => {
    renderWithProviders(<PropertyNew />);

    const progressBar = document.querySelector('.bg-\\[\\#252525\\]');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '12.5%' }); // 1/8 = 12.5%
  });
});

