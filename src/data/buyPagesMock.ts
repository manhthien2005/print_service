// MOCK DATA - Tách riêng để dễ dàng xóa bỏ khi tích hợp API thật
// TODO: Xóa file này khi thay thế bằng dữ liệu API

export type PaymentMethod = 'bank' | 'momo';
export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface PagePackage {
  id: string;
  name: string;
  pages: number;
  bonusPages: number; // Số trang bonus (%)
  priceVnd: number;
  popular?: boolean; // Gói phổ biến
  description?: string;
}

export interface PurchaseHistoryItem {
  id: string;
  transactionId: string;
  packageId?: string; // null nếu là custom purchase
  packageName?: string;
  pages: number;
  bonusPages: number;
  totalPages: number; // pages + bonusPages
  priceVnd: number;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  purchasedAt: string; // ISO string
  completedAt?: string; // ISO string
  notes?: string;
}

export interface PurchaseSummary {
  totalPurchases: number;
  totalPagesPurchased: number;
  totalBonusPages: number;
  totalSpentVnd: number;
}

export const pagePackagesMock: PagePackage[] = [
  {
    id: 'pkg-1',
    name: 'Gói Cơ Bản',
    pages: 100,
    bonusPages: 0,
    priceVnd: 50000,
    description: 'Phù hợp cho nhu cầu in ít',
  },
  {
    id: 'pkg-2',
    name: 'Gói Tiết Kiệm',
    pages: 500,
    bonusPages: 50, // 10% bonus
    priceVnd: 200000,
    popular: true,
    description: 'Tiết kiệm 10% - Gói được yêu thích',
  },
  {
    id: 'pkg-3',
    name: 'Gói Ưu Đãi',
    pages: 1000,
    bonusPages: 200, // 20% bonus
    priceVnd: 350000,
    popular: true,
    description: 'Tiết kiệm 20% - Giá tốt nhất',
  },
  {
    id: 'pkg-4',
    name: 'Gói Siêu Tiết Kiệm',
    pages: 2000,
    bonusPages: 600, // 30% bonus
    priceVnd: 600000,
    description: 'Tiết kiệm 30% - Cho người dùng nhiều',
  },
];

export const purchaseHistoryMock: PurchaseHistoryItem[] = [
  {
    id: 'purchase-1',
    transactionId: 'TXN-2025-1201-001',
    packageId: 'pkg-2',
    packageName: 'Gói Tiết Kiệm',
    pages: 500,
    bonusPages: 50,
    totalPages: 550,
    priceVnd: 200000,
    paymentMethod: 'momo',
    status: 'completed',
    purchasedAt: '2025-12-01T10:30:00Z',
    completedAt: '2025-12-01T10:31:00Z',
  },
  {
    id: 'purchase-2',
    transactionId: 'TXN-2025-1125-002',
    packageId: undefined,
    packageName: 'Mua tùy chỉnh',
    pages: 150,
    bonusPages: 0,
    totalPages: 150,
    priceVnd: 75000,
    paymentMethod: 'bank',
    status: 'completed',
    purchasedAt: '2025-11-25T14:20:00Z',
    completedAt: '2025-11-25T14:25:00Z',
  },
  {
    id: 'purchase-3',
    transactionId: 'TXN-2025-1115-003',
    packageId: 'pkg-3',
    packageName: 'Gói Ưu Đãi',
    pages: 1000,
    bonusPages: 200,
    totalPages: 1200,
    priceVnd: 350000,
    paymentMethod: 'momo',
    status: 'completed',
    purchasedAt: '2025-11-15T09:15:00Z',
    completedAt: '2025-11-15T09:16:00Z',
  },
  {
    id: 'purchase-4',
    transactionId: 'TXN-2025-1105-004',
    packageId: 'pkg-1',
    packageName: 'Gói Cơ Bản',
    pages: 100,
    bonusPages: 0,
    totalPages: 100,
    priceVnd: 50000,
    paymentMethod: 'bank',
    status: 'failed',
    purchasedAt: '2025-11-05T16:45:00Z',
    notes: 'Giao dịch thất bại do lỗi kết nối',
  },
  {
    id: 'purchase-5',
    transactionId: 'TXN-2025-1028-005',
    packageId: undefined,
    packageName: 'Mua tùy chỉnh',
    pages: 200,
    bonusPages: 0,
    totalPages: 200,
    priceVnd: 100000,
    paymentMethod: 'momo',
    status: 'completed',
    purchasedAt: '2025-10-28T11:30:00Z',
    completedAt: '2025-10-28T11:31:00Z',
  },
  {
    id: 'purchase-6',
    transactionId: 'TXN-2025-1020-006',
    packageId: 'pkg-2',
    packageName: 'Gói Tiết Kiệm',
    pages: 500,
    bonusPages: 50,
    totalPages: 550,
    priceVnd: 200000,
    paymentMethod: 'bank',
    status: 'completed',
    purchasedAt: '2025-10-20T13:15:00Z',
    completedAt: '2025-10-20T13:20:00Z',
  },
  {
    id: 'purchase-7',
    transactionId: 'TXN-2025-1010-007',
    packageId: 'pkg-4',
    packageName: 'Gói Siêu Tiết Kiệm',
    pages: 2000,
    bonusPages: 600,
    totalPages: 2600,
    priceVnd: 600000,
    paymentMethod: 'momo',
    status: 'pending',
    purchasedAt: '2025-10-10T08:00:00Z',
    notes: 'Đang chờ xác nhận thanh toán',
  },
];

export const purchaseSummaryMock: PurchaseSummary = {
  totalPurchases: purchaseHistoryMock.filter(p => p.status === 'completed')
    .length,
  totalPagesPurchased: purchaseHistoryMock
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.pages, 0),
  totalBonusPages: purchaseHistoryMock
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.bonusPages, 0),
  totalSpentVnd: purchaseHistoryMock
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.priceVnd, 0),
};

export const paymentMethods = [
  { value: 'bank' as PaymentMethod, label: 'Ngân hàng', icon: '🏦' },
  { value: 'momo' as PaymentMethod, label: 'MoMo', icon: '💳' },
];
