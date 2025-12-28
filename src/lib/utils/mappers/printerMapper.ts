import type { PrinterResponse } from '@/types/api';

/**
 * Frontend PrinterPhysical type (matching ManagePrintersContent interface)
 */
export interface PrinterPhysical {
  printerId: string;
  brandName: string;
  modelName: string;
  serialNumber: string;
  roomName: string; // Created from roomCode + buildingCode
  isEnabled: boolean;
  installedDate: string; // YYYY-MM-DD format
  lastMaintenanceDate: string; // YYYY-MM-DD format
  createdAt: string;
}

/**
 * Printer status type for student printer info page
 */
export type PrinterStatus = 'online' | 'busy' | 'offline' | 'maintenance';

/**
 * Printer info type for student printer info page
 */
export interface PrinterInfo {
  id: string;
  name: string;
  brand: string;
  model: string;
  building: string;
  room: string;
  floor: string;
  status: PrinterStatus;
  queueLength: number;
  uptime: number;
  supportsColor: boolean;
  supportsDuplex: boolean;
  maxPaperSize: 'A3' | 'A4';
  lastActive: string;
  ipAddress: string;
  serial: string;
  paperLevels: { size: 'A3' | 'A4'; level: number }[];
  tags?: string[];
  note?: string;
}

/**
 * Printer info summary type
 */
export interface PrinterInfoSummary {
  total: number;
  online: number;
  busy: number;
  offline: number;
  maintenance: number;
  avgQueue: number;
}

/**
 * Maps PrinterResponse from backend to PrinterPhysical for frontend
 */
export function mapPrinterResponse(response: PrinterResponse): PrinterPhysical {
  // Create roomName from roomCode + buildingCode
  const roomName =
    response.roomCode && response.buildingCode
      ? `${response.roomCode} - ${response.buildingCode}`
      : response.roomCode || '';

  // Format dates: LocalDate comes as YYYY-MM-DD, keep as is
  const installedDate = response.installedDate || '';
  const lastMaintenanceDate = response.lastMaintenanceDate || '';

  return {
    printerId: response.printerId,
    brandName: response.brandName,
    modelName: response.modelName,
    serialNumber: response.serialNumber,
    roomName,
    isEnabled: response.isEnabled,
    installedDate,
    lastMaintenanceDate,
    createdAt: response.createdAt, // Already ISO string from JSON
  };
}

/**
 * Maps array of PrinterResponse to PrinterPhysical[]
 */
export function mapPrintersResponse(
  responses: PrinterResponse[]
): PrinterPhysical[] {
  return responses.map(mapPrinterResponse);
}

/**
 * Maps PrinterResponse to PrinterInfo for student printer info page
 * Note: Some fields like queueLength, uptime, ipAddress are not available from API
 * and will be set to default/calculated values
 */
export function mapPrinterToInfo(response: PrinterResponse): PrinterInfo {
  // Determine status from isEnabled
  // If disabled, it's offline. If enabled, assume online (could be enhanced with actual status API)
  const status: PrinterStatus = response.isEnabled ? 'online' : 'offline';

  // Extract building name from buildingCode (format: "BUILDING-CODE" or just use buildingCode)
  const building = response.buildingCode || 'N/A';

  // Extract room code
  const room = response.roomCode || 'N/A';

  // Extract floor from room code if it follows pattern (e.g., R305 -> Tầng 3)
  const floorMatch = room.match(/R(\d)(\d{2})/);
  const floor = floorMatch ? `Tầng ${floorMatch[1]}` : 'N/A';

  // Create printer name
  const name = `${response.brandName} ${response.modelName} • ${room}`;

  // Map max paper size
  const maxPaperSize: 'A3' | 'A4' =
    response.maxPageSize?.toUpperCase() === 'A3' ? 'A3' : 'A4';

  // Default values for fields not available in API
  const queueLength = 0; // TODO: Could be fetched from print jobs API if available
  const uptime = response.isEnabled ? 95 : 0; // Estimate based on enabled status
  const ipAddress = 'N/A'; // Not available in API
  const lastActive = response.updatedAt
    ? new Date(response.updatedAt).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Chưa có dữ liệu';

  // Paper levels - default values (not available in API)
  const paperLevels: { size: 'A3' | 'A4'; level: number }[] = [
    { size: 'A4' as const, level: 75 },
    ...(maxPaperSize === 'A3' ? [{ size: 'A3' as const, level: 50 }] : []),
  ];

  // Tags based on capabilities
  const tags: string[] = [];
  if (response.supportsColor) tags.push('in màu');
  if (response.supportsDuplex) tags.push('in 2 mặt');
  if (maxPaperSize === 'A3') tags.push('A3');

  return {
    id: response.printerId,
    name,
    brand: response.brandName,
    model: response.modelName,
    building,
    room,
    floor,
    status,
    queueLength,
    uptime,
    supportsColor: response.supportsColor,
    supportsDuplex: response.supportsDuplex,
    maxPaperSize,
    lastActive,
    ipAddress,
    serial: response.serialNumber,
    paperLevels,
    tags: tags.length > 0 ? tags : undefined,
  };
}

/**
 * Maps array of PrinterResponse to PrinterInfo[]
 */
export function mapPrintersToInfo(responses: PrinterResponse[]): PrinterInfo[] {
  return responses.map(mapPrinterToInfo);
}

/**
 * Calculates summary from PrinterInfo array
 */
export function calculatePrinterSummary(
  printers: PrinterInfo[]
): PrinterInfoSummary {
  const summary: PrinterInfoSummary = {
    total: printers.length,
    online: 0,
    busy: 0,
    offline: 0,
    maintenance: 0,
    avgQueue: 0,
  };

  printers.forEach(printer => {
    switch (printer.status) {
      case 'online':
        summary.online += 1;
        break;
      case 'busy':
        summary.busy += 1;
        break;
      case 'offline':
        summary.offline += 1;
        break;
      case 'maintenance':
        summary.maintenance += 1;
        break;
    }
    summary.avgQueue += printer.queueLength;
  });

  summary.avgQueue = Math.round(summary.avgQueue / Math.max(summary.total, 1));

  return summary;
}
