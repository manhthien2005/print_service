'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils/cn';
import {
  studentFilters,
  studentStats,
  studentsMockData,
  StudentStatus,
  StudentItem,
} from '@/data/studentsMock';
import CountUp from '@/components/ui/CountUp';

const PAGE_SIZE = 10;

type StatusFilterValue = 'all' | StudentStatus;
type SortColumn =
  | 'studentCode'
  | 'fullName'
  | 'email'
  | 'faculty'
  | 'yearLevel'
  | 'status'
  | 'enrollmentDate'
  | null;
type SortDirection = 'asc' | 'desc' | null;

const statusBadgeClass: Record<StudentStatus, string> = {
  active:
    'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30',
  graduated:
    'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/30',
  suspended:
    'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/40',
  withdrawn:
    'bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30',
};

const statusLabel: Record<StudentStatus, string> = {
  active: 'Đang học',
  graduated: 'Tốt nghiệp',
  suspended: 'Tạm dừng',
  withdrawn: 'Rút',
};

function formatDate(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function StatusBadge({ status }: { status: StudentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        statusBadgeClass[status]
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  caption,
  trend,
  useCountUp,
  countUpValue,
}: {
  title: string;
  value?: string;
  caption?: string;
  trend?: { label: string; positive?: boolean };
  useCountUp?: boolean;
  countUpValue?: number;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="text-sm font-semibold text-slate-500 dark:text-white/60">
        {title}
      </div>
      <div className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
        {useCountUp && countUpValue !== undefined ? (
          <CountUp to={countUpValue} separator="." duration={2} />
        ) : (
          value
        )}
      </div>
      {caption && (
        <div className="mt-1 text-sm text-slate-500 dark:text-white/60">
          {caption}
        </div>
      )}
      {trend && (
        <div
          className={cn(
            'mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
            trend.positive
              ? 'bg-green-500/10 text-green-600 dark:text-green-300'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
          )}
        >
          {trend.positive ? (
            <svg
              className="h-4 w-4 text-green-600 dark:text-green-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 14l5-5 4 4 5-7"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 6h4v4"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-amber-600 dark:text-amber-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 10l5 5 4-4 5 7"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 18h4v-4"
              />
            </svg>
          )}
          {trend.label}
        </div>
      )}
    </div>
  );
}

export function ManageStudentsContent() {
  const [search, setSearch] = useState('');
  const [faculty, setFaculty] = useState<string>('');
  const [status, setStatus] = useState<StatusFilterValue>('all');
  const [yearLevel, setYearLevel] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selected, setSelected] = useState<StudentItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return studentsMockData.filter(student => {
      const matchesSearch =
        search.length === 0 ||
        student.fullName.toLowerCase().includes(search.toLowerCase()) ||
        student.studentCode.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase());

      const matchesFaculty = !faculty || student.faculty === faculty;
      const matchesStatus = status === 'all' || student.status === status;
      const matchesYearLevel =
        yearLevel === 'all' || student.yearLevel.toString() === yearLevel;

      const enrollment = new Date(student.enrollmentDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const endInclusive = end ? new Date(end) : null;
      if (endInclusive) endInclusive.setHours(23, 59, 59, 999);
      const matchesTime =
        (!start || enrollment >= start) &&
        (!endInclusive || enrollment <= endInclusive);

      return (
        matchesSearch &&
        matchesFaculty &&
        matchesStatus &&
        matchesYearLevel &&
        matchesTime
      );
    });
  }, [search, faculty, status, yearLevel, startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [
    filtered.length,
    search,
    faculty,
    status,
    yearLevel,
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
        case 'studentCode':
          return direction * a.studentCode.localeCompare(b.studentCode);
        case 'fullName':
          return direction * a.fullName.localeCompare(b.fullName);
        case 'email':
          return direction * a.email.localeCompare(b.email);
        case 'faculty':
          return direction * a.faculty.localeCompare(b.faculty);
        case 'yearLevel':
          return direction * (a.yearLevel - b.yearLevel);
        case 'status':
          return direction * a.status.localeCompare(b.status);
        case 'enrollmentDate':
          return (
            direction *
            (new Date(a.enrollmentDate).getTime() -
              new Date(b.enrollmentDate).getTime())
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

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginated.map(item => item.id);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Handle select item
  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedItems.size === 0) return;
    console.log(`Bulk action: ${action}`, Array.from(selectedItems));
    alert(
      `Đã thực hiện "${action}" cho ${selectedItems.size} sinh viên đã chọn`
    );
    setSelectedItems(new Set());
  };

  // Calculate stats from filtered data
  const activeCount = filtered.filter(s => s.status === 'active').length;
  const suspendedCount = filtered.filter(s => s.status === 'suspended').length;
  const graduatedCount = filtered.filter(s => s.status === 'graduated').length;

  const isAllSelected =
    paginated.length > 0 && paginated.every(item => selectedItems.has(item.id));

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Tổng sinh viên"
          caption={`Từ ${studentFilters.faculties.length} khoa`}
          trend={{ label: `+${studentStats[0].delta}`, positive: true }}
          useCountUp
          countUpValue={filtered.length}
        />
        <SummaryCard
          title="Đang hoạt động"
          caption="Sinh viên đang học"
          trend={{ label: `+${studentStats[1].delta}`, positive: true }}
          useCountUp
          countUpValue={activeCount}
        />
        <SummaryCard
          title="Tạm dừng"
          caption="Cần theo dõi"
          trend={{ label: studentStats[2].delta, positive: false }}
          useCountUp
          countUpValue={suspendedCount}
        />
        <SummaryCard
          title="Đã tốt nghiệp"
          caption="Hoàn thành chương trình"
          trend={{ label: `+${studentStats[3].delta}`, positive: true }}
          useCountUp
          countUpValue={graduatedCount}
        />
      </div>

      {/* Main Table Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              Danh sách sinh viên
            </div>
            <div className="text-sm text-slate-500 dark:text-white/60">
              Tìm kiếm, lọc và sắp xếp danh sách sinh viên
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
                placeholder="Tìm theo tên, mã SV, email..."
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

            <Button
              type="button"
              variant="default"
              size="sm"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Thêm sinh viên
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Select
              value={status}
              onChange={e => setStatus(e.target.value as StatusFilterValue)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang học</option>
              <option value="graduated">Tốt nghiệp</option>
              <option value="suspended">Tạm dừng</option>
              <option value="withdrawn">Rút</option>
            </Select>
            <Select
              value={faculty}
              onChange={e => setFaculty(e.target.value)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">Tất cả khoa</option>
              {studentFilters.faculties.map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
            <Select
              value={yearLevel}
              onChange={e => setYearLevel(e.target.value)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="all">Tất cả năm</option>
              <option value="1">Năm 1</option>
              <option value="2">Năm 2</option>
              <option value="3">Năm 3</option>
              <option value="4">Năm 4</option>
            </Select>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Ngày nhập học từ"
              className="w-full"
            />
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Ngày nhập học đến"
              className="w-full"
              min={startDate || undefined}
            />
          </div>
        )}

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
              Đã chọn {selectedItems.size} sinh viên
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('Kích hoạt')}
                className="flex items-center border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                Kích hoạt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('Tạm dừng')}
                className="flex items-center border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                Tạm dừng
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('Xóa')}
                className="flex items-center border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
                Xóa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems(new Set())}
                className="flex items-center border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Bỏ chọn
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="w-12 px-4 py-3">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      onChange={e => handleSelectAll(e.target.checked)}
                    />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('studentCode')}
                >
                  <div className="flex items-center">
                    Mã SV
                    {sortIcon('studentCode')}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('fullName')}
                >
                  <div className="flex items-center">
                    Họ tên
                    {sortIcon('fullName')}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortIcon('email')}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('faculty')}
                >
                  <div className="flex items-center">
                    Khoa / Bộ môn
                    {sortIcon('faculty')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                  Ngành / Lớp
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('yearLevel')}
                >
                  <div className="flex items-center">
                    Năm
                    {sortIcon('yearLevel')}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('status')}
                >
                  <div className="flex items-center justify-center">
                    Trạng thái
                    {sortIcon('status')}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('enrollmentDate')}
                >
                  <div className="flex items-center">
                    Ngày nhập học
                    {sortIcon('enrollmentDate')}
                  </div>
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
                    colSpan={10}
                    className="px-4 py-8 text-center text-slate-500 dark:text-white/50"
                  >
                    Không có dữ liệu phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                paginated.map(item => {
                  const isSelected = selectedItems.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        'border-b border-slate-100 transition-colors hover:bg-slate-50/50 dark:border-white/5 dark:hover:bg-white/5',
                        isSelected && 'bg-blue-50/50 dark:bg-blue-900/10'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isSelected}
                            onChange={e =>
                              handleSelectItem(item.id, e.target.checked)
                            }
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {item.studentCode}
                      </td>
                      <td className="px-4 py-3 text-slate-800 dark:text-white/80">
                        {item.fullName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                        {item.email}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 dark:text-white">
                          {item.faculty}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-white/60">
                          {item.department}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 dark:text-white">
                          {item.major}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-white/60">
                          {item.className}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-white/75">
                        Năm {item.yearLevel}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                        {formatDate(item.enrollmentDate)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelected(item)}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelected(item)}
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
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                              />
                            </svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Student Detail Modal */}
      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Chi tiết sinh viên"
        size="lg"
      >
        {selected && (
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-2xl font-bold text-white">
                  {selected.fullName.charAt(0)}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selected.fullName}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-white/60">
                    Mã SV: {selected.studentCode}
                  </div>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <StatusBadge status={selected.status} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Thông tin cá nhân
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Email:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Ngày nhập học:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatDate(selected.enrollmentDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Dự kiến tốt nghiệp:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatDate(selected.expectedGraduate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Thông tin học tập
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Khoa:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.faculty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Bộ môn:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.department}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Ngành:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.major}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Lớp:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.className}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Năm học:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      Năm {selected.yearLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="sm"
                variant="default"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
                Chỉnh sửa
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h69.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                  />
                </svg>
                Xem lịch sử
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ManageStudentsContent;



