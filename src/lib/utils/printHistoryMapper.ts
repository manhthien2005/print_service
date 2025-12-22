import type {
  StudentPrintHistoryItemResponse,
  StudentPrintJobDetailResponse,
} from '@/types/api';
import type {
  PrintHistoryItem,
  PrintJobStatus,
} from '@/app/[locale]/student/history/components/historyTypes';

/**
 * Map BE print status to FE print status
 */
export function mapPrintStatus(beStatus: string): PrintJobStatus {
  switch (beStatus.toLowerCase()) {
    case 'completed':
      return 'completed';
    case 'printing':
      return 'processing';
    case 'queued':
      return 'queued';
    case 'failed':
    case 'cancelled':
      return 'failed';
    default:
      return 'queued';
  }
}

/**
 * Map BE color mode to FE color mode
 */
export function mapColorMode(
  beColorMode: string
): 'color' | 'grayscale' | 'black-white' {
  switch (beColorMode.toLowerCase()) {
    case 'color':
      return 'color';
    case 'grayscale':
      return 'grayscale';
    case 'black-white':
      return 'black-white';
    default:
      return 'black-white';
  }
}

/**
 * Extract file size from file URL or return default
 * Note: BE doesn't provide file size, so we'll use a default or calculate if possible
 */
function getFileSizeKB(): number {
  // Default file size if not available
  return 1024; // 1MB default
}

/**
 * Extract file name from file URL
 */
function getFileName(
  fileUrl: string | null,
  providedFileName: string | null
): string {
  if (providedFileName) return providedFileName;
  if (!fileUrl) return 'Unknown';

  const idx = fileUrl.lastIndexOf('/');
  return idx >= 0 && idx + 1 < fileUrl.length
    ? fileUrl.substring(idx + 1)
    : fileUrl;
}

/**
 * Parse printer location to extract building and room
 */
function parsePrinterLocation(location: string | null): {
  buildingName?: string;
  roomCode?: string;
  location: string;
} {
  if (!location) {
    return { location: '—' };
  }

  // Format: "BUILDING-ROOM" or "BUILDING-ROOM - Brand Model"
  const parts = location.split('-');
  if (parts.length >= 2) {
    const buildingName = parts[0];
    const roomCode = parts[1].split(' ')[0]; // Get room code before any additional text
    return {
      buildingName,
      roomCode,
      location,
    };
  }

  return { location };
}

/**
 * Map BE StudentPrintHistoryItemResponse to FE PrintHistoryItem
 */
export function mapHistoryItemToFE(
  item: StudentPrintHistoryItemResponse
): PrintHistoryItem {
  const status = mapPrintStatus(item.printStatus);
  const colorMode = mapColorMode(item.colorMode);
  const fileName = getFileName(item.fileUrl, item.fileName);
  const { buildingName, roomCode, location } = parsePrinterLocation(
    item.printerLocation
  );

  // Determine if duplex based on printSide
  const duplex = item.printSide === 'double-sided';

  // Create tags array
  const tags: string[] = [];
  if (item.pageOrientation === 'landscape') {
    tags.push('Ngang');
  }
  if (duplex) {
    tags.push('2 mặt');
  } else {
    tags.push('1 mặt');
  }
  if (colorMode === 'color') {
    tags.push('Màu');
    tags.push('In màu');
  } else if (colorMode === 'grayscale') {
    tags.push('In xám');
  } else {
    tags.push('Đen trắng');
  }

  return {
    id: item.jobId,
    documentName: fileName,
    fileType: (item.fileType || 'PDF').toUpperCase(),
    fileSizeKB: getFileSizeKB(),
    previewUrl: item.fileUrl || undefined,
    printerName: item.printerName || 'Unknown Printer',
    printerSerial: undefined, // Not provided by BE
    buildingName,
    roomCode,
    printerStatus: 'online' as const, // BE doesn't provide this, default to online
    supportsColor: undefined, // Not provided in history item
    supportsDuplex: undefined, // Not provided in history item
    location: location,
    submittedAt: item.createdAt,
    completedAt: item.endTime || undefined,
    pageCount: item.totalPages || 0,
    copies: item.numberOfCopy || 1,
    colorMode,
    duplex,
    paperSize: undefined, // Not provided in history item
    orientation:
      item.pageOrientation === 'landscape' ? 'landscape' : 'portrait',
    costVnd: 0, // Not provided by BE
    status,
    tags,
    errorMessage: status === 'failed' ? 'Lỗi khi in' : undefined,
  };
}

/**
 * Map BE StudentPrintJobDetailResponse to FE PrintHistoryItem for detail view
 */
export function mapJobDetailToFE(
  detail: StudentPrintJobDetailResponse
): PrintHistoryItem {
  const status = mapPrintStatus(detail.printStatus);
  const colorMode = mapColorMode(detail.colorMode);
  const fileName = getFileName(detail.fileUrl, detail.fileName);

  // Parse printer display name: "BUILDING-ROOM - Brand Model"
  let buildingName: string | undefined;
  let roomCode: string | undefined;
  let location = '—';

  if (detail.printerDisplayName) {
    const parts = detail.printerDisplayName.split(' - ');
    if (parts.length >= 1) {
      const locationPart = parts[0];
      const locationParts = locationPart.split('-');
      if (locationParts.length >= 2) {
        buildingName = locationParts[0];
        roomCode = locationParts[1];
        location = locationPart;
      }
    }
  }

  const duplex = detail.printSide === 'double-sided';

  const tags: string[] = [];
  if (detail.pageOrientation === 'landscape') {
    tags.push('Ngang');
  }
  if (duplex) {
    tags.push('2 mặt');
  } else {
    tags.push('1 mặt');
  }
  if (colorMode === 'color') {
    tags.push('Màu');
    tags.push('In màu');
  } else if (colorMode === 'grayscale') {
    tags.push('In xám');
  } else {
    tags.push('Đen trắng');
  }

  return {
    id: detail.jobId,
    documentName: fileName,
    fileType: (detail.fileType || 'PDF').toUpperCase(),
    fileSizeKB: getFileSizeKB(),
    previewUrl: detail.fileUrl || undefined,
    printerName:
      detail.printerDisplayName?.split(' - ')[1] || 'Unknown Printer',
    printerSerial: undefined,
    buildingName,
    roomCode,
    printerStatus: 'online' as const,
    supportsColor: undefined,
    supportsDuplex: undefined,
    location,
    submittedAt: detail.createdAt,
    completedAt: detail.endTime || undefined,
    pageCount: detail.totalPrintedPages || detail.originalPages || 0,
    copies: detail.numberOfCopy || 1,
    colorMode,
    duplex,
    paperSize: undefined,
    orientation:
      detail.pageOrientation === 'landscape' ? 'landscape' : 'portrait',
    costVnd: 0,
    status,
    tags,
    errorMessage: status === 'failed' ? 'Lỗi khi in' : undefined,
  };
}
