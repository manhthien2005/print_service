'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import SpotlightCard from '@/components/ui/SpotlightCard';
import BalanceCountUp from './BalanceCountUp';
import ChangePasswordModal from './ChangePasswordModal';
import EditProfileModal from './EditProfileModal';
import ProfileSkeleton from './ProfileSkeleton';
import { useStudentProfile } from '@/lib/api/services/student';
import { formatDate } from '@/lib/utils/date';
// import { formatNumber } from '@/lib/utils/format'; // Not used currently
import { getInitials } from '@/lib/utils/string';
// import { toast } from '@/components/ui/Toast'; // Not used currently

interface StudentProfileContentProps {
  locale: string;
  t: any;
}

export default function StudentProfileContent({
  locale,
  t,
}: StudentProfileContentProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const { data, isLoading, error, refetch } = useStudentProfile();

  const withLocale = (path: string) =>
    `/${locale}${path.startsWith('/') ? path : '/' + path}`;

  // Handle loading state
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <Card className="border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-900/20">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-300">
              {t.error?.title ?? 'Không thể tải thông tin'}
            </h3>
            <p className="mb-4 text-red-700 dark:text-red-400">
              {error instanceof Error
                ? error.message
                : (t.error?.message ??
                  'Đã xảy ra lỗi khi tải thông tin profile')}
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {t.error?.retry ?? 'Thử lại'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Extract profile data from API response
  const profileData = data?.data?.data;
  if (!profileData) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <Card className="border-slate-200 bg-slate-50 p-8 dark:border-white/10 dark:bg-white/5">
          <div className="text-center">
            <p className="text-slate-600 dark:text-white/70">
              {t.error?.notFound ?? 'Không tìm thấy thông tin profile'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Format data for display
  const formattedDateOfBirth = profileData.dateOfBirth
    ? formatDate(profileData.dateOfBirth, 'dd/MM/yyyy', locale as 'vi' | 'en')
    : '—';

  // const formattedBalance = formatNumber(profileData.balance || 0); // Not used currently
  const avatarInitials = getInitials(profileData.fullName);
  const displayPhone = profileData.phoneNumber || '—';
  // const displayAddress = profileData.address || '—'; // Not used currently
  const displayStudentCode = profileData.studentCode || '—';
  const displayFaculty = profileData.facultyName || '—';
  const displayMajor = profileData.departmentName || '—';
  const displayClass = profileData.classCode || '—';

  // Map status to display text
  const statusMap: Record<string, string> = {
    active: t.badges?.active ?? 'Active',
    graduated: t.badges?.graduated ?? 'Graduated',
    suspended: t.badges?.suspended ?? 'Suspended',
    withdrawn: t.badges?.withdrawn ?? 'Withdrawn',
  };
  const displayStatus = statusMap[profileData.status] || profileData.status;

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Profile Header - Centered */}
        <SpotlightCard
          className="flex flex-col items-center gap-6 border-slate-200/70 bg-gradient-to-br from-white via-sky-50/30 to-indigo-50/30 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:from-white/5 dark:via-sky-500/10 dark:to-indigo-500/10"
          spotlightColor="rgba(56, 189, 248, 0.3)"
        >
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            {/* Avatar */}
            {profileData.profilePicture ? (
              <img
                src={profileData.profilePicture}
                alt={profileData.fullName}
                className="h-32 w-32 rounded-full object-cover shadow-2xl ring-4 ring-white/50 dark:ring-white/10"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-500 text-3xl font-bold text-white shadow-2xl ring-4 ring-white/50 dark:ring-white/10">
                {avatarInitials}
              </div>
            )}

            {/* Name and Status */}
            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                {profileData.fullName}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Student Badge */}
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  {displayStatus}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditProfileOpen(true)}
                className="border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:bg-white hover:shadow-md dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {t.editProfile ?? 'Edit Profile'}
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsChangePasswordOpen(true)}
                className="border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:bg-white hover:shadow-md dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                {t.changePassword ?? 'Change Password'}
              </Button>
            </div>
          </div>
        </SpotlightCard>

        {/* Balance Card - Centered with Top-up Button */}
        <SpotlightCard
          className="relative overflow-hidden border-slate-200/70 bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-xl backdrop-blur dark:border-white/10 dark:from-emerald-500/10 dark:via-white/5 dark:to-sky-500/10"
          spotlightColor="rgba(16, 185, 129, 0.3)"
        >
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/20" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/20" />
          <div className="relative z-10 p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-white/70">
                  {t.balance?.title ?? 'SỐ DƯ'}
                </h3>
                <div className="space-y-1">
                  <div className="text-5xl font-bold text-slate-900 dark:text-white">
                    <BalanceCountUp
                      to={Math.floor(profileData.balance || 0)}
                      duration={1.5}
                      className="inline-block"
                    />
                    <span className="ml-1">₫</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-white/60">
                    {t.balance?.subtitle ?? 'Số dư khả dụng'}
                  </p>
                </div>
              </div>
              <Link href={withLocale('/student/top-up')}>
                <Button className="bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-lg hover:from-emerald-600 hover:to-sky-600 hover:shadow-xl dark:from-emerald-600 dark:to-sky-600 dark:hover:from-emerald-700 dark:hover:to-sky-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2 h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  {t.balance?.topUp ?? 'Nạp tiền'}
                </Button>
              </Link>
            </div>
          </div>
        </SpotlightCard>

        {/* Contact Info and Academic Details - Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Info */}
          <Card className="border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="p-6">
              <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white/70">
                {t.contactInfo?.title ?? 'CONTACT INFO'}
              </h3>
              <div className="space-y-5">
                {/* University Email */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-6 w-6 text-sky-600 dark:text-sky-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {profileData.email}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-white/70">
                      {t.contactInfo?.universityEmail ?? 'University Email'}
                    </div>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {displayPhone}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-white/70">
                      {t.contactInfo?.mobileNumber ?? 'Mobile Number'}
                    </div>
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-6 w-6 text-purple-600 dark:text-purple-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {formattedDateOfBirth}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-white/70">
                      {t.contactInfo?.dateOfBirth ?? 'Date of Birth'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Academic Details */}
          <Card className="border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
            <div className="p-6">
              <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white/70">
                {t.academicDetails?.title ?? 'ACADEMIC DETAILS'}
              </h3>
              <div className="space-y-5">
                {/* Student ID */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-6 w-6 text-amber-600 dark:text-amber-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {displayStudentCode}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-white/70">
                      {t.academicDetails?.studentId ?? 'Student ID'}
                    </div>
                  </div>
                </div>

                {/* Class */}
                {displayClass !== '—' && (
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {displayClass}
                      </div>
                      <div className="mt-1 text-sm text-slate-500 dark:text-white/70">
                        {t.academicDetails?.class ?? 'Class'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Faculty */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-6 w-6 text-rose-600 dark:text-rose-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-1.125-1.125V3M20.25 3v1.5M3.75 3v1.5m16.5 0V3m0 1.5v1.5"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {displayFaculty}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-white/70">
                      {t.academicDetails?.faculty ?? 'Faculty'}
                    </div>
                  </div>
                </div>

                {/* Major */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443a55.381 55.381 0 015.25 2.882V15"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {displayMajor}
                    </div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-white/70">
                      {t.academicDetails?.major ?? 'Major'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        locale={locale}
        t={t.changePasswordModal}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        locale={locale}
        t={t.editProfileModal}
        initialData={profileData}
        onSuccess={() => {
          refetch();
        }}
      />
    </>
  );
}
