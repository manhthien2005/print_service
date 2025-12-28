/**
 * Backend API Response Types
 * These types match the Java DTOs from the backend
 */

// Response wrapper types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string; // ISO LocalDateTime string
}

export interface PageResponse {
  page: number; // 0-indexed
  limit: number;
  totalItems: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PageResponse;
  timestamp: string; // ISO LocalDateTime string
}

// Brand types
export interface BrandResponse {
  brandId: string; // UUID as string
  brandName: string;
  countryOfOrigin: string;
  website: string;
  createdAt: string; // ISO LocalDateTime string
}

export interface BrandRequest {
  brandName: string;
  countryOfOrigin?: string;
  website?: string;
}

// Printer Model types
export interface PrinterModelResponse {
  modelId: string; // UUID as string
  brandId: string; // UUID as string
  brandName: string;
  modelName: string;
  description?: string;
  maxPaperSizeId: string; // UUID as string
  maxPaperSizeName: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
  image2dUrl?: string;
  image3dUrl?: string;
  createdAt: string; // ISO LocalDateTime string
}

export interface PrinterModelRequest {
  brandId: string; // UUID as string
  modelName: string;
  description?: string;
  maxPaperSizeId: string; // UUID as string
  supportsColor?: boolean;
  supportsDuplex?: boolean;
}

// Printer Physical types
export interface PrinterResponse {
  printerId: string; // UUID as string
  serialNumber: string;
  isEnabled: boolean;
  installedDate?: string; // ISO LocalDate string (YYYY-MM-DD)
  lastMaintenanceDate?: string; // ISO LocalDate string (YYYY-MM-DD)
  createdAt: string; // ISO LocalDateTime string
  updatedAt: string; // ISO LocalDateTime string

  // Model info
  modelId: string; // UUID as string
  modelName: string;
  brandName: string;
  maxPageSize: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
  image2dUrl?: string;
  image3dUrl?: string;

  // Room info
  roomId: string; // UUID as string
  roomCode: string;
  buildingId: string; // UUID as string
  buildingCode: string;
  campusName: string;
}

export interface PrinterRequest {
  modelId: string; // UUID as string
  roomId: string; // UUID as string
  serialNumber?: string;
  isEnabled?: boolean;
  installedDate?: string; // ISO LocalDate string (YYYY-MM-DD)
  lastMaintenanceDate?: string; // ISO LocalDate string (YYYY-MM-DD)
}

export interface UpdatePrinterStatusRequest {
  isEnabled: boolean;
}

export interface BulkPrinterStatusRequest {
  ids: string[]; // UUIDs as strings
  isEnabled: boolean;
}

export interface PrinterImportResult {
  totalRows: number;
  successRows: number;
  errorMessages: string[];
}

// Printer Log types - matches PrinterLogResponse DTO from backend
export interface PrinterLogResponse {
  logId: string; // UUID as string
  timestamp: string; // ISO LocalDateTime string
  printerId: string; // UUID as string
  printerLocation: string | null; // Format: "BUILDING-ROOM"
  printerName: string | null; // Format: "Brand Model"
  logType: string; // 'print_job', 'error', 'maintenance', 'status_change', 'configuration', 'admin_action'
  severity: string; // 'info', 'warning', 'error', 'critical'
  description: string;
  errorCode: string | null;
  isResolved: boolean | null;
  userName: string | null;
  userType: string | null;
  relatedFileName: string | null;
  details: string | null; // JSON string
  ipAddress: string | null;
  createdAt: string; // ISO LocalDateTime string
  resolvedAt: string | null; // ISO LocalDateTime string
  resolvedBy: string | null; // UUID as string
  resolutionNotes: string | null;
  jobId: string | null; // UUID as string
  userId: string | null; // UUID as string
}

// Reference types (for dropdowns)
export interface RoomResponse {
  roomId: string; // UUID as string
  roomCode: string;
  roomType?: string;
  buildingId: string; // UUID as string
  buildingCode: string;
  campusName: string;
  createdAt: string; // ISO LocalDateTime string
}

export interface BuildingResponse {
  buildingId: string; // UUID as string
  buildingCode: string;
  address?: string;
  campusName: string;
  createdAt: string; // ISO LocalDateTime string
}

export interface PageSizeResponse {
  pageSizeId: string; // UUID as string
  sizeName: string;
  widthMm: number;
  heightMm: number;
}

// Bulk delete request
export interface IdListRequest {
  ids: string[]; // UUIDs as strings
}

