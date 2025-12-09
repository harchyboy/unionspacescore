import { useQuery } from '@tanstack/react-query';
import type { Supplier, SupplierCategory, SupplierContractStatus, WorkOrder, SupplierActivity, SupplierCommunication, SupplierPerformance } from '../types/supplier';

interface SuppliersResponse {
  items: Supplier[];
  total: number;
  page: number;
  pageSize: number;
}

interface SuppliersParams {
  page?: number;
  pageSize?: number;
  filters?: {
    category?: SupplierCategory;
    status?: SupplierContractStatus;
    slaBand?: string;
    coverage?: string;
    compliance?: string;
    query?: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function fetchSuppliers(params: SuppliersParams = {}): Promise<SuppliersResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  
  if (params.filters) {
    if (params.filters.category) searchParams.set('category', params.filters.category);
    if (params.filters.status) searchParams.set('status', params.filters.status);
    if (params.filters.slaBand) searchParams.set('slaBand', params.filters.slaBand);
    if (params.filters.coverage) searchParams.set('coverage', params.filters.coverage);
    if (params.filters.compliance) searchParams.set('compliance', params.filters.compliance);
    if (params.filters.query) searchParams.set('query', params.filters.query);
  }

  const response = await fetch(`/api/suppliers?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch suppliers');
  }
  return response.json();
}

export async function fetchSupplier(id: string): Promise<Supplier> {
  const response = await fetch(`/api/suppliers/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch supplier');
  }
  return response.json();
}

export async function fetchSupplierWorkOrders(supplierId: string): Promise<WorkOrder[]> {
  const response = await fetch(`/api/suppliers/${supplierId}/work-orders`);
  if (!response.ok) {
    throw new Error('Failed to fetch work orders');
  }
  return response.json();
}

export async function fetchSupplierPerformance(supplierId: string): Promise<SupplierPerformance> {
  const response = await fetch(`/api/suppliers/${supplierId}/performance`);
  if (!response.ok) {
    throw new Error('Failed to fetch supplier performance');
  }
  return response.json();
}

export async function fetchSupplierActivity(supplierId: string): Promise<SupplierActivity[]> {
  const response = await fetch(`/api/suppliers/${supplierId}/activity`);
  if (!response.ok) {
    throw new Error('Failed to fetch supplier activity');
  }
  return response.json();
}

export async function fetchSupplierCommunications(supplierId: string): Promise<SupplierCommunication[]> {
  const response = await fetch(`/api/suppliers/${supplierId}/communications`);
  if (!response.ok) {
    throw new Error('Failed to fetch supplier communications');
  }
  return response.json();
}

// React Query hooks
export function useSuppliers(params: SuppliersParams = {}) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => fetchSuppliers(params),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => fetchSupplier(id),
    enabled: !!id,
  });
}

export function useSupplierWorkOrders(supplierId: string) {
  return useQuery({
    queryKey: ['supplier-work-orders', supplierId],
    queryFn: () => fetchSupplierWorkOrders(supplierId),
    enabled: !!supplierId,
  });
}

export function useSupplierPerformance(supplierId: string) {
  return useQuery({
    queryKey: ['supplier-performance', supplierId],
    queryFn: () => fetchSupplierPerformance(supplierId),
    enabled: !!supplierId,
  });
}

export function useSupplierActivity(supplierId: string) {
  return useQuery({
    queryKey: ['supplier-activity', supplierId],
    queryFn: () => fetchSupplierActivity(supplierId),
    enabled: !!supplierId,
  });
}

export function useSupplierCommunications(supplierId: string) {
  return useQuery({
    queryKey: ['supplier-communications', supplierId],
    queryFn: () => fetchSupplierCommunications(supplierId),
    enabled: !!supplierId,
  });
}

