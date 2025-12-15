'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { MockUploadedFile } from '@/data/printMock';
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

  const isImage = uploadedFile.file?.type.startsWith('image/');
  const isPDF = uploadedFile.file?.type === 'application/pdf';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('previewTitle')}
      size="xl"
    >
      <div className="space-y-4">
        <div className="flex min-h-[480px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          {isImage && uploadedFile.preview_url && (
            <img
              src={uploadedFile.preview_url}
              alt="Preview"
              className="max-h-[720px] w-full object-contain"
            />
          )}

          {isPDF && objectUrl && (
            <iframe
              src={objectUrl}
              title="PDF preview"
              className="h-[720px] w-full"
            />
          )}

          {!isImage && !isPDF && (
            <div className="flex flex-col items-center gap-3 p-6 text-center text-sm text-slate-600 dark:text-white/70">
              <FileIcon fileName={uploadedFile.file_name} size={64} />
              <p>{t('previewUnavailable')}</p>
              {objectUrl && (
                <a
                  href={objectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
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
