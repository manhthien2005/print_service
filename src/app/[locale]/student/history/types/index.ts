// Types for Print History - separated from mock data

export type PrintJobStatus = 'completed' | 'processing' | 'queued' | 'failed';

export interface PrintHistoryItem {
  id: string;
  documentName: string;
  fileType: string;
  fileSizeKB: number;
  previewUrl?: string;
  printerName: string;
  printerSerial?: string;
  buildingName?: string;
  roomCode?: string;
  printerStatus?: 'online' | 'offline' | 'maintenance';
  supportsColor?: boolean;
  supportsDuplex?: boolean;
  location: string;
  submittedAt: string; // ISO string
  completedAt?: string; // ISO string
  pageCount: number;
  copies: number;
  colorMode: 'color' | 'grayscale' | 'black-white';
  duplex: boolean;
  paperSize?: string;
  orientation?: 'portrait' | 'landscape';
  costVnd: number;
  status: PrintJobStatus;
  tags?: string[];
  errorMessage?: string;
}

export interface HistoryFilterOption {
  label: string;
  value: string;
}

export type StatusFilterValue =
  | 'all'
  | 'completed'
  | 'processing'
  | 'queued'
  | 'failed';

export type SortColumn =
  | 'document'
  | 'printer'
  | 'mode'
  | 'pages'
  | 'time'
  | 'status'
  | null;

export type SortDirection = 'asc' | 'desc' | null;
