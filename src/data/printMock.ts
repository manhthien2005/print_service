// MOCK DATA - Tách riêng để dễ dàng xóa bỏ khi tích hợp API
// TODO: Xóa file này khi tích hợp API thật

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
}

// Mock Printers Data
export const mockPrinters: MockPrinter[] = [
  {
    printer_id: '1',
    serial_number: 'HP-4100-001',
    brand_name: 'HP',
    model_name: 'LaserJet Pro 4100',
    room_code: 'R305',
    building_name: 'Tòa nhà A',
    is_enabled: true,
    supports_color: false,
    supports_duplex: true,
    max_paper_size: 'A4',
    status: 'online',
    installed_date: '2024-01-15',
    last_maintenance_date: '2024-11-20',
  },
  {
    printer_id: '2',
    serial_number: 'CANON-5500-002',
    brand_name: 'Canon',
    model_name: 'PIXMA G5500',
    room_code: 'R402',
    building_name: 'Tòa nhà B',
    is_enabled: true,
    supports_color: true,
    supports_duplex: true,
    max_paper_size: 'A3',
    status: 'online',
    installed_date: '2024-02-10',
    last_maintenance_date: '2024-11-15',
  },
  {
    printer_id: '3',
    serial_number: 'EPSON-8500-003',
    brand_name: 'Epson',
    model_name: 'EcoTank L8500',
    room_code: 'R201',
    building_name: 'Tòa nhà A',
    is_enabled: true,
    supports_color: true,
    supports_duplex: false,
    max_paper_size: 'A4',
    status: 'online',
    installed_date: '2024-03-05',
    last_maintenance_date: '2024-10-30',
  },
  {
    printer_id: '4',
    serial_number: 'HP-4100-004',
    brand_name: 'HP',
    model_name: 'LaserJet Pro 4100',
    room_code: 'R305',
    building_name: 'Tòa nhà A',
    is_enabled: true,
    supports_color: false,
    supports_duplex: true,
    max_paper_size: 'A4',
    status: 'maintenance',
    installed_date: '2024-01-15',
    last_maintenance_date: '2024-09-01',
  },
  {
    printer_id: '5',
    serial_number: 'BROTHER-8500-005',
    brand_name: 'Brother',
    model_name: 'HL-L8500CDW',
    room_code: 'R501',
    building_name: 'Tòa nhà C',
    is_enabled: true,
    supports_color: true,
    supports_duplex: true,
    max_paper_size: 'A3',
    status: 'offline',
    installed_date: '2024-04-20',
    last_maintenance_date: '2024-11-10',
  },
];

// Mock Page Sizes Data
export const mockPageSizes: MockPageSize[] = [
  {
    page_size_id: '1',
    size_name: 'A4',
    width_mm: 210,
    height_mm: 297,
  },
  {
    page_size_id: '2',
    size_name: 'A3',
    width_mm: 297,
    height_mm: 420,
  },
  {
    page_size_id: '3',
    size_name: 'A5',
    width_mm: 148,
    height_mm: 210,
  },
  {
    page_size_id: '4',
    size_name: 'Letter',
    width_mm: 216,
    height_mm: 279,
  },
];

// Mock Permitted File Types
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
