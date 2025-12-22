'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils/cn';
import {
  systemLogsMockData,
  systemLogsSummaryMock,
} from '@/data/systemLogsMock';
import type { SystemLogItem, ActionType } from '../types';
import { actionTypeLabels, actionTypeColors } from '../types';
import CountUp from '@/components/ui/CountUp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const PAGE_SIZE = 10;

type ActionFilterValue = 'all' | ActionType;
type SortColumn =
  | 'userName'
  | 'actionType'
  | 'tableName'
  | 'actionTimestamp'
  | null;
type SortDirection = 'asc' | 'desc' | null;

function formatDateTime(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function ActionBadge({ actionType }: { actionType: ActionType }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        actionTypeColors[actionType]
      )}
    >
      {actionTypeLabels[actionType]}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  caption,
  useCountUp,
  countUpValue,
}: {
  title: string;
  value?: string;
  caption?: string;
  useCountUp?: boolean;
  countUpValue?: number;
}) {
  return (
    <Card className="border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-600 dark:text-white/70">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between pb-4">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {useCountUp && countUpValue !== undefined ? (
            <CountUp to={countUpValue} separator="." duration={2} />
          ) : (
            value
          )}
        </div>
      </CardContent>
      {caption && (
        <CardContent className="pt-0">
          <p className="text-xs text-slate-500 dark:text-white/60">{caption}</p>
        </CardContent>
      )}
    </Card>
  );
}

