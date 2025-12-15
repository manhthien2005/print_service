import { useApiQuery, useApiMutation } from '@/lib/hooks';
import type {
  BrandResponse,
  BrandRequest,
  PaginatedApiResponse,
  ApiResponse,
  IdListRequest,
} from '@/types/api';
import { mapBrandsResponse, type Brand } from '@/lib/utils/mappers';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '../client';

/**
 * Query key factory for brands
 */
export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (params: { page?: number; limit?: number; keyword?: string }) =>
    [...brandKeys.lists(), params] as const,
  detail: (id: string) => [...brandKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch brands with pagination and search
 */
export function useBrands(params?: {
  page?: number;
  limit?: number;
  keyword?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.keyword) queryParams.append('keyword', params.keyword);

  const url = `/brands${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<BrandResponse>>(
    brandKeys.list(params || {}),
    url,
    {
      select: (
        response: AxiosResponse<PaginatedApiResponse<BrandResponse>>
      ) => {
        // Map the response data
        const mappedData = mapBrandsResponse(response.data.data);
        return {
          ...response,
          data: {
            ...response.data,
            data: mappedData,
          },
        } as AxiosResponse<PaginatedApiResponse<Brand>>;
      },
    }
  );
}

/**
 * Hook to fetch all brands for dropdown (no pagination)
 */
export function useBrandsForSelect() {
  return useApiQuery<PaginatedApiResponse<BrandResponse>>(
    [...brandKeys.all, 'select'],
    '/brands?page=0&limit=1000', // Get all brands
    {
      select: (
        response: AxiosResponse<PaginatedApiResponse<BrandResponse>>
      ) => {
        const mappedData = mapBrandsResponse(response.data.data);
        return {
          ...response,
          data: {
            ...response.data,
            data: mappedData,
          },
        } as AxiosResponse<PaginatedApiResponse<Brand>>;
      },
    }
  );
}

/**
 * Hook to create a new brand
 */
export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<BrandResponse>, BrandRequest>(
    '/brands',
    'post',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: brandKeys.all });
      },
    }
  );
}

/**
 * Hook to update a brand
 */
export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<BrandResponse>>,
    Error,
    BrandRequest & { id: string }
  >({
    mutationFn: variables => {
      const { id, ...data } = variables;
      return apiClient.put<ApiResponse<BrandResponse>>(`/brands/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}

/**
 * Hook to delete a brand
 */
export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<ApiResponse<void>>, Error, string>({
    mutationFn: (id: string) => {
      return apiClient.delete<ApiResponse<void>>(`/brands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}

/**
 * Hook to bulk delete brands
 */
export function useBulkDeleteBrands() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<void>, IdListRequest>(
    '/brands/bulk-delete',
    'post',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: brandKeys.all });
      },
    }
  );
}
