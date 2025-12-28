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
