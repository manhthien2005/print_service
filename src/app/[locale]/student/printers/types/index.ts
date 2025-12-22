// Types extracted from printersInfoMock.ts

export type PrinterStatus = 'online' | 'busy' | 'offline' | 'maintenance';

export interface PrinterInfoMock {
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

export interface PrinterInfoSummary {
  total: number;
  online: number;
  busy: number;
  offline: number;
  maintenance: number;
  avgQueue: number;
}

export interface PrinterNotice {
  id: string;
  title: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
  actionLabel?: string;
}
