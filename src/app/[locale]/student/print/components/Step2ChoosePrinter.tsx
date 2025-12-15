'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { MockPrinter } from '@/data/printMock';
import { PrinterLocationModal } from '../../printers/components/PrinterLocationModal';

interface Step2ChoosePrinterProps {
  printers: MockPrinter[];
  selectedPrinter: MockPrinter | null;
  onPrinterSelect: (printer: MockPrinter) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2ChoosePrinter({
  printers,
  selectedPrinter,
  onPrinterSelect,
  onNext,
  onBack,
}: Step2ChoosePrinterProps) {
  const t = useTranslations('student.print.step2');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [hoveredPrinterId, setHoveredPrinterId] = useState<string | null>(null);
  const [selectedPrinterForLocation, setSelectedPrinterForLocation] =
    useState<MockPrinter | null>(null);

  // Extract unique buildings and rooms
  const { buildings, rooms } = useMemo(() => {
    const buildingSet = new Set<string>();
    const roomSet = new Set<string>();

    printers.forEach(printer => {
      buildingSet.add(printer.building_name);
      roomSet.add(printer.room_code);
    });

    return {
      buildings: Array.from(buildingSet).sort(),
      rooms: Array.from(roomSet).sort(),
    };
  }, [printers]);

  // Filter and sort printers
  const filteredAndSortedPrinters = useMemo(() => {
    const filtered = printers.filter(printer => {
      // Search filter
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        printer.serial_number.toLowerCase().includes(query) ||
        printer.brand_name.toLowerCase().includes(query) ||
        printer.model_name.toLowerCase().includes(query) ||
        printer.room_code.toLowerCase().includes(query) ||
        printer.building_name.toLowerCase().includes(query);

      // Building filter
      const matchesBuilding =
        selectedBuilding === 'all' ||
        printer.building_name === selectedBuilding;

      // Room filter
      const matchesRoom =
        selectedRoom === 'all' || printer.room_code === selectedRoom;

      return matchesSearch && matchesBuilding && matchesRoom;
    });

    // Sort by status: online -> maintenance -> offline
    const statusOrder = { online: 0, maintenance: 1, offline: 2 };
    filtered.sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      // If same status, sort by building and room
      const buildingDiff = a.building_name.localeCompare(b.building_name);
      if (buildingDiff !== 0) return buildingDiff;
      return a.room_code.localeCompare(b.room_code);
    });

    return filtered;
  }, [printers, searchQuery, selectedBuilding, selectedRoom]);

  // Get available rooms based on selected building
  const availableRooms = useMemo(() => {
    if (selectedBuilding === 'all') return rooms;
    return printers
      .filter(p => p.building_name === selectedBuilding)
      .map(p => p.room_code)
      .filter((room, index, self) => self.indexOf(room) === index)
      .sort();
  }, [printers, selectedBuilding, rooms]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-yellow-500';
      default:
        return 'bg-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return t('status.online');
      case 'offline':
        return t('status.offline');
      case 'maintenance':
        return t('status.maintenance');
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          {t('title')}
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
          {t('description')}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pl-10 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder-white/40 dark:focus:border-blue-400"
          />
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Building and Room Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
              {t('building')}
            </label>
            <Select
              value={selectedBuilding}
              onChange={e => {
                setSelectedBuilding(e.target.value);
                setSelectedRoom('all'); // Reset room when building changes
              }}
            >
              <option value="all">{t('allBuildings')}</option>
              {buildings.map(building => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
              {t('room')}
            </label>
            <Select
              value={selectedRoom}
              onChange={e => setSelectedRoom(e.target.value)}
              disabled={
                selectedBuilding !== 'all' && availableRooms.length === 0
              }
            >
              <option value="all">{t('allRooms')}</option>
              {availableRooms.map(room => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {filteredAndSortedPrinters.length > 0 && (
        <div className="text-sm text-slate-600 dark:text-white/70">
          {t('found')}{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {filteredAndSortedPrinters.length}
          </span>{' '}
          {t('printers')}
        </div>
      )}

      {/* Printer List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredAndSortedPrinters.map((printer, index) => {
          const isSelected = selectedPrinter?.printer_id === printer.printer_id;
          const isDisabled = !printer.is_enabled || printer.status !== 'online';

          return (
            <button
              key={printer.printer_id}
              onClick={() => !isDisabled && onPrinterSelect(printer)}
              onMouseEnter={() => setHoveredPrinterId(printer.printer_id)}
              onMouseLeave={() => setHoveredPrinterId(null)}
              disabled={isDisabled}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-xl border-2 p-5 text-left transition-all duration-300',
                'animate-in fade-in slide-in-from-bottom-2',
                isSelected
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/30 dark:from-blue-500/20 dark:to-blue-500/10'
                  : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-white hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-400/50 dark:hover:from-blue-500/10 dark:hover:to-white/5',
                isDisabled &&
                  'cursor-not-allowed opacity-50 hover:border-slate-200 hover:shadow-none dark:hover:border-white/10'
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Animated background gradient */}
              {!isDisabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              )}

              {/* Header: Printer Name and Status/Selection Icon */}
              <div className="relative z-10 mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-2 text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {printer.brand_name} {printer.model_name}
                  </h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-white/60">
                    Serial:{' '}
                    <span className="font-mono font-medium">
                      {printer.serial_number}
                    </span>
                  </p>
                </div>
                {/* Status Icon or Selection Icon (top right) */}
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 shadow-lg ring-2 ring-blue-300 dark:ring-blue-500/50">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'h-3 w-3 rounded-full shadow-sm ring-2 ring-white',
                        getStatusColor(printer.status),
                        printer.status === 'online' && 'animate-pulse'
                      )}
                      title={getStatusLabel(printer.status)}
                    />
                  )}
                </div>
              </div>

              {/* Hover Button - Xem Vị Trí */}
              {hoveredPrinterId === printer.printer_id && !isDisabled && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm transition-all duration-300">
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedPrinterForLocation(printer);
                    }}
                    className="bg-white text-slate-900 hover:bg-blue-50 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Xem Vị Trí
                  </Button>
                </div>
              )}

              {/* Location */}
              <div className="relative z-10 mb-3 flex items-center gap-2 text-sm text-slate-600 dark:text-white/70">
                <svg
                  className="h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="truncate font-medium">
                  {printer.building_name} - {printer.room_code}
                </span>
              </div>

              {/* Features Tags - Larger */}
              <div className="relative z-10 mt-auto flex flex-wrap gap-2">
                {printer.supports_color && (
                  <span className="inline-flex items-center rounded-lg bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700 shadow-sm dark:bg-purple-500/20 dark:text-purple-300">
                    {t('features.color')}
                  </span>
                )}
                {printer.supports_duplex && (
                  <span className="inline-flex items-center rounded-lg bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 shadow-sm dark:bg-green-500/20 dark:text-green-300">
                    {t('features.duplex')}
                  </span>
                )}
                <span className="inline-flex items-center rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm dark:bg-blue-500/20 dark:text-blue-300">
                  Khổ tối đa: {printer.max_paper_size}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredAndSortedPrinters.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
          <svg
            className="mx-auto h-12 w-12 text-slate-400 dark:text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-slate-600 dark:text-white/70">
            {t('noResults')}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('back')}
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedPrinter}
          className="min-w-32"
        >
          {t('next')}
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>

      {/* Printer Location Modal */}
      <PrinterLocationModal
        isOpen={selectedPrinterForLocation !== null}
        onClose={() => setSelectedPrinterForLocation(null)}
        printer={selectedPrinterForLocation}
      />
    </div>
  );
}