// ============================================================================
// Student Print API Types
// ============================================================================

// File Upload & Management
export interface UploadedFileResponse {
  uploadedFileId: string; // UUID as string
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  fileUrl: string;
  pageCount: number;
  uploadedAt: string; // ISO LocalDateTime string
  lastPrintedAt: string | null; // ISO LocalDateTime string
  printCount: number;
}

export interface UploadedFileDetailResponse extends UploadedFileResponse {
  printHistory: Array<{
    jobId: string; // UUID as string
    printedAt: string; // ISO LocalDateTime string
    printerName: string;
  }>;
}

export interface UploadedFilesListParams {
  page?: number;
  limit?: number;
  search?: string;
  file_type?: string;
  date_range?: string; // 'today', 'week', 'month', '3months', 'all'
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  sort_by?: string; // 'uploaded_at', 'file_name', 'last_printed_at', 'print_count'
  sort_direction?: string; // 'asc', 'desc'
}

// Printer Management
export interface AvailablePrinterResponse {
  printerId: string; // UUID as string
  serialNumber: string;
  isEnabled: boolean;
  status: string; // 'idle', 'busy', 'offline'
  printingStatus: string;
  modelName: string;
  brandName: string;
  maxPageSize: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
  roomCode: string;
  buildingCode: string;
  buildingAddress: string;
  campusName: string;
}

export interface AvailablePrintersParams {
  keyword?: string;
  buildingId?: string; // UUID as string
  roomId?: string; // UUID as string
  status?: string;
  supportsColor?: boolean;
  supportsDuplex?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: string; // 'asc', 'desc'
}

export interface PrinterDetailResponse {
  printerId: string; // UUID as string
  serialNumber: string;
  brandName: string;
  modelName: string;
  buildingName: string;
  buildingCode: string;
  buildingAddress: string;
  campusName: string;
  floorNumber: number;
  roomCode: string;
  roomName: string;
  roomType: string;
  printerPixelCoordinate: string; // JSON string
  status: string;
  supportsColor: boolean;
  supportsDuplex: boolean;
  maxPaperSize: string;
  installedDate: string | null; // ISO LocalDate string
  lastMaintenanceDate: string | null; // ISO LocalDate string
}

export interface PrinterQueueResponse {
  printerId: string; // UUID as string
  queueCount: number;
  status: string;
  currentJob: {
    jobId: string; // UUID as string
    startedAt: string; // ISO LocalDateTime string
    estimatedCompletionTime: string; // ISO LocalDateTime string
  } | null;
  queuedJobs: Array<{
    jobId: string; // UUID as string
    queuedAt: string; // ISO LocalDateTime string
    totalPages: number;
  }>;
  estimatedWaitTimeMinutes: number;
}

// Print Configuration
export interface ColorModeResponse {
  colorModeId: string; // UUID as string
  colorModeName: string; // 'black_white', 'grayscale', 'color'
  description: string;
  colorMultiplier: number;
}

export interface PermittedFileTypeResponse {
  fileTypeId: string; // UUID as string
  fileExtension: string;
  mimeType: string;
  description: string;
  isPermitted: boolean;
}

export interface PricingConfigResponse {
  pageSizePrices: Array<{
    pageSizeId: string; // UUID as string
    sizeName: string;
    pagePrice: number;
  }>;
  colorModePrices: Array<{
    colorModeId: string; // UUID as string
    colorModeName: string;
    pricePerPage: number;
  }>;
  discountPackages: Array<{
    packageId: string; // UUID as string
    minPages: number;
    discountPercentage: number;
    packageName: string;
  }>;
}

// Cost Calculation & Print Jobs
export interface CalculateCostRequest {
  uploadedFileId: string; // UUID as string
  printerId: string; // UUID as string
  pageSizeName: string; // Page size name: 'A3', 'A4', 'A5', 'Letter', 'Legal'
  colorModeName: 'black-white' | 'grayscale' | 'color'; // Color mode name: 'black-white', 'grayscale', or 'color'
  pageOrientation: 'portrait' | 'landscape'; // Page orientation
  printSide: 'one-sided' | 'double-sided';
  numberOfCopy: number; // 1-99
  // Deprecated fields (kept for backward compatibility, will be removed in future)
  /** @deprecated Use pageSizeName instead */
  pageSizeId?: string; // UUID as string
  /** @deprecated Use pageSizeName instead */
  paperSize?: string; // Paper size name (for compatibility)
  /** @deprecated Use colorModeName instead */
  colorModeId?: string; // UUID as string
  /** @deprecated Use colorModeName instead */
  colorMode?: string; // Color mode name (for compatibility)
  /** @deprecated Use pageOrientation instead */
  orientation?: 'portrait' | 'landscape'; // Alias for pageOrientation
}

