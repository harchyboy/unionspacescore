import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Contact,
  ContactListParams,
  ContactListResponse,
  CreateContactInput,
  UpdateContactInput,
} from '../types/contact';

const API_BASE = '/api/contacts';

// Transform API response to Contact type
function transformContact(data: Record<string, unknown>): Contact {
  const firstName = (data.firstName as string) || (data.name as string)?.split(' ')[0] || '';
  const lastName = (data.lastName as string) || (data.name as string)?.split(' ').slice(1).join(' ') || '';
  const cacheBustSource =
    (data.updatedAt as string) ||
    (data.lastActivity as string) ||
    (data.createdAt as string) ||
    undefined;
  const cacheBust = cacheBustSource ? Date.parse(cacheBustSource) : undefined;
  const avatar =
    (data.avatar as string) ||
    (data.avatarUrl as string) ||
    (data.id
      ? `/api/contacts/${data.id as string}/photo${Number.isFinite(cacheBust) ? `?t=${cacheBust}` : ''}`
      : undefined);
  
  return {
    id: data.id as string,
    firstName,
    lastName,
    fullName: data.name as string || `${firstName} ${lastName}`.trim(),
    email: data.email as string || '',
    phone: data.phone as string | undefined,
    mobile: data.mobile as string | undefined,
    company: data.company as string | undefined,
    companyId: data.accountId as string | undefined,
    type: (data.type as Contact['type']) || 'Broker',
    role: data.role as string | undefined,
    avatar,
    territory: data.territory as string | undefined,
    notes: data.notes as string | undefined,
    relationshipHealth: (data.health as Contact['relationshipHealth']) || 'good',
    relationshipHealthScore: data.relationshipHealthScore as number | undefined,
    lastActivity: data.lastActivity as string | undefined,
    lastContacted: (data.lastContacted as string | undefined) ?? (data.lastActivity as string | undefined),
    linkedinUrl: data.linkedinUrl as string | undefined,
    enrichmentStatus: data.enrichmentStatus as Contact['enrichmentStatus'],
    enrichedAt: data.enrichedAt as string | undefined,
    // Performance Metrics
    referralVolume: data.referralVolume as number | null | undefined,
    revenueAttribution: data.revenueAttribution as number | null | undefined,
    conversionRate: data.conversionRate as number | null | undefined,
    commissionPaid: data.commissionPaid as number | null | undefined,
    qualityScore: data.qualityScore as number | null | undefined,
    createdAt: data.createdAt as string || new Date().toISOString(),
    updatedAt: data.updatedAt as string || new Date().toISOString(),
  };
}

// Fetch all contacts
async function fetchContacts(params?: ContactListParams): Promise<ContactListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  
  // Pass filters to the API
  if (params?.filters?.type) searchParams.set('type', params.filters.type);
  if (params?.filters?.health) searchParams.set('health', params.filters.health);
  if (params?.filters?.query) searchParams.set('query', params.filters.query);
  if (params?.filters?.company) searchParams.set('company', params.filters.company);
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch contacts');
  }

  const data = await response.json();
  const items = (data.items || []).map(transformContact);

  return {
    items,
    total: data.total || items.length,
    page: data.page || 1,
    pageSize: data.pageSize || 200,
    totalPages: Math.ceil((data.total || items.length) / (data.pageSize || 200)),
  };
}

// Fetch single contact
async function fetchContact(id: string): Promise<Contact> {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch contact');
  }

  const data = await response.json();
  return transformContact(data);
}

// Create contact
export async function createContact(input: CreateContactInput): Promise<Contact> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      mobile: input.mobile,
      company: input.company,
      companyCity: input.companyCity,
      accountId: input.accountId,
      type: input.type,
      role: input.role,
      territory: input.territory,
      notes: input.notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create contact' }));
    throw new Error(error.message || 'Failed to create contact');
  }

  const data = await response.json();
  return transformContact(data);
}

// Update contact
export async function updateContact(input: UpdateContactInput): Promise<Contact> {
  const response = await fetch(`${API_BASE}/${input.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update contact' }));
    throw new Error(error.message || 'Failed to update contact');
  }

  const data = await response.json();
  return transformContact(data);
}

// Delete contact
async function deleteContact(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete contact');
  }
}

// React Query Hooks
export function useContacts(params?: ContactListParams) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => fetchContacts(params),
  });
}

export function useContact(id: string, initialData?: Contact) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => fetchContact(id),
    enabled: !!id,
    initialData,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContact,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', data.id] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

// Enrich contact with LinkedIn data
interface EnrichmentResult {
  success: boolean;
  linkedinUrl: string | null;
  status: 'enriched' | 'not_found' | 'error' | 'already_enriched';
  message: string;
}

async function enrichContact(id: string): Promise<EnrichmentResult> {
  const response = await fetch(`/api/enrich?id=${encodeURIComponent(id)}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Enrichment failed' }));
    throw new Error(error.message || 'Failed to enrich contact');
  }

  return response.json();
}

export function useEnrichContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrichContact,
    onSuccess: (data, contactId) => {
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

