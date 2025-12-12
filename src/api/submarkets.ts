import { useQuery } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface SubmarketStat {
  submarket: string;
  count: number;
}

async function fetchSubmarkets(): Promise<SubmarketStat[]> {
  const response = await fetch(`${API_BASE}/api/submarkets`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch submarkets');
  }
  
  return response.json();
}

export function useSubmarkets() {
  return useQuery({
    queryKey: ['submarkets'],
    queryFn: fetchSubmarkets,
  });
}

