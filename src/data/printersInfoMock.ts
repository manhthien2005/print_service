// MOCK DATA - Tách riêng để dễ dàng gỡ bỏ khi tích hợp API thật
// TODO: Xóa file này khi đã kết nối API máy in thật

export type PrinterStatus = 'online' | 'busy' | 'offline' | 'maintenance';

export interface PrinterInfoMock {
  id: string;
  name: string;
  brand: string;
  model: string;
  building: string;
  room: string;
  floor: string;
  status: PrinterStatus;
  queueLength: number;
  uptime: number;
  supportsColor: boolean;
  supportsDuplex: boolean;
  maxPaperSize: 'A3' | 'A4';
  lastActive: string;
  ipAddress: string;
  serial: string;
  paperLevels: { size: 'A3' | 'A4'; level: number }[];
  tags?: string[];
  note?: string;
}

export interface PrinterInfoSummary {
  total: number;
  online: number;
  busy: number;
  offline: number;
  maintenance: number;
  avgQueue: number;
}

export interface PrinterNotice {
  id: string;
  title: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
  actionLabel?: string;
}

const basePrinters: PrinterInfoMock[] = [
  {
    id: 'p-01',
    name: 'HP 4100 • R305',
    brand: 'HP',
    model: 'LaserJet Pro 4100',
    building: 'Tòa nhà A',
    room: 'R305',
    floor: 'Tầng 3',
    status: 'online',
    queueLength: 2,
    uptime: 98,
    supportsColor: false,
    supportsDuplex: true,
    maxPaperSize: 'A4',
    lastActive: '3 phút trước',
    ipAddress: '10.10.3.21',
    serial: 'HP-4100-001',
    paperLevels: [
      { size: 'A4', level: 76 },
      { size: 'A3', level: 0 },
    ],
    tags: ['ưu tiên'],
    note: 'Cấu hình cho lớp 9h - 11h',
  },
  {
    id: 'p-02',
    name: 'Canon G5500 • R402',
    brand: 'Canon',
    model: 'PIXMA G5500',
    building: 'Tòa nhà B',
    room: 'R402',
    floor: 'Tầng 4',
    status: 'busy',
    queueLength: 6,
    uptime: 94,
    supportsColor: true,
    supportsDuplex: true,
    maxPaperSize: 'A3',
    lastActive: 'Đang in 4/12 trang',
    ipAddress: '10.10.4.12',
    serial: 'CANON-5500-002',
    paperLevels: [
      { size: 'A4', level: 64 },
      { size: 'A3', level: 52 },
    ],
    tags: ['in màu', 'hỗ trợ đồ họa'],
  },
  {
    id: 'p-03',
    name: 'Epson L8500 • R201',
    brand: 'Epson',
    model: 'EcoTank L8500',
    building: 'Tòa nhà A',
    room: 'R201',
    floor: 'Tầng 2',
    status: 'online',
    queueLength: 1,
    uptime: 97,
    supportsColor: true,
    supportsDuplex: false,
    maxPaperSize: 'A4',
    lastActive: '12 phút trước',
    ipAddress: '10.10.2.9',
    serial: 'EPSON-8500-003',
    paperLevels: [
      { size: 'A4', level: 58 },
      { size: 'A3', level: 0 },
    ],
    tags: ['ảnh', 'không 2 mặt'],
  },
  {
    id: 'p-04',
    name: 'HP 4100 • R108',
    brand: 'HP',
    model: 'LaserJet Pro 4100',
    building: 'Tòa nhà A',
    room: 'R108',
    floor: 'Tầng 1',
    status: 'maintenance',
    queueLength: 0,
    uptime: 82,
    supportsColor: false,
    supportsDuplex: true,
    maxPaperSize: 'A4',
    lastActive: 'Hôm qua',
    ipAddress: '10.10.1.14',
    serial: 'HP-4100-004',
    paperLevels: [
      { size: 'A4', level: 34 },
      { size: 'A3', level: 0 },
    ],
    note: 'Chờ thay trục kéo giấy',
  },
  {
    id: 'p-05',
    name: 'Brother 8500 • R501',
    brand: 'Brother',
    model: 'HL-L8500CDW',
    building: 'Tòa nhà C',
    room: 'R501',
    floor: 'Tầng 5',
    status: 'offline',
    queueLength: 0,
    uptime: 0,
    supportsColor: true,
    supportsDuplex: true,
    maxPaperSize: 'A3',
    lastActive: 'Tắt nguồn',
    ipAddress: '10.10.5.3',
    serial: 'BROTHER-8500-005',
    paperLevels: [
      { size: 'A4', level: 12 },
      { size: 'A3', level: 8 },
    ],
    tags: ['ưu tiên đồ họa'],
    note: 'Chờ bật nguồn bởi kỹ thuật',
  },
  {
    id: 'p-06',
    name: 'Ricoh IM C3000 • R210',
    brand: 'Ricoh',
    model: 'IM C3000',
    building: 'Tòa nhà B',
    room: 'R210',
    floor: 'Tầng 2',
    status: 'online',
    queueLength: 0,
    uptime: 96,
    supportsColor: true,
    supportsDuplex: true,
    maxPaperSize: 'A3',
    lastActive: '5 phút trước',
    ipAddress: '10.10.2.33',
    serial: 'RICOH-C3000-006',
    paperLevels: [
      { size: 'A4', level: 81 },
      { size: 'A3', level: 72 },
    ],
    tags: ['scan', 'in nhanh'],
  },
  {
    id: 'p-07',
    name: 'Xerox B235 • R112',
    brand: 'Xerox',
    model: 'B235',
    building: 'Tòa nhà A',
    room: 'R112',
    floor: 'Tầng 1',
    status: 'busy',
    queueLength: 3,
    uptime: 92,
    supportsColor: false,
    supportsDuplex: true,
    maxPaperSize: 'A4',
    lastActive: 'Đang in 18/40 trang',
    ipAddress: '10.10.1.24',
    serial: 'XEROX-B235-007',
    paperLevels: [
      { size: 'A4', level: 44 },
      { size: 'A3', level: 0 },
    ],
    tags: ['ưu tiên tài liệu thi'],
  },
  {
    id: 'p-08',
    name: 'HP PageWide • R602',
    brand: 'HP',
    model: 'PageWide Pro 577dw',
    building: 'Tòa nhà D',
    room: 'R602',
    floor: 'Tầng 6',
    status: 'online',
    queueLength: 0,
    uptime: 99,
    supportsColor: true,
    supportsDuplex: true,
    maxPaperSize: 'A4',
    lastActive: 'Vừa sẵn sàng',
    ipAddress: '10.10.6.11',
    serial: 'HP-PAGEWIDE-008',
    paperLevels: [
      { size: 'A4', level: 88 },
      { size: 'A3', level: 0 },
    ],
    tags: ['ưu tiên khoa CNTT'],
  },
];

