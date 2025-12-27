// Types extracted from systemLogsMock.ts

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
    'bg-indigo-100 text-indigo-700 ring-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300',
  LOGOUT:
    'bg-slate-100 text-slate-700 ring-slate-500/30 dark:bg-slate-500/10 dark:text-slate-200',
  VIEW: 'bg-cyan-100 text-cyan-700 ring-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300',
  EXPORT:
    'bg-purple-100 text-purple-700 ring-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300',
};
