// MOCK DATA - Tách riêng để dễ dàng xóa bỏ khi tích hợp API thật
// TODO: Xóa file này khi thay thế bằng dữ liệu API

export type ActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'EXPORT';

export interface SystemLogItem {
  auditId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  actionType: ActionType;
  tableName: string;
  recordId: string | null;
  changedField: string | null;
  ipAddress: string;
  userAgent: string;
  actionTimestamp: string; // ISO string
}

export interface SystemLogsSummary {
  totalLogs: number;
  logsToday: number;
  logsThisWeek: number;
  logsThisMonth: number;
  uniqueUsers: number;
}

export const actionTypeLabels: Record<ActionType, string> = {
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  VIEW: 'Xem',
  EXPORT: 'Xuất dữ liệu',
};

export const actionTypeColors: Record<ActionType, string> = {
  CREATE:
    'bg-emerald-100 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  UPDATE:
    'bg-blue-100 text-blue-700 ring-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
  DELETE:
    'bg-rose-100 text-rose-700 ring-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
  LOGIN:
    'bg-green-100 text-green-700 ring-green-500/30 dark:bg-green-500/10 dark:text-green-300',
  LOGOUT:
    'bg-amber-100 text-amber-700 ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  VIEW: 'bg-slate-100 text-slate-700 ring-slate-500/30 dark:bg-slate-500/10 dark:text-slate-200',
  EXPORT:
    'bg-purple-100 text-purple-700 ring-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300',
};

