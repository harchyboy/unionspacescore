import { useQuery } from '@tanstack/react-query';
import type { DealRoomResponse, DealRoomFilters } from '../types/dealRoomDashboard';

const API_BASE = '/api/deals';

async function fetchDeals(filters?: DealRoomFilters): Promise<DealRoomResponse> {
  const searchParams = new URLSearchParams();

  if (filters) {
    if (filters.stage && filters.stage !== 'all') {
      searchParams.set('stage', filters.stage);
    }
    if (filters.owner && filters.owner !== 'all') {
      searchParams.set('owner', filters.owner);
    }
    if (filters.dealType && filters.dealType !== 'all') {
      searchParams.set('dealType', filters.dealType);
    }
    if (filters.property && filters.property !== 'all') {
      searchParams.set('property', filters.property);
    }
    if (filters.search) {
      searchParams.set('search', filters.search);
    }
  }

  const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch deals');
  return response.json();
}

export function useDeals(filters?: DealRoomFilters) {
  return useQuery({
    queryKey: ['deals', filters],
    queryFn: () => fetchDeals(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