export interface CalculateCostResponse {
  totalPages: number;
  basePricePerPage: number;
  colorModePricePerPage: number;
  subtotalBeforeDiscount: number;
  discountPackageId: string | null; // UUID as string
  discountPercentage: number;
  discountAmount: number;
  totalPrice: number;
  estimatedPages: number;
  estimatedCost?: number;
}

export interface CreatePrintJobRequest {
  uploadedFileId: string; // UUID as string
  printerId: string; // UUID as string
  paymentMethod: 'balance' | 'qr';
  pageSizeName: string; // Page size name: 'A3', 'A4', 'A5', 'Letter', 'Legal'
  colorModeName: 'black-white' | 'grayscale' | 'color'; // Color mode name: 'black-white', 'grayscale', or 'color'
  pageOrientation: 'portrait' | 'landscape'; // Page orientation
  printSide: 'one-sided' | 'double-sided';
  numberOfCopy: number; // 1-99
  // Deprecated fields (kept for backward compatibility, will be removed in future)
  /** @deprecated Use pageSizeName instead */
  pageSizeId?: string; // UUID as string
  /** @deprecated Use pageSizeName instead */
  paperSize?: string; // Paper size name (for compatibility)
  /** @deprecated Use colorModeName instead */
  colorModeId?: string; // UUID as string
  /** @deprecated Use colorModeName instead */
  colorMode?: string; // Color mode name (for compatibility)
  /** @deprecated Use pageOrientation instead */
  orientation?: 'portrait' | 'landscape'; // Alias for pageOrientation
}

export interface CreatePrintJobResponse {
  jobId: string; // UUID as string
  printStatus: string; // 'queued', 'printing', 'completed', 'cancelled', 'failed'
  totalPrice: number;
  paymentId: string; // UUID as string
  paymentStatus: string;
  paymentMethod: string;
  printer: {
    printerId: string; // UUID as string
    location: string;
    status: string;
  };
  estimatedCompletionTime: string; // ISO LocalDateTime string
  remainingBalance: number;
  createdAt: string; // ISO LocalDateTime string
  qrUrl?: string;
  paymentCode?: string;
  transferContent?: string;
  expiredAt?: string; // ISO LocalDateTime string
}

export interface PrintJobStatusResponse {
  jobId: string; // UUID as string
  printStatus: string;
  uploadedFile: {
    fileName: string;
    fileUrl: string;
  };
  printer: {
    brandName: string;
    modelName: string;
    location: string;
  };
  config: {
    paperSize: string;
    colorMode: string;
    printSide: string;
    numberOfCopy: number;
  };
  pricing: {
    totalPages: number;
    totalPrice: number;
  };
  startTime: string | null; // ISO LocalDateTime string
  endTime: string | null; // ISO LocalDateTime string
  createdAt: string; // ISO LocalDateTime string
}

export interface PrintJobProgressResponse {
  jobId: string; // UUID as string
  printStatus: string;
  progress: {
    totalPages: number;
    printedPages: number;
    percentage: number;
    estimatedTimeRemainingMinutes: number;
  };
  queueInfo: {
    positionInQueue: number;
    jobsAhead: number;
    isCurrentlyPrinting: boolean;
  };
  timing: {
    startTime: string | null; // ISO LocalDateTime string
    estimatedCompletionTime: string | null; // ISO LocalDateTime string
    elapsedMinutes: number;
    elapsedSeconds: number;
  };
  printer: {
    printerId: string; // UUID as string
    printerName: string;
    location: string;
    status: string;
  };
}

export interface PaymentStatusResponse {
  paymentId: string;
  paymentCode?: string;
  paymentStatus:
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'expired'
    | 'failed'
    | string;
  paymentMethod: string;
  jobId: string;
  totalAmount: number;
  updatedAt: string;
}

export interface CancelPrintJobResponse {
  jobId: string; // UUID as string
  refundAmount: number;
}

// Student Balance
export interface StudentBalanceResponse {
  balanceAmount: number;
  balanceInPages: number;
  isSufficient?: boolean;
  shortage?: number | null;
}

export interface BalanceHistoryParams {
  page?: number;
  limit?: number;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  sort_by?: string; // 'created_at', 'amount', 'direction'
  sort_direction?: string; // 'asc', 'desc'
}

