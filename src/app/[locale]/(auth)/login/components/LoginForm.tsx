'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { FieldError } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import GlareHover from '@/components/GlareHover';
import { Captcha } from '@/components/ui/Captcha';
import { useZodForm } from '@/lib/hooks/useZodForm';
import { loginSchema, type LoginFormData } from '../schemas';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { toast } from '@/components/ui/Toast';
import type { LoginFormProps } from '../types';
import {
  FAILED_LOGIN_KEY,
  MAX_FAILED_ATTEMPTS,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../constants';

export default function LoginForm({ locale, copy: t }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { setUser, setToken } = useAuthStore();
  const tValidation = useTranslations('validation');

  const translateValidationMessage = (message?: string) => {
    if (!message) return '';
    switch (message) {
      case 'validation.required':
        return tValidation('required');
      case 'validation.email':
        return tValidation('email');
      case 'validation.minLength':
        return tValidation('minLength', { min: PASSWORD_MIN_LENGTH });
      case 'validation.maxLength':
        return tValidation('maxLength', { max: PASSWORD_MAX_LENGTH });
      default:
        return message;
    }
  };

  const renderError = (error?: FieldError) => {
    if (!error) return null;
    return (
      <p className="mt-1 text-xs text-red-400">
        {translateValidationMessage(error.message)}
      </p>
    );
  };

  useEffect(() => {
    // Load failed attempts from localStorage
    // Only show captcha if attempts >= MAX_FAILED_ATTEMPTS
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(FAILED_LOGIN_KEY);
      if (stored) {
        const attempts = parseInt(stored, 10);
        // Only set if it's a valid number
        if (!isNaN(attempts) && attempts > 0) {
          setFailedAttempts(attempts);
          // Only show captcha if attempts >= MAX_FAILED_ATTEMPTS
          if (attempts >= MAX_FAILED_ATTEMPTS) {
            setShowCaptcha(true);
          } else {
            // Explicitly set to false if attempts < MAX_FAILED_ATTEMPTS
            setShowCaptcha(false);
          }
        } else {
          // Invalid or 0 attempts, clear localStorage and ensure captcha is hidden
          localStorage.removeItem(FAILED_LOGIN_KEY);
          setFailedAttempts(0);
          setShowCaptcha(false);
        }
      } else {
        // No stored value, ensure captcha is hidden
        setFailedAttempts(0);
        setShowCaptcha(false);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm(loginSchema, {
    defaultValues: {
      rememberMe: false,
    },
  });

  const handleFailedLogin = (error: unknown) => {
    // Only count failed attempts for authentication errors (401, 403) or credential errors
    const isAuthError =
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof error.response === 'object' &&
      error.response !== null &&
      'status' in error.response &&
      (error.response.status === 401 || error.response.status === 403);

    // Also check if error message indicates wrong credentials
    const isCredentialError =
      error instanceof Error &&
      (error.message.toLowerCase().includes('password') ||
        error.message.toLowerCase().includes('credential') ||
        error.message.toLowerCase().includes('invalid') ||
        error.message.toLowerCase().includes('sai') ||
        error.message.toLowerCase().includes('không đúng'));

    // Only increment if it's an authentication/credential error
    if (isAuthError || isCredentialError) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem(FAILED_LOGIN_KEY, String(newAttempts));

      // Show captcha only after exactly MAX_FAILED_ATTEMPTS failed attempts
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        setShowCaptcha(true);
      }
    }
  };

  const handleSuccessfulLogin = () => {
    // Reset failed attempts on successful login
    setFailedAttempts(0);
    localStorage.removeItem(FAILED_LOGIN_KEY);
    setShowCaptcha(false);
    setCaptchaValid(false);
    setCaptchaToken(null);
  };

  const handleCaptchaVerify = useCallback(
    (isValid: boolean, token?: string | null) => {
      setCaptchaValid(isValid);
      setCaptchaToken(token || null);
    },
    []
  );

  // Reset captcha state when showCaptcha changes to true
  useEffect(() => {
    if (showCaptcha) {
      setCaptchaValid(false);
      setCaptchaToken(null);
    }
  }, [showCaptcha]);

  const onSubmit = async (data: LoginFormData) => {
    // Check captcha if required - must have both valid flag and token
    if (showCaptcha) {
      if (!captchaValid || !captchaToken) {
        toast.error(t.captchaRequired);
        return;
      }
    }

    try {
      setIsLoading(true);
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        tokenType: string;
        expiresIn: number;
        user: {
          userId: string;
          email: string;
          fullName: string;
          userType: string;
          phoneNumber?: string;
          isActive?: boolean;
        };
        message?: string;
        timestamp?: string;
      }>('/auth/login', {
        email: data.email,
        password: data.password,
        ...(showCaptcha && captchaToken && { recaptchaToken: captchaToken }),
      });

      console.log('Login response:', response.data);

      // Handle response - API returns data directly: { accessToken, refreshToken, user, ... }
      if (response.data && response.data.accessToken && response.data.user) {
        const { accessToken, refreshToken, user } = response.data;

        // Save to store
        setToken(accessToken);
        setUser({
          id: user.userId,
          email: user.email,
          name: user.fullName,
          userType: user.userType as 'student' | 'staff',
        });

        // Save refresh token if remember me, otherwise clear any existing
        if (data.rememberMe && refreshToken) {
          localStorage.setItem('refresh-token', refreshToken);
        } else if (!data.rememberMe) {
          localStorage.removeItem('refresh-token');
        }

        handleSuccessfulLogin();
        toast.success(
          t.login === 'Login' ? 'Login successful!' : 'Đăng nhập thành công!'
        );

        // Redirect based on user role
        const redirectPath =
          user.userType === 'staff'
            ? `/${locale}/staff/dashboard`
            : `/${locale}/student/dashboard`;

        // Use window.location for reliable redirect
        setTimeout(() => {
          window.location.href = redirectPath;
        }, 500);
      } else {
        // Handle unexpected response format
        console.error('Unexpected response format:', response.data);
        toast.error(
          t.login === 'Login'
            ? 'Login failed. Invalid response format.'
            : 'Đăng nhập thất bại. Định dạng phản hồi không hợp lệ.'
        );
      }
    } catch (error: unknown) {
      handleFailedLogin(error);
      let errorMessage =
        t.login === 'Login'
          ? 'Login failed. Please check your credentials.'
          : 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'data' in error.response &&
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'message' in error.response.data
      ) {
        errorMessage = String(error.response.data.message);
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">{t.title}</h1>
        <p className="mt-2 text-sm text-white/70">{t.subtitle}</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-white/90">
            {t.email}
          </label>
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
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`h-11 !border-white/20 !bg-white/5 pl-10 !text-white placeholder:text-white/60 focus-visible:!border-white/40 focus-visible:!ring-white/25 ${
                errors.email
                  ? '!border-red-400/50 focus-visible:!border-red-400'
                  : ''
              }`}
              {...register('email')}
            />
          </div>
          {renderError(errors.email)}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-white/90"
          >
            {t.password}
          </label>
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
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path strokeLinecap="round" d="M9 11V8a3 3 0 0 1 6 0v3" />
              </svg>
            </span>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`h-11 !border-white/20 !bg-white/5 pl-10 pr-10 !text-white placeholder:text-white/60 focus-visible:!border-white/40 focus-visible:!ring-white/25 ${
                errors.password
                  ? '!border-red-400/50 focus-visible:!border-red-400'
                  : ''
              }`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition hover:text-white/90"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
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
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
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
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </button>
          </div>
          {renderError(errors.password)}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-0 focus:ring-offset-transparent"
              {...register('rememberMe')}
            />
            <span>{t.rememberMe}</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-cyan-300 transition hover:text-cyan-200 hover:underline"
          >
            {t.forgotPassword}
          </Link>
        </div>

        {/* Only show captcha if failedAttempts >= MAX_FAILED_ATTEMPTS */}
        {showCaptcha && failedAttempts >= MAX_FAILED_ATTEMPTS && (
          <Captcha
            onVerify={handleCaptchaVerify}
            className="animate-fade-in"
            copy={{
              title: t.captchaTitle,
              error: t.captchaError,
            }}
          />
        )}

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
              {isLoading
                ? t.login === 'Login'
                  ? 'Logging in...'
                  : 'Đang đăng nhập...'
                : t.login}
            </button>
          </GlareHover>
        </div>
      </form>
    </div>
  );
}
