'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface StepIndicatorProps {
  currentStep: number;
  steps: Array<{ label: string }>;
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  const [animatedStep, setAnimatedStep] = useState(currentStep);

  useEffect(() => {
    // Animate step change
    const timer = setTimeout(() => {
      setAnimatedStep(currentStep);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="mb-8 w-full">
      <div className="relative flex w-full items-start">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === animatedStep;
          const isCompleted = stepNumber < animatedStep;
          const isUpcoming = stepNumber > animatedStep;

          return (
            <React.Fragment key={stepNumber}>
              {/* Step Circle */}
              <div className="relative z-10 flex flex-1 flex-col items-center">
                <div
                  className={cn(
                    'relative flex h-14 w-14 items-center justify-center rounded-full border-2 font-semibold transition-all duration-500 ease-out',
                    isCompleted &&
                      'border-green-500 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/40 ring-4 ring-green-500/20',
                    isActive &&
                      'scale-110 animate-pulse border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/50 ring-4 ring-blue-500/30',
                    isUpcoming &&
                      'border-slate-300 bg-white text-slate-400 dark:border-white/20 dark:bg-white/5 dark:text-white/40'
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="animate-in fade-in zoom-in h-7 w-7 duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-lg font-bold">{stepNumber}</span>
                  )}
                  {isActive && (
                    <div className="absolute inset-0 animate-ping rounded-full bg-blue-400/30" />
                  )}
                </div>
                <div className="mt-3 w-full text-center">
                  <div
                    className={cn(
                      'text-sm font-semibold transition-all duration-300',
                      isActive &&
                        'scale-105 font-bold text-blue-600 dark:text-blue-400',
                      isCompleted && 'text-green-600 dark:text-green-400',
                      isUpcoming && 'text-slate-400 dark:text-white/40'
                    )}
                  >
                    {step.label}
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className="relative mx-1 h-1 flex-1"
                  style={{ marginTop: '1.75rem' }}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className={cn(
                        'absolute left-0 top-0 h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out',
                        isCompleted
                          ? 'w-full from-green-500 to-green-600'
                          : 'w-0 from-blue-500 to-blue-600'
                      )}
                      style={{
                        width: isCompleted ? '100%' : isActive ? '50%' : '0%',
                      }}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
