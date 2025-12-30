export const STATUS_STYLES = {
  completed: {
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-200',
    dot: 'bg-emerald-400',
  },
  pending: {
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-200',
    dot: 'bg-amber-400',
  },
  failed: {
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-200',
    dot: 'bg-rose-400',
  },
  cancelled: {
    className: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  queued: {
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-200',
    dot: 'bg-blue-400',
  },
  printing: {
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-200',
    dot: 'bg-purple-400',
  },
};

// Quick actions for dashboard
export interface StudentQuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export const studentQuickActionsMock: StudentQuickAction[] = [
  {
    id: 'print',
    title: 'In tài liệu',
    description: 'Tải file và gửi lệnh in ngay',
    href: '/student/print',
    badge: 'Mới',
  },
  {
    id: 'buy',
    title: 'Nạp tiền',
    description: 'Nạp tiền vào tài khoản bằng ví hoặc thẻ',
    href: '/student/buy-pages',
  },
  {
    id: 'history',
    title: 'Lịch sử in',
    description: 'Theo dõi trạng thái và chi phí',
    href: '/student/history',
  },
  {
    id: 'printers',
    title: 'Máy in gần bạn',
    description: 'Xem máy in online theo tòa nhà',
    href: '/student/printers',
  },
];

// Recent prints mock data (TODO: Replace with API data)
export interface StudentPrintHistoryItem {
  id: string;
  fileName: string;
  printer: string;
  size: 'A3' | 'A4' | 'A5';
  pagesUsedA4: number;
  timeAgo: string;
  status: 'completed' | 'pending' | 'failed';
}

export const studentRecentPrintsMock: StudentPrintHistoryItem[] = [
  {
    id: 'ph-01',
    fileName: 'BaoCao_TotNghiep.pdf',
    printer: 'HP 4100 • R305',
    size: 'A4',
    pagesUsedA4: 32,
    timeAgo: '15 phút trước',
    status: 'completed',
  },
  {
    id: 'ph-02',
    fileName: 'Slide-BaoVe.pptx',
    printer: 'Canon G5500 • R402',
    size: 'A3',
    pagesUsedA4: 8,
    timeAgo: '2 giờ trước',
    status: 'completed',
  },
  {
    id: 'ph-03',
    fileName: 'HoSoThucTap.docx',
    printer: 'Epson L8500 • R201',
    size: 'A5',
    pagesUsedA4: 6,
    timeAgo: 'Hôm qua',
    status: 'pending',
  },
];
