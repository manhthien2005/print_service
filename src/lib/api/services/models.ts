import { useApiQuery, useApiMutation } from '@/lib/hooks';
import type {
  PrinterModelResponse,
  PaginatedApiResponse,
  ApiResponse,
  IdListRequest,
} from '@/types/api';
import { mapModelsResponse } from '@/lib/utils/mappers';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '../client';

/**
 * Query key factory for models
 */
export const modelKeys = {
  all: ['models'] as const,
  lists: () => [...modelKeys.all, 'list'] as const,
  list: (params: {
    page?: number;
    limit?: number;
    keyword?: string;
    brandId?: string;
    supportsColor?: boolean;
    supportsDuplex?: boolean;
  }) => [...modelKeys.lists(), params] as const,
  detail: (id: string) => [...modelKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch printer models with filters
 */
export function useModels(params?: {
  page?: number;
  limit?: number;
  keyword?: string;
  brandId?: string;
  supportsColor?: boolean;
  supportsDuplex?: boolean;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.brandId) queryParams.append('brandId', params.brandId);
  if (params?.supportsColor !== undefined)
    queryParams.append('supportsColor', params.supportsColor.toString());
  if (params?.supportsDuplex !== undefined)
    queryParams.append('supportsDuplex', params.supportsDuplex.toString());

  const url = `/models${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<PrinterModelResponse>>(
    modelKeys.list(params || {}),
    url,
    {
      select: (
        response: AxiosResponse<PaginatedApiResponse<PrinterModelResponse>>
      ) => {
        const mappedData = mapModelsResponse(response.data.data);
        return {
          ...response,
          data: {
            ...response.data,
            data: mappedData,
          },
        } as unknown as AxiosResponse<
          PaginatedApiResponse<PrinterModelResponse>
        >;
      },
    }
  );
}

/**
 * Hook to fetch all models for dropdown (no pagination)
 */
export function useModelsForSelect() {
  return useApiQuery<PaginatedApiResponse<PrinterModelResponse>>(
    [...modelKeys.all, 'select'],
    '/models?page=0&limit=1000',
    {
      select: (
        response: AxiosResponse<PaginatedApiResponse<PrinterModelResponse>>
      ) => {
        const mappedData = mapModelsResponse(response.data.data);
        return {
          ...response,
          data: {
            ...response.data,
            data: mappedData,
          },
        } as unknown as AxiosResponse<
          PaginatedApiResponse<PrinterModelResponse>
        >;
      },
    }
  );
}

/**
 * Hook to create a new printer model (with multipart/form-data)
 */
export function useCreateModel() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<PrinterModelResponse>>,
    Error,
    FormData
  >({
    mutationFn: async (formData: FormData) => {
      return apiClient.post<ApiResponse<PrinterModelResponse>>(
        '/models',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          } as any,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.all });
    },
  });
}

/**
 * Hook to update a printer model (with multipart/form-data)
 */
export function useUpdateModel() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<PrinterModelResponse>>,
    Error,
    { id: string; formData: FormData }
  >({
    mutationFn: async ({ id, formData }) => {
      return apiClient.put<ApiResponse<PrinterModelResponse>>(
        `/models/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          } as any,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.all });
    },
  });
}

/**
 * Hook to delete a printer model
 */
export function useDeleteModel() {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<ApiResponse<void>>, Error, string>({
    mutationFn: (id: string) => {
      return apiClient.delete<ApiResponse<void>>(`/models/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.all });
    },
  });
}

/**
 * Hook to bulk delete printer models
 */
export function useBulkDeleteModels() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<void>, IdListRequest>(
    '/models/bulk-delete',
    'post',
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: modelKeys.all });
      },
    }
  );
}
