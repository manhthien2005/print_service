// MOCK DATA - Tách riêng để dễ dàng xóa bỏ khi tích hợp API thật
// TODO: Xóa file này khi thay thế bằng dữ liệu API

export interface PrintJobStats {
  date: string;
  completed: number;
  failed: number;
  queued: number;
  total: number;
}

export interface PrintStatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface PagesPrintedStats {
  date: string;
  pages: number;
  colorPages: number;
  blackWhitePages: number;
}

export interface RevenueStats {
  month: string;
  revenue: number;
  purchases: number;
}

export interface TopPrinterStats {
  printerName: string;
  totalJobs: number;
  totalPages: number;
  successRate: number;
}

export interface ColorModeDistribution {
  name: string;
  value: number;
  color: string;
}

export interface PaperSizeDistribution {
  size: string;
  count: number;
  percentage: number;
}

export interface ReportsData {
  printJobsByDate: PrintJobStats[];
  printStatusDistribution: PrintStatusDistribution[];
  pagesPrintedByDate: PagesPrintedStats[];
  revenueByMonth: RevenueStats[];
  topPrinters: TopPrinterStats[];
  colorModeDistribution: ColorModeDistribution[];
  paperSizeDistribution: PaperSizeDistribution[];
  summary: {
    totalPrintJobs: number;
    totalPagesPrinted: number;
    totalRevenue: number;
    averageJobsPerDay: number;
    successRate: number;
  };
}

// Mock data cho Print Jobs theo ngày (30 ngày gần nhất)
export const printJobsByDateMock: PrintJobStats[] = [
  { date: '2024-11-10', completed: 45, failed: 2, queued: 3, total: 50 },
  { date: '2024-11-11', completed: 52, failed: 1, queued: 2, total: 55 },
  { date: '2024-11-12', completed: 48, failed: 3, queued: 4, total: 55 },
  { date: '2024-11-13', completed: 61, failed: 2, queued: 1, total: 64 },
  { date: '2024-11-14', completed: 55, failed: 1, queued: 3, total: 59 },
  { date: '2024-11-15', completed: 58, failed: 2, queued: 2, total: 62 },
  { date: '2024-11-16', completed: 49, failed: 3, queued: 5, total: 57 },
  { date: '2024-11-17', completed: 63, failed: 1, queued: 1, total: 65 },
  { date: '2024-11-18', completed: 57, failed: 2, queued: 4, total: 63 },
  { date: '2024-11-19', completed: 60, failed: 1, queued: 2, total: 63 },
  { date: '2024-11-20', completed: 54, failed: 2, queued: 3, total: 59 },
  { date: '2024-11-21', completed: 59, failed: 1, queued: 2, total: 62 },
  { date: '2024-11-22', completed: 56, failed: 3, queued: 4, total: 63 },
  { date: '2024-11-23', completed: 62, failed: 1, queued: 1, total: 64 },
  { date: '2024-11-24', completed: 58, failed: 2, queued: 3, total: 63 },
  { date: '2024-11-25', completed: 61, failed: 1, queued: 2, total: 64 },
  { date: '2024-11-26', completed: 55, failed: 2, queued: 4, total: 61 },
  { date: '2024-11-27', completed: 59, failed: 1, queued: 3, total: 63 },
  { date: '2024-11-28', completed: 57, failed: 2, queued: 2, total: 61 },
  { date: '2024-11-29', completed: 60, failed: 1, queued: 1, total: 62 },
  { date: '2024-11-30', completed: 64, failed: 2, queued: 3, total: 69 },
  { date: '2024-12-01', completed: 58, failed: 1, queued: 2, total: 61 },
  { date: '2024-12-02', completed: 61, failed: 2, queued: 4, total: 67 },
  { date: '2024-12-03', completed: 55, failed: 1, queued: 3, total: 59 },
  { date: '2024-12-04', completed: 59, failed: 2, queued: 2, total: 63 },
  { date: '2024-12-05', completed: 62, failed: 1, queued: 1, total: 64 },
  { date: '2024-12-06', completed: 57, failed: 2, queued: 3, total: 62 },
  { date: '2024-12-07', completed: 60, failed: 1, queued: 2, total: 63 },
  { date: '2024-12-08', completed: 58, failed: 2, queued: 4, total: 64 },
  { date: '2024-12-09', completed: 61, failed: 1, queued: 2, total: 64 },
];

// Mock data cho phân bố trạng thái in
export const printStatusDistributionMock: PrintStatusDistribution[] = [
  { name: 'Hoàn tất', value: 1685, color: '#10b981' },
  { name: 'Thất bại', value: 48, color: '#ef4444' },
  { name: 'Đang chờ', value: 67, color: '#64748b' },
];

