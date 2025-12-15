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



