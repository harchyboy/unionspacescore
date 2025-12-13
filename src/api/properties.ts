import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { Property, PropertyId, PropertyDocument } from '../types/property';

export interface ListPropertiesParams {
  search?: string;
  marketingStatus?: string;
  visibility?: string;
  submarkets?: string;
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
  if (params.submarkets) searchParams.set('submarkets', params.submarkets);
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
  file: File,
  onProgress?: (progress: number) => void
): Promise<PropertyDocument> {
  // Step 1: Get Signed URL from Backend
  const initResponse = await fetch(`${API_BASE}/properties/${id}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'get-upload-url',
      filename: file.name,
      contentType: file.type
    })
  });

  if (!initResponse.ok) {
    throw new Error('Failed to initiate upload');
  }

  const { signedUrl, path, publicUrl } = await initResponse.json();

  // Step 2: Upload directly to Supabase Storage via Signed URL (using XHR for progress)
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', file.type);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error('Failed to upload file to storage'));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });

  // Step 3: Link file to property in DB
  const linkResponse = await fetch(`${API_BASE}/properties/${id}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'link-file',
      storagePath: path,
      filename: file.name,
      size: file.size,
      type: file.type,
      publicUrl
    })
  });

  if (!linkResponse.ok) {
    throw new Error('Failed to link file to property');
  }

  return {
    id: path,
    name: file.name,
    url: publicUrl,
    type: file.type,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    uploadedAt: new Date().toISOString()
  };
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

export async function deleteImage(
  propertyId: PropertyId,
  imageUrl: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/properties/${propertyId}/documents?url=${encodeURIComponent(imageUrl)}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    throw new Error(`Delete error: ${response.statusText}`);
  }
}

// React Query hooks
export function useProperties(params: ListPropertiesParams = {}) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => listProperties(params),
    placeholderData: keepPreviousData,
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
    mutationFn: ({ id, file, onProgress }: { id: PropertyId; file: File; onProgress?: (progress: number) => void }) => 
      uploadDocument(id, file, onProgress),
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

export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, imageUrl }: { propertyId: PropertyId; imageUrl: string }) =>
      deleteImage(propertyId, imageUrl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.propertyId] });
    },
  });
}

export async function extractBrochureData(
  id: PropertyId,
  documentUrl: string
): Promise<{ success: boolean; data: unknown }> {
  return fetchJson<{ success: boolean; data: unknown }>(
    `${API_BASE}/properties/${id}/extract-brochure`,
    {
      method: 'POST',
      body: JSON.stringify({ documentUrl }),
    }
  );
}

export function useExtractBrochureData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, documentUrl }: { id: PropertyId; documentUrl: string }) =>
      extractBrochureData(id, documentUrl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
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
