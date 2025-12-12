'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  purchaseHistoryMock,
  purchaseSummaryMock,
  PurchaseHistoryItem,
  PurchaseStatus,
  PaymentMethod,
} from '@/data/buyPagesMock';
import { cn } from '@/lib/utils/cn';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { Modal } from '@/components/ui/Modal';
import CountUp from '@/components/ui/CountUp';

type StatusFilterValue = 'all' | PurchaseStatus;
type PaymentFilterValue = 'all' | PaymentMethod;
type SortColumn = 'date' | 'pages' | 'price' | 'status' | null;
type SortDirection = 'asc' | 'desc' | null;

const PAGE_SIZE = 10;

function formatDate(value?: string) {
  if (!value) return '--';
  return new Date(value).toLocaleString('vi-VN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

function StatusBadge({ status }: { status: PurchaseStatus }) {
  const styles: Record<PurchaseStatus, string> = {
    completed:
      'bg-green-100 text-green-700 ring-green-500/30 dark:bg-green-500/10 dark:text-green-300',
    pending:
      'bg-amber-100 text-amber-700 ring-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
    failed:
      'bg-rose-100 text-rose-700 ring-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
    cancelled:
      'bg-slate-100 text-slate-700 ring-slate-500/30 dark:bg-slate-500/10 dark:text-slate-200',
  };

  const label: Record<PurchaseStatus, string> = {
    completed: 'Thành công',
    pending: 'Đang chờ',
    failed: 'Thất bại',
    cancelled: 'Đã hủy',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        styles[status]
      )}
    >
      {label[status]}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const styles: Record<
    PaymentMethod,
    { label: string; icon: string; className: string }
  > = {
    bank: {
      label: 'Ngân hàng',
      icon: '🏦',
      className:
        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    },
    momo: {
      label: 'MoMo',
      icon: '💳',
      className:
        'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300',
    },
  };

  const style = styles[method];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold',
        style.className
      )}
    >
      <span>{style.icon}</span>
      <span>{style.label}</span>
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
    <div className="relative rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="text-sm font-semibold text-slate-500 dark:text-white/60">
        {title}
      </div>
      <div className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
        {useCountUp && countUpValue !== undefined ? (
          <CountUp
            to={countUpValue}
            separator="."
            duration={2}
            className="text-3xl font-bold text-slate-900 dark:text-white"
          />
        ) : (
          value
        )}
      </div>
      {caption && (
        <div className="mt-1 text-sm text-slate-500 dark:text-white/60">
          {caption}
        </div>
      )}
    </div>
  );
}

function HistoryRow({
  item,
  onClick,
}: {
  item: PurchaseHistoryItem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group grid w-full grid-cols-12 items-center gap-3 rounded-xl border border-slate-200/70 bg-white/70 px-4 py-3 text-left transition hover:-translate-y-[1px] hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5"
    >
      <div className="col-span-2">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          {item.transactionId}
        </div>
      </div>

      <div className="col-span-2">
        <div className="text-sm text-slate-600 dark:text-white/70">
          {formatDate(item.purchasedAt)}
        </div>
      </div>

      <div className="col-span-2">
        <div className="text-sm font-semibold text-slate-800 dark:text-white">
          {item.packageName || 'Mua tùy chỉnh'}
        </div>
        {item.packageId && (
          <div className="mt-0.5 text-xs text-slate-500 dark:text-white/60">
            Gói: {item.packageId}
          </div>
        )}
      </div>

      <div className="col-span-1">
        <div className="text-sm text-slate-800 dark:text-white">
          {item.pages.toLocaleString('vi-VN')} trang
        </div>
        {item.bonusPages > 0 && (
          <div className="text-xs text-green-600 dark:text-green-400">
            +{item.bonusPages} bonus
          </div>
        )}
        <div className="text-xs text-slate-500 dark:text-white/60">
          Tổng: {item.totalPages} trang
        </div>
      </div>

      <div className="col-span-1">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">
          {formatPrice(item.priceVnd)}
        </div>
      </div>

      <div className="col-span-2 flex items-center justify-center px-2">
        <PaymentMethodBadge method={item.paymentMethod} />
      </div>

      <div className="col-span-2 flex items-center justify-center px-2">
        <StatusBadge status={item.status} />
      </div>
    </button>
  );
}

