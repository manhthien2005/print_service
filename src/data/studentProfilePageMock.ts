// MOCK DATA - Tách riêng để dễ dàng gỡ bỏ khi tích hợp API thật
// TODO: Xóa file này khi đã kết nối API profile page

export interface StudentProfilePageData {
  id: string;
  fullName: string;
  studentId: string;
  avatarUrl?: string;
  avatarInitials: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  faculty: string;
  major: string;
  academicYear: string;
  status: 'active' | 'graduated' | 'suspended';
  balance: number; // VNĐ
}

export const studentProfilePageMock: StudentProfilePageData = {
  id: 'stu-profile-001',
  fullName: 'Nguyen Van A',
  studentId: 'ITITIU19000',
  avatarInitials: 'NA',
  email: 'nva@hcmiu.edu.vn',
  phone: '0912345678',
  dateOfBirth: '01/01/2001',
  faculty: 'Computer Science & Engineering',
  major: 'Information Technology',
  academicYear: '2024-2028',
  status: 'active',
  balance: 500000, // 500,000 VNĐ
};
