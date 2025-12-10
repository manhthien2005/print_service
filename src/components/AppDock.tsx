'use client';

import React, { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import Dock from './Dock';

interface AppDockProps {
  locale: string;
}

export default function AppDock({ locale }: AppDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuthStore();

  const userType = user?.userType || 'student';

  const studentCopy = {
    en: {
      home: 'Home',
      printersInfo: 'Printers Info',
      printDocument: 'Print Document',
      printHistory: 'Print History',
      buyPages: 'Buy Pages',
      profile: 'Profile',
      logout: 'Logout',
    },
    vi: {
      home: 'Trang chủ',
      printersInfo: 'Thông tin máy in',
      printDocument: 'In tài liệu',
      printHistory: 'Lịch sử in',
      buyPages: 'Mua trang',
      profile: 'Hồ sơ',
      logout: 'Đăng xuất',
    },
  };

  const staffCopy = {
    en: {
      dashboard: 'Dashboard',
      managePrinters: 'Manage Printers',
      manageStudents: 'Manage Students',
      systemLogs: 'System Logs',
      reports: 'Reports',
      configuration: 'Configuration',
      settings: 'Settings',
      logout: 'Logout',
    },
    vi: {
      dashboard: 'Bảng điều khiển',
      managePrinters: 'Quản lý máy in',
      manageStudents: 'Quản lý sinh viên',
      systemLogs: 'Nhật ký hệ thống',
      reports: 'Báo cáo',
      configuration: 'Cấu hình',
      settings: 'Cài đặt',
      logout: 'Đăng xuất',
    },
  };

  const studentT =
    locale in studentCopy ? studentCopy[locale as 'en' | 'vi'] : studentCopy.en;

  const staffT =
    locale in staffCopy ? staffCopy[locale as 'en' | 'vi'] : staffCopy.en;

  const handleLogout = () => {
    logout();
    // Clear refresh token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refresh-token');
    }
    window.location.href = `/${locale}`;
  };

  // Student items
  const studentItems = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      ),
      label: studentT.home,
      onClick: () => router.push(`/${locale}/student/dashboard`),
      path: `/${locale}/student/dashboard`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8V4.8c0-.45.36-.81.81-.81h8.38c.45 0 .81.36.81.81V8M7 16H5.2A1.2 1.2 0 0 1 4 14.8V11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3.8c0 .66-.54 1.2-1.2 1.2H17M7 12.5h.01M9 16h6m-6 3h6c.55 0 1-.45 1-1v-4H8v4c0 .55.45 1 1 1Z"
          />
        </svg>
      ),
      label: studentT.printersInfo,
      onClick: () => router.push(`/${locale}/student/printers`),
      path: `/${locale}/student/printers`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      ),
      label: studentT.printDocument,
      onClick: () => router.push(`/${locale}/student/print`),
      path: `/${locale}/student/print`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
      label: studentT.printHistory,
      onClick: () => router.push(`/${locale}/student/history`),
      path: `/${locale}/student/history`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
          />
        </svg>
      ),
      label: studentT.buyPages,
      onClick: () => router.push(`/${locale}/student/buy-pages`),
      path: `/${locale}/student/buy-pages`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      ),
      label: studentT.profile,
      onClick: () => router.push(`/${locale}/student/profile`),
      path: `/${locale}/student/profile`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
          />
        </svg>
      ),
      label: studentT.logout,
      onClick: handleLogout,
    },
  ];

  // Staff items
  const staffItems = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z"
          />
        </svg>
      ),
      label: staffT.dashboard,
      onClick: () => router.push(`/${locale}/staff/dashboard`),
      path: `/${locale}/staff/dashboard`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8V4.8c0-.45.36-.81.81-.81h8.38c.45 0 .81.36.81.81V8M7 16H5.2A1.2 1.2 0 0 1 4 14.8V11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3.8c0 .66-.54 1.2-1.2 1.2H17M7 12.5h.01M9 16h6m-6 3h6c.55 0 1-.45 1-1v-4H8v4c0 .55.45 1 1 1Z"
          />
        </svg>
      ),
      label: staffT.managePrinters,
      onClick: () => router.push(`/${locale}/staff/manage-printers`),
      path: `/${locale}/staff/manage-printers`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
      ),
      label: staffT.manageStudents,
      onClick: () => router.push(`/${locale}/staff/manage-students`),
      path: `/${locale}/staff/manage-students`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ),
      label: staffT.systemLogs,
      onClick: () => router.push(`/${locale}/staff/system-logs`),
      path: `/${locale}/staff/system-logs`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      ),
      label: staffT.reports,
      onClick: () => router.push(`/${locale}/staff/reports`),
      path: `/${locale}/staff/reports`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-white"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
      label: staffT.configuration,
      onClick: () => router.push(`/${locale}/staff/configuration`),
      path: `/${locale}/staff/configuration`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      ),
      label: staffT.settings,
      onClick: () => router.push(`/${locale}/staff/settings`),
      path: `/${locale}/staff/settings`,
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
          />
        </svg>
      ),
      label: staffT.logout,
      onClick: handleLogout,
    },
  ];

  const items = userType === 'staff' ? staffItems : studentItems;

  // Determine active index based on current pathname
  const activeIndex = useMemo(() => {
    return items.findIndex((item, index) => {
      // Skip logout button (last item)
      if (index === items.length - 1) return false;

      // Match based on path property
      if (item.path) {
        return pathname === item.path || pathname.startsWith(item.path + '/');
      }
      return false;
    });
  }, [items, pathname]);

  // Don't show dock if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Dock
      items={items}
      panelHeight={68}
      baseItemSize={50}
      magnification={70}
      activeIndex={activeIndex >= 0 ? activeIndex : undefined}
    />
  );
}
