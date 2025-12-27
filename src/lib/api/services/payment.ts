import { useApiQuery, useApiMutation } from '@/lib/hooks';
import type {
  DepositBonusPackageResponse,
  DepositResponse,
  CreateDepositRequest,
  DepositHistoryResponse,
  DepositDetailResponse,
  ApiResponse,
  BonusPackageResponse,
} from '@/types/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { apiClient } from '../client';

/**
 * Query key factory for payment
 */
export const paymentKeys = {
  all: ['payment'] as const,
  packages: () => [...paymentKeys.all, 'packages'] as const,
  bonusPackages: () => [...paymentKeys.all, 'bonus-packages'] as const,
  current: () => [...paymentKeys.all, 'current'] as const,
  deposits: (params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDirection?: string;
  }) => [...paymentKeys.all, 'deposits', params] as const,
  depositDetail: (id: string) => [...paymentKeys.all, 'deposit', id] as const,
};

/**
 * Hook to fetch payment packages
 */
export function usePaymentPackages() {
  return useApiQuery<ApiResponse<DepositBonusPackageResponse[]>>(
    paymentKeys.packages(),
    '/payment/packages',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

/**
 * Hook to fetch bonus packages (discount packages for printing)
 */
export function useBonusPackages() {
  return useApiQuery<ApiResponse<BonusPackageResponse[]>>(
    paymentKeys.bonusPackages(),
    '/payment/bonus-packages',
    {
      staleTime: 5 * 60 * 1000, // 5 minutes (pricing doesn't change often)
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

/**
 * Hook to fetch current pending deposit
 */
export function useCurrentDeposit(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useApiQuery<ApiResponse<DepositResponse>>(
    paymentKeys.current(),
    '/payment/current',
    {
      enabled: options?.enabled !== false,
      refetchInterval: options?.refetchInterval,
      retry: false, // Don't retry on 404 (no pending deposit)
      staleTime: 0, // Always refetch for real-time updates
    }
  );
}

/**
 * Hook to create a new deposit
 */
export function useCreateDeposit() {
  const queryClient = useQueryClient();
  return useApiMutation<ApiResponse<DepositResponse>, CreateDepositRequest>(
    '/payment/create-deposit',
    'post',
    {
      onSuccess: () => {
        // Invalidate current deposit query to refetch
        queryClient.invalidateQueries({ queryKey: paymentKeys.current() });
        // Invalidate deposits list
        queryClient.invalidateQueries({ queryKey: paymentKeys.deposits() });
      },
    }
  );
}

/**
 * Hook to cancel a deposit
 */
export function useCancelDeposit() {
  const queryClient = useQueryClient();
  return useMutation<
    AxiosResponse<ApiResponse<void>>,
    Error,
    { depositId: string; cancellationReason?: string }
  >({
    mutationFn: ({ depositId, cancellationReason }) => {
      // DELETE with body - axios delete accepts config with data property
      return apiClient.delete<ApiResponse<void>>(
        `/payment/${depositId}/cancel`,
        cancellationReason
          ? ({
              data: { cancellationReason },
            } as any)
          : undefined
      );
    },
    onSuccess: () => {
      // Invalidate current deposit query
      queryClient.invalidateQueries({ queryKey: paymentKeys.current() });
      // Invalidate deposits list
      queryClient.invalidateQueries({ queryKey: paymentKeys.deposits() });
    },
  });
}

/**
 * Hook to fetch deposit history
 */
export function useDepositHistory(params?: {
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params?.toDate) queryParams.append('toDate', params.toDate);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortDirection)
    queryParams.append('sortDirection', params.sortDirection);

  const url = `/payment/deposits${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return useApiQuery<ApiResponse<DepositHistoryResponse>>(
    paymentKeys.deposits(params),
    url,
    {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch deposit detail
 */
export function useDepositDetail(depositId: string) {
  return useApiQuery<ApiResponse<DepositDetailResponse>>(
    paymentKeys.depositDetail(depositId),
    `/payment/deposits/${depositId}`,
    {
      enabled: !!depositId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}
