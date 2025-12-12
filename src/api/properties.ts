import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Property, PropertyId, PropertyDocument } from '../types/property';

export interface ListPropertiesParams {
  search?: string;
  marketingStatus?: string;
  visibility?: string;
  brokerSet?: string;
  missingMedia?: boolean;
  brokerReadyThisWeek?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ListPropertiesResponse {
  properties: Property[];
  total: number;
  submarketStats?: { submarket: string; count: number }[];
  page: number;
  limit: number;
}

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
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export async function listProperties(
  params: ListPropertiesParams = {}
): Promise<ListPropertiesResponse> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.marketingStatus) searchParams.set('marketingStatus', params.marketingStatus);
  if (params.visibility) searchParams.set('visibility', params.visibility);
  if (params.brokerSet) searchParams.set('brokerSet', params.brokerSet);
  if (params.missingMedia) searchParams.set('missingMedia', 'true');
  if (params.brokerReadyThisWeek) searchParams.set('brokerReadyThisWeek', 'true');
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const url = `${API_BASE}/properties?${searchParams.toString()}`;
  return fetchJson<ListPropertiesResponse>(url);
}

export async function getProperty(id: PropertyId): Promise<Property> {
  return fetchJson<Property>(`${API_BASE}/properties/${id}`);
}

export async function createProperty(payload: Partial<Property>): Promise<Property> {
  return fetchJson<Property>(`${API_BASE}/properties`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProperty(
  id: PropertyId,
  payload: Partial<Property>
): Promise<Property> {
  return fetchJson<Property>(`${API_BASE}/properties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function uploadDocument(
  id: PropertyId,
  file: File
): Promise<PropertyDocument> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/properties/${id}/documents`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload error: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteDocument(
  propertyId: PropertyId,
  documentId: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/properties/${propertyId}/documents/${documentId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Delete error: ${response.statusText}`);
  }
}

// React Query hooks
export function useProperties(params: ListPropertiesParams = {}) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => listProperties(params),
  });
}

export function useProperty(id: PropertyId | undefined) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id!),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: PropertyId; payload: Partial<Property> }) =>
      updateProperty(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: PropertyId; file: File }) => uploadDocument(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, documentId }: { propertyId: PropertyId; documentId: string }) =>
      deleteDocument(propertyId, documentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.propertyId] });
    },
  });
}

// Bulk actions
export async function bulkUpdateProperties(
  propertyIds: PropertyId[],
  updates: {
    visibility?: 'Private' | 'Public';
    marketingStatus?: 'Draft' | 'Broker-Ready' | 'On Market';
    brokerSet?: string;
  }
): Promise<{ success: boolean; updated: number; errors?: string[] }> {
  return fetchJson<{ success: boolean; updated: number; errors?: string[] }>(
    `${API_BASE}/properties/bulk`,
    {
      method: 'PATCH',
      body: JSON.stringify({ propertyIds, updates }),
    }
  );
}

export async function bulkPushToBrokerSet(
  propertyIds: PropertyId[],
  brokerSet: string
): Promise<{ success: boolean; updated: number; errors?: string[] }> {
  return fetchJson<{ success: boolean; updated: number; errors?: string[] }>(
    `${API_BASE}/properties/bulk/broker-set`,
    {
      method: 'POST',
      body: JSON.stringify({ propertyIds, brokerSet }),
    }
  );
}

export function useBulkUpdateProperties() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyIds,
      updates,
    }: {
      propertyIds: PropertyId[];
      updates: Parameters<typeof bulkUpdateProperties>[1];
    }) => bulkUpdateProperties(propertyIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useBulkPushToBrokerSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyIds, brokerSet }: { propertyIds: PropertyId[]; brokerSet: string }) =>
      bulkPushToBrokerSet(propertyIds, brokerSet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
