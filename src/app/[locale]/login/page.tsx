import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { locales } from '@/lib/i18n/config';
import LightRays from '@/components/LightRays';
import LoginForm from './LoginForm';

const copy = {
  en: {
    title: 'Welcome back',
    subtitle: 'Sign in to your account',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    login: 'Login',
    captchaTitle: 'Security verification',
    captchaError: 'Please complete the security verification',
    captchaRequired: 'Please complete the security verification',
  },
  vi: {
    title: 'Chào mừng trở lại',
    subtitle: 'Đăng nhập vào tài khoản của bạn',
    email: 'Email',
    password: 'Mật khẩu',
    rememberMe: 'Ghi nhớ đăng nhập',
    forgotPassword: 'Quên mật khẩu?',
    login: 'Đăng nhập',
    captchaTitle: 'Xác minh bảo mật',
    captchaError: 'Vui lòng hoàn thành xác minh bảo mật',
    captchaRequired: 'Vui lòng hoàn thành xác minh bảo mật',
  },
};

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = locale in copy ? copy[locale as 'en' | 'vi'] : copy.en;

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
        <LoginForm locale={locale} copy={t} />
      </div>
    </main>
  );
}
