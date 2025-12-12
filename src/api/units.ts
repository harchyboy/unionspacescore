import { useQuery } from '@tanstack/react-query';

export interface UnitListItem {
  id: string;
  code: string;
  floor?: string | null;
  sizeSqFt?: number | null;
  desks?: number | null;
  status?: string | null;
  fitOut?: string | null;
  pricePsf?: number | null;
  pricePcm?: number | null;
  pipelineStage?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  zohoCreatedAt?: string | null;
  zohoModifiedAt?: string | null;
  property?: {
    id: string;
    zohoId: string;
    name: string;
    addressLine?: string | null;
    city?: string | null;
    postcode?: string | null;
    country?: string | null;
  } | null;
}

export interface ListUnitsParams {
  search?: string;
  status?: string;
  pipelineStage?: string;
  fitOut?: string;
  propertyId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'updatedAt' | 'updated_at' | 'code' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ListUnitsResponse {
  units: UnitListItem[];
  total: number;
  page: number;
  limit: number;
}

export type UnitDetails = UnitListItem;

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function listUnits(params: ListUnitsParams = {}): Promise<ListUnitsResponse> {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.status) sp.set('status', params.status);
  if (params.pipelineStage) sp.set('pipelineStage', params.pipelineStage);
  if (params.fitOut) sp.set('fitOut', params.fitOut);
  if (params.propertyId) sp.set('propertyId', params.propertyId);
  if (params.page) sp.set('page', params.page.toString());
  if (params.limit) sp.set('limit', params.limit.toString());
  if (params.sortBy) sp.set('sortBy', params.sortBy);
  if (params.sortOrder) sp.set('sortOrder', params.sortOrder);

  return fetchJson<ListUnitsResponse>(`${API_BASE}/units?${sp.toString()}`);
}

export async function getUnit(id: string): Promise<UnitDetails> {
  return fetchJson<UnitDetails>(`${API_BASE}/units/${id}`);
}

export function useUnits(params: ListUnitsParams = {}) {
  return useQuery({
    queryKey: ['units', params],
    queryFn: () => listUnits(params),
  });
}

export function useUnit(id: string | undefined) {
  return useQuery({
    queryKey: ['unit', id],
    queryFn: () => getUnit(id!),
    enabled: !!id,
  });
}


