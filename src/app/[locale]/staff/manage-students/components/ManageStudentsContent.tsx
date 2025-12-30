'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils/cn';
import { studentFilters } from '@/data/studentsMock';
import type { StudentStatus, StudentItem } from '../types';
import CountUp from '@/components/ui/CountUp';
import {
  useAdminUsers,
  type AdminUserListItem,
} from '@/lib/api/services/adminUsers';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { UserHistoryModal } from './UserHistoryModal';
import { DeleteConfirmationModal } from '@/app/[locale]/staff/manage-printers/components/DeleteConfirmationModal';
import { useDeleteUser, useGetUserDetail } from '@/lib/api/services/adminUsers';
import { toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/common/Skeleton';

const PAGE_SIZE = 10;

// Helper function to validate UUID
const isValidUUID = (id: string | null | undefined): boolean => {
  if (!id) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

type StatusFilterValue = 'all' | StudentStatus;
type SortColumn =
  | 'studentCode'
  | 'fullName'
  | 'email'
  | 'faculty'
  | 'yearLevel'
  | 'status'
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

// Status labels will be handled by translation

function formatDate(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function StatusBadge({ status, t }: { status: StudentStatus; t: any }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        statusBadgeClass[status]
      )}
    >
      {t(`status.${status}`)}
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
  isLoading,
}: {
  title: string;
  value?: string;
  caption?: string;
  trend?: { label: string; positive?: boolean };
  useCountUp?: boolean;
  countUpValue?: number;
  isLoading?: boolean;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="text-sm font-semibold text-slate-500 dark:text-white/60">
        {title}
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-9 w-24" variant="shimmer" />
      ) : (
        <div className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
          {useCountUp && countUpValue !== undefined ? (
            <CountUp to={countUpValue} separator="." duration={2} />
          ) : (
            value
          )}
        </div>
      )}
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
  const t = useTranslations('staff.manageStudents');
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

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyModalUserId, setHistoryModalUserId] = useState<string | null>(
    null
  );
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingUserName, setDeletingUserName] = useState<string>('');

  const deleteUser = useDeleteUser();

  // Get user detail for edit modal (handled inside EditUserModal)

  // Get user detail for detail modal
  const selectedUserId = useMemo(() => {
    // Only use selected.id if it's a valid UUID, otherwise use null
    return isValidUUID(selected?.id) ? selected!.id : null;
  }, [selected?.id]);

  const {
    data: selectedUserDetailResponse,
    isLoading: isLoadingSelectedDetail,
  } = useGetUserDetail(selectedUserId);
  const selectedUserDetail = selectedUserDetailResponse?.data?.data;

  // Use API to fetch users with global stats
  // BE now returns UserListWithStatsResponse which includes globalStats and paginated users
  const { data: usersResponse, isLoading: isLoadingUsers } = useAdminUsers({
    search: search || undefined,
    accountStatus:
      status !== 'all'
        ? (status as 'active' | 'inactive' | 'suspended')
        : undefined,
    studentStatus:
      status !== 'all'
        ? (status as 'active' | 'graduated' | 'suspended' | 'withdrawn')
        : undefined,
    page: page - 1, // API uses 0-based pagination
    limit: PAGE_SIZE,
    sortBy: sortColumn || 'createdAt',
    sortDirection: sortDirection || 'desc',
  });

  // Extract data from new response structure
  const usersListWithStats = usersResponse?.data?.data;
  const users: AdminUserListItem[] = usersListWithStats?.users || [];
  const globalStats = usersListWithStats?.globalStats;
  const paginationMetadata = usersListWithStats?.pagination;

  // Map PaginationMetadata to PageResponse format for compatibility
  const pagination = paginationMetadata
    ? {
        page: paginationMetadata.currentPage,
        limit: paginationMetadata.pageSize,
        totalItems: paginationMetadata.totalElements,
        totalPages: paginationMetadata.totalPages,
        first: !paginationMetadata.hasPrevious,
        last: !paginationMetadata.hasNext,
      }
    : undefined;

  // Convert API response to StudentItem format for compatibility
  const filtered = useMemo(() => {
    return users.map(user => ({
      id: user.userId, // Use userId from API (UUID format)
      studentCode: user.studentCode || '',
      fullName: user.fullName,
      email: user.email,
      faculty: user.facultyName || '',
      department: user.departmentName || '',
      major: user.majorName || '',
      className: user.className || '',
      yearLevel: user.yearLevel || 0,
      status: (user.studentStatus || user.accountStatus) as StudentStatus,
      enrollmentDate: user.enrollmentDate || '',
      expectedGraduate: '', // Not available in list response
      userType: user.userType, // Add userType for account type column
    }));
  }, [users]);

  // Apply client-side filtering for filters not supported by BE
  // Note: These filters only work on the current page's data, not across all pages
  // For full functionality, these filters should be implemented on the backend
  const clientFiltered = useMemo(() => {
    let result = filtered;

    if (faculty) {
      result = result.filter(item => item.faculty === faculty);
    }
    if (yearLevel && yearLevel !== 'all') {
      result = result.filter(
        item => item.yearLevel === parseInt(yearLevel, 10)
      );
    }
    if (startDate) {
      result = result.filter(item => {
        if (!item.enrollmentDate) return false;
        return new Date(item.enrollmentDate) >= new Date(startDate);
      });
    }
    if (endDate) {
      result = result.filter(item => {
        if (!item.enrollmentDate) return false;
        return new Date(item.enrollmentDate) <= new Date(endDate);
      });
    }

    return result;
  }, [filtered, faculty, yearLevel, startDate, endDate]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, faculty, status, yearLevel, startDate, endDate]);

  // API handles sorting and pagination for BE-supported filters
  // Client-side filters (faculty, yearLevel, enrollmentDate) are applied after pagination
  const paginated = clientFiltered;

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
    alert(t('bulkAction.alert', { action, count: selectedItems.size }));
    setSelectedItems(new Set());
  };

  // Get stats from globalStats in the response (BE calculates these efficiently)
  const totalUsersCount = globalStats?.totalUsers || 0;
  const totalActiveUsersCount = globalStats?.activeUsers || 0; // All active users (students + staff)
  const totalSuspendedUsersCount = globalStats?.suspendedUsers || 0; // All suspended users
  const activeStudentsCount = globalStats?.activeStudents || 0; // Students with active status
  const graduatedStudentsCount = globalStats?.graduatedStudents || 0; // Students who graduated
  const withdrawnStudentsCount = globalStats?.withdrawnStudents || 0; // Students who withdrew

  const isAllSelected =
    paginated.length > 0 && paginated.every(item => selectedItems.has(item.id));

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          title={t('stats.totalUsers')}
          useCountUp={!isLoadingUsers}
          countUpValue={totalUsersCount}
          isLoading={isLoadingUsers}
        />
        <SummaryCard
          title={t('stats.activeUsers')}
          useCountUp={!isLoadingUsers}
          countUpValue={totalActiveUsersCount}
          isLoading={isLoadingUsers}
        />
        <SummaryCard
          title={t('stats.activeStudents')}
          useCountUp={!isLoadingUsers}
          countUpValue={activeStudentsCount}
          isLoading={isLoadingUsers}
        />
        <SummaryCard
          title={t('stats.graduatedStudents')}
          useCountUp={!isLoadingUsers}
          countUpValue={graduatedStudentsCount}
          isLoading={isLoadingUsers}
        />
        <SummaryCard
          title={t('stats.withdrawnStudents')}
          useCountUp={!isLoadingUsers}
          countUpValue={withdrawnStudentsCount}
          isLoading={isLoadingUsers}
        />
        <SummaryCard
          title={t('stats.suspendedUsers')}
          useCountUp={!isLoadingUsers}
          countUpValue={totalSuspendedUsersCount}
          isLoading={isLoadingUsers}
        />
      </div>

      {/* Main Table Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('table.title')}
            </div>
            <div className="text-sm text-slate-500 dark:text-white/60">
              {t('table.subtitle')}
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
                placeholder={t('table.searchPlaceholder')}
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
              {t('table.advancedFilters')}
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setIsAddUserModalOpen(true)}
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
              {t('table.addStudent')}
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
              <option value="all">{t('filters.allStatuses')}</option>
              <option value="active">{t('status.active')}</option>
              <option value="graduated">{t('status.graduated')}</option>
              <option value="suspended">{t('status.suspended')}</option>
              <option value="withdrawn">{t('status.withdrawn')}</option>
            </Select>
            <Select
              value={faculty}
              onChange={e => setFaculty(e.target.value)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">{t('filters.allFaculties')}</option>
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
              <option value="all">{t('filters.allYears')}</option>
              <option value="1">{t('filters.year1')}</option>
              <option value="2">{t('filters.year2')}</option>
              <option value="3">{t('filters.year3')}</option>
              <option value="4">{t('filters.year4')}</option>
            </Select>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder={t('filters.enrollmentDateFrom')}
              className="w-full"
            />
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder={t('filters.enrollmentDateTo')}
              className="w-full"
              min={startDate || undefined}
            />
          </div>
        )}

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
              {t('table.bulkActions.selected', { count: selectedItems.size })}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleBulkAction(t('table.bulkActions.activate'))
                }
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
                {t('table.bulkActions.activate')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction(t('table.bulkActions.suspend'))}
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
                {t('table.bulkActions.suspend')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction(t('table.bulkActions.delete'))}
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
                {t('table.bulkActions.delete')}
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
                {t('table.bulkActions.deselect')}
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
                    {t('table.studentCode')}
                    {sortIcon('studentCode')}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('fullName')}
                >
                  <div className="flex items-center">
                    {t('table.fullName')}
                    {sortIcon('fullName')}
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('email')}
                >
                  <div className="flex items-center">
                    {t('table.email')}
                    {sortIcon('email')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                  {t('table.majorClass')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-white/90">
                  {t('table.accountType')}
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-white/90 dark:hover:bg-white/5"
                  onClick={() => toggleSort('status')}
                >
                  <div className="flex items-center justify-center">
                    {t('table.status')}
                    {sortIcon('status')}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-white/90">
                  {t('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingUsers ? (
                Array.from({ length: Math.min(PAGE_SIZE, 5) }).map(
                  (_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      className="animate-fade-in border-b border-slate-100 dark:border-white/5"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both',
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <Skeleton
                            variant="shimmer"
                            className="h-4 w-4 rounded-full"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton variant="shimmer" className="h-4 w-32" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton variant="shimmer" className="h-4 w-40" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton variant="shimmer" className="h-4 w-48" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton variant="shimmer" className="h-4 w-36" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton variant="shimmer" className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <Skeleton
                            variant="shimmer"
                            className="h-6 w-20 rounded-full"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Skeleton
                            variant="shimmer"
                            className="h-8 w-8 rounded"
                          />
                          <Skeleton
                            variant="shimmer"
                            className="h-8 w-8 rounded"
                          />
                          <Skeleton
                            variant="shimmer"
                            className="h-8 w-8 rounded"
                          />
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-slate-500 dark:text-white/50"
                  >
                    {t('table.noData')}
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
                          {item.major}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-white/60">
                          {item.className}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-white/75">
                        {item.userType === 'student'
                          ? t('table.accountTypeStudent')
                          : t('table.accountTypeStaff')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={item.status} t={t} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              if (isValidUUID(item.id)) {
                                setSelected(item);
                              } else {
                                toast.error(t('errors.invalidUserId'));
                              }
                            }}
                            title={t('actions.view')}
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
                            onClick={() => {
                              if (isValidUUID(item.id)) {
                                setEditingUserId(item.id);
                                setIsEditUserModalOpen(true);
                              } else {
                                toast.error(t('errors.invalidUserId'));
                              }
                            }}
                            title={t('actions.edit')}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => {
                              if (isValidUUID(item.id)) {
                                setDeletingUserId(item.id);
                                setDeletingUserName(item.fullName);
                                setIsDeleteUserModalOpen(true);
                              } else {
                                toast.error(t('errors.invalidUserId'));
                              }
                            }}
                            title={t('actions.delete')}
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
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
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

        {pagination && (
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={pagination.totalItems}
            onChange={setPage}
          />
        )}
      </div>

      {/* Student Detail Modal */}
      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={t('modal.detail.title')}
        size="lg"
      >
        {isLoadingSelectedDetail ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-500 dark:text-slate-400">
              {t('loading.userInfo')}
            </div>
          </div>
        ) : selectedUserDetail ? (
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-2xl font-bold text-white">
                  {selectedUserDetail.fullName.charAt(0)}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {selectedUserDetail.fullName}
                  </div>
                  {selectedUserDetail.studentCode && (
                    <div className="text-sm text-slate-500 dark:text-white/60">
                      {t('modal.detail.studentCode')}:{' '}
                      {selectedUserDetail.studentCode}
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                {selectedUserDetail.studentStatus && (
                  <StatusBadge
                    status={selectedUserDetail.studentStatus as StudentStatus}
                    t={t}
                  />
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  {t('modal.detail.personalInfo')}
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      {t('modal.detail.email')}:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selectedUserDetail.email}
                    </span>
                  </div>
                  {selectedUserDetail.phoneNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.phoneNumber')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedUserDetail.phoneNumber}
                      </span>
                    </div>
                  )}
                  {selectedUserDetail.enrollmentDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.enrollmentDate')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatDate(selectedUserDetail.enrollmentDate)}
                      </span>
                    </div>
                  )}
                  {selectedUserDetail.graduationDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.expectedGraduate')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatDate(selectedUserDetail.graduationDate)}
                      </span>
                    </div>
                  )}
                  {selectedUserDetail.currentBalance !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.currentBalance')}:
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(selectedUserDetail.currentBalance)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  {t('modal.detail.academicInfo')}
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  {selectedUserDetail.facultyName && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.faculty')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedUserDetail.facultyName}
                      </span>
                    </div>
                  )}
                  {selectedUserDetail.departmentName && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.department')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedUserDetail.departmentName}
                      </span>
                    </div>
                  )}
                  {selectedUserDetail.majorName && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.major')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedUserDetail.majorName}
                      </span>
                    </div>
                  )}
                  {selectedUserDetail.className && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.class')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {selectedUserDetail.className}
                      </span>
                    </div>
                  )}
                  {selectedUserDetail.yearLevel && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        {t('modal.detail.academicYear')}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {t('table.year')} {selectedUserDetail.yearLevel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  if (selectedUserDetail?.userId) {
                    setEditingUserId(selectedUserDetail.userId);
                    setIsEditUserModalOpen(true);
                    setSelected(null);
                  }
                }}
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
                {t('modal.detail.edit')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (selectedUserDetail?.userId) {
                    setHistoryModalUserId(selectedUserDetail.userId);
                    setIsHistoryModalOpen(true);
                    setSelected(null);
                  }
                }}
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
                {t('modal.detail.viewHistory')}
              </Button>
            </div>
          </div>
        ) : selected ? (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {t('errors.loadUserFailed')}
          </div>
        ) : null}
      </Modal>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={() => {
          // Refresh list will be handled by query invalidation in the hook
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setEditingUserId(null);
        }}
        userId={editingUserId}
        onSuccess={() => {
          // Refresh list will be handled by query invalidation in the hook
        }}
      />

      {/* Delete User Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteUserModalOpen}
        onClose={() => {
          setIsDeleteUserModalOpen(false);
          setDeletingUserId(null);
          setDeletingUserName('');
        }}
        onConfirm={async () => {
          if (!deletingUserId) return;
          try {
            await deleteUser.mutateAsync(deletingUserId);
            toast.success(t('errors.deleteUserSuccess'));
            setIsDeleteUserModalOpen(false);
            setDeletingUserId(null);
            setDeletingUserName('');
          } catch (error: any) {
            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              t('errors.deleteUserFailed');
            toast.error(errorMessage);
            throw error;
          }
        }}
        title={t('deleteModal.title')}
        message={t('deleteModal.message')}
        itemName={deletingUserName}
        isLoading={deleteUser.isPending}
        type="activity"
      />

      {/* User History Modal */}
      <UserHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistoryModalUserId(null);
        }}
        userId={
          historyModalUserId ||
          selectedUserDetail?.userId ||
          (isValidUUID(selected?.id) ? selected!.id : null)
        }
        userName={selectedUserDetail?.fullName || selected?.fullName}
      />
    </div>
  );
}

export default ManageStudentsContent;
