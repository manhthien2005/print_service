export type StudentStatus = 'active' | 'graduated' | 'suspended' | 'withdrawn';

export interface StudentItem {
  id: string;
  studentCode: string;
  fullName: string;
  email: string;
  faculty: string;
  department: string;
  major: string;
  className: string;
  yearLevel: number;
  status: StudentStatus;
  enrollmentDate: string;
  expectedGraduate: string;
}

export const studentStats = [
  { label: 'Tổng sinh viên', value: 4820, delta: '+3.2%' },
  { label: 'Đang hoạt động', value: 4560, delta: '+2.8%' },
  { label: 'Tạm dừng', value: 140, delta: '-0.3%' },
  { label: 'Đã tốt nghiệp', value: 120, delta: '+1.1%' },
];

export const studentFilters = {
  faculties: [
    'Công nghệ thông tin',
    'Kinh tế',
    'Ngôn ngữ Anh',
    'Điện - Điện tử',
  ],
  statuses: [
    'active',
    'graduated',
    'suspended',
    'withdrawn',
  ] as StudentStatus[],
};

export const studentsMockData: StudentItem[] = [
  {
    id: 'stu-001',
    studentCode: 'IT2021001',
    fullName: 'Nguyễn Văn A',
    email: 'a.nguyen@siu.edu.vn',
    faculty: 'Công nghệ thông tin',
    department: 'Khoa học máy tính',
    major: 'Kỹ thuật phần mềm',
    className: 'SE2021A',
    yearLevel: 4,
    status: 'active',
    enrollmentDate: '2021-09-01',
    expectedGraduate: '2025-06-30',
  },
  {
    id: 'stu-002',
    studentCode: 'IT2021042',
    fullName: 'Trần Thị B',
    email: 'b.tran@siu.edu.vn',
    faculty: 'Công nghệ thông tin',
    department: 'Hệ thống thông tin',
    major: 'Hệ thống thông tin',
    className: 'IS2021B',
    yearLevel: 4,
    status: 'graduated',
    enrollmentDate: '2020-09-01',
    expectedGraduate: '2024-06-30',
  },
  {
    id: 'stu-003',
    studentCode: 'BA2022033',
    fullName: 'Phạm Văn C',
    email: 'c.pham@siu.edu.vn',
    faculty: 'Kinh tế',
    department: 'Quản trị kinh doanh',
    major: 'Quản trị kinh doanh',
    className: 'BA2022A',
    yearLevel: 3,
    status: 'active',
    enrollmentDate: '2022-09-01',
    expectedGraduate: '2026-06-30',
  },
  {
    id: 'stu-004',
    studentCode: 'EE2022155',
    fullName: 'Lê Thị D',
    email: 'd.le@siu.edu.vn',
    faculty: 'Điện - Điện tử',
    department: 'Điện tử viễn thông',
    major: 'Điện tử viễn thông',
    className: 'EE2022B',
    yearLevel: 3,
    status: 'suspended',
    enrollmentDate: '2022-09-01',
    expectedGraduate: '2026-06-30',
  },
  {
    id: 'stu-005',
    studentCode: 'ENG2023010',
    fullName: 'Đặng Quốc E',
    email: 'e.dang@siu.edu.vn',
    faculty: 'Ngôn ngữ Anh',
    department: 'Biên - Phiên dịch',
    major: 'Ngôn ngữ Anh',
    className: 'EN2023A',
    yearLevel: 2,
    status: 'active',
    enrollmentDate: '2023-09-01',
    expectedGraduate: '2027-06-30',
  },
  {
    id: 'stu-006',
    studentCode: 'IT2023077',
    fullName: 'Võ Minh F',
    email: 'f.vo@siu.edu.vn',
    faculty: 'Công nghệ thông tin',
    department: 'Khoa học máy tính',
    major: 'Trí tuệ nhân tạo',
    className: 'AI2023A',
    yearLevel: 2,
    status: 'withdrawn',
    enrollmentDate: '2023-09-01',
    expectedGraduate: '2027-06-30',
  },
  {
    id: 'stu-007',
    studentCode: 'BA2024021',
    fullName: 'Ngô Hải G',
    email: 'g.ngo@siu.edu.vn',
    faculty: 'Kinh tế',
    department: 'Tài chính',
    major: 'Tài chính doanh nghiệp',
    className: 'FIN2024A',
    yearLevel: 1,
    status: 'active',
    enrollmentDate: '2024-09-01',
    expectedGraduate: '2028-06-30',
  },
  {
    id: 'stu-008',
    studentCode: 'IT2024022',
    fullName: 'Huỳnh Gia H',
    email: 'h.huynh@siu.edu.vn',
    faculty: 'Công nghệ thông tin',
    department: 'Mạng máy tính',
    major: 'An toàn thông tin',
    className: 'SEC2024A',
    yearLevel: 1,
    status: 'active',
    enrollmentDate: '2024-09-01',
    expectedGraduate: '2028-06-30',
  },
];
