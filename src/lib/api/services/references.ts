import { useApiQuery } from '@/lib/hooks';
import type {
  RoomResponse,
  BuildingResponse,
  PageSizeResponse,
  PaginatedApiResponse,
  ApiResponse,
} from '@/types/api';

/**
 * Query key factory for references
 */
export const referenceKeys = {
  all: ['references'] as const,
  rooms: (params?: {
    page?: number;
    limit?: number;
    keyword?: string;
    buildingId?: string;
  }) => [...referenceKeys.all, 'rooms', params] as const,
  buildings: (params?: { page?: number; limit?: number; keyword?: string }) =>
    [...referenceKeys.all, 'buildings', params] as const,
  pageSizes: () => [...referenceKeys.all, 'pageSizes'] as const,
};

/**
 * Hook to fetch rooms
 */
export function useRooms(params?: {
  page?: number;
  limit?: number;
  keyword?: string;
  buildingId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.limit !== undefined)
    queryParams.append('limit', params.limit.toString());
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.buildingId) queryParams.append('buildingId', params.buildingId);

  const url = `/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<RoomResponse>>(
    referenceKeys.rooms(params),
    url
  );
}

/**
 * Hook to fetch all rooms for dropdown (no pagination)
 */
export function useAllRooms() {
  return useApiQuery<PaginatedApiResponse<RoomResponse>>(
    [...referenceKeys.all, 'rooms', 'all'],
    '/rooms?page=0&limit=1000'
  );
}

/**
 * Hook to fetch buildings
 */
export function useBuildings(params?: {
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

  const url = `/buildings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useApiQuery<PaginatedApiResponse<BuildingResponse>>(
    referenceKeys.buildings(params),
    url
  );
}

/**
 * Hook to fetch all buildings for dropdown (no pagination)
 */
export function useAllBuildings() {
  return useApiQuery<PaginatedApiResponse<BuildingResponse>>(
    [...referenceKeys.all, 'buildings', 'all'],
    '/buildings?page=0&limit=1000'
  );
}

/**
 * Hook to fetch page sizes (non-paginated)
 */
export function usePageSizes() {
  return useApiQuery<ApiResponse<PageSizeResponse[]>>(
    referenceKeys.pageSizes(),
    '/page-sizes'
  );
}