export interface BalanceHistoryItem {
  ledgerId: string; // UUID as string
  amount: number; // Positive for IN, negative for OUT
  direction: 'IN' | 'OUT';
  sourceType: 'DEPOSIT' | 'SEMESTER_BONUS' | 'PAYMENT' | 'REFUND';
  description: string;
  createdAt: string; // ISO LocalDateTime string
}

// ============================================================================
// Payment/Deposit API Types
// ============================================================================

export interface DepositBonusPackageResponse {
  id: string; // UUID as string
  amount: number;
  bonusAmount: number;
  totalReceived: number;
  packageName: string;
  description: string;
}

export interface DepositResponse {
  depositId: string; // UUID as string
  qrUrl: string;
  transferContent: string;
  amount: number;
  bonusAmount?: number;
  totalCredited?: number;
  createdAt: string; // ISO LocalDateTime string
  expiredAt: string; // ISO LocalDateTime string
  serverTime: string; // ISO LocalDateTime string
  isReused: boolean;
  status:
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'expired'
    | 'failed'
    | 'refunded';
}

export interface CreateDepositRequest {
  packageId?: string; // UUID as string
  amount?: number;
}

export interface DepositStatusResponse {
  depositId: string;
  depositCode: string;
  paymentStatus:
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'expired'
    | 'failed'
    | string;
  paymentMethod: string;
  depositAmount: number;
  bonusAmount?: number;
  totalCredited: number;
  updatedAt: string;
}

export interface DepositHistoryResponse {
  statistics: {
    totalTransactions: number;
    completedTransactions: number;
    totalDeposited: number;
    totalBonus: number;
    totalSpent: number;
  };
  data: {
    success: boolean;
    message: string;
    data: DepositHistoryItem[];
    pagination: PageResponse;
    timestamp: string;
  };
}

export interface DepositHistoryItem {
  depositId: string; // UUID as string
  depositCode: string;
  depositAmount: number;
  bonusAmount: number;
  totalCredited: number;
  paymentStatus:
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'expired'
    | 'failed'
    | 'refunded';
  paymentMethod: string;
  transactionDate: string; // ISO LocalDateTime string
  expiredAt: string | null; // ISO LocalDateTime string
  packageName: string | null;
}

export interface DepositDetailResponse {
  depositId: string; // UUID as string
  depositCode: string;
  depositAmount: number;
  bonusAmount: number;
  totalCredited: number;
  paymentStatus:
    | 'pending'
    | 'completed'
    | 'cancelled'
    | 'expired'
    | 'failed'
    | 'refunded';
  paymentMethod: string;
  paymentReference: string | null;
  transactionDate: string; // ISO LocalDateTime string
  expiredAt: string | null; // ISO LocalDateTime string
  cancellationReason: string | null;
  packageId: string | null; // UUID as string
  packageName: string | null;
  packageDescription: string | null;
}

// ============================================================================
// Student Profile API Types
// ============================================================================

export interface StudentProfileResponse {
  userId: string; // UUID as string
  email: string;
  fullName: string;
  studentId: string;
  studentCode?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO LocalDate string
  address?: string;
  avatarUrl?: string;
  profilePicture?: string;
  facultyName?: string;
  departmentName?: string;
  classCode?: string;
  status?: string;
  balance?: number;
  createdAt: string; // ISO LocalDateTime string
  updatedAt: string; // ISO LocalDateTime string
}

export interface UpdateStudentProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO LocalDate string
  address?: string;
}

// ============================================================================
// Print History API Types
// ============================================================================

export interface StudentPrintHistoryItemResponse {
  jobId: string; // UUID as string
  printStatus: string; // 'queued', 'printing', 'completed', 'cancelled', 'failed'
  fileName: string | null;
  fileType: string | null;
  fileUrl?: string | null;
  uploadedFileId?: string | null; // BE provides when available
  printerName: string | null;
  printerLocation: string | null;
  paperSize?: string | null;
  colorMode: string;
  printSide: string;
  pageOrientation?: string | null;
  numberOfCopy: number;
  totalPages: number;
  subtotalBeforeDiscount?: number | null;
  totalPrice: number;
  createdAt: string; // ISO LocalDateTime string
  startTime?: string | null; // ISO LocalDateTime string
  endTime?: string | null; // ISO LocalDateTime string
  completedAt?: string | null; // legacy support
}

