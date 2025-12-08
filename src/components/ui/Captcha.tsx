'use client';

import React, { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface CaptchaProps {
  onVerify: (isValid: boolean, token?: string | null) => void;
  className?: string;
  copy?: {
    title?: string;
    error?: string;
  };
}

export function Captcha({
  onVerify,
  className = '',
  copy = {
    title: 'Security verification',
    error: 'Please complete the security verification',
  },
}: CaptchaProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  // Don't reset on mount - parent component manages the state

  const handleChange = (token: string | null) => {
    const isValid = !!token;
    onVerify(isValid, token);
  };

  const handleExpired = () => {
    onVerify(false, null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleError = () => {
    onVerify(false, null);
  };

  if (!siteKey) {
    console.warn('reCAPTCHA site key is not configured. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your .env file.');
    return (
      <div className={`space-y-3 rounded-lg border border-red-300/50 bg-red-50/10 p-4 ${className}`}>
        <p className="text-sm text-red-400">
          reCAPTCHA is not configured. Please set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 rounded-lg border border-white/20 bg-white/5 p-4 ${className}`}>
      <label className="text-sm font-medium text-white/90">
        {copy.title}
      </label>
      <div className="flex justify-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={handleChange}
          onExpired={handleExpired}
          onError={handleError}
          theme="dark"
        />
      </div>
    </div>
  );
}