export const printerInfoList = basePrinters;

export const printerInfoSummary: PrinterInfoSummary = basePrinters.reduce(
  (acc, printer) => {
    acc.total += 1;
    acc.avgQueue += printer.queueLength;

    switch (printer.status) {
      case 'online':
        acc.online += 1;
        break;
      case 'busy':
        acc.busy += 1;
        break;
      case 'offline':
        acc.offline += 1;
        break;
      case 'maintenance':
        acc.maintenance += 1;
        break;
      default:
        break;
    }

    return acc;
  },
  {
    total: 0,
    online: 0,
    busy: 0,
    offline: 0,
    maintenance: 0,
    avgQueue: 0,
  } satisfies PrinterInfoSummary
);

printerInfoSummary.avgQueue = Math.round(
  printerInfoSummary.avgQueue / Math.max(printerInfoSummary.total, 1)
);

export const printerNotices: PrinterNotice[] = [
  {
    id: 'notice-01',
    title: 'R108 tạm ngưng để thay trục kéo giấy',
    detail: 'Ưu tiên chuyển job sang R305 hoặc R210.',
    severity: 'warning',
    actionLabel: 'Chuyển job',
  },
  {
    id: 'notice-02',
    title: 'R402 đang có hàng đợi dài',
    detail: 'Cân nhắc sử dụng máy Ricoh R210 (A3, in màu).',
    severity: 'info',
    actionLabel: 'Xem hướng dẫn',
  },
  {
    id: 'notice-03',
    title: 'Kiểm tra nguồn R501',
    detail: 'Máy offline, liên hệ kỹ thuật trước khi dùng.',
    severity: 'critical',
    actionLabel: 'Liên hệ',
  },
];