export function SystemLogsContent() {
  const [search, setSearch] = useState('');
  const [actionType, setActionType] = useState<ActionFilterValue>('all');
  const [tableName, setTableName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selected, setSelected] = useState<SystemLogItem | null>(null);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const uniqueTableNames = useMemo(() => {
    return Array.from(
      new Set(systemLogsMockData.map(log => log.tableName))
    ).sort();
  }, []);

  const uniqueUserRoles = useMemo(() => {
    return Array.from(
      new Set(systemLogsMockData.map(log => log.userRole))
    ).sort();
  }, []);

  const filtered = useMemo(() => {
    return systemLogsMockData.filter(log => {
      const matchesSearch =
        search.length === 0 ||
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        log.tableName.toLowerCase().includes(search.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(search.toLowerCase()) ||
        (log.recordId &&
          log.recordId.toLowerCase().includes(search.toLowerCase()));

      const matchesActionType =
        actionType === 'all' || log.actionType === actionType;
      const matchesTableName = !tableName || log.tableName === tableName;
      const matchesUserRole = !userRole || log.userRole === userRole;

      const timestamp = new Date(log.actionTimestamp);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const endInclusive = end ? new Date(end) : null;
      if (endInclusive) endInclusive.setHours(23, 59, 59, 999);
      const matchesTime =
        (!start || timestamp >= start) &&
        (!endInclusive || timestamp <= endInclusive);

      return (
        matchesSearch &&
        matchesActionType &&
        matchesTableName &&
        matchesUserRole &&
        matchesTime
      );
    });
  }, [search, actionType, tableName, userRole, startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [
    filtered.length,
    search,
    actionType,
    tableName,
    userRole,
    startDate,
    endDate,
    sortColumn,
    sortDirection,
  ]);

  const sorted = useMemo(() => {
    if (!sortColumn || !sortDirection) return filtered;
    const data = [...filtered];
    data.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      switch (sortColumn) {
        case 'userName':
          return direction * a.userName.localeCompare(b.userName);
        case 'actionType':
          return direction * a.actionType.localeCompare(b.actionType);
        case 'tableName':
          return direction * a.tableName.localeCompare(b.tableName);
        case 'actionTimestamp':
          return (
            direction *
            (new Date(a.actionTimestamp).getTime() -
              new Date(b.actionTimestamp).getTime())
          );
        default:
          return 0;
      }
    });
    return data;
  }, [filtered, sortColumn, sortDirection]);

  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (column: Exclude<SortColumn, null>) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else setSortDirection('asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortIcon = (column: Exclude<SortColumn, null>) => {
    if (sortColumn !== column || !sortDirection)
      return (
        <svg
          className="ml-1 h-4 w-4 text-slate-400"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M7 7l3-3 3 3M7 13l3 3 3-3"
          />
        </svg>
      );
    return sortDirection === 'asc' ? (
      <svg
        className="ml-1 h-4 w-4 text-blue-500"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M7 11l3-3 3 3"
        />
      </svg>
    ) : (
      <svg
        className="ml-1 h-4 w-4 text-blue-500"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M7 9l3 3 3-3"
        />
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Tổng nhật ký"
          useCountUp
          countUpValue={systemLogsSummaryMock.totalLogs}
          caption="Tất cả các bản ghi"
        />
        <SummaryCard
          title="Hôm nay"
          useCountUp
          countUpValue={systemLogsSummaryMock.logsToday}
          caption="Nhật ký trong ngày"
        />
        <SummaryCard
          title="Tuần này"
          useCountUp
          countUpValue={systemLogsSummaryMock.logsThisWeek}
          caption="7 ngày gần nhất"
        />
        <SummaryCard
          title="Tháng này"
          useCountUp
          countUpValue={systemLogsSummaryMock.logsThisMonth}
          caption="30 ngày gần nhất"
        />
        <SummaryCard
          title="Người dùng"
          useCountUp
          countUpValue={systemLogsSummaryMock.uniqueUsers}
          caption="Số người dùng hoạt động"
        />
      </div>

      {/* Main Table Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              Nhật ký hệ thống
            </div>
            <div className="text-sm text-slate-500 dark:text-white/60">
              Tìm kiếm, lọc và xem chi tiết các hoạt động hệ thống
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition focus-within:ring-2 focus-within:ring-blue-500/50 dark:border-white/10 dark:bg-white/5">
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="ml-2 w-56 bg-transparent text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                placeholder="Tìm theo người dùng, bảng, IP..."
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(prev => !prev)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6h18M7 12h10M10 18h4"
                />
              </svg>
              Bộ lọc nâng cao
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select
              value={actionType}
              onChange={e => setActionType(e.target.value as ActionFilterValue)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="all">Tất cả hành động</option>
              <option value="CREATE">Tạo mới</option>
              <option value="UPDATE">Cập nhật</option>
              <option value="DELETE">Xóa</option>
              <option value="LOGIN">Đăng nhập</option>
              <option value="LOGOUT">Đăng xuất</option>
              <option value="VIEW">Xem</option>
              <option value="EXPORT">Xuất dữ liệu</option>
            </Select>
            <Select
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">Tất cả bảng</option>
              {uniqueTableNames.map(table => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </Select>
            <Select
              value={userRole}
              onChange={e => setUserRole(e.target.value)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">Tất cả vai trò</option>
              {uniqueUserRoles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Từ ngày"
              className="w-full"
            />
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Đến ngày"
              className="w-full"
              min={startDate || undefined}
            />
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('actionTimestamp')}
                >
                  <div className="flex items-center">
                    Thời gian
                    {sortIcon('actionTimestamp')}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('userName')}
                >
                  <div className="flex items-center">
                    Người dùng
                    {sortIcon('userName')}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('actionType')}
                >
                  <div className="flex items-center">
                    Hành động
                    {sortIcon('actionType')}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('tableName')}
                >
                  <div className="flex items-center">
                    Bảng
                    {sortIcon('tableName')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                  Bản ghi
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                  IP Address
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-500 dark:text-white/50"
                  >
                    Không có dữ liệu phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                paginated.map(log => (
                  <tr
                    key={log.auditId}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">
                      {formatDateTime(log.actionTimestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {log.userName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-white/60">
                        {log.userEmail}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-white/60">
                        {log.userRole}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ActionBadge actionType={log.actionType} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-white/80">
                      {log.tableName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">
                      {log.recordId ? (
                        <span className="font-mono text-xs">
                          {log.recordId}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-white/70">
                      <span className="font-mono text-xs">{log.ipAddress}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelected(log)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onChange={setPage}
        />
      </div>

      {/* Log Detail Modal */}
      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Chi tiết nhật ký"
        size="lg"
      >
        {selected && (
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-2xl font-bold text-white">
                  {selected.userName.charAt(0)}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selected.userName}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-white/60">
                    {selected.userEmail}
                  </div>
                  <div className="mt-1">
                    <ActionBadge actionType={selected.actionType} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Thông tin hành động
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Loại hành động:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {actionTypeLabels[selected.actionType]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Bảng:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.tableName}
                    </span>
                  </div>
                  {selected.recordId && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        ID bản ghi:
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        {selected.recordId}
                      </span>
                    </div>
                  )}
                  {selected.changedField && (
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-600 dark:text-white/70">
                        Trường thay đổi:
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        {selected.changedField}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Thông tin kỹ thuật
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Thời gian:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatDateTime(selected.actionTimestamp)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      IP Address:
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                      {selected.ipAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Vai trò:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.userRole}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-600 dark:text-white/70">
                      User Agent:
                    </span>
                    <span className="break-all font-mono text-xs text-slate-900 dark:text-white">
                      {selected.userAgent}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="mb-2 text-xs uppercase text-slate-500 dark:text-white/50">
                Audit ID
              </div>
              <div className="font-mono text-xs text-slate-900 dark:text-white">
                {selected.auditId}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SystemLogsContent;
