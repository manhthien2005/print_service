// MOCK DATA - Tách riêng để dễ dàng xóa bỏ khi tích hợp API thật
// TODO: Xóa file này khi thay thế bằng dữ liệu API

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

export interface PrintHistorySummary {
  totalJobsThisMonth: number;
  totalPagesThisMonth: number;
  estimatedCostVnd: number;
  successRate: number; // 0-1
}

export interface HistoryFilterOption {
  label: string;
  value: string;
}

export const printHistorySummaryMock: PrintHistorySummary = {
  totalJobsThisMonth: 24,
  totalPagesThisMonth: 358,
  estimatedCostVnd: 72000,
  successRate: 0.96,
};

export const printHistoryMock: PrintHistoryItem[] = [
  {
    id: 'JOB-12045',
    documentName: 'Báo cáo tài chính Q4.pdf',
    fileType: 'PDF',
    fileSizeKB: 2048,
    previewUrl:
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    printerName: 'HP LaserJet Pro 4100',
    printerSerial: 'HP-4100-001',
    buildingName: 'Tòa nhà A',
    roomCode: 'R305',
    printerStatus: 'online',
    supportsColor: false,
    supportsDuplex: true,
    location: 'R305 - Tòa nhà A',
    submittedAt: '2025-12-09T14:20:00Z',
    completedAt: '2025-12-09T14:22:00Z',
    pageCount: 12,
    copies: 1,
    colorMode: 'grayscale',
    duplex: true,
    paperSize: 'A4',
    orientation: 'portrait',
    costVnd: 12000,
    status: 'completed',
    tags: ['A4', '2 mặt'],
  },
  {
    id: 'JOB-12042',
    documentName: 'Slide bài giảng tuần 12.pptx',
    fileType: 'PPTX',
    fileSizeKB: 5120,
    previewUrl:
      'https://file-examples.com/storage/fe7f80f931cf1e5c864f9a1/2017/08/file_example_PPT_1MB.ppt',
    printerName: 'Canon PIXMA G5500',
    printerSerial: 'CANON-5500-002',
    buildingName: 'Tòa nhà B',
    roomCode: 'R402',
    printerStatus: 'online',
    supportsColor: true,
    supportsDuplex: true,
    location: 'R402 - Tòa nhà B',
    submittedAt: '2025-12-08T08:05:00Z',
    completedAt: '2025-12-08T08:09:00Z',
    pageCount: 32,
    copies: 1,
    colorMode: 'color',
    duplex: false,
    paperSize: 'A3',
    orientation: 'landscape',
    costVnd: 24000,
    status: 'completed',
    tags: ['A3', '1 mặt', 'Màu'],
  },
  {
    id: 'JOB-12038',
    documentName: 'Đồ án cuối kỳ.docx',
    fileType: 'DOCX',
    fileSizeKB: 1536,
    previewUrl:
      'https://file-examples.com/storage/fe7f80f931cf1e5c864f9a1/2017/02/file-sample_1MB.docx',
    printerName: 'Brother HL-L8500CDW',
    printerSerial: 'BROTHER-8500-005',
    buildingName: 'Tòa nhà C',
    roomCode: 'R501',
    printerStatus: 'online',
    supportsColor: true,
    supportsDuplex: true,
    location: 'R501 - Tòa nhà C',
    submittedAt: '2025-12-06T10:15:00Z',
    completedAt: '2025-12-06T10:17:00Z',
    pageCount: 48,
    copies: 2,
    colorMode: 'black-white',
    duplex: true,
    paperSize: 'A4',
    orientation: 'portrait',
    costVnd: 32000,
    status: 'processing',
    tags: ['A4', '2 mặt'],
  },
  {
    id: 'JOB-12031',
    documentName: 'Phiếu thu ngân sách.xlsx',
    fileType: 'XLSX',
    fileSizeKB: 782,
    previewUrl:
      'https://file-examples.com/storage/fe7f80f931cf1e5c864f9a1/2017/02/file_example_XLSX_10.xlsx',
    printerName: 'HP LaserJet Pro 4100',
    printerSerial: 'HP-4100-004',
    buildingName: 'Tòa nhà A',
    roomCode: 'R305',
    printerStatus: 'maintenance',
    supportsColor: false,
    supportsDuplex: true,
    location: 'R305 - Tòa nhà A',
    submittedAt: '2025-12-05T16:40:00Z',
    completedAt: '2025-12-05T16:44:00Z',
    pageCount: 8,
    copies: 1,
    colorMode: 'black-white',
    duplex: true,
    paperSize: 'A4',
    orientation: 'portrait',
    costVnd: 6400,
    status: 'completed',
    tags: ['A4', '2 mặt'],
  },
  {
    id: 'JOB-12022',
    documentName: 'Mẫu hợp đồng thuê thiết bị.pdf',
    fileType: 'PDF',
    fileSizeKB: 980,
    printerName: 'Epson EcoTank L8500',
    printerSerial: 'EPSON-8500-003',
    buildingName: 'Tòa nhà A',
    roomCode: 'R201',
    printerStatus: 'online',
    supportsColor: true,
    supportsDuplex: false,
    location: 'R201 - Tòa nhà A',
    submittedAt: '2025-12-03T09:10:00Z',
    completedAt: '2025-12-03T09:12:00Z',
    pageCount: 20,
    copies: 1,
    colorMode: 'grayscale',
    duplex: false,
    paperSize: 'A4',
    orientation: 'portrait',
    costVnd: 14000,
    status: 'failed',
    errorMessage: 'Kết nối máy in bị gián đoạn.',
    tags: ['A4', '1 mặt'],
  },
  {
    id: 'JOB-12015',
    documentName: 'Bài tập lớn Thiết kế phần mềm.pdf',
    fileType: 'PDF',
    fileSizeKB: 3200,
    printerName: 'Canon PIXMA G5500',
    printerSerial: 'CANON-5500-002',
    buildingName: 'Tòa nhà B',
    roomCode: 'R402',
    printerStatus: 'online',
    supportsColor: true,
    supportsDuplex: true,
    location: 'R402 - Tòa nhà B',
    submittedAt: '2025-12-02T14:25:00Z',
    completedAt: '2025-12-02T14:29:00Z',
    pageCount: 60,
    copies: 1,
    colorMode: 'black-white',
    duplex: true,
    paperSize: 'A4',
    orientation: 'portrait',
    costVnd: 30000,
    status: 'completed',
    tags: ['A4', '2 mặt'],
  },
  {
    id: 'JOB-11998',
    documentName: 'Poster sự kiện CLB Kỹ thuật.jpg',
    fileType: 'JPG',
    fileSizeKB: 4280,
    previewUrl:
      'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=1200&q=80',
    printerName: 'Brother HL-L8500CDW',
    printerSerial: 'BROTHER-8500-005',
    buildingName: 'Tòa nhà C',
    roomCode: 'R501',
    printerStatus: 'offline',
    supportsColor: true,
    supportsDuplex: true,
    location: 'R501 - Tòa nhà C',
    submittedAt: '2025-11-28T11:50:00Z',
    completedAt: '2025-11-28T11:54:00Z',
    pageCount: 2,
    copies: 3,
    colorMode: 'color',
    duplex: false,
    paperSize: 'A3',
    orientation: 'landscape',
    costVnd: 27000,
    status: 'queued',
    tags: ['A3', '1 mặt', 'Màu'],
  },
];

export const historyStatusFilters: HistoryFilterOption[] = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Thành công', value: 'completed' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Đang chờ', value: 'queued' },
  { label: 'Lỗi', value: 'failed' },
];

export const historyTimeFilters: HistoryFilterOption[] = [
  { label: '7 ngày', value: '7d' },
  { label: '30 ngày', value: '30d' },
  { label: 'Tất cả', value: 'all' },
];

export const recentHistoryActivity = [
  {
    id: 'ACT-1',
    title: 'Hoàn tất in ấn',
    description: 'JOB-12045 hoàn thành trên HP LaserJet Pro 4100',
    timestamp: '2025-12-09T14:22:30Z',
    status: 'completed' as PrintJobStatus,
  },
  {
    id: 'ACT-2',
    title: 'Đang xử lý',
    description: 'JOB-12038 đang được xử lý trên Brother HL-L8500CDW',
    timestamp: '2025-12-06T10:16:00Z',
    status: 'processing' as PrintJobStatus,
  },
  {
    id: 'ACT-3',
    title: 'Lỗi kết nối',
    description: 'JOB-12022 thất bại do mất kết nối máy in',
    timestamp: '2025-12-03T09:12:30Z',
    status: 'failed' as PrintJobStatus,
  },
];
