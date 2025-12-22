import { useState } from 'react';
import type { PrintHistoryItem } from '../types';
import { FileIcon } from '../../print/components/FileIcon';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PrinterLocationModal } from '../../printers/components/PrinterLocationModal';
import { formatDate, getPrinterStatusMeta } from '../utils';
import { StatusBadge } from './StatusBadge';
import { DetailModalSkeleton } from './DetailModalSkeleton';
import { cn } from '@/lib/utils/cn';

interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PrintHistoryItem | null;
  isLoading: boolean;
}

export function HistoryDetailModal({
  isOpen,
  onClose,
  item,
  isLoading,
}: HistoryDetailModalProps) {
  const [showLocation, setShowLocation] = useState(false);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Chi tiết lịch sử in"
        size="lg"
      >
        {isLoading ? (
          <DetailModalSkeleton />
        ) : item ? (
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex items-center gap-4">
                <FileIcon fileName={item.documentName} size={56} />
                <div>
                  <div className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {item.documentName}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-white/60">
                    ID: {item.id} • {item.fileType} • {item.fileSizeKB} KB
                  </div>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    if (item.previewUrl) {
                      window.open(
                        item.previewUrl,
                        '_blank',
                        'noopener,noreferrer'
                      );
                    }
                  }}
                  disabled={!item.previewUrl}
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Xem file in
                </Button>
                <StatusBadge status={item.status} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 pt-6 dark:border-white/10 dark:bg-white/5">
                {(() => {
                  const meta = getPrinterStatusMeta(item.printerStatus);
                  return (
                    <div
                      className={cn(
                        'absolute right-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
                        meta.badge
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
                      {meta.label}
                    </div>
                  );
                })()}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                        Máy in
                      </div>
                      <div className="text-base font-semibold text-slate-900 dark:text-white">
                        {item.printerName}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-white/60">
                        Serial: {item.printerSerial || '—'}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-white/70">
                        <svg
                          className="h-4 w-4 text-slate-500 dark:text-white/60"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 21h16M4 10h16M9 21V6m6 15V6m3 4.5V4H6v6.5"
                          />
                        </svg>
                        <span>
                          {item.buildingName || '—'}{' '}
                          {item.roomCode ? `- ${item.roomCode}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setShowLocation(true)}
                    className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transition-transform hover:scale-[1.01] hover:from-blue-600 hover:to-indigo-600 hover:shadow-lg active:scale-[0.99]"
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
                        d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z"
                      />
                      <circle cx="12" cy="11" r="2.5" />
                    </svg>
                    Xem vị trí
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Cấu hình in
                </div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Khổ giấy
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.paperSize || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Hướng giấy
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.orientation === 'landscape' ? 'Ngang' : 'Dọc'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Chế độ màu
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.colorMode === 'color'
                        ? 'In màu'
                        : item.colorMode === 'grayscale'
                          ? 'In xám'
                          : 'Đen trắng'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Mặt in
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.duplex ? '2 mặt' : '1 mặt'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Số bản
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.copies}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-white/70">
                      Tổng trang
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.pageCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs uppercase text-slate-500 dark:text-white/50">
                  Thời gian
                </div>
                <div className="mt-2 space-y-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <div>Gửi: {formatDate(item.submittedAt)}</div>
                  <div>
                    {item.status === 'processing'
                      ? 'Hoàn tất dự kiến:'
                      : 'Hoàn tất:'}{' '}
                    {formatDate(item.completedAt)}
                  </div>
                </div>
              </div>
            </div>

            {item.status === 'processing' && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                <div className="flex items-center justify-between text-sm font-semibold text-blue-800 dark:text-blue-200">
                  <span>Đang in</span>
                  <span>65%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                </div>
                <div className="mt-2 text-xs text-blue-700 dark:text-blue-200">
                  Ước tính hoàn tất trong 2 phút...
                </div>
              </div>
            )}

            {item.errorMessage && (
              <div className="rounded-xl border border-rose-200/60 bg-rose-50/70 p-4 text-sm text-rose-700 ring-1 ring-rose-200 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100">
                {item.errorMessage}
              </div>
            )}

            <PrinterLocationModal
              isOpen={showLocation}
              onClose={() => setShowLocation(false)}
              printer={
                item
                  ? {
                      printer_id: item.printerSerial || item.printerName,
                      serial_number: item.printerSerial || 'N/A',
                      brand_name: item.printerName,
                      model_name: item.printerName,
                      room_code: item.roomCode || 'N/A',
                      building_name: item.buildingName || 'N/A',
                      is_enabled: true,
                      supports_color: item.supportsColor ?? true,
                      supports_duplex: item.supportsDuplex ?? true,
                      max_paper_size: item.paperSize || 'A4',
                      status: item.printerStatus || 'online',
                      installed_date: '',
                      last_maintenance_date: '',
                    }
                  : null
              }
            />
          </div>
        ) : null}
      </Modal>
    </>
  );
}