export interface StudentPrintJobDetailResponse {
  jobId: string; // UUID as string
  printStatus: string;
  uploadedFile?: {
    uploadedFileId: string; // UUID as string
    fileName: string;
    fileType: string;
    fileUrl: string;
    pageCount: number;
  };
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  printer: {
    printerId: string; // UUID as string
    brandName: string;
    modelName: string;
    location: string;
    roomCode: string;
    buildingCode: string;
  };
  printerDisplayName?: string;
  config: {
    paperSize: string;
    colorMode: string;
    pageOrientation: string;
    printSide: string;
    numberOfCopy: number;
  };
  colorMode?: string;
  printSide?: string;
  pageOrientation?: string;
  numberOfCopy?: number;
  paymentMethod?: string | null;
  subtotalBeforeDiscount?: number | null;
  discountPercentage?: number | null;
  discountAmount?: number | null;
  totalPrice?: number | null;
  pricing: {
    totalPages: number;
    basePricePerPage: number;
    colorModePricePerPage: number;
    subtotalBeforeDiscount: number;
    discountAmount: number;
    totalPrice: number;
  };
  totalPrintedPages?: number;
  originalPages?: number;
  payment: {
    paymentId: string; // UUID as string
    paymentStatus: string;
    paymentMethod: string;
    paidAt: string; // ISO LocalDateTime string
  };
  timing: {
    createdAt: string; // ISO LocalDateTime string
    queuedAt: string | null; // ISO LocalDateTime string
    startedAt: string | null; // ISO LocalDateTime string
    completedAt: string | null; // ISO LocalDateTime string
    cancelledAt: string | null; // ISO LocalDateTime string
  };
  createdAt?: string; // ISO LocalDateTime string
  endTime?: string | null; // ISO LocalDateTime string
  cancellationReason: string | null;
}

// Legacy PrintHistoryStatsResponse - kept for backward compatibility
export interface PrintHistoryStatsResponse {
  totalJobs?: number;
  completedJobs?: number;
  failedJobs?: number;
  cancelledJobs?: number;
  totalPages?: number;
  totalSpent?: number;
  averagePagesPerJob?: number;
  averageCostPerJob?: number;
  jobsThisMonth?: number | JobsThisMonth;
  pagesLast30Days?: number;
  successRate?: number | SuccessRate;
  pagesThisMonth?: number;
}

// Dashboard-specific PrintHistoryStatsResponse structure
export interface JobsThisMonth {
  total: number;
  color: number;
  blackWhite: number;
  growthPercent: number;
}

export interface SuccessRate {
  percent: number;
  status: string; // 'STABLE' | 'UP' | 'DOWN'
}

// Dashboard PrintHistoryStatsResponse (used by dashboard API)
export interface DashboardPrintHistoryStatsResponse {
  jobsThisMonth: JobsThisMonth;
  pagesThisMonth: number;
  pagesLast30Days: number;
  successRate: SuccessRate;
}

// ============================================================================
// Dashboard API Types
// ============================================================================

export interface StudentDashboardResponse {
  userName: string;
  balance: StudentBalanceResponse;
  printHistoryStats: DashboardPrintHistoryStatsResponse;
  recentFiles?: any[]; // Array of recent file items
}

// Bonus Package from /api/payment/bonus-packages
export interface BonusPackageResponse {
  packageId: string; // UUID as string
  minPages: number;
  discountPercentage: number; // 0-1 range
  packageName: string;
  description: string;
  isActive: boolean;
  createdAt: string; // ISO LocalDateTime string
  updatedAt: string; // ISO LocalDateTime string
}

export interface DashboardPrinterStatsResponse {
  totalPrinters: number;
  activePrinters: number;
  inactivePrinters: number;
  maintenancePrinters?: number;
  printersByStatus: Record<string, number>;
  printersByBrand: Record<string, number>;
  totalBrands?: number;
  totalModels?: number;
  maintenanceWarning?: number;
}

// ============================================================================
// Notification API Types
// ============================================================================

export interface NotificationResponse {
  notificationId: string; // UUID as string
  notificationType: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string; // ISO LocalDateTime string
  referenceId?: string; // UUID as string
  referenceType?: string;
}

export type NotificationType =
  | 'DEPOSIT_CREATED'
  | 'DEPOSIT_SUCCESS'
  | 'DEPOSIT_FAILED'
  | 'DEPOSIT_EXPIRED'
  | 'PRINT_JOB_CREATED'
  | 'PRINT_JOB_QUEUED'
  | 'PRINT_JOB_PRINTING'
  | 'PRINT_JOB_COMPLETED'
  | 'PRINT_JOB_FAILED'
  | 'PRINT_JOB_CANCELLED'
  | 'BALANCE_LOW'
  | 'SYSTEM';

