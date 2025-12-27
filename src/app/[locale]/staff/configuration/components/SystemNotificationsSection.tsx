'use client';

import React, { useState } from 'react';
import {
  useSendSystemNotification,
  type SendSystemNotificationRequest,
} from '@/lib/api/services/systemConfig';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { BellIcon } from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/Toast';
import { useTranslations } from 'next-intl';

export function SystemNotificationsSection() {
  const t = useTranslations('staff.configuration.systemNotifications');
  const sendMutation = useSendSystemNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<SendSystemNotificationRequest>({
    title: '',
    message: '',
    notificationType: 'SYSTEM',
    targetStudentIds: null,
  });

  const handleSend = async () => {
    try {
      const result = await sendMutation.mutateAsync(formData);
      const count = result.data?.data?.successCount || 0;
      toast.success(t('sendSuccess', { count }));
      setIsModalOpen(false);
      setFormData({
        title: '',
        message: '',
        notificationType: 'SYSTEM',
        targetStudentIds: null,
      });
    } catch (error) {
      toast.error(t('sendError'));
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <BellIcon className="h-4 w-4" />
              {t('sendNotification')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm text-slate-600 dark:text-white/70">
              {t('infoText')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Send Notification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            title: '',
            message: '',
            notificationType: 'SYSTEM',
            targetStudentIds: null,
          });
        }}
        title={t('sendTitle')}
        size="md"
      >
        <div className="space-y-4 p-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('title')}
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder={t('titlePlaceholder')}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-white/70">
              {t('message')}
            </label>
            <textarea
              value={formData.message}
              onChange={e =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder={t('messagePlaceholder')}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
              rows={4}
            />
          </div>

          <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <div className="font-semibold">{t('note')}</div>
                <div className="mt-1">{t('noteContent')}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSend}
              disabled={
                !formData.title || !formData.message || sendMutation.isPending
              }
              className="flex-1 border border-blue-700 bg-blue-700/80 text-white hover:border-blue-800 hover:bg-blue-800/90 dark:border-blue-600 dark:bg-blue-600/80 dark:hover:border-blue-700 dark:hover:bg-blue-700/90"
            >
              {sendMutation.isPending ? t('sending') : t('send')}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({
                  title: '',
                  message: '',
                  notificationType: 'SYSTEM',
                  targetStudentIds: null,
                });
              }}
              disabled={sendMutation.isPending}
              className="border border-red-500 bg-red-500/80 text-white hover:border-red-600 hover:bg-red-600/90 dark:border-red-600 dark:bg-red-600/80 dark:hover:border-red-700 dark:hover:bg-red-700/90"
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
