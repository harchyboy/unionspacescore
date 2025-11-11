import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Contact,
  ContactListParams,
  ContactListResponse,
  CreateContactInput,
  UpdateContactInput,
} from '../types/contact';

const API_BASE = '/api/contacts';

async function listContacts(params: ContactListParams = {}): Promise<ContactListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  
  if (params.filters) {
    if (params.filters.type && params.filters.type !== 'all') {
      searchParams.set('type', params.filters.type);
    }
    if (params.filters.company) searchParams.set('company', params.filters.company);
    if (params.filters.submarket) searchParams.set('submarket', params.filters.submarket);
    if (params.filters.activity) searchParams.set('activity', params.filters.activity);
    if (params.filters.health && params.filters.health !== 'all') {
      searchParams.set('health', params.filters.health);
    }
    if (params.filters.query) searchParams.set('query', params.filters.query);
  }

  const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch contacts');
  return response.json();
}

async function getContactById(id: string): Promise<Contact> {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) throw new Error('Failed to fetch contact');
  return response.json();
}

async function createContact(input: CreateContactInput): Promise<Contact> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error('Failed to create contact');
  return response.json();
}

async function updateContact(input: UpdateContactInput): Promise<Contact> {
  const { id, ...data } = input;
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update contact');
  return response.json();
}

async function deleteContact(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete contact');
}

// React Query Hooks
export function useContacts(params: ContactListParams = {}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => listContacts(params),
  });
}

export function useContact(id: string | null) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => getContactById(id!),
    enabled: !!id,
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
      queryClient.invalidateQueries({ queryKey: ['contacts', data.id] });
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

