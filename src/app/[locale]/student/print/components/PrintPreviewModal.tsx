'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { MockUploadedFile } from '@/app/[locale]/student/print/types';
import { FileIcon } from './FileIcon';
import { useTranslations } from 'next-intl';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadedFile: MockUploadedFile;
}

export function PrintPreviewModal({
  isOpen,
  onClose,
  uploadedFile,
}: PrintPreviewModalProps) {
  const t = useTranslations('student.print.step4');
  const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (uploadedFile.preview_url) {
      setObjectUrl(undefined);
      return;
    }

    if (uploadedFile.file) {
      const url = URL.createObjectURL(uploadedFile.file);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    setObjectUrl(undefined);
  }, [uploadedFile.file, uploadedFile.preview_url]);

  // Determine file type from file object or file_type/file_name
  const isImage =
    uploadedFile.file?.type.startsWith('image/') ||
    uploadedFile.file_type?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(uploadedFile.file_name || '');
  const isPDF =
    uploadedFile.file?.type === 'application/pdf' ||
    uploadedFile.file_type === 'application/pdf' ||
    /\.pdf$/i.test(uploadedFile.file_name || '');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('previewTitle')}
      size="xl"
    >
      <div className="space-y-4">
        <div className="dark:bg-background/5 flex min-h-[480px] items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm dark:border-border">
          {isImage && uploadedFile.preview_url && (
            <img
              src={uploadedFile.preview_url}
              alt="Preview"
              className="max-h-[720px] w-full object-contain"
            />
          )}

          {isPDF && (uploadedFile.preview_url || objectUrl) && (
            <iframe
              src={uploadedFile.preview_url || objectUrl}
              title="PDF preview"
              className="h-[720px] w-full"
            />
          )}

          {!isImage && !isPDF && (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-sm text-muted-foreground dark:text-muted-foreground">
              <FileIcon fileName={uploadedFile.file_name} size={64} />
              <p>{t('previewUnavailable')}</p>
              {(uploadedFile.preview_url || objectUrl) && (
                <a
                  href={uploadedFile.preview_url || objectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline dark:text-primary"
                >
                  {t('openInNewTab')}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
