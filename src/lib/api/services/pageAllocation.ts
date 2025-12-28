import { useApiQuery, useApiMutation } from '@/lib/hooks';
import type { ApiResponse } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';

/**
 * Types for Page Allocation API
 */

export interface PageAllocation {
  allocationId: string;
  pageSizeId: string;
  sizeName: string;
  sizeDescription: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  updatedAt: string;
  updatedByName?: string;
  updatedByEmail?: string;
}

export interface AddPagesRequest {
  quantity: number;
  note?: string;
}

export interface UpdateAllocationRequest {
  quantity: number;
  lowStockThreshold?: number;
  note?: string;
}

export interface CheckAvailabilityResponse {
  pageSizeId: string;
  sizeName: string;
  available: boolean;
  currentQuantity: number;
  pagesNeeded: number;
  shortage: number;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data?: Record<string, string>; // Field-level errors
}

/**
 * Query key factory for page allocation
 */
export const pageAllocationKeys = {
  all: ['pageAllocation'] as const,
  list: () => [...pageAllocationKeys.all, 'list'] as const,
  detail: (pageSizeId: string) =>
    [...pageAllocationKeys.all, 'detail', pageSizeId] as const,
  lowStock: () => [...pageAllocationKeys.all, 'lowStock'] as const,
  checkAvailability: (pageSizeId: string, pagesNeeded: number) =>
    [...pageAllocationKeys.all, 'check', pageSizeId, pagesNeeded] as const,
};

/**
 * Hooks for Page Allocation
 */

// Get all allocations
export function usePageAllocations() {
  return useApiQuery<ApiResponse<PageAllocation[]>>(
    pageAllocationKeys.list(),
    '/admin/page-allocation'
  );
}

// Get allocation by page size ID
export function usePageAllocation(pageSizeId: string) {
  return useApiQuery<ApiResponse<PageAllocation>>(
    pageAllocationKeys.detail(pageSizeId),
    `/admin/page-allocation/${pageSizeId}`,
    {
      enabled: !!pageSizeId,
    }
  );
}

// Get low stock allocations
export function useLowStockAllocations() {
  return useApiQuery<ApiResponse<PageAllocation[]>>(
    pageAllocationKeys.lowStock(),
    '/admin/page-allocation/low-stock'
  );
}

// Check availability (disabled by default, trigger manually)
export function useCheckAvailability(
  pageSizeId: string,
  pagesNeeded: number,
  enabled: boolean = false
) {
  return useApiQuery<ApiResponse<CheckAvailabilityResponse>>(
    pageAllocationKeys.checkAvailability(pageSizeId, pagesNeeded),
    `/admin/page-allocation/${pageSizeId}/check?pagesNeeded=${pagesNeeded}`,
    {
      enabled: enabled && !!pageSizeId && pagesNeeded > 0,
    }
  );
}

// Add pages to allocation
export function useAddPages() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<PageAllocation>,
    { pageSizeId: string; data: AddPagesRequest }
  >('', 'post', {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pageAllocationKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: pageAllocationKeys.detail(variables.pageSizeId),
      });
      queryClient.invalidateQueries({
        queryKey: pageAllocationKeys.lowStock(),
      });
    },
    mutationFn: async (variables: {
      pageSizeId: string;
      data: AddPagesRequest;
    }) => {
      return apiClient.post(
        `/admin/page-allocation/${variables.pageSizeId}/add`,
        variables.data
      );
    },
  });
}

// Update allocation (set absolute quantity)
export function useUpdateAllocation() {
  const queryClient = useQueryClient();
  return useApiMutation<
    ApiResponse<PageAllocation>,
    { pageSizeId: string; data: UpdateAllocationRequest }
  >('', 'put', {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: pageAllocationKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: pageAllocationKeys.detail(variables.pageSizeId),
      });
      queryClient.invalidateQueries({
        queryKey: pageAllocationKeys.lowStock(),
      });
    },
    mutationFn: async (variables: {
      pageSizeId: string;
      data: UpdateAllocationRequest;
    }) => {
      return apiClient.put(
        `/admin/page-allocation/${variables.pageSizeId}`,
        variables.data
      );
    },
  });
}

// Initialize allocations
export function useInitializeAllocations() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<void>, void>('', 'post', {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pageAllocationKeys.list(),
      });
      queryClient.invalidateQueries({
        queryKey: pageAllocationKeys.lowStock(),
      });
    },
    mutationFn: async () => {
      return apiClient.post('/admin/page-allocation/initialize');
    },
  });
}
