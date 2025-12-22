import type {
  UploadedFileResponse,
  AvailablePrinterResponse,
  PageSizeResponse,
  ColorModeResponse,
  CalculateCostResponse,
  CreatePrintJobResponse,
  PrintJobProgressResponse,
  StudentBalanceResponse,
} from '@/types/api';

// ============================================================================
// Uploaded File Mappers
// ============================================================================

/**
 * Frontend UploadedFile type (matching MockUploadedFile interface)
 */
export interface UploadedFile {
  uploadedFileId: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  fileUrl: string;
  pageCount: number;
  uploadedAt: string;
  lastPrintedAt: string | null;
  printCount: number;
}

/**
 * Maps UploadedFileResponse from API to UploadedFile for frontend
 */
export function mapUploadedFileResponse(
  response: UploadedFileResponse
): UploadedFile {
  return {
    uploadedFileId: response.uploadedFileId,
    fileName: response.fileName,
    fileType: response.fileType,
    fileSizeKb: response.fileSizeKb,
    fileUrl: response.fileUrl,
    pageCount: response.pageCount,
    uploadedAt: response.uploadedAt,
    lastPrintedAt: response.lastPrintedAt,
    printCount: response.printCount,
  };
}

/**
 * Maps array of UploadedFileResponse to UploadedFile[]
 */
export function mapUploadedFilesResponse(
  responses: UploadedFileResponse[]
): UploadedFile[] {
  return responses.map(mapUploadedFileResponse);
}

// ============================================================================
// Printer Mappers
// ============================================================================

/**
 * Frontend AvailablePrinter type (matching MockPrinter interface)
 * Using snake_case to match MockPrinter
 */
export interface AvailablePrinter {
  printer_id: string;
  serial_number: string;
  brand_name: string;
  model_name: string;
  room_code: string;
  building_name: string;
  building_code?: string;
  building_address?: string;
  campus_name?: string;
  is_enabled: boolean;
  status: 'online' | 'offline' | 'maintenance';
  printing_status?: 'idle' | 'printing' | 'error';
  supports_color: boolean;
  supports_duplex: boolean;
  max_paper_size: string;
  installed_date?: string;
  last_maintenance_date?: string;
}

/**
 * Maps AvailablePrinterResponse from API to AvailablePrinter for frontend
 */
export function mapAvailablePrinterResponse(
  response: AvailablePrinterResponse
): AvailablePrinter {
  // Map status: API uses 'idle'/'busy'/'offline'/'maintenance', FE uses 'online'/'offline'/'maintenance'
  let status: 'online' | 'offline' | 'maintenance' = 'online';
  if (response.status === 'offline' || response.status === 'maintenance') {
    status = response.status;
  } else if (response.status === 'idle' || response.status === 'busy') {
    status = 'online';
  }

  return {
    printer_id: response.printerId,
    serial_number: response.serialNumber,
    brand_name: response.brandName,
    model_name: response.modelName,
    room_code: response.roomCode,
    building_name: response.buildingCode || response.buildingAddress || '', // Use buildingCode as buildingName
    building_code: response.buildingCode,
    building_address: response.buildingAddress,
    campus_name: response.campusName,
    is_enabled: response.isEnabled,
    status,
    printing_status: response.printingStatus,
    supports_color: response.supportsColor,
    supports_duplex: response.supportsDuplex,
    max_paper_size: response.maxPageSize,
  };
}

/**
 * Maps array of AvailablePrinterResponse to AvailablePrinter[]
 */
export function mapAvailablePrintersResponse(
  responses: AvailablePrinterResponse[]
): AvailablePrinter[] {
  return responses.map(mapAvailablePrinterResponse);
}

// ============================================================================
// Page Size Mappers
// ============================================================================

/**
 * Frontend PageSize type (matching MockPageSize interface)
 * Using snake_case to match MockPageSize
 */
export interface PageSize {
  page_size_id: string;
  size_name: string;
  width_mm: number;
  height_mm: number;
}

/**
 * Maps PageSizeResponse from API to PageSize for frontend
 */
export function mapPageSizeResponse(response: PageSizeResponse): PageSize {
  return {
    page_size_id: response.pageSizeId,
    size_name: response.sizeName,
    width_mm: response.widthMm,
    height_mm: response.heightMm,
  };
}

/**
 * Maps array of PageSizeResponse to PageSize[]
 */
export function mapPageSizesResponse(
  responses: PageSizeResponse[]
): PageSize[] {
  return responses.map(mapPageSizeResponse);
}