export interface NotificationCountResponse {
  unreadCount: number;
}

export interface NotificationListResponse {
  content: NotificationResponse[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
}

// ============================================================================
// Staff Reports API Types
// ============================================================================

export interface WeeklyActivityItem {
  date: string; // YYYY-MM-DD
  dayName: string; // "Sat", "Sun", etc.
  jobCount: number;
  pageCount: number;
  revenue: number;
}

export interface PrinterStatusResponse {
  idle: number;
  printing: number;
  maintained: number;
  unplugged: number;
  error: number;
}

export interface PaperSizeUsageItem {
  sizeName: string;
  count: number;
  percentage: number;
}

export interface RecentActivity {
  id: string; // UUID
  type: string; // "PRINT_JOB", etc.
  description: string;
  studentName: string;
  studentCode: string;
  timestamp: string; // ISO LocalDateTime string
  status: string;
}

export interface StaffDashboardOverviewResponse {
  printersOnline: number;
  totalPrinters: number;
  jobsToday: number;
  jobsThisMonth: number;
  completedJobsToday: number;
  queuedJobs: number;
  printingJobs: number;
  revenueToday: number;
  revenueThisMonth: number;
  depositsToday: number;
  depositsThisMonth: number;
  totalPagestoday: number; // Note: typo in API response
  totalPagesThisMonth: number;
  activeStudents: number;
  newStudentsThisMonth: number;
  weeklyActivity: WeeklyActivityItem[];
  printerStatus: PrinterStatusResponse;
  paperSizeUsage: PaperSizeUsageItem[];
  recentActivities: RecentActivity[];
}

export interface PrintJobStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  cancelledJobs: number;
  completionRate: number; // percentage
  totalPages: number;
  colorPages?: number;
  bwPages?: number;
  duplexPages?: number;
  a4Pages?: number;
  a3Pages?: number;
  jobGrowthRate?: number; // vs previous period
}

export interface RevenueStats {
  totalRevenue: number;
  printRevenue?: number;
  depositAmount: number;
  bonusGiven?: number;
  refundAmount?: number;
  avgDepositAmount?: number;
  avgJobCost: number;
  revenueGrowthRate?: number; // vs previous period
}

export interface UserStats {
  totalActiveStudents: number;
  newRegistrations: number;
  activeUsers?: number; // users who printed at least once
  usageRate?: number; // activeUsers / totalActiveStudents
}

export interface PrinterStats {
  totalPrinters: number;
  activePrinters: number;
  maintenanceEvents?: number;
  avgUtilizationRate?: number;
  paperJamEvents?: number;
  outOfPaperEvents?: number;
}

export interface SystemReportData {
  printJobStats: PrintJobStats;
  revenueStats: RevenueStats;
  userStats: UserStats;
  printerStats: PrinterStats;
}

export interface SystemReportResponse {
  reportId: string; // UUID
  reportType: 'MONTHLY' | 'YEARLY';
  reportPeriod: string; // "2025-12" for monthly, "2025" for yearly
  periodStart: string; // ISO LocalDate string
  periodEnd: string; // ISO LocalDate string
  generatedAt: string; // ISO LocalDateTime string
  generatedBy: string; // "SYSTEM" or user name
  printJobStats: PrintJobStats;
  revenueStats: RevenueStats;
  userStats: UserStats;
  printerStats: PrinterStats;
}

export interface CustomReportResponse {
  printJobStats: PrintJobStats;
  revenueStats: RevenueStats;
  userStats: UserStats;
  printerStats: PrinterStats;
  // Additional fields that might be available
  printJobsByDate?: Array<{
    date: string;
    completed: number;
    failed: number;
    queued: number;
    total: number;
  }>;
  pagesPrintedByDate?: Array<{
    date: string;
    pages: number;
    colorPages: number;
    blackWhitePages: number;
  }>;
  revenueByMonth?: Array<{
    month: string;
    revenue: number;
    purchases: number;
  }>;
  topPrinters?: Array<{
    printerName: string;
    totalJobs: number;
    totalPages: number;
    successRate: number;
  }>;
  colorModeDistribution?: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  paperSizeDistribution?: Array<{
    size: string;
    count: number;
    percentage: number;
  }>;
}
