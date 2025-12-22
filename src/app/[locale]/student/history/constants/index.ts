export const PAGE_SIZE = 10;

export const tagExcludes = [
  '1 mặt',
  '2 mặt',
  'Màu',
  'In màu',
  'In xám',
  'Đen trắng',
];

export const historyStatusFilters = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Thành công', value: 'completed' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Đang chờ', value: 'queued' },
  { label: 'Lỗi', value: 'failed' },
] as const;
