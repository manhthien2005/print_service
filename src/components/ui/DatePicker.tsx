'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  className,
  error,
  disabled,
  min,
  max,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setCurrentMonth(new Date(value));
    }
  }, [value]);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatInputValue = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange?.(formatInputValue(date));
    setIsOpen(false);
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDisabled = (date: Date): boolean => {
    if (min) {
      const minDate = new Date(min);
      if (date < minDate) return true;
    }
    if (max) {
      const maxDate = new Date(max);
      if (date > maxDate) return true;
    }
    return false;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days: (Date | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    );
  }

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const months = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

  return (
    <div ref={datePickerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          isOpen && 'ring-2 ring-ring ring-offset-2'
        )}
      >
        <span className={cn(!selectedDate && 'text-muted-foreground')}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
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
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-[100] mt-1 rounded-md border border-slate-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-slate-900">
          {/* Calendar Header */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="rounded-md p-1 hover:bg-accent hover:text-accent-foreground"
            >
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
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <div className="font-semibold">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="rounded-md p-1 hover:bg-accent hover:text-accent-foreground"
            >
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
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>

          {/* Week Days */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div
                key={day}
                className="p-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="p-2" />;
              }

              const dayDisabled = isDisabled(date);
              const dayIsToday = isToday(date);
              const dayIsSelected = isSelected(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => !dayDisabled && handleDateSelect(date)}
                  disabled={dayDisabled}
                  className={cn(
                    'rounded-md p-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-30',
                    dayIsToday &&
                      !dayIsSelected &&
                      'font-semibold text-blue-600 dark:text-blue-400',
                    dayIsSelected &&
                      'hover:bg-primary/90 bg-primary font-semibold text-primary-foreground'
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