// Mock data cho số trang in theo ngày
export const pagesPrintedByDateMock: PagesPrintedStats[] = [
  { date: '2024-11-10', pages: 1250, colorPages: 180, blackWhitePages: 1070 },
  { date: '2024-11-11', pages: 1420, colorPages: 210, blackWhitePages: 1210 },
  { date: '2024-11-12', pages: 1180, colorPages: 150, blackWhitePages: 1030 },
  { date: '2024-11-13', pages: 1650, colorPages: 240, blackWhitePages: 1410 },
  { date: '2024-11-14', pages: 1380, colorPages: 190, blackWhitePages: 1190 },
  { date: '2024-11-15', pages: 1520, colorPages: 220, blackWhitePages: 1300 },
  { date: '2024-11-16', pages: 1280, colorPages: 160, blackWhitePages: 1120 },
  { date: '2024-11-17', pages: 1720, colorPages: 260, blackWhitePages: 1460 },
  { date: '2024-11-18', pages: 1450, colorPages: 200, blackWhitePages: 1250 },
  { date: '2024-11-19', pages: 1580, colorPages: 230, blackWhitePages: 1350 },
  { date: '2024-11-20', pages: 1320, colorPages: 170, blackWhitePages: 1150 },
  { date: '2024-11-21', pages: 1480, colorPages: 210, blackWhitePages: 1270 },
  { date: '2024-11-22', pages: 1350, colorPages: 180, blackWhitePages: 1170 },
  { date: '2024-11-23', pages: 1620, colorPages: 250, blackWhitePages: 1370 },
  { date: '2024-11-24', pages: 1390, colorPages: 190, blackWhitePages: 1200 },
  { date: '2024-11-25', pages: 1550, colorPages: 220, blackWhitePages: 1330 },
  { date: '2024-11-26', pages: 1280, colorPages: 160, blackWhitePages: 1120 },
  { date: '2024-11-27', pages: 1510, colorPages: 210, blackWhitePages: 1300 },
  { date: '2024-11-28', pages: 1370, colorPages: 180, blackWhitePages: 1190 },
  { date: '2024-11-29', pages: 1490, colorPages: 200, blackWhitePages: 1290 },
  { date: '2024-11-30', pages: 1680, colorPages: 250, blackWhitePages: 1430 },
  { date: '2024-12-01', pages: 1420, colorPages: 190, blackWhitePages: 1230 },
  { date: '2024-12-02', pages: 1560, colorPages: 230, blackWhitePages: 1330 },
  { date: '2024-12-03', pages: 1310, colorPages: 170, blackWhitePages: 1140 },
  { date: '2024-12-04', pages: 1470, colorPages: 210, blackWhitePages: 1260 },
  { date: '2024-12-05', pages: 1610, colorPages: 240, blackWhitePages: 1370 },
  { date: '2024-12-06', pages: 1340, colorPages: 180, blackWhitePages: 1160 },
  { date: '2024-12-07', pages: 1500, colorPages: 220, blackWhitePages: 1280 },
  { date: '2024-12-08', pages: 1360, colorPages: 190, blackWhitePages: 1170 },
  { date: '2024-12-09', pages: 1530, colorPages: 230, blackWhitePages: 1300 },
];

// Mock data cho doanh thu theo tháng (6 tháng gần nhất)
export const revenueByMonthMock: RevenueStats[] = [
  { month: 'Tháng 7', revenue: 12500000, purchases: 245 },
  { month: 'Tháng 8', revenue: 13800000, purchases: 268 },
  { month: 'Tháng 9', revenue: 15200000, purchases: 295 },
  { month: 'Tháng 10', revenue: 14500000, purchases: 282 },
  { month: 'Tháng 11', revenue: 16800000, purchases: 312 },
  { month: 'Tháng 12', revenue: 14200000, purchases: 278 },
];

// Mock data cho top printers
export const topPrintersMock: TopPrinterStats[] = [
  {
    printerName: 'HP LaserJet Pro M404dn - P101',
    totalJobs: 342,
    totalPages: 12450,
    successRate: 0.98,
  },
  {
    printerName: 'Canon PIXMA G3010 - P205',
    totalJobs: 298,
    totalPages: 11200,
    successRate: 0.96,
  },
  {
    printerName: 'HP OfficeJet Pro 9015e - P301',
    totalJobs: 275,
    totalPages: 9850,
    successRate: 0.97,
  },
  {
    printerName: 'Epson EcoTank ET-2720 - P102',
    totalJobs: 256,
    totalPages: 9200,
    successRate: 0.95,
  },
  {
    printerName: 'HP LaserJet Pro M404dn - P201',
    totalJobs: 234,
    totalPages: 8450,
    successRate: 0.99,
  },
];

// Mock data cho phân bố chế độ màu
export const colorModeDistributionMock: ColorModeDistribution[] = [
  { name: 'Đen trắng', value: 1245, color: '#1e293b' },
  { name: 'In màu', value: 342, color: '#3b82f6' },
  { name: 'In xám', value: 98, color: '#64748b' },
];

// Mock data cho phân bố khổ giấy
export const paperSizeDistributionMock: PaperSizeDistribution[] = [
  { size: 'A4', count: 1520, percentage: 85.2 },
  { size: 'A3', count: 145, percentage: 8.1 },
  { size: 'Letter', count: 68, percentage: 3.8 },
  { size: 'Legal', count: 32, percentage: 1.8 },
  { size: 'A5', count: 20, percentage: 1.1 },
];

// Summary statistics
export const reportsSummaryMock = {
  totalPrintJobs: 1800,
  totalPagesPrinted: 43250,
  totalRevenue: 87000000,
  averageJobsPerDay: 60,
  successRate: 0.94,
};

// Combined reports data
export const reportsDataMock: ReportsData = {
  printJobsByDate: printJobsByDateMock,
  printStatusDistribution: printStatusDistributionMock,
  pagesPrintedByDate: pagesPrintedByDateMock,
  revenueByMonth: revenueByMonthMock,
  topPrinters: topPrintersMock,
  colorModeDistribution: colorModeDistributionMock,
  paperSizeDistribution: paperSizeDistributionMock,
  summary: reportsSummaryMock,
};



