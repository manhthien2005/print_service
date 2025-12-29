'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/common/Skeleton';
import { MockPrinter } from '@/app/[locale]/student/print/types';
import { PrinterLocationModal } from '@/app/[locale]/student/printers/components/PrinterLocationModal';
import { useAvailablePrinters } from '@/app/[locale]/student/print/api';
import { mapAvailablePrintersResponse } from '@/lib/utils/mappers/studentPrintMapper';
import { useAllBuildings, useAllRooms } from '@/lib/api/services/references';

interface Step2ChoosePrinterProps {
  printers?: MockPrinter[]; // Optional, will load from API if not provided
  selectedPrinter: MockPrinter | null;
  onPrinterSelect: (printer: MockPrinter) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2ChoosePrinter({
  printers: propsPrinters,
  selectedPrinter,
  onPrinterSelect,
  onNext,
  onBack,
}: Step2ChoosePrinterProps) {
  const t = useTranslations('student.print.step2');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [supportsColorFilter, setSupportsColorFilter] = useState<
    boolean | undefined
  >(undefined);
  const [supportsDuplexFilter, setSupportsDuplexFilter] = useState<
    boolean | undefined
  >(undefined);
  const [page, setPage] = useState(0);
  const [hoveredPrinterId, setHoveredPrinterId] = useState<string | null>(null);
  const [selectedPrinterForLocation, setSelectedPrinterForLocation] =
    useState<MockPrinter | null>(null);

  // Load buildings and rooms from API to get UUIDs
  const { data: buildingsData } = useAllBuildings();
  const { data: roomsData } = useAllRooms();

  // Map buildings: buildingCode -> buildingId (UUID)
  const buildingMap = useMemo(() => {
    const map = new Map<string, string>(); // buildingCode -> buildingId
    if (buildingsData?.data?.data) {
      buildingsData.data.data.forEach(building => {
        // Map by buildingCode
        if (building.buildingCode) {
          map.set(building.buildingCode, building.buildingId);
        }
      });
    }
    return map;
  }, [buildingsData]);

  // Convert selected building code to UUID
  const selectedBuildingId = useMemo(() => {
    if (selectedBuilding === 'all') return undefined;
    return buildingMap.get(selectedBuilding);
  }, [selectedBuilding, buildingMap]);

  // selectedRoom now stores roomId (UUID) directly, so no conversion needed
  const selectedRoomId = useMemo(() => {
    if (selectedRoom === 'all') return undefined;
    return selectedRoom; // selectedRoom is already roomId (UUID)
  }, [selectedRoom]);

  // Load filtered printers from API
  // Note: Backend keyword search only supports serialNumber, not brand/model/room/building
  const {
    data: printersData,
    isLoading: isLoadingPrinters,
    error: printersError,
  } = useAvailablePrinters({
    keyword: searchQuery.trim() || undefined, // Only use searchQuery for serialNumber search
    buildingId: selectedBuildingId, // Send UUID, not code
    roomId: selectedRoomId, // Send UUID, not code
    supportsColor: supportsColorFilter,
    supportsDuplex: supportsDuplexFilter,
    page,
    limit: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  // Map API response to MockPrinter format for display
  const apiPrinters = useMemo(() => {
    if (printersData?.data?.data) {
      const mapped = mapAvailablePrintersResponse(printersData.data.data);
      // Debug: Log printers data
      if (process.env.NODE_ENV === 'development') {
        console.log('📦 Mapped printers:', mapped.length, mapped);
        console.log('📦 Raw API response:', printersData.data);
      }
      return mapped;
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ No printers data:', printersData);
    }
    return [];
  }, [printersData]);

  // Use API printers if available, otherwise use props printers (for backward compatibility)
  // Type assertion needed because AvailablePrinter is compatible with MockPrinter
  const printers: MockPrinter[] =
    apiPrinters.length > 0
      ? (apiPrinters as MockPrinter[])
      : propsPrinters || [];

  // Extract unique buildings from API data (for dropdown options)
  const buildings = useMemo(() => {
    const buildingSet = new Set<string>();

    // Use buildings from API
    if (buildingsData?.data?.data) {
      buildingsData.data.data.forEach(building => {
        if (building.buildingCode) {
          buildingSet.add(building.buildingCode);
        }
      });
    }

    // Also extract from printers
    printers.forEach(printer => {
      if (printer.building_name) {
        buildingSet.add(printer.building_name);
      }
    });

    return Array.from(buildingSet).sort();
  }, [buildingsData, printers]);

  // Extract rooms from API data with roomId, roomCode, and buildingCode
  // Format: { roomId: string, roomCode: string, buildingCode: string }[]
  // Include buildingCode to differentiate rooms with same code in different buildings
  const rooms = useMemo(() => {
    const roomMap = new Map<
      string,
      { roomId: string; roomCode: string; buildingCode: string }
    >();

    // Use rooms from API
    if (roomsData?.data?.data) {
      roomsData.data.data.forEach(room => {
        if (room.roomId && room.roomCode) {
          roomMap.set(room.roomId, {
            roomId: room.roomId,
            roomCode: room.roomCode,
            buildingCode: room.buildingCode || '',
          });
        }
      });
    }

    return Array.from(roomMap.values()).sort((a, b) => {
      // Sort by buildingCode first, then roomCode
      const buildingCompare = a.buildingCode.localeCompare(b.buildingCode);
      if (buildingCompare !== 0) return buildingCompare;
      return a.roomCode.localeCompare(b.roomCode);
    });
  }, [roomsData]);

  // Sort printers (API already handles filtering by buildingId/roomId)
  const filteredAndSortedPrinters = useMemo(() => {
    // API already filters by buildingId and roomId correctly
    // So we don't need client-side filtering, just sort
    const sorted = [...printers];

    // Sort by status: online -> maintenance -> offline
    const statusOrder = { online: 0, maintenance: 1, offline: 2 };
    sorted.sort((a, b) => {
      const statusDiff =
        (statusOrder[a.status as keyof typeof statusOrder] || 2) -
        (statusOrder[b.status as keyof typeof statusOrder] || 2);
      if (statusDiff !== 0) return statusDiff;
      // If same status, sort by building and room
      const buildingDiff = (a.building_name || '').localeCompare(
        b.building_name || ''
      );
      if (buildingDiff !== 0) return buildingDiff;
      return (a.room_code || '').localeCompare(b.room_code || '');
    });

    return sorted;
  }, [printers]);

  // Get available rooms based on selected building
  // Filter rooms from API data by buildingId
  // Returns array of { roomId, roomCode, buildingCode } objects
  const availableRooms = useMemo(() => {
    if (selectedBuilding === 'all') return rooms;

    const roomMap = new Map<
      string,
      { roomId: string; roomCode: string; buildingCode: string }
    >();

    // Get buildingId for selected building
    const buildingId = buildingMap.get(selectedBuilding);

    // Filter rooms by buildingId from API data
    if (buildingId && roomsData?.data?.data) {
      roomsData.data.data
        .filter(room => room.buildingId === buildingId)
        .forEach(room => {
          if (room.roomId && room.roomCode) {
            roomMap.set(room.roomId, {
              roomId: room.roomId,
              roomCode: room.roomCode,
              buildingCode: room.buildingCode || '',
            });
          }
        });
    }

    return Array.from(roomMap.values()).sort((a, b) =>
      a.roomCode.localeCompare(b.roomCode)
    );
  }, [selectedBuilding, buildingMap, roomsData, rooms]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'; // Status indicator - keep specific color
      case 'offline':
        return 'bg-destructive';
      case 'maintenance':
        return 'bg-yellow-500'; // Warning color - keep specific
      default:
        return 'bg-muted';
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
        return t('unknown');
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
            className="w-full rounded-lg border border-slate-200 bg-background px-4 py-3 pl-10 text-foreground placeholder-muted-foreground focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400/30 dark:border-white/10 dark:bg-background dark:text-foreground dark:placeholder-muted-foreground dark:focus:border-blue-400"
          />
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
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
            <label className="dark:text-foreground/80 mb-2 block text-sm font-medium text-foreground">
              {t('building')}
            </label>
            <Select
              value={selectedBuilding}
              onChange={e => {
                setSelectedBuilding(e.target.value);
                setSelectedRoom('all'); // Reset room when building changes
                setPage(0); // Reset to first page
              }}
              isLoading={isLoadingPrinters && printers.length === 0}
              disabled={isLoadingPrinters && printers.length === 0}
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
            <label className="dark:text-foreground/80 mb-2 block text-sm font-medium text-foreground">
              {t('room')}
            </label>
            <Select
              value={selectedRoom}
              onChange={e => {
                setSelectedRoom(e.target.value);
                setPage(0); // Reset to first page
              }}
              isLoading={isLoadingPrinters && printers.length === 0}
              disabled={
                isLoadingPrinters && printers.length === 0
                  ? true
                  : selectedBuilding !== 'all' && availableRooms.length === 0
              }
            >
              <option value="all">{t('allRooms')}</option>
              {availableRooms.map(room => (
                <option key={room.roomId} value={room.roomId}>
                  {selectedBuilding === 'all'
                    ? `${room.roomCode} (${room.buildingCode})`
                    : room.roomCode}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Feature Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="dark:text-foreground/80 mb-2 block text-sm font-medium text-foreground">
              {t('supportsColor')}
            </label>
            <Select
              value={
                supportsColorFilter === undefined
                  ? 'all'
                  : supportsColorFilter
                    ? 'true'
                    : 'false'
              }
              onChange={e => {
                const value =
                  e.target.value === 'all'
                    ? undefined
                    : e.target.value === 'true';
                setSupportsColorFilter(value);
                setPage(0);
              }}
              isLoading={isLoadingPrinters && printers.length === 0}
              disabled={isLoadingPrinters && printers.length === 0}
            >
              <option value="all">{t('all')}</option>
              <option value="true">{t('yes')}</option>
              <option value="false">{t('no')}</option>
            </Select>
          </div>
          <div>
            <label className="dark:text-foreground/80 mb-2 block text-sm font-medium text-foreground">
              {t('supportsDuplex')}
            </label>
            <Select
              value={
                supportsDuplexFilter === undefined
                  ? 'all'
                  : supportsDuplexFilter
                    ? 'true'
                    : 'false'
              }
              onChange={e => {
                const value =
                  e.target.value === 'all'
                    ? undefined
                    : e.target.value === 'true';
                setSupportsDuplexFilter(value);
                setPage(0);
              }}
              isLoading={isLoadingPrinters && printers.length === 0}
              disabled={isLoadingPrinters && printers.length === 0}
            >
              <option value="all">{t('all')}</option>
              <option value="true">{t('yes')}</option>
              <option value="false">{t('no')}</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Printer List Skeleton Loading */}
      {isLoadingPrinters && printers.length === 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div
              key={i}
              className="dark:bg-background/5 group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-background p-5 dark:border-white/10"
            >
              {/* Header skeleton */}
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Skeleton className="mb-2 h-5 w-3/4" variant="shimmer" />
                  <Skeleton className="h-4 w-1/2" variant="shimmer" />
                </div>
                <Skeleton className="h-3 w-3 rounded-full" variant="shimmer" />
              </div>

              {/* Location skeleton */}
              <div className="mb-3 flex items-center gap-2">
                <Skeleton className="h-4 w-4" variant="shimmer" />
                <Skeleton className="h-4 w-24" variant="shimmer" />
              </div>

              {/* Features tags skeleton */}
              <div className="mt-auto flex flex-wrap gap-2">
                <Skeleton className="h-6 w-16 rounded-lg" variant="shimmer" />
                <Skeleton className="h-6 w-16 rounded-lg" variant="shimmer" />
                <Skeleton className="h-6 w-24 rounded-lg" variant="shimmer" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {printersError && !isLoadingPrinters && (
        <div className="border-destructive/30 bg-destructive/10 dark:border-destructive/30 dark:bg-destructive/10 rounded-lg border p-4">
          <p className="text-sm text-destructive dark:text-destructive">
            {(printersError as any)?.response?.data?.message ||
              (printersError as any)?.message ||
              t('errors.loadPrintersFailed')}
          </p>
        </div>
      )}

      {/* Results count + Pagination */}
      {!isLoadingPrinters &&
        !printersError &&
        filteredAndSortedPrinters.length > 0 && (
          <div className="flex flex-col items-start justify-between gap-3 text-sm text-muted-foreground dark:text-muted-foreground md:flex-row md:items-center">
            <div>
              {t('found')}{' '}
              <span className="font-semibold text-primary dark:text-primary">
                {printersData?.data?.pagination?.totalItems ||
                  filteredAndSortedPrinters.length}
              </span>{' '}
              {t('printers')}
            </div>

            {printersData?.data?.pagination &&
              printersData.data.pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="h-8 w-8 rounded-full p-0 transition-transform duration-150 hover:scale-[1.02]"
                    aria-label={t('pageInfo', {
                      page: page + 1,
                      total: printersData.data.pagination.totalPages,
                    })}
                  >
                    <span className="text-base">&lt;</span>
                  </Button>
                  <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                    {t('pageInfo', {
                      page: page + 1,
                      total: printersData.data.pagination.totalPages,
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage(p =>
                        Math.min(
                          printersData.data.pagination.totalPages - 1,
                          p + 1
                        )
                      )
                    }
                    disabled={
                      page >= printersData.data.pagination.totalPages - 1
                    }
                    className="h-8 w-8 rounded-full p-0 transition-transform duration-150 hover:scale-[1.02]"
                    aria-label={t('next')}
                  >
                    <span className="text-base">&gt;</span>
                  </Button>
                </div>
              )}
          </div>
        )}

      {/* Printer List */}
      {!isLoadingPrinters && !printersError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredAndSortedPrinters.map((printer, index) => {
            const isSelected =
              selectedPrinter?.printer_id === printer.printer_id;
            const isDisabled =
              !printer.is_enabled || printer.status !== 'online';

            return (
              <button
                key={printer.printer_id}
                onClick={() => !isDisabled && onPrinterSelect(printer)}
                onMouseEnter={() => setHoveredPrinterId(printer.printer_id)}
                onMouseLeave={() => setHoveredPrinterId(null)}
                disabled={isDisabled}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-xl border p-5 text-left transition-all duration-300',
                  'animate-in fade-in slide-in-from-bottom-2',
                  isSelected
                    ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl shadow-blue-500/20 ring-1 ring-blue-300/30 dark:border-blue-400/50 dark:from-blue-500/20 dark:to-blue-500/10'
                    : 'dark:bg-background/5 dark:hover:to-background/5 border-slate-200 bg-background hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-background hover:shadow-lg dark:border-white/10 dark:hover:border-blue-400/50 dark:hover:from-blue-500/10',
                  isDisabled &&
                    'cursor-not-allowed opacity-50 hover:border-slate-200 hover:shadow-none dark:hover:border-white/10'
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Animated background gradient */}
                {!isDisabled && (
                  <div className="from-primary/0 via-primary/5 to-primary/0 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                )}

                {/* Header: Printer Name and Status/Selection Icon */}
                <div className="relative z-10 mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="line-clamp-2 text-base font-bold text-foreground transition-colors group-hover:text-primary dark:text-foreground dark:group-hover:text-primary">
                      {printer.brand_name} {printer.model_name}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground">
                      {t('serial')}:{' '}
                      <span className="font-mono font-medium">
                        {printer.serial_number}
                      </span>
                    </p>
                  </div>
                  {/* Status Icon or Selection Icon (top right) */}
                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <div className="to-primary/90 ring-primary/30 dark:ring-primary/50 rounded-full bg-gradient-to-br from-primary p-1.5 shadow-lg ring-2">
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
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/30 dark:text-blue-200 dark:hover:bg-blue-500/40"
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
                      {t('viewLocation')}
                    </Button>
                  </div>
                )}

                {/* Location */}
                <div className="relative z-10 mb-3 flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
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
                    {t('maxPaperSize', { size: printer.max_paper_size })}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {filteredAndSortedPrinters.length === 0 &&
        !isLoadingPrinters &&
        !printersError && (
          <div className="dark:bg-muted/5 rounded-lg border border-border bg-muted p-8 text-center dark:border-border">
            <svg
              className="dark:text-muted-foreground/40 mx-auto h-12 w-12 text-muted-foreground"
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
            <p className="mt-4 text-muted-foreground dark:text-muted-foreground">
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
          variant="outline"
          onClick={onNext}
          disabled={!selectedPrinter}
          className="min-w-32 transition-transform duration-150 hover:scale-[1.01]"
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
