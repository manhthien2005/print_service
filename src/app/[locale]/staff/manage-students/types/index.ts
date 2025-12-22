// Types extracted from studentsMock.ts

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

