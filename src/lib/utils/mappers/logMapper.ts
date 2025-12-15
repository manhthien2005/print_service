import type { PrinterLogResponse } from '@/types/api';

/**
 * Frontend PrinterActivityLog type (matching ManagePrintersContent interface)
 */
export interface PrinterActivityLog {
  logId: string;
  printerId: string;
  printerLocation: string | null; // Format: "BUILDING-ROOM"
  printerName: string | null; // Format: "Brand Model"
  logType: string; // Backend logType: 'print_job', 'error', 'maintenance', 'status_change', 'configuration', 'admin_action'
  actionType: string; // Mapped from logType for display compatibility
  severity: string; // 'info', 'warning', 'error', 'critical'
  description: string;
  performedBy: string; // User name
  actionDetail: string; // Alias for description
  actionTimestamp: string; // ISO LocalDateTime string
  timestamp: string; // Alias for actionTimestamp
  userName: string | null;
  userType: string | null;
  errorCode: string | null;
  isResolved: boolean | null;
  relatedFileName: string | null;
  createdAt: string;
}

/**
 * Maps logType from backend to actionType for display
 * Backend uses: 'print_job', 'error', 'maintenance', 'status_change', 'configuration', 'admin_action'
 * Frontend expects: 'added', 'enabled', 'disabled', 'updated', 'removed', 'maintenance'
 */
function mapLogTypeToActionType(logType: string): string {
  const mapping: Record<string, string> = {
    print_job: 'print_job',
    error: 'error',
    maintenance: 'maintenance',
    status_change: 'status_change',
    configuration: 'configuration',
    admin_action: 'admin_action',
    // Legacy mappings for backward compatibility
    added: 'added',
    enabled: 'enabled',
    disabled: 'disabled',
    updated: 'updated',
    removed: 'removed',
  };
  return mapping[logType] || logType;
}

/**
 * Maps PrinterLogResponse from backend to PrinterActivityLog for frontend
 */
export function mapLogResponse(
  response: PrinterLogResponse
): PrinterActivityLog {
  const timestamp = response.timestamp || response.createdAt;
  const actionType = mapLogTypeToActionType(response.logType);

  return {
    logId: response.logId,
    printerId: response.printerId,
    printerLocation: response.printerLocation,
    printerName: response.printerName,
    logType: response.logType,
    actionType: actionType,
    severity: response.severity,
    description: response.description,
    performedBy: response.userName || 'Unknown',
    actionDetail: response.description,
    actionTimestamp: timestamp,
    timestamp: timestamp,
    userName: response.userName,
    userType: response.userType,
    errorCode: response.errorCode,
    isResolved: response.isResolved,
    relatedFileName: response.relatedFileName,
    createdAt: response.createdAt,
  };
}

/**
 * Maps array of PrinterLogResponse to PrinterActivityLog[]
 */
export function mapLogsResponse(
  responses: PrinterLogResponse[]
): PrinterActivityLog[] {
  return responses.map(mapLogResponse);
}
