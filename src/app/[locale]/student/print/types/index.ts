// Types extracted from printMock.ts and uploadedFilesMock.ts
// These types are used for student print functionality

export interface MockPrinter {
  printer_id: string;
  serial_number: string;
  brand_name: string;
  model_name: string;
  room_code: string;
  building_name: string;
  is_enabled: boolean;
  supports_color: boolean;
  supports_duplex: boolean;
  max_paper_size: string;
  status: 'online' | 'offline' | 'maintenance';
  installed_date: string;
  last_maintenance_date: string;
}

export interface MockPageSize {
  page_size_id: string;
  size_name: string;
  width_mm: number;
  height_mm: number;
}

export interface MockPrintConfig {
  paper_size: string;
  orientation: 'portrait' | 'landscape';
  print_side: 'one-sided' | 'double-sided';
  color_mode: 'color' | 'grayscale' | 'black-white';
  number_of_copy: number;
  pages_per_sheet?: number;
  page_range?: 'all' | 'custom';
  custom_page_range?: string; // e.g., "1-5,10,15-20"
}

export interface MockUploadedFile {
  file: File | null;
  file_name: string;
  file_type: string;
  file_size_kb: number;
  preview_url?: string;
  page_count?: number;
  uploaded_file_id?: string; // UUID from API after upload
}

export interface UploadedFileItem {
  id: string;
  file_name: string;
  file_type: string;
  file_size_kb: number;
  uploaded_at: string;
  page_count?: number;
  last_printed_at?: string;
  print_count: number;
}

// Default Print Configuration
export const defaultPrintConfig: MockPrintConfig = {
  paper_size: 'A4',
  orientation: 'portrait',
  print_side: 'one-sided',
  color_mode: 'black-white',
  number_of_copy: 1,
  pages_per_sheet: 1,
  page_range: 'all',
  custom_page_range: '',
};

// Permitted File Types (used as fallback)
export const mockPermittedFileTypes = [
  { extension: '.pdf', mime_type: 'application/pdf', label: 'PDF' },
  { extension: '.doc', mime_type: 'application/msword', label: 'DOC' },
  {
    extension: '.docx',
    mime_type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'DOCX',
  },
  { extension: '.xls', mime_type: 'application/vnd.ms-excel', label: 'XLS' },
  {
    extension: '.xlsx',
    mime_type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    label: 'XLSX',
  },
  {
    extension: '.ppt',
    mime_type: 'application/vnd.ms-powerpoint',
    label: 'PPT',
  },
  {
    extension: '.pptx',
    mime_type:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    label: 'PPTX',
  },
  { extension: '.jpg', mime_type: 'image/jpeg', label: 'JPG' },
  { extension: '.jpeg', mime_type: 'image/jpeg', label: 'JPEG' },
  { extension: '.png', mime_type: 'image/png', label: 'PNG' },
];

// File type filters
export const fileTypeFilters = [
  { value: 'all', label: 'Tất cả loại file' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'Word (DOCX)' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'pptx', label: 'PowerPoint (PPTX)' },
];

// Date range filters
export const dateRangeFilters = [
  { value: 'all', label: 'Tất cả thời gian' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'week', label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
  { value: '3months', label: '3 tháng qua' },
];

// Payment Options Types
export type PaymentMethod = 'balance' | 'qr';

export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}

export const paymentOptions: PaymentOption[] = [
  {
    id: 'balance',
    label: 'Dùng số dư',
    description: 'Thanh toán bằng số dư hiện có trong tài khoản',
    icon: '💰',
  },
  {
    id: 'qr',
    label: 'Thanh toán QR (SePay)',
    description: 'Quét mã QR để thanh toán trực tiếp qua SePay',
    icon: '📱',
  },
];

// QR Payment Data
export interface QRPaymentData {
  qrCode: string; // Base64 image or URL
  amount: number;
  transactionId: string;
  expiryTime: string; // ISO date string
  paymentUrl: string;
}

// Mock function to generate QR payment (will be replaced with API call)
export function generateQRPayment(amount: number): QRPaymentData {
  return {
    qrCode:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // Placeholder
    amount,
    transactionId: `TXN-${Date.now()}`,
    expiryTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    paymentUrl: `https://sepay.vn/pay/${Date.now()}`,
  };
}
