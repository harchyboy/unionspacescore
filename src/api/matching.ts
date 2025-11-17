import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MatchingResult, PropertyMatch } from '../types/matching';
import type { DealId } from '../types/deal';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getMatches(dealId: DealId): Promise<MatchingResult> {
  return fetchJson<MatchingResult>(`${API_BASE}/deals/${dealId}/matches`);
}

export function useMatches(dealId: DealId | undefined) {
  return useQuery({
    queryKey: ['matches', dealId],
    queryFn: () => getMatches(dealId!),
    enabled: !!dealId,
  });
}

export async function addToShortlist(dealId: DealId, propertyId: string, unitId?: string): Promise<void> {
  return fetchJson<void>(`${API_BASE}/deals/${dealId}/shortlist`, {
    method: 'POST',
    body: JSON.stringify({ propertyId, unitId }),
  });
}

export function useAddToShortlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dealId, propertyId, unitId }: { dealId: DealId; propertyId: string; unitId?: string }) =>
      addToShortlist(dealId, propertyId, unitId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches', variables.dealId] });
    },
  });
}

