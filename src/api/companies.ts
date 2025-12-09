import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Company, CompanyListResponse, CompanyFilters } from '../types/company';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface UseCompaniesParams {
  page?: number;
  pageSize?: number;
  filters?: CompanyFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

async function fetchCompanies(params: UseCompaniesParams): Promise<CompanyListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params.filters?.type) searchParams.set('type', params.filters.type);
  if (params.filters?.query) searchParams.set('search', params.filters.query);
  
  const response = await fetch(`${API_BASE}/api/accounts?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch companies');
  }
  
  const data = await response.json();
  
  // Transform the response to match our Company interface
  return {
    items: data.items.map((item: Record<string, unknown>) => ({
      id: item.id as string,
      name: item.name as string,
      type: item.type as string | null,
      industry: item.industry as string | null,
      website: item.website as string | null,
      phone: item.phone as string | null,
      address: item.address as string | null,
      city: item.city as string | null,
      postcode: item.postcode as string | null,
      country: item.country as string | null,
      employeeCount: item.employeeCount as number | null,
      annualRevenue: item.annualRevenue as number | null,
      description: item.description as string | null,
      createdAt: item.createdAt as string | null,
      updatedAt: item.updatedAt as string | null,
    })) as Company[],
    total: data.total || data.items.length,
    page: data.page || 1,
    pageSize: data.pageSize || 50,
    moreRecords: data.moreRecords,
  };
}

async function fetchCompany(id: string): Promise<Company> {
  const response = await fetch(`${API_BASE}/api/accounts/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch company');
  }
  
  return response.json();
}

export function useCompanies(params: UseCompaniesParams = {}) {
  return useQuery({
    queryKey: ['companies', params],
    queryFn: () => fetchCompanies(params),
  });
}

export function useCompany(id: string, initialData?: Company) {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => fetchCompany(id),
    initialData,
    enabled: !!id,
  });
}

interface CreateCompanyPayload {
  name: string;
  type?: string;
  industry?: string;
  website?: string;
  phone?: string;
  city?: string;
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateCompanyPayload) => {
      const response = await fetch(`${API_BASE}/api/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create company');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/api/accounts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete company');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}
