// Note: Trend type moved to src/app/[locale]/staff/dashboard/types/index.ts
import type { Trend } from '@/app/[locale]/staff/dashboard/types';

export interface StatWidget {
  id: 'printersOnline' | 'jobsToday' | 'pagesMonth';
  value: number;
  suffix?: string;
  change: string;
  trend: Trend;
  captionKey?: 'total' | 'lastJob';
}

export interface WeeklyActivity {
  day: string;
  jobs: number;
  pages: number;
}

export interface PaperUsage {
  name: string;
  value: number;
  color: string;
}

export interface PrinterStatus {
  name: string;
  status: 'online' | 'offline' | 'maintenance';
  queue: number;
  utilization: number;
  location: string;
}

export interface QuickAction {
  id: 'printers' | 'reports' | 'logs' | 'config';
  href: string;
  badgeKey?: 'realtime';
}

export interface AlertItem {
  id: 'lowPaper' | 'driverUpdate' | 'printerOffline';
  severity: 'info' | 'warning' | 'critical';
}

// Mock data exports removed - now using API
// Types kept for reference if needed elsewhere