// ============================================================================
// Color Mode Mappers
// ============================================================================

/**
 * Frontend ColorMode type
 */
export interface ColorMode {
  colorModeId: string;
  colorModeName: 'black_white' | 'grayscale' | 'color';
  description: string;
  colorMultiplier: number;
}

/**
 * Maps ColorModeResponse from API to ColorMode for frontend
 */
export function mapColorModeResponse(response: ColorModeResponse): ColorMode {
  return {
    colorModeId: response.colorModeId,
    colorModeName: response.colorModeName,
    description: response.description,
    colorMultiplier: response.colorMultiplier,
  };
}

/**
 * Maps array of ColorModeResponse to ColorMode[]
 */
export function mapColorModesResponse(
  responses: ColorModeResponse[]
): ColorMode[] {
  return responses.map(mapColorModeResponse);
}

// ============================================================================
// Cost Calculation Mappers
// ============================================================================

/**
 * Frontend CalculateCost type
 */
export interface CalculateCost {
  totalPages: number;
  basePricePerPage: number;
  colorModePricePerPage: number;
  subtotalBeforeDiscount: number;
  discountPackageId: string | null;
  discountPercentage: number;
  discountAmount: number;
  totalPrice: number;
  estimatedPages: number;
}

/**
 * Maps CalculateCostResponse from API to CalculateCost for frontend
 */
export function mapCalculateCostResponse(
  response: CalculateCostResponse
): CalculateCost {
  return {
    totalPages: response.totalPages,
    basePricePerPage: response.basePricePerPage,
    colorModePricePerPage: response.colorModePricePerPage,
    subtotalBeforeDiscount: response.subtotalBeforeDiscount,
    discountPackageId: response.discountPackageId,
    discountPercentage: response.discountPercentage,
    discountAmount: response.discountAmount,
    totalPrice: response.totalPrice,
    estimatedPages: response.estimatedPages,
  };
}

// ============================================================================
// Print Job Mappers
// ============================================================================

/**
 * Frontend CreatePrintJob type
 */
export interface CreatePrintJob {
  jobId: string;
  printStatus: 'queued' | 'printing' | 'completed' | 'cancelled' | 'failed';
  totalPrice: number;
  paymentId: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  printer: {
    printerId: string;
    location: string;
    status: string;
  };
  estimatedCompletionTime: string;
  remainingBalance: number;
  createdAt: string;
}

/**
 * Maps CreatePrintJobResponse from API to CreatePrintJob for frontend
 */
export function mapCreatePrintJobResponse(
  response: CreatePrintJobResponse
): CreatePrintJob {
  return {
    jobId: response.jobId,
    printStatus: response.printStatus,
    totalPrice: response.totalPrice,
    paymentId: response.paymentId,
    paymentStatus: response.paymentStatus,
    paymentMethod: response.paymentMethod,
    printer: response.printer,
    estimatedCompletionTime: response.estimatedCompletionTime,
    remainingBalance: response.remainingBalance,
    createdAt: response.createdAt,
  };
}

/**
 * Frontend PrintJobProgress type
 */
export interface PrintJobProgress {
  jobId: string;
  printStatus: 'queued' | 'printing' | 'completed' | 'cancelled' | 'failed';
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
    startTime: string | null;
    estimatedCompletionTime: string | null;
    elapsedMinutes: number;
    elapsedSeconds: number;
  };
  printer: {
    printerId: string;
    printerName: string;
    location: string;
    status: string;
  };
}

/**
 * Maps PrintJobProgressResponse from API to PrintJobProgress for frontend
 */
export function mapPrintJobProgressResponse(
  response: PrintJobProgressResponse
): PrintJobProgress {
  return {
    jobId: response.jobId,
    printStatus: response.printStatus,
    progress: response.progress,
    queueInfo: response.queueInfo,
    timing: response.timing,
    printer: response.printer,
  };
}

// ============================================================================
// Balance Mappers
// ============================================================================

/**
 * Frontend StudentBalance type
 */
export interface StudentBalance {
  balanceAmount: number;
  balanceInPages: number;
  isSufficient?: boolean;
  shortage?: number | null;
}

/**
 * Maps StudentBalanceResponse from API to StudentBalance for frontend
 */
export function mapStudentBalanceResponse(
  response: StudentBalanceResponse
): StudentBalance {
  return {
    balanceAmount: response.balanceAmount,
    balanceInPages: response.balanceInPages,
    isSufficient: response.isSufficient,
    shortage: response.shortage,
  };
}
