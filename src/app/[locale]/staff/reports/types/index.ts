// Types extracted from reportsMock.ts

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
    totalJobs: number;
    totalPages: number;
    totalRevenue: number;
    successRate: number;
  };
}

