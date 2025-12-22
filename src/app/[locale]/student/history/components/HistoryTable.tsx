import type { PrintHistoryItem, SortColumn, SortDirection } from '../types';
import { HistoryRow } from './HistoryRow';

interface HistoryTableProps {
  items: PrintHistoryItem[];
  onItemClick: (item: PrintHistoryItem) => void;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: Exclude<SortColumn, null>) => void;
}

function SortIcon({
  column,
  currentColumn,
  currentDirection,
}: {
  column: Exclude<SortColumn, null>;
  currentColumn: SortColumn;
  currentDirection: SortDirection;
}) {
  if (currentColumn !== column || !currentDirection) {
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
  }
  return currentDirection === 'asc' ? (
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
}

export function HistoryTable({
  items,
  onItemClick,
  sortColumn,
  sortDirection,
  onSort,
}: HistoryTableProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="hidden grid-cols-12 items-center gap-4 px-1 py-2 text-base font-semibold text-slate-800 dark:text-white md:grid">
        <button
          type="button"
          onClick={() => onSort('document')}
          className="col-span-3 flex items-center gap-2"
        >
          <span>Tài liệu</span>
          <SortIcon
            column="document"
            currentColumn={sortColumn}
            currentDirection={sortDirection}
          />
        </button>
        <button
          type="button"
          onClick={() => onSort('printer')}
          className="col-span-2 flex items-center gap-2"
        >
          <span>Máy in</span>
          <SortIcon
            column="printer"
            currentColumn={sortColumn}
            currentDirection={sortDirection}
          />
        </button>
        <button
          type="button"
          onClick={() => onSort('mode')}
          className="col-span-2 flex items-center gap-2"
        >
          <span>Chế độ</span>
          <SortIcon
            column="mode"
            currentColumn={sortColumn}
            currentDirection={sortDirection}
          />
        </button>
        <button
          type="button"
          onClick={() => onSort('pages')}
          className="col-span-1 flex items-center gap-2"
        >
          <span>Trang</span>
          <SortIcon
            column="pages"
            currentColumn={sortColumn}
            currentDirection={sortDirection}
          />
        </button>
        <button
          type="button"
          onClick={() => onSort('time')}
          className="col-span-2 flex items-center gap-2"
        >
          <span>Thời gian</span>
          <SortIcon
            column="time"
            currentColumn={sortColumn}
            currentDirection={sortDirection}
          />
        </button>
        <button
          type="button"
          onClick={() => onSort('status')}
          className="col-span-2 flex items-center justify-center gap-2 text-center"
        >
          <span>Trạng thái</span>
          <SortIcon
            column="status"
            currentColumn={sortColumn}
            currentDirection={sortDirection}
          />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200/70 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
          Không có dữ liệu phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        items.map(item => (
          <HistoryRow
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
          />
        ))
      )}
    </div>
  );
}
