// MOCK DATA - Tách riêng để dễ dàng xóa bỏ khi tích hợp API
// TODO: Xóa file này khi tích hợp API thật

export interface UploadedFileItem {
  id: string;
  file_name: string;
  file_type: string;
  file_size_kb: number;
  uploaded_at: string;
  page_count?: number;
  last_printed_at?: string;
  print_count: number;
}

export const uploadedFilesMock: UploadedFileItem[] = [
  {
    id: '1',
    file_name: 'BaiTapToan.pdf',
    file_type: 'application/pdf',
    file_size_kb: 245,
    uploaded_at: '2024-11-25T10:30:00Z',
    page_count: 15,
    last_printed_at: '2024-11-25T14:20:00Z',
    print_count: 2,
  },
  {
    id: '2',
    file_name: 'BaoCaoThucTap.docx',
    file_type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size_kb: 512,
    uploaded_at: '2024-11-24T09:15:00Z',
    page_count: 25,
    last_printed_at: '2024-11-24T16:45:00Z',
    print_count: 1,
  },
  {
    id: '3',
    file_name: 'SlideThuyetTrinh.pptx',
    file_type:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    file_size_kb: 1024,
    uploaded_at: '2024-11-23T13:20:00Z',
    page_count: 30,
    print_count: 0,
  },
  {
    id: '4',
    file_name: 'BangDiem.xlsx',
    file_type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    file_size_kb: 128,
    uploaded_at: '2024-11-22T11:00:00Z',
    page_count: 5,
    last_printed_at: '2024-11-22T11:30:00Z',
    print_count: 3,
  },
  {
    id: '5',
    file_name: 'DeThiCuoiKy.pdf',
    file_type: 'application/pdf',
    file_size_kb: 890,
    uploaded_at: '2024-11-21T08:45:00Z',
    page_count: 40,
    last_printed_at: '2024-11-21T15:10:00Z',
    print_count: 1,
  },
  {
    id: '6',
    file_name: 'GhiChuBaiGiang.pdf',
    file_type: 'application/pdf',
    file_size_kb: 156,
    uploaded_at: '2024-11-20T14:30:00Z',
    page_count: 8,
    print_count: 0,
  },
  {
    id: '7',
    file_name: 'BaiTapLapTrinh.docx',
    file_type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size_kb: 320,
    uploaded_at: '2024-11-19T10:20:00Z',
    page_count: 12,
    last_printed_at: '2024-11-19T17:00:00Z',
    print_count: 2,
  },
  {
    id: '8',
    file_name: 'ThuyetMinhDoAn.pdf',
    file_type: 'application/pdf',
    file_size_kb: 2048,
    uploaded_at: '2024-11-18T09:00:00Z',
    page_count: 60,
    last_printed_at: '2024-11-18T16:30:00Z',
    print_count: 1,
  },
  {
    id: '9',
    file_name: 'SlideBaoCao.pptx',
    file_type:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    file_size_kb: 768,
    uploaded_at: '2024-11-17T15:45:00Z',
    page_count: 20,
    print_count: 0,
  },
  {
    id: '10',
    file_name: 'DanhSachSinhVien.xlsx',
    file_type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    file_size_kb: 64,
    uploaded_at: '2024-11-16T12:10:00Z',
    page_count: 3,
    last_printed_at: '2024-11-16T13:00:00Z',
    print_count: 1,
  },
  {
    id: '11',
    file_name: 'BaiKiemTra.pdf',
    file_type: 'application/pdf',
    file_size_kb: 445,
    uploaded_at: '2024-11-15T10:00:00Z',
    page_count: 18,
    last_printed_at: '2024-11-15T11:30:00Z',
    print_count: 2,
  },
  {
    id: '12',
    file_name: 'TaiLieuThamKhao.pdf',
    file_type: 'application/pdf',
    file_size_kb: 1234,
    uploaded_at: '2024-11-14T08:30:00Z',
    page_count: 50,
    print_count: 0,
  },
];

export const fileTypeFilters = [
  { value: 'all', label: 'Tất cả loại file' },
  { value: 'pdf', label: 'PDF' },
  { value: 'docx', label: 'Word (DOCX)' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'pptx', label: 'PowerPoint (PPTX)' },
];

export const dateRangeFilters = [
  { value: 'all', label: 'Tất cả thời gian' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'week', label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
  { value: '3months', label: '3 tháng qua' },
];



