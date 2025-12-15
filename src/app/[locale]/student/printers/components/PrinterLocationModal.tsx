'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { MockPrinter } from '@/data/printMock';
import Image from 'next/image';

interface PrinterLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  printer: MockPrinter | null;
}

export function PrinterLocationModal({
  isOpen,
  onClose,
  printer,
}: PrinterLocationModalProps) {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  if (!printer) return null;

  // Construct image paths based on printer serial number
  const mapImagePath = '/images/school-map.png'; // Placeholder - you can replace with actual map
  const printer2DImagePath = `/images/printers/${printer.serial_number}-2d.png`;
  const printer3DImagePath = `/images/printers/${printer.serial_number}-3d.png`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vị trí máy in - ${printer.brand_name} ${printer.model_name}`}
      size="xl"
    >
      <div className="space-y-6 p-6">
        {/* Map Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Bản đồ trường học
          </h3>
          <div className="relative h-64 w-full overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
            <Image
              src={mapImagePath}
              alt="School Map"
              fill
              className="object-contain"
              onError={e => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                      <div class="text-center">
                        <svg class="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <p>Bản đồ sẽ được hiển thị tại đây</p>
                        <p class="text-sm mt-1">${printer.building_name} - ${printer.room_code}</p>
                      </div>
                    </div>
                  `;
                }
              }}
            />
            {/* Location marker */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-75" />
                <div className="relative rounded-full bg-blue-600 p-2 shadow-lg">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-white/70">
            Vị trí:{' '}
            <span className="font-semibold">
              {printer.building_name} - {printer.room_code}
            </span>
          </p>
        </div>

        {/* Printer Image Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Hình ảnh máy in
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('2d')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === '2d'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20'
                } `}
              >
                2D View
              </button>
              <button
                onClick={() => setViewMode('3d')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === '3d'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20'
                } `}
              >
                3D View
              </button>
            </div>
          </div>
          <div className="relative h-96 w-full overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
            <Image
              src={viewMode === '2d' ? printer2DImagePath : printer3DImagePath}
              alt={`${printer.brand_name} ${printer.model_name} ${viewMode.toUpperCase()} View`}
              fill
              className="object-contain p-4"
              onError={e => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                      <div class="text-center">
                        <svg class="mx-auto h-16 w-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>Hình ảnh ${viewMode.toUpperCase()} sẽ được hiển thị tại đây</p>
                        <p class="text-xs mt-1">Đường dẫn: ${viewMode === '2d' ? printer2DImagePath : printer3DImagePath}</p>
                      </div>
                    </div>
                  `;
                }
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}