export function PurchaseHistory() {
  const [status, setStatus] = useState<StatusFilterValue>('all');
  const [paymentMethod, setPaymentMethod] = useState<PaymentFilterValue>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PurchaseHistoryItem | null>(null);
  const [page, setPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return purchaseHistoryMock.filter(item => {
      const matchesStatus = status === 'all' || item.status === status;
      const matchesPayment =
        paymentMethod === 'all' || item.paymentMethod === paymentMethod;

      const purchased = new Date(item.purchasedAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const endInclusive = end ? new Date(end) : null;
      if (endInclusive) endInclusive.setHours(23, 59, 59, 999);
      const matchesTime =
        (!start || purchased >= start) &&
        (!endInclusive || purchased <= endInclusive);

      const term = search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        item.transactionId.toLowerCase().includes(term) ||
        item.packageName?.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term);

      return matchesStatus && matchesPayment && matchesTime && matchesSearch;
    });
  }, [status, paymentMethod, startDate, endDate, search]);

  useEffect(() => {
    setPage(1);
  }, [
    filtered.length,
    status,
    paymentMethod,
    startDate,
    endDate,
    search,
    sortColumn,
    sortDirection,
  ]);

  const sorted = useMemo(() => {
    if (!sortColumn || !sortDirection) return filtered;
    const data = [...filtered];
    data.sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      switch (sortColumn) {
        case 'date':
          return (
            direction *
            (new Date(a.purchasedAt).getTime() -
              new Date(b.purchasedAt).getTime())
          );
        case 'pages':
          return direction * (a.totalPages - b.totalPages);
        case 'price':
          return direction * (a.priceVnd - b.priceVnd);
        case 'status':
          return direction * a.status.localeCompare(b.status);
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
          className="h-4 w-4 text-slate-400"
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
        className="h-4 w-4 text-blue-500"
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
        className="h-4 w-4 text-blue-500"
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Tổng giao dịch"
          useCountUp
          countUpValue={purchaseSummaryMock.totalPurchases}
          caption="Đã hoàn thành"
        />
        <SummaryCard
          title="Trang đã mua"
          useCountUp
          countUpValue={purchaseSummaryMock.totalPagesPurchased}
          caption={`+${purchaseSummaryMock.totalBonusPages.toLocaleString('vi-VN')} trang bonus`}
        />
        <SummaryCard
          title="Tổng chi tiêu"
          value={formatPrice(purchaseSummaryMock.totalSpentVnd)}
          caption="Tất cả giao dịch thành công"
        />
        <SummaryCard
          title="Trang bonus"
          useCountUp
          countUpValue={purchaseSummaryMock.totalBonusPages}
          caption="Từ các gói mua"
        />
      </div>

      {/* History Table */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              Lịch sử mua trang
            </div>
            <div className="text-sm text-slate-500 dark:text-white/60">
              Tìm kiếm, lọc và sắp xếp lịch sử mua
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
                placeholder="Tìm theo mã giao dịch..."
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              value={status}
              onChange={e => setStatus(e.target.value as StatusFilterValue)}
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Thành công</option>
              <option value="pending">Đang chờ</option>
              <option value="failed">Thất bại</option>
              <option value="cancelled">Đã hủy</option>
            </Select>
            <Select
              value={paymentMethod}
              onChange={e =>
                setPaymentMethod(e.target.value as PaymentFilterValue)
              }
              className="rounded-xl border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="all">Tất cả phương thức</option>
              <option value="bank">Ngân hàng</option>
              <option value="momo">MoMo</option>
            </Select>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Ngày bắt đầu"
              className="w-full"
            />
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Ngày kết thúc"
              className="w-full"
              min={startDate || undefined}
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="hidden grid-cols-12 items-center gap-3 px-1 py-2 text-sm font-semibold text-slate-800 dark:text-white md:grid">
            <button
              type="button"
              onClick={() => toggleSort('date')}
              className="col-span-2 flex items-center gap-2 text-left"
            >
              <span>Mã giao dịch</span>
              {sortIcon('date')}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('date')}
              className="col-span-2 flex items-center gap-2 text-left"
            >
              <span>Ngày</span>
              {sortIcon('date')}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('pages')}
              className="col-span-2 flex items-center gap-2 text-left"
            >
              <span>Gói</span>
            </button>
            <button
              type="button"
              onClick={() => toggleSort('pages')}
              className="col-span-1 flex items-center gap-2 text-left"
            >
              <span>Số trang</span>
              {sortIcon('pages')}
            </button>
            <button
              type="button"
              onClick={() => toggleSort('price')}
              className="col-span-1 flex items-center gap-2 text-left"
            >
              <span>Giá</span>
              {sortIcon('price')}
            </button>
            <span className="col-span-2 px-2 text-center">Phương thức</span>
            <button
              type="button"
              onClick={() => toggleSort('status')}
              className="col-span-2 flex items-center justify-center gap-2 px-2 text-center"
            >
              <span>Trạng thái</span>
              {sortIcon('status')}
            </button>
          </div>

          {paginated.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200/70 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
              Không có dữ liệu phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            paginated.map(item => (
              <HistoryRow
                key={item.id}
                item={item}
                onClick={() => setSelected(item)}
              />
            ))
          )}

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onChange={setPage}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Chi tiết giao dịch"
        size="lg"
      >
        {selected && (
          <div className="space-y-4 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Thông tin giao dịch
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Mã giao dịch:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Loại mua:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.packageName || 'Mua tùy chỉnh'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Ngày mua:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatDate(selected.purchasedAt)}
                    </span>
                  </div>
                  {selected.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        Hoàn tất:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatDate(selected.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Chi tiết thanh toán
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Trang cơ bản:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {selected.pages.toLocaleString('vi-VN')} trang
                    </span>
                  </div>
                  {selected.bonusPages > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-white/70">
                        Trang bonus:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        +{selected.bonusPages} trang
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Tổng trang:
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {selected.totalPages.toLocaleString('vi-VN')} trang
                    </span>
                  </div>
                  <div className="mt-3 border-t border-slate-200 pt-3 dark:border-white/10">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-slate-900 dark:text-white">
                        Tổng tiền:
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(selected.priceVnd)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Phương thức:
                    </span>
                    <PaymentMethodBadge method={selected.paymentMethod} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Trạng thái:
                    </span>
                    <StatusBadge status={selected.status} />
                  </div>
                </div>
              </div>
            </div>

            {selected.notes && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                <div className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Ghi chú:
                </div>
                <div className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  {selected.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
