'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LightRays from '@/components/LightRays';
import GlareHover from '@/components/GlareHover';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from '@/components/ui/Toast';

const copy = {
  en: {
    title: 'Reset password',
    subtitle: 'Enter a new password for your account.',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    submit: 'Change password',
    submitting: 'Processing...',
    back: 'Back to login',
    success: 'Password reset successful, please log in again',
    missingToken: 'Invalid link or missing token',
    missingFields: 'Please fill all password fields',
    mismatch: 'Passwords do not match',
    error: 'Reset password failed, try again',
  },
  vi: {
    title: 'Đặt lại mật khẩu',
    subtitle: 'Nhập mật khẩu mới cho tài khoản của bạn.',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu',
    submit: 'Đổi mật khẩu',
    submitting: 'Đang xử lý...',
    back: 'Quay lại đăng nhập',
    success: 'Đặt lại mật khẩu thành công, vui lòng đăng nhập lại',
    missingToken: 'Liên kết không hợp lệ hoặc thiếu token',
    missingFields: 'Vui lòng nhập đầy đủ mật khẩu',
    mismatch: 'Mật khẩu xác nhận không khớp',
    error: 'Đặt lại mật khẩu thất bại, thử lại',
  },
};

export default function ResetPasswordPage({
  params,
}: {
  params: { locale: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params.locale || 'vi';
  const t = locale in copy ? copy[locale as 'en' | 'vi'] : copy.en;

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error(t.missingToken);
    }
  }, [token, t.missingToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t.missingToken);
      return;
    }
    if (!password || !confirmPassword) {
      toast.error(t.missingFields);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t.mismatch);
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword: password,
      });
      toast.success(t.success);
      router.push(`/${locale}/login`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.error;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginHref = useMemo(() => `/${locale}/login`, [locale]);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#0b0b16] text-white"
      suppressHydrationWarning
    >
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1.2}
        lightSpread={0.6}
        rayLength={1.2}
        followMouse
        mouseInfluence={0.2}
        noiseAmount={0}
        distortion={0}
        asBackground
        className="opacity-100"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-5%,rgba(255,255,255,0.11),transparent_45%),radial-gradient(circle_at_15%_20%,rgba(148,163,184,0.16),transparent_32%),radial-gradient(circle_at_85%_12%,rgba(148,163,184,0.14),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.58)_60%,rgba(0,0,0,0.78)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-md animate-fade-in rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white">{t.title}</h1>
            <p className="mt-2 text-sm text-white/70">{t.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-white/90">{t.newPassword}</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 border-white/20 bg-white/5 px-3 text-white placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/90">
                {t.confirmPassword}
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 border-white/20 bg-white/5 px-3 text-white placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-white/20"
              />
            </div>

            <div className="relative w-full">
              <GlareHover
                width="100%"
                height="54px"
                background="transparent"
                borderRadius="1px"
                borderColor="transparent"
                glareColor="#ffffff"
                glareOpacity={0.2}
                glareAngle={-45}
                glareSize={360}
                transitionDuration={1500}
                playOnce={false}
                className="w-full"
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative z-10 h-[44px] w-full rounded-lg border border-white/35 bg-transparent px-4 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(0,0,0,0.35)] transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? t.submitting : t.submit}
                </button>
              </GlareHover>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              href={loginHref}
              className="inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-cyan-200 hover:underline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19 3 12m0 0 7-7m-7 7h18"
                />
              </svg>
              {t.back}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
