'use client';

import { useEffect, useRef, useState } from 'react';

interface BalanceCountUpProps {
  to: number;
  duration?: number;
  className?: string;
}

// Easing function: ease-out cubic (nhanh lúc đầu, chậm dần về cuối)
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export default function BalanceCountUp({
  to,
  duration = 3,
  className = '',
}: BalanceCountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    // Tính bước nhảy dựa trên giá trị (tối ưu cho số tiền VND)
    // Với số >= 1000000, bước 100000
    // Với số >= 100000, bước 10000
    // Với số >= 10000, bước 5000
    // Với số >= 1000, bước 1000
    // Với số < 1000, bước 100
    const getStep = (value: number): number => {
      if (value >= 1000000) return 100000;
      if (value >= 100000) return 10000;
      if (value >= 10000) return 5000;
      if (value >= 1000) return 1000;
      return 100;
    };

    const step = getStep(to);

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = (currentTime - startTimeRef.current) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Áp dụng easing function (ease-out)
      const easedProgress = easeOutCubic(progress);

      // Tính giá trị hiện tại với easing
      const currentValue = Math.floor(easedProgress * to);

      // Làm tròn xuống bước gần nhất
      const roundedValue = Math.floor(currentValue / step) * step;

      setDisplayValue(Math.min(roundedValue, to));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(to);
      }
    };

    startTimeRef.current = undefined;
    setDisplayValue(0);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [to, duration]);

  // Format số với dấu phẩy ngăn cách hàng nghìn
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return <span className={className}>{formatNumber(displayValue)}</span>;
}
