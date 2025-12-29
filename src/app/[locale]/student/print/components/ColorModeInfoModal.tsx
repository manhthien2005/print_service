'use client';

import { Modal } from '@/components/ui/Modal';
import { useTranslations } from 'next-intl';

interface ColorModeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ColorModeInfoModal({
  isOpen,
  onClose,
}: ColorModeInfoModalProps) {
  const t = useTranslations('student.print.colorModeInfoModal');

  const colorModes = [
    {
      mode: t('modes.color.mode'),
      icon: '🎨',
      description: t('modes.color.description'),
      useCase: t('modes.color.useCase'),
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
    },
    {
      mode: t('modes.grayscale.mode'),
      icon: '⚫',
      description: t('modes.grayscale.description'),
      useCase: t('modes.grayscale.useCase'),
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-500/10',
    },
    {
      mode: t('modes.blackWhite.mode'),
      icon: '⚪',
      description: t('modes.blackWhite.description'),
      useCase: t('modes.blackWhite.useCase'),
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-500/10',
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('title')} size="md">
      <div className="space-y-4 p-6">
        {colorModes.map((mode, index) => (
          <div
            key={mode.mode}
            className={`rounded-xl border-2 border-slate-200 p-4 dark:border-white/10 ${mode.bg} transition-all duration-300`}
            style={{
              animation: `fadeInSlide 0.4s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-3xl">{mode.icon}</div>
              <div className="flex-1">
                <h4 className={`mb-1 text-lg font-bold ${mode.color}`}>
                  {mode.mode}
                </h4>
                <p className="mb-2 text-sm text-slate-600 dark:text-white/70">
                  {mode.description}
                </p>
                <div className="text-xs">
                  <div className="flex items-start gap-2">
                    <span className="min-w-[80px] font-semibold text-slate-700 dark:text-white/80">
                      {t('useWhen')}
                    </span>
                    <span className="text-slate-600 dark:text-white/70">
                      {mode.useCase}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <style jsx>{`
          @keyframes fadeInSlide {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </Modal>
  );
}
