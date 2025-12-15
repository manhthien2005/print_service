// MOCK DATA - Tách riêng để dễ dàng xóa bỏ khi tích hợp API thật
// TODO: Xóa file này khi thay thế bằng dữ liệu API

export type PaymentMethod = 'bank' | 'momo';
export type RechargeStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface RechargePackage {
  id: string;
  name: string;
  amountVnd: number; // Số tiền nạp
  bonusAmountVnd?: number; // Số tiền bonus (nếu có)
  popular?: boolean; // Gói phổ biến
  description?: string;
  isEvent?: boolean; // Gói sự kiện đặc biệt
  eventTheme?: string; // Chủ đề sự kiện (ví dụ: 'christmas', 'new-year')
}

export interface RechargeHistoryItem {
  id: string;
  transactionId: string;
  packageId?: string; // null nếu là custom recharge
  packageName?: string;
  amountVnd: number; // Số tiền nạp
  bonusAmountVnd: number; // Số tiền bonus
  totalAmountVnd: number; // amountVnd + bonusAmountVnd
  paymentMethod: PaymentMethod;
  status: RechargeStatus;
  rechargedAt: string; // ISO string
  completedAt?: string; // ISO string
  notes?: string;
}

export interface RechargeSummary {
  totalRecharges: number;
  totalAmountRecharged: number;
  totalBonusAmount: number;
  totalSpentVnd: number;
}

export const rechargePackagesMock: RechargePackage[] = [
  {
    id: 'pkg-1',
    name: 'Gói Cơ Bản',
    amountVnd: 50000,
    bonusAmountVnd: 0,
    description: 'Phù hợp cho nhu cầu in ít',
  },
  {
    id: 'pkg-2',
    name: 'Gói Tiết Kiệm',
    amountVnd: 100000,
    bonusAmountVnd: 10000, // 10% bonus
    popular: true,
    description: 'Tiết kiệm 10% - Gói được yêu thích',
  },
  {
    id: 'pkg-3',
    name: 'Gói Giáng Sinh',
    amountVnd: 200000,
    bonusAmountVnd: 50000, // 25% bonus (đặc biệt hơn)
    popular: true,
    description: '🎄 Ưu đãi Giáng Sinh - Tiết kiệm 25%',
    isEvent: true,
    eventTheme: 'christmas',
  },
  {
    id: 'pkg-4',
    name: 'Gói Siêu Tiết Kiệm',
    amountVnd: 500000,
    bonusAmountVnd: 150000, // 30% bonus
    description: 'Tiết kiệm 30% - Cho người dùng nhiều',
  },
];

export const rechargeHistoryMock: RechargeHistoryItem[] = [
  {
    id: 'recharge-1',
    transactionId: 'TXN-2025-1201-001',
    packageId: 'pkg-2',
    packageName: 'Gói Tiết Kiệm',
    amountVnd: 100000,
    bonusAmountVnd: 10000,
    totalAmountVnd: 110000,
    paymentMethod: 'momo',
    status: 'completed',
    rechargedAt: '2025-12-01T10:30:00Z',
    completedAt: '2025-12-01T10:31:00Z',
  },
  {
    id: 'recharge-2',
    transactionId: 'TXN-2025-1125-002',
    packageId: undefined,
    packageName: 'Nạp tùy chỉnh',
    amountVnd: 75000,
    bonusAmountVnd: 0,
    totalAmountVnd: 75000,
    paymentMethod: 'bank',
    status: 'completed',
    rechargedAt: '2025-11-25T14:20:00Z',
    completedAt: '2025-11-25T14:25:00Z',
  },
  {
    id: 'recharge-3',
    transactionId: 'TXN-2025-1115-003',
    packageId: 'pkg-3',
    packageName: 'Gói Giáng Sinh',
    amountVnd: 200000,
    bonusAmountVnd: 50000,
    totalAmountVnd: 250000,
    paymentMethod: 'momo',
    status: 'completed',
    rechargedAt: '2025-11-15T09:15:00Z',
    completedAt: '2025-11-15T09:16:00Z',
  },
  {
    id: 'recharge-4',
    transactionId: 'TXN-2025-1105-004',
    packageId: 'pkg-1',
    packageName: 'Gói Cơ Bản',
    amountVnd: 50000,
    bonusAmountVnd: 0,
    totalAmountVnd: 50000,
    paymentMethod: 'bank',
    status: 'failed',
    rechargedAt: '2025-11-05T16:45:00Z',
    notes: 'Giao dịch thất bại do lỗi kết nối',
  },
  {
    id: 'recharge-5',
    transactionId: 'TXN-2025-1028-005',
    packageId: undefined,
    packageName: 'Nạp tùy chỉnh',
    amountVnd: 100000,
    bonusAmountVnd: 0,
    totalAmountVnd: 100000,
    paymentMethod: 'momo',
    status: 'completed',
    rechargedAt: '2025-10-28T11:30:00Z',
    completedAt: '2025-10-28T11:31:00Z',
  },
  {
    id: 'recharge-6',
    transactionId: 'TXN-2025-1020-006',
    packageId: 'pkg-2',
    packageName: 'Gói Tiết Kiệm',
    amountVnd: 100000,
    bonusAmountVnd: 10000,
    totalAmountVnd: 110000,
    paymentMethod: 'bank',
    status: 'completed',
    rechargedAt: '2025-10-20T13:15:00Z',
    completedAt: '2025-10-20T13:20:00Z',
  },
  {
    id: 'recharge-7',
    transactionId: 'TXN-2025-1010-007',
    packageId: 'pkg-4',
    packageName: 'Gói Siêu Tiết Kiệm',
    amountVnd: 500000,
    bonusAmountVnd: 150000,
    totalAmountVnd: 650000,
    paymentMethod: 'momo',
    status: 'pending',
    rechargedAt: '2025-10-10T08:00:00Z',
    notes: 'Đang chờ xác nhận thanh toán',
  },
];

export const rechargeSummaryMock: RechargeSummary = {
  totalRecharges: rechargeHistoryMock.filter(r => r.status === 'completed')
    .length,
  totalAmountRecharged: rechargeHistoryMock
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.amountVnd, 0),
  totalBonusAmount: rechargeHistoryMock
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + (r.bonusAmountVnd || 0), 0),
  totalSpentVnd: rechargeHistoryMock
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.amountVnd, 0),
};

export const paymentMethods = [
  { value: 'bank' as PaymentMethod, label: 'Ngân hàng', icon: '🏦' },
  { value: 'momo' as PaymentMethod, label: 'MoMo', icon: '💳' },
];
