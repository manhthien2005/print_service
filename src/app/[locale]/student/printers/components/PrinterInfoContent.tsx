'use client';

import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Tabs } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils/cn';
import CountUp from '@/components/ui/CountUp';
import { PrinterLocationModal } from './PrinterLocationModal';
import {
  printerInfoList,
  printerInfoSummary,
  printerNotices,
} from '@/data/printersInfoMock';
import type { PrinterInfoMock, PrinterStatus } from '../types';

type StatusTab = 'all' | PrinterStatus;

const statusTabs: { value: StatusTab; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'online', label: 'Online' },
  { value: 'busy', label: 'Đang in' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'offline', label: 'Offline' },
];

const statusColors: Record<PrinterStatus, string> = {
  online:
    'bg-emerald-500/15 text-emerald-700 ring-emerald-500/30 dark:text-emerald-200',
  busy: 'bg-amber-500/15 text-amber-700 ring-amber-500/30 dark:text-amber-200',
  offline: 'bg-rose-500/15 text-rose-700 ring-rose-500/30 dark:text-rose-200',
  maintenance:
    'bg-blue-500/15 text-blue-700 ring-blue-500/30 dark:text-blue-200',
};

const noticeTone: Record<string, string> = {
  info: 'border-sky-200/70 bg-sky-50/70 dark:border-sky-900/40 dark:bg-sky-900/20',
  warning:
    'border-amber-200/70 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-900/20',
  critical:
    'border-rose-200/70 bg-rose-50/70 dark:border-rose-900/40 dark:bg-rose-900/25',
};

function StatusBadge({ status }: { status: PrinterStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        statusColors[status]
      )}
    >
      {status === 'busy'
        ? 'Đang in'
        : status === 'online'
          ? 'Sẵn sàng'
          : status === 'maintenance'
            ? 'Bảo trì'
            : 'Offline'}
    </span>
  );
}

function MetricTile({
  label,
  value,
  caption,
}: {
  label: string;
  value: React.ReactNode;
  caption?: string;
}) {
  return (
    <Card className="border-slate-200/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <CardHeader className="pb-4">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
        {caption && (
          <p className="text-xs text-slate-500 dark:text-white/60">{caption}</p>
        )}
      </CardHeader>
    </Card>
  );
}

