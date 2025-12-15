'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GlareHover from '@/components/GlareHover';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from '@/components/ui/Toast';

interface ResetPasswordFormProps {
  locale: string;
  copy: {
    title: string;
    subtitle: string;
    newPassword: string;
    confirmPassword: string;
    submit: string;
    submitting: string;
    back: string;
    success: string;
    missingToken: string;
    missingFields: string;
    mismatch: string;
    error: string;
  };
}

export default function ResetPasswordForm({
  locale,
  copy: t,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
          <label className="text-sm text-white/90">{t.confirmPassword}</label>
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
  );
}



