import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { Property, PropertyId, PropertyDocument } from '../types/property';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  // Try to use Supabase client directly (recommended for large files)
  if (supabase && isSupabaseConfigured()) {
    const timestamp = Date.now();
    const baseNameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = file.name.split('.').pop() || 'bin';
    const finalFileName = `${timestamp}_${baseNameWithoutExt}.${ext}`;
    
    const isImage = file.type.startsWith('image/');
    const folder = isImage ? '' : 'documents/';
    const storagePath = `properties/${id}/${folder}${finalFileName}`;

    // Upload directly to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('property-files')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Simulate progress completion (Supabase JS SDK doesn't support progress natively)
    if (onProgress) {
      onProgress(100);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('property-files')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Link file to property via API
    const linkResponse = await fetch(`${API_BASE}/properties/${id}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'link-file',
        storagePath,
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
      id: storagePath,
      name: file.name,
      url: publicUrl,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString()
    };
  }

  // Fallback: Use API proxy for smaller files (< 4.5MB due to Vercel limits)
  if (file.size >= 4.5 * 1024 * 1024) {
    throw new Error('File too large. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for large file uploads.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/properties/${id}/documents`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload error: ${response.statusText}`);
  }

  if (onProgress) {
    onProgress(100);
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