function PrinterCard({
  printer,
  onView,
}: {
  printer: PrinterInfoMock;
  onView: (printer: PrinterInfoMock) => void;
}) {
  const estimatedMinutes = Math.max(1, Math.round(printer.queueLength * 2));

  return (
    <Card className="border-slate-200/70 bg-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_12px_40px_rgba(0,0,0,0.32)]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{printer.name}</CardTitle>
          </div>
          <div className="flex items-start gap-2">
            <StatusBadge status={printer.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm text-slate-700 dark:text-white/80">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/70 px-3 py-2 dark:border-white/10">
            <span className="text-slate-500 dark:text-white/60">Model</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {printer.model}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/70 px-3 py-2 dark:border-white/10">
            <span className="text-slate-500 dark:text-white/60">Vị trí</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {printer.building} • {printer.room} • {printer.floor}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/70 px-3 py-2 dark:border-white/10">
            <span className="text-slate-500 dark:text-white/60">Chức năng</span>
            <div className="flex flex-wrap justify-end gap-2">
              <span className="flex items-center gap-2 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100 dark:bg-cyan-500/10 dark:text-cyan-200 dark:ring-cyan-500/30">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                {printer.supportsDuplex ? 'In 2 mặt' : '1 mặt'}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-200 dark:ring-violet-500/30">
                <span className="h-2 w-2 rounded-full bg-violet-500" />
                {printer.supportsColor ? 'In màu' : 'Đen trắng'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/70 px-3 py-2 dark:border-white/10">
            <span className="text-slate-500 dark:text-white/60">Hàng đợi</span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:bg-white/10 dark:text-white">
                {printer.queueLength} công việc
              </span>
              <span className="text-xs text-slate-500 dark:text-white/60">
                ≈ {estimatedMinutes} phút
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            size="sm"
            variant="default"
            className="w-full bg-white/20 text-slate-900 shadow-sm backdrop-blur transition hover:bg-white/40 hover:shadow-md dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            onClick={() => onView(printer)}
          >
            Xem thêm
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PrinterInfoContent() {
  const [status, setStatus] = useState<StatusTab>('all');
  const [building, setBuilding] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [colorOnly, setColorOnly] = useState(false);
  const [duplexOnly, setDuplexOnly] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [selectedPrinter, setSelectedPrinter] =
    useState<PrinterInfoMock | null>(null);

  const buildingOptions = useMemo(() => {
    const values = Array.from(new Set(printerInfoList.map(p => p.building)));
    return values.sort();
  }, []);

  const filteredPrinters = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return printerInfoList
      .filter(printer => {
        if (status !== 'all' && printer.status !== status) return false;

        if (
          onlyAvailable &&
          (printer.status === 'offline' || printer.status === 'maintenance')
        ) {
          return false;
        }

        if (building !== 'all' && printer.building !== building) return false;
        if (colorOnly && !printer.supportsColor) return false;
        if (duplexOnly && !printer.supportsDuplex) return false;

        if (!normalized) return true;

        const haystack = [
          printer.name,
          printer.brand,
          printer.model,
          printer.room,
          printer.building,
          printer.ipAddress,
          printer.serial,
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalized);
      })
      .sort((a, b) => {
        const order: Record<PrinterStatus, number> = {
          online: 0,
          busy: 1,
          maintenance: 2,
          offline: 3,
        };
        const diff = order[a.status] - order[b.status];
        if (diff !== 0) return diff;
        return a.queueLength - b.queueLength;
      });
  }, [status, building, keyword, onlyAvailable, colorOnly, duplexOnly]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Tổng máy in"
          value={printerInfoSummary.total.toString()}
          caption="Tất cả cơ sở"
        />
        <MetricTile
          label="Đang sẵn sàng"
          value={
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">
              <CountUp to={printerInfoSummary.online} />
            </span>
          }
          caption="Chấp nhận công việc mới"
        />
        <MetricTile
          label="Đang in / bảo trì"
          value={`${printerInfoSummary.busy} / ${printerInfoSummary.maintenance}`}
          caption="Theo dõi hàng đợi & lịch bảo trì"
        />
        <MetricTile
          label="Hàng đợi trung bình"
          value={`${printerInfoSummary.avgQueue}`}
          caption="Sắp xếp theo mức ưu tiên"
        />
      </div>

      <Card className="border-slate-200/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/5 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Bộ lọc nhanh</CardTitle>
              <CardDescription>
                Lọc theo trạng thái, tòa nhà, tính năng và từ khóa để tìm máy in
                phù hợp.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
              onClick={() => setShowTips(true)}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Lưu ý & mẹo
            </Button>
          </div>
          <Tabs
            items={statusTabs}
            value={status}
            onChange={setStatus}
            className="mt-2"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                Tìm kiếm
              </label>
              <div className="relative">
                <Input
                  placeholder="Tên máy, tòa nhà, phòng, IP..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-white/50"
                />
                <svg
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.2-5.2M11 18a7 7 0 100-14 7 7 0 000 14z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                Tòa nhà
              </label>
              <Select
                value={building}
                onChange={e => setBuilding(e.target.value)}
              >
                <option value="all">Tất cả</option>
                {buildingOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white/80">
              <Checkbox
                checked={onlyAvailable}
                onChange={e => setOnlyAvailable(e.target.checked)}
              />
              Chỉ hiển thị máy có thể nhận công việc
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white/80">
              <Checkbox
                checked={colorOnly}
                onChange={e => setColorOnly(e.target.checked)}
              />
              Ưu tiên máy in màu
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white/80">
              <Checkbox
                checked={duplexOnly}
                onChange={e => setDuplexOnly(e.target.checked)}
              />
              Cần hỗ trợ in 2 mặt
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-white/70">
          <div>
            Tìm thấy{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-300">
              {filteredPrinters.length}
            </span>{' '}
            máy in phù hợp
          </div>
          <Tooltip content="Sắp xếp theo trạng thái và số công việc trong hàng đợi">
            <span className="cursor-help text-xs text-slate-500 dark:text-white/50">
              Ưu tiên trạng thái sẵn sàng
            </span>
          </Tooltip>
        </div>

        {filteredPrinters.length === 0 ? (
          <Card className="border-slate-200/70 bg-white/80 p-8 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5 dark:text-white">
            Không có máy in nào khớp bộ lọc. Thử bỏ bớt điều kiện lọc.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {filteredPrinters.map(printer => (
              <PrinterCard
                key={printer.id}
                printer={printer}
                onView={p => {
                  setSelectedPrinter(p);
                  setShowLocation(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showTips}
        onClose={() => setShowTips(false)}
        title="Lưu ý & mẹo chọn máy in"
        size="lg"
      >
        <div className="space-y-4 p-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
              Lưu ý nhanh
            </h4>
            <div className="space-y-2">
              {printerNotices.map(notice => (
                <div
                  key={notice.id}
                  className={cn(
                    'rounded-xl border px-3 py-3 text-sm',
                    noticeTone[notice.severity]
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{notice.title}</p>
                      <p className="text-sm text-slate-600 dark:text-white/70">
                        {notice.detail}
                      </p>
                    </div>
                    {notice.actionLabel && (
                      <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-white/10 dark:text-white/80 dark:ring-white/10">
                        {notice.actionLabel}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
              Mẹo chọn máy in
            </h4>
            <div className="space-y-2 text-sm text-slate-700 dark:text-white/70">
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <p>
                  Cần in gấp: ưu tiên máy <strong>sẵn sàng</strong> và hàng đợi
                  &lt; 2.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                <p>
                  In màu hoặc A3: chọn máy <strong>Canon G5500</strong> (R402)
                  hoặc <strong>Ricoh IM C3000</strong> (R210).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                <p>
                  Hệ thống bận: bật bộ lọc &quot;chỉ máy nhận công việc&quot; để
                  loại bỏ máy đang bảo trì/offline.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-slate-500" />
                <p>
                  Nếu cần scan hoặc copy kèm: ưu tiên Ricoh IM C3000 hoặc HP
                  PageWide (R602).
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <PrinterLocationModal
        isOpen={showLocation}
        onClose={() => setShowLocation(false)}
        printer={
          selectedPrinter
            ? {
                printer_id: selectedPrinter.id,
                serial_number: selectedPrinter.serial,
                brand_name: selectedPrinter.brand,
                model_name: selectedPrinter.model,
                room_code: selectedPrinter.room,
                building_name: selectedPrinter.building,
                is_enabled: selectedPrinter.status !== 'offline',
                supports_color: selectedPrinter.supportsColor,
                supports_duplex: selectedPrinter.supportsDuplex,
                max_paper_size: selectedPrinter.maxPaperSize,
                status:
                  selectedPrinter.status === 'maintenance'
                    ? 'maintenance'
                    : selectedPrinter.status === 'offline'
                      ? 'offline'
                      : 'online',
                installed_date: '',
                last_maintenance_date: '',
              }
            : null
        }
      />
    </div>
  );
}
