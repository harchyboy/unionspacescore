import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DealId } from '../types/deal';
import type { MatchingResult } from '../types/matching';

// Fetch matches for a deal
async function fetchMatches(dealId: DealId): Promise<MatchingResult> {
  const response = await fetch(`/api/deals/${dealId}/matches`);
  if (!response.ok) {
    throw new Error('Failed to fetch matches');
  }
  return response.json();
}

export function useMatches(dealId: DealId) {
  return useQuery({
    queryKey: ['matches', dealId],
    queryFn: () => fetchMatches(dealId),
    enabled: !!dealId,
  });
}

// Add property to shortlist
interface AddToShortlistParams {
  dealId: DealId;
  propertyId: string;
  unitId?: string;
}

async function addToShortlist({ dealId, propertyId, unitId }: AddToShortlistParams): Promise<void> {
  const response = await fetch(`/api/deals/${dealId}/shortlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ propertyId, unitId }),
  });
  if (!response.ok) {
    throw new Error('Failed to add to shortlist');
  }
}

export function useAddToShortlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addToShortlist,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches', variables.dealId] });
    },
  });
}

