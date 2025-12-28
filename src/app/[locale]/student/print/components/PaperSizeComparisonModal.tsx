'use client';

import { Modal } from '@/components/ui/Modal';
import { MockPageSize } from '@/app/[locale]/student/print/types';
import { useState, useEffect } from 'react';

interface PaperSizeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageSizes: MockPageSize[];
}

export function PaperSizeComparisonModal({
  isOpen,
  onClose,
  pageSizes,
}: PaperSizeComparisonModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Sort sizes by area (largest to smallest)
  const sortedSizes = [...pageSizes].sort((a, b) => {
    const areaA = a.width_mm * a.height_mm;
    const areaB = b.width_mm * b.height_mm;
    return areaB - areaA;
  });

  const hasA0Stack = sortedSizes.some(s => s.size_name === 'A0');
  const maxWidth = Math.max(...sortedSizes.map(s => s.width_mm));
  const maxHeight = Math.max(...sortedSizes.map(s => s.height_mm));

  useEffect(() => {
    if (isOpen) {
      setSelectedSize(null);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="So sánh khổ giấy" size="lg">
      <div className="space-y-6 p-6">
        {/* Visual Comparison */}
        <div className="relative w-full overflow-hidden rounded-xl border-2 border-slate-800/50 bg-slate-900 p-6 text-white shadow-inner shadow-slate-900/40 dark:border-white/10 dark:bg-slate-900 md:p-8">
          {hasA0Stack ? (
            <div className="relative mx-auto aspect-[841/1189] w-full max-w-5xl rounded-xl border border-slate-700 bg-slate-800/70 shadow-inner dark:border-white/10 dark:bg-white/5">
              {(() => {
                const a0 = sortedSizes.find(s => s.size_name === 'A0')!;
                const getSize = (name: string) =>
                  sortedSizes.find(s => s.size_name === name) || a0;
                const dims: Record<
                  string,
                  { w: number; h: number; left: number; top: number }
                > = {
                  A0: { w: 100, h: 100, left: 0, top: 0 },
                  A1: {
                    w: (594 / 841) * 100,
                    h: (841 / 1189) * 100,
                    left: 0,
                    top: (1 - 841 / 1189) * 100,
                  },
                  A2: {
                    w: (420 / 841) * 100,
                    h: (594 / 1189) * 100,
                    left: 100 - (420 / 841) * 100,
                    top: 0,
                  },
                  A3: {
                    w: (297 / 841) * 100,
                    h: (420 / 1189) * 100,
                    left: 0,
                    top: 100 - (420 / 1189) * 100,
                  },
                  A4: {
                    w: (210 / 841) * 100,
                    h: (297 / 1189) * 100,
                    left: 0,
                    top: 0,
                  },
                };
                const order = ['A0', 'A1', 'A2', 'A3', 'A4'];

                return order
                  .filter(n => sortedSizes.some(s => s.size_name === n))
                  .map((name, idx) => {
                    const size = getSize(name);
                    const isSelected = selectedSize === name;
                    const wMm =
                      size.size_name === 'A0'
                        ? a0.width_mm
                        : Math.round(
                            ((dims[name]?.w ?? 0) / 100) * a0.width_mm
                          );
                    const hMm =
                      size.size_name === 'A0'
                        ? a0.height_mm
                        : Math.round(
                            ((dims[name]?.h ?? 0) / 100) * a0.height_mm
                          );

                    return (
                      <div
                        key={name}
                        className={`duration-400 absolute cursor-pointer rounded-md border-2 shadow-md transition-all ${isSelected ? 'border-blue-400 bg-blue-500/10 shadow-blue-500/30' : 'border-slate-500 bg-slate-800/70 hover:border-blue-400 hover:bg-blue-500/5'} `}
                        style={{
                          width: `${dims[name]?.w ?? 100}%`,
                          height: `${dims[name]?.h ?? 100}%`,
                          left: `${dims[name]?.left ?? 0}%`,
                          top: `${dims[name]?.top ?? 0}%`,
                          zIndex: isSelected ? 30 : 10 - idx,
                          animation: `fadeInScale 0.5s ease-out ${idx * 0.08}s both`,
                        }}
                        onMouseEnter={() => setSelectedSize(name)}
                        onMouseLeave={() => setSelectedSize(null)}
                        onClick={() => setSelectedSize(name)}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center">
                          <div
                            className={`text-sm font-bold ${isSelected ? 'text-blue-200' : 'text-slate-100'}`}
                          >
                            {name}
                          </div>
                          <div
                            className={`text-[11px] ${isSelected ? 'text-blue-300' : 'text-slate-300'}`}
                          >
                            {wMm} × {hMm} mm
                          </div>
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>
          ) : (
            <div className="grid auto-rows-[70px] grid-cols-12 gap-4">
              {sortedSizes.map((size, index) => {
                const area = size.width_mm * size.height_mm;
                const isSelected = selectedSize === size.size_name;
                const colSpan = Math.min(
                  12,
                  Math.max(3, Math.round((size.width_mm / maxWidth) * 7) + 2)
                );
                const rowSpan = Math.max(
                  2,
                  Math.round((size.height_mm / maxHeight) * 3) + 1
                );

                return (
                  <div
                    key={size.page_size_id}
                    className={`relative cursor-pointer rounded-xl border-2 px-4 py-3 shadow-sm transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-500/10 shadow-blue-500/30'
                        : 'border-slate-700 bg-slate-800/70 hover:border-blue-400 hover:bg-blue-500/5'
                    } `}
                    style={{
                      animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                      gridColumn: `span ${colSpan} / span ${colSpan}`,
                      gridRow: `span ${rowSpan} / span ${rowSpan}`,
                    }}
                    onMouseEnter={() => setSelectedSize(size.size_name)}
                    onMouseLeave={() => setSelectedSize(null)}
                    onClick={() => setSelectedSize(size.size_name)}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div
                        className={`text-base font-bold md:text-lg ${isSelected ? 'text-blue-200' : 'text-slate-100'}`}
                      >
                        {size.size_name}
                      </div>
                      <div
                        className={`text-xs font-semibold ${isSelected ? 'text-blue-300' : 'text-slate-400'}`}
                      >
                        {(area / 100).toFixed(2)} cm²
                      </div>
                    </div>
                    <div
                      className={`text-sm ${isSelected ? 'text-blue-200' : 'text-slate-300'}`}
                    >
                      {size.width_mm} × {size.height_mm} mm
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Size Details Table */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Chi tiết kích thước
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-white/80">
                    Khổ giấy
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-white/80">
                    Chiều rộng (mm)
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-white/80">
                    Chiều cao (mm)
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-white/80">
                    Diện tích (cm²)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {sortedSizes.map((size, index) => {
                  const area = ((size.width_mm * size.height_mm) / 100).toFixed(
                    2
                  );
                  const isSelected = selectedSize === size.size_name;

                  return (
                    <tr
                      key={size.page_size_id}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-500/20'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5'
                      } `}
                      onMouseEnter={() => setSelectedSize(size.size_name)}
                      onMouseLeave={() => setSelectedSize(null)}
                      style={{
                        animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      <td
                        className={`px-4 py-3 font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}
                      >
                        {size.size_name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                        {size.width_mm}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                        {size.height_mm}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-white/70">
                        {area}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </Modal>
  );
}
