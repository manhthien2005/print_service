'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { MockPrinter } from '@/app/[locale]/student/print/types';
import Image from 'next/image';
import { usePrinterFloorDiagram } from '@/app/[locale]/student/print/api';
import { Skeleton } from '@/components/common/Skeleton';

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch floor diagram data
  const {
    data: floorDiagramData,
    isLoading: isLoadingFloorDiagram,
    error: floorDiagramError,
  } = usePrinterFloorDiagram(printer?.printer_id || null);

  const floorDiagram = floorDiagramData?.data?.data;
  const printerInfo = floorDiagram?.printer;
  const floorInfo = floorDiagram?.floor;
  const pixelCoordinate = printerInfo?.pixel_coordinate;

  // Calculate icon position based on image scale
  useEffect(() => {
    if (
      imageLoaded &&
      imageRef.current &&
      containerRef.current &&
      pixelCoordinate?.pixel
    ) {
      const img = imageRef.current;
      const container = containerRef.current;

      // Get natural image dimensions
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // Get displayed image dimensions (with object-contain)
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const scaleX = containerWidth / naturalWidth;
      const scaleY = containerHeight / naturalHeight;
      const scale = Math.min(scaleX, scaleY); // object-contain uses min scale

      const displayedWidth = naturalWidth * scale;
      const displayedHeight = naturalHeight * scale;

      // Calculate offset (centering)
      const offsetX = (containerWidth - displayedWidth) / 2;
      const offsetY = (containerHeight - displayedHeight) / 2;

      // Calculate position
      const x = offsetX + pixelCoordinate.pixel[0] * scale;
      const y = offsetY + pixelCoordinate.pixel[1] * scale;

      setImageSize({ width: x, height: y });
    }
  }, [imageLoaded, pixelCoordinate]);

  if (!printer) return null;

  // Construct image paths based on printer serial number
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
        {/* Printer Information */}
        {isLoadingFloorDiagram ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" variant="shimmer" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" variant="shimmer" />
              <Skeleton className="h-20 w-full" variant="shimmer" />
            </div>
          </div>
        ) : floorDiagramError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
            <p className="text-sm text-red-600 dark:text-red-400">
              Không thể tải thông tin sơ đồ tầng
            </p>
          </div>
        ) : printerInfo ? (
          <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Thông tin vị trí
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600 dark:text-white/70">
                  Building Code:
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {printerInfo.building_code}
                </p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-white/70">
                  Building Name:
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {printerInfo.building_name}
                </p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-white/70">
                  Floor Number:
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Tầng {printerInfo.floor_number}
                </p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-white/70">
                  Room Code:
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {printerInfo.room_code}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-slate-600 dark:text-white/70">
                  Room Name:
                </span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {printerInfo.room_name}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Map Section */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Sơ đồ tầng
          </h3>
          {isLoadingFloorDiagram ? (
            <div className="relative h-96 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/10">
              <Skeleton className="h-full w-full" variant="shimmer" />
            </div>
          ) : floorDiagramError ? (
            <div className="relative h-96 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/10">
              <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <svg
                    className="mx-auto mb-2 h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <p>Không thể tải sơ đồ tầng</p>
                </div>
              </div>
            </div>
          ) : floorInfo?.diagram_url ? (
            <div
              ref={containerRef}
              className="relative h-96 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/10"
            >
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Skeleton className="h-full w-full" variant="shimmer" />
                </div>
              )}
              <img
                ref={imageRef}
                src={floorInfo.diagram_url}
                alt={`Sơ đồ tầng ${printerInfo?.floor_number || ''}`}
                className={`h-full w-full object-contain ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(true);
                }}
              />
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-white/10">
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <svg
                      className="mx-auto mb-2 h-12 w-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p>Không thể tải hình ảnh sơ đồ</p>
                  </div>
                </div>
              )}
              {/* Printer icon marker */}
              {pixelCoordinate?.pixel &&
                !imageError &&
                imageLoaded &&
                imageSize && (
                  <div
                    className="absolute z-10"
                    style={{
                      left: `${imageSize.width}px`,
                      top: `${imageSize.height}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-75" />
                      <div className="relative rounded-full bg-blue-600 p-2 shadow-lg ring-2 ring-white">
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
                )}
            </div>
          ) : (
            <div className="relative h-96 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/10">
              <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <svg
                    className="mx-auto mb-2 h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  <p>Sơ đồ tầng chưa có sẵn</p>
                </div>
              </div>
            </div>
          )}
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
