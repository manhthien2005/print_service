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
