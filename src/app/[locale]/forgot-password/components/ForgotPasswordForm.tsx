'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GlareHover from '@/components/GlareHover';
import { Input } from '@/components/ui/Input';
import { Captcha } from '@/components/ui/Captcha';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from '@/components/ui/Toast';

interface ForgotPasswordFormProps {
  locale: string;
  copy: {
    title: string;
    subtitle: string;
    email: string;
    submit: string;
    sending: string;
    resend: string;
    back: string;
    success: string;
    missingEmail: string;
    invalidEmail: string;
    error: string;
    resendHint: string;
    captchaRequired: string;
    captchaTitle: string;
    resendIn: (s: number) => string;
  };
}

export default function ForgotPasswordForm({
  locale,
  copy: t,
}: ForgotPasswordFormProps) {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSentEmail, setLastSentEmail] = useState<string | null>(null);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const startResendCountdown = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error(t.missingEmail);
      return;
    }
    if (!validateEmail(email)) {
      toast.error(t.invalidEmail);
      return;
    }
    if (!captchaValid || !captchaToken) {
      toast.error(t.captchaRequired);
      return;
    }
    try {
      setIsLoading(true);
      await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      toast.success(t.success);
      setLastSentEmail(email);
      startResendCountdown();
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
          <label className="text-sm text-white/90">{t.email}</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6.5c0-.83.67-1.5 1.5-1.5h13c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8l8 5 8-5"
                />
              </svg>
            </span>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-11 border-white/20 bg-white/5 pl-10 text-white placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-white/20"
            />
          </div>
        </div>

        <Captcha
          onVerify={(isValid, token) => {
            setCaptchaValid(isValid);
            setCaptchaToken(token || null);
          }}
          className="animate-fade-in"
          copy={{
            title: t.captchaTitle,
            error: t.captchaRequired,
          }}
        />

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
              {isLoading ? t.sending : t.submit}
            </button>
          </GlareHover>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isLoading || !lastSentEmail || resendTimer > 0}
          className="w-full rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          title={t.resendHint}
        >
          {resendTimer > 0 ? t.resendIn(resendTimer) : t.resend}
        </button>
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



