/**
 * Types for Admin Print History Management Page
 */

export type PrintStatus =
  | 'queued'
  | 'printing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'pending_payment';

export type PaymentMethod = 'balance' | 'qr';

export interface PrintHistoryItem {
  jobId: string;
  createdAt: string;
  startTime?: string;
  endTime?: string;
  printStatus: PrintStatus;

  studentId: string;
  studentCode: string;
  studentName: string;
  studentEmail: string;

  printerId: string;
  printerCode: string;
  printerName: string;
  roomName: string;
  floorName: string;
  buildingName: string;

  fileId: string;
  fileName: string;
  fileType: string;

  pageSizeName: string;
  colorModeName: string;
  pageOrientation: string;
  printSide: string;
  numberOfCopy: number;
  totalPages: number;
  printedPages: number;

  subtotalBeforeDiscount: number;
  discountPercentage: number;
  discountAmount: number;
  totalPrice: number;
  discountPackageName?: string;

  paymentMethod: PaymentMethod;
}

export interface PrintHistoryFilters {
  studentId?: string;
  printerId?: string;
  from?: string; // ISO 8601: yyyy-MM-dd'T'HH:mm:ss
  to?: string; // ISO 8601: yyyy-MM-dd'T'HH:mm:ss
  status?: PrintStatus | 'all';
  fileType?: string | 'all';
  paymentMethod?: PaymentMethod | 'all';
  page?: number; // 0-indexed
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PrintHistoryStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  cancelledJobs: number;
  pendingPaymentJobs: number;
  queuedJobs: number;
  printingJobs: number;

  totalPages: number;
  completedPages: number;
  colorPages: number;
  blackWhitePages: number;

  totalRevenue: number;
  totalDiscount: number;
  netRevenue: number;

  uniqueStudents: number;
}

export type SortColumn =
  | 'createdAt'
  | 'totalPrice'
  | 'totalPages'
  | 'studentCode'
  | 'printerCode'
  | null;

export type SortDirection = 'asc' | 'desc' | null;
