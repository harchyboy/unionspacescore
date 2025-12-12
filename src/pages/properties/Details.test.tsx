import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyDetails } from './Details';
import type { Property } from '../../types/property';

const mockProperty: Property = {
  id: 'test-id',
  name: 'Test Property',
  addressLine: '123 Test St',
  postcode: 'SW1A 1AA',
  city: 'London',
  country: 'United Kingdom',
  amenities: ['Reception', 'Kitchen'],
  marketing: {
    visibility: 'Public',
    status: 'On Market',
    fitOut: 'Cat A',
  },
  units: [],
  stats: {
    occupancyPct: 50,
    totalUnits: 2,
    available: 1,
    underOffer: 0,
    let: 1,
  },
};

vi.mock('../../api/properties', () => ({
  useProperty: (id: string) => ({
    data: id === 'test-id' ? mockProperty : null,
    isLoading: false,
    error: null,
  }),
}));

const renderWithProviders = (ui: React.ReactElement, initialEntries = ['/properties/test-id']) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/properties/:id" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('PropertyDetails', () => {
  it('renders property header', () => {
    renderWithProviders(<PropertyDetails />);

    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText(/123 Test St/i)).toBeInTheDocument();
  });

  it('renders all tabs', () => {
    renderWithProviders(<PropertyDetails />);

    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /units/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /availability/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /commercials/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /documents/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /approvals/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /risk/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /deal room/i })).toBeInTheDocument();
  });

  it('defaults to overview tab', () => {
    renderWithProviders(<PropertyDetails />);

    const overviewTab = screen.getByRole('tab', { name: /overview/i });
    expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  });

  it('switches tabs when clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PropertyDetails />);

    const unitsTab = screen.getByRole('tab', { name: /units/i });
    await user.click(unitsTab);

    await waitFor(() => {
      expect(unitsTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  it('persists tab in URL', () => {
    renderWithProviders(<PropertyDetails />, ['/properties/test-id?tab=units']);

    const unitsTab = screen.getByRole('tab', { name: /units/i });
    expect(unitsTab).toHaveAttribute('aria-selected', 'true');
  });
});