// Mock data cho system logs
export const systemLogsMockData: SystemLogItem[] = [
  {
    auditId: 'audit-001',
    userId: 'user-001',
    userName: 'Nguyễn Văn Admin',
    userEmail: 'admin@siu.edu.vn',
    userRole: 'ADMIN',
    actionType: 'LOGIN',
    tableName: 'user',
    recordId: null,
    changedField: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T08:30:00',
  },
  {
    auditId: 'audit-002',
    userId: 'user-002',
    userName: 'Trần Thị Staff',
    userEmail: 'staff@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'CREATE',
    tableName: 'student',
    recordId: 'student-123',
    changedField: 'fullName, email, studentCode',
    ipAddress: '192.168.1.101',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T09:15:00',
  },
  {
    auditId: 'audit-003',
    userId: 'user-001',
    userName: 'Nguyễn Văn Admin',
    userEmail: 'admin@siu.edu.vn',
    userRole: 'ADMIN',
    actionType: 'UPDATE',
    tableName: 'printer_physical',
    recordId: 'printer-456',
    changedField: 'isEnabled, roomName',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T10:20:00',
  },
  {
    auditId: 'audit-004',
    userId: 'user-003',
    userName: 'Phạm Văn Manager',
    userEmail: 'manager@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'DELETE',
    tableName: 'print_job',
    recordId: 'job-789',
    changedField: null,
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T11:05:00',
  },
  {
    auditId: 'audit-005',
    userId: 'user-002',
    userName: 'Trần Thị Staff',
    userEmail: 'staff@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'VIEW',
    tableName: 'student_page_purchase',
    recordId: null,
    changedField: null,
    ipAddress: '192.168.1.101',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T11:30:00',
  },
  {
    auditId: 'audit-006',
    userId: 'user-001',
    userName: 'Nguyễn Văn Admin',
    userEmail: 'admin@siu.edu.vn',
    userRole: 'ADMIN',
    actionType: 'EXPORT',
    tableName: 'print_job',
    recordId: null,
    changedField: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T12:00:00',
  },
  {
    auditId: 'audit-007',
    userId: 'user-004',
    userName: 'Lê Thị Operator',
    userEmail: 'operator@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'CREATE',
    tableName: 'printer_model',
    recordId: 'model-321',
    changedField: 'modelName, brandName, maxPaperSize',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Linux; x86_64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T13:15:00',
  },
  {
    auditId: 'audit-008',
    userId: 'user-002',
    userName: 'Trần Thị Staff',
    userEmail: 'staff@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'UPDATE',
    tableName: 'student',
    recordId: 'student-456',
    changedField: 'status, yearLevel',
    ipAddress: '192.168.1.101',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T14:20:00',
  },
  {
    auditId: 'audit-009',
    userId: 'user-001',
    userName: 'Nguyễn Văn Admin',
    userEmail: 'admin@siu.edu.vn',
    userRole: 'ADMIN',
    actionType: 'LOGOUT',
    tableName: 'user',
    recordId: null,
    changedField: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T15:00:00',
  },
  {
    auditId: 'audit-010',
    userId: 'user-003',
    userName: 'Phạm Văn Manager',
    userEmail: 'manager@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'VIEW',
    tableName: 'system_audit_log',
    recordId: null,
    changedField: null,
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T15:30:00',
  },
  {
    auditId: 'audit-011',
    userId: 'user-002',
    userName: 'Trần Thị Staff',
    userEmail: 'staff@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'CREATE',
    tableName: 'brand',
    recordId: 'brand-654',
    changedField: 'brandName, countryOfOrigin',
    ipAddress: '192.168.1.101',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T16:10:00',
  },
  {
    auditId: 'audit-012',
    userId: 'user-001',
    userName: 'Nguyễn Văn Admin',
    userEmail: 'admin@siu.edu.vn',
    userRole: 'ADMIN',
    actionType: 'UPDATE',
    tableName: 'system_configuration',
    recordId: 'config-001',
    changedField: 'maxPagesPerJob, colorPrintPrice',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T16:45:00',
  },
  {
    auditId: 'audit-013',
    userId: 'user-004',
    userName: 'Lê Thị Operator',
    userEmail: 'operator@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'DELETE',
    tableName: 'printer_activity_log',
    recordId: 'log-999',
    changedField: null,
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Linux; x86_64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T17:20:00',
  },
  {
    auditId: 'audit-014',
    userId: 'user-002',
    userName: 'Trần Thị Staff',
    userEmail: 'staff@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'EXPORT',
    tableName: 'student',
    recordId: null,
    changedField: null,
    ipAddress: '192.168.1.101',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T18:00:00',
  },
  {
    auditId: 'audit-015',
    userId: 'user-001',
    userName: 'Nguyễn Văn Admin',
    userEmail: 'admin@siu.edu.vn',
    userRole: 'ADMIN',
    actionType: 'LOGIN',
    tableName: 'user',
    recordId: null,
    changedField: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T19:15:00',
  },
  {
    auditId: 'audit-016',
    userId: 'user-003',
    userName: 'Phạm Văn Manager',
    userEmail: 'manager@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'UPDATE',
    tableName: 'page_allocation',
    recordId: 'allocation-123',
    changedField: 'allocatedPages, usedPages',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T20:30:00',
  },
  {
    auditId: 'audit-017',
    userId: 'user-002',
    userName: 'Trần Thị Staff',
    userEmail: 'staff@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'VIEW',
    tableName: 'print_job',
    recordId: null,
    changedField: null,
    ipAddress: '192.168.1.101',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T21:00:00',
  },
  {
    auditId: 'audit-018',
    userId: 'user-001',
    userName: 'Nguyễn Văn Admin',
    userEmail: 'admin@siu.edu.vn',
    userRole: 'ADMIN',
    actionType: 'CREATE',
    tableName: 'room',
    recordId: 'room-789',
    changedField: 'roomCode, buildingName, floor',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T22:15:00',
  },
  {
    auditId: 'audit-019',
    userId: 'user-004',
    userName: 'Lê Thị Operator',
    userEmail: 'operator@siu.edu.vn',
    userRole: 'STAFF',
    actionType: 'UPDATE',
    tableName: 'printer_physical',
    recordId: 'printer-111',
    changedField: 'lastMaintenanceDate, isEnabled',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Linux; x86_64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T23:30:00',
  },
  {
    auditId: 'audit-020',
    userId: 'user-001',
    userName: 'Nguyễn Văn Admin',
    userEmail: 'admin@siu.edu.vn',
    userRole: 'ADMIN',
    actionType: 'LOGOUT',
    tableName: 'user',
    recordId: null,
    changedField: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    actionTimestamp: '2024-12-09T23:59:00',
  },
];

// Summary statistics
export const systemLogsSummaryMock: SystemLogsSummary = {
  totalLogs: 1250,
  logsToday: 20,
  logsThisWeek: 145,
  logsThisMonth: 580,
  uniqueUsers: 8,
};

