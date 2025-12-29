import type {
  TransactionDirection,
  TransactionSourceType,
} from '@/lib/api/services/adminTransactionHistory';

export interface TransactionFilters {
  studentId?: string;
  from?: string;
  to?: string;
  direction?: TransactionDirection | 'all';
  sourceType?: TransactionSourceType | 'all';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export type SortColumn =
  | 'createdAt'
  | 'amount'
  | 'studentCode'
  | 'sourceType'
  | 'direction'
  | null;

export type SortDirection = 'asc' | 'desc' | null;
