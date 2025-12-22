'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { MockUploadedFile, mockPermittedFileTypes } from '../types';
import { FileIcon } from './FileIcon';
import { useUploadFile, usePermittedFileTypes } from '../api';
import { mapUploadedFileResponse } from '@/lib/utils/mappers/studentPrintMapper';
import { toast } from '@/components/ui/Toast';

interface Step1UploadDocumentProps {
  uploadedFile: MockUploadedFile;
  onFileSelect: (file: MockUploadedFile) => void;
  onNext: () => void;
  onSaveFile?: () => void; // Optional, not used anymore
}

export function Step1UploadDocument({
  uploadedFile,
  onFileSelect,
  onNext,
}: Step1UploadDocumentProps) {
  const t = useTranslations('student.print.step1');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);

  const uploadFileMutation = useUploadFile();
  const { data: permittedFileTypesData } = usePermittedFileTypes();

  // Use API permitted file types if available, otherwise fallback to mock
  const permittedFileTypes =
    permittedFileTypesData?.data?.data ||
    mockPermittedFileTypes.map(t => ({
      fileExtension: t.extension.replace('.', ''),
      mimeType: t.mime_type,
      description: t.label,
    }));

  const handleFileChange = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setLocalFile(file);

    // Check file type (client-side validation)
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = permittedFileTypes.some((type: any) => {
      const ext =
        type.fileExtension ||
        (type.extension ? type.extension.replace('.', '') : '');
      return (
        (ext && `.${ext}`.toLowerCase() === fileExtension.toLowerCase()) ||
        type.mimeType === file.type ||
        type.mime_type === file.type
      );
    });

    if (!isValidType) {
      const allowedExtensions = permittedFileTypes
        .map(
          t =>
            `.${(t as any).fileExtension || (t as any).extension?.replace('.', '')}`
        )
        .filter(Boolean)
        .join(', ');
      setError(
        `Loại file không được hỗ trợ. Các loại file được phép: ${allowedExtensions}`
      );
      setIsUploading(false);
      setLocalFile(null);
      return;
    }

    // Check file size (max 50MB)
    const maxSizeMB = 50;
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File quá lớn. Kích thước tối đa: ${maxSizeMB}MB`);
      setIsUploading(false);
      setLocalFile(null);
      return;
    }

    try {
      // Upload file to API automatically
      const response = await uploadFileMutation.mutateAsync(file);
      const uploadedFileData = mapUploadedFileResponse(response.data.data);

      // Update parent component with uploaded file info
      onFileSelect({
        file: null, // Don't store File object, use uploadedFileId instead
        file_name: uploadedFileData.fileName,
        file_type: uploadedFileData.fileType,
        file_size_kb: uploadedFileData.fileSizeKb,
        preview_url: undefined, // Don't use preview, always show FileIcon
        page_count: uploadedFileData.pageCount,
        uploaded_file_id: uploadedFileData.uploadedFileId, // Store uploadedFileId
      });

      toast.success('Upload file thành công');
      setIsUploading(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      console.error('Upload error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        config: err?.config,
      });
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Có lỗi xảy ra khi upload file. Vui lòng thử lại.';
      setError(errorMessage);
      setIsUploading(false);
      setLocalFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemove = () => {
    // Cleanup blob URL if exists
    if (
      uploadedFile.preview_url &&
      uploadedFile.preview_url.startsWith('blob:')
    ) {
      URL.revokeObjectURL(uploadedFile.preview_url);
    }
    setLocalFile(null);
    onFileSelect({
      file: null,
      file_name: '',
      file_type: '',
      file_size_kb: 0,
      page_count: undefined,
      uploaded_file_id: undefined,
    });
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (kb: number) => {
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  const getFileTypeColor = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return {
          border: 'border-red-300 dark:border-red-500/50',
          bg: 'from-red-50 to-white dark:from-red-500/10',
          ring: 'ring-red-300 dark:ring-red-500/50',
        };
      case 'doc':
      case 'docx':
        return {
          border: 'border-blue-300 dark:border-blue-500/50',
          bg: 'from-blue-50 to-white dark:from-blue-500/10',
          ring: 'ring-blue-300 dark:ring-blue-500/50',
        };
      case 'xls':
      case 'xlsx':
        return {
          border: 'border-green-300 dark:border-green-500/50',
          bg: 'from-green-50 to-white dark:from-green-500/10',
          ring: 'ring-green-300 dark:ring-green-500/50',
        };
      case 'ppt':
      case 'pptx':
        return {
          border: 'border-orange-300 dark:border-orange-500/50',
          bg: 'from-orange-50 to-white dark:from-orange-500/10',
          ring: 'ring-orange-300 dark:ring-orange-500/50',
        };
      case 'jpg':
      case 'jpeg':
      case 'png':
        return {
          border: 'border-purple-300 dark:border-purple-500/50',
          bg: 'from-purple-50 to-white dark:from-purple-500/10',
          ring: 'ring-purple-300 dark:ring-purple-500/50',
        };
      default:
        return {
          border: 'border-slate-300 dark:border-slate-500/50',
          bg: 'from-slate-50 to-white dark:from-slate-500/10',
          ring: 'ring-slate-300 dark:ring-slate-500/50',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          {t('title')}
        </h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-white/70">
          {t('description')}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={permittedFileTypes
          .map((t: any) => t.mimeType || t.mime_type)
          .join(',')}
        onChange={handleInputChange}
        disabled={isUploading}
      />

      {!uploadedFile.file_name && !localFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          className={cn(
            'group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300',
            isDragging
              ? 'scale-[1.02] border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg shadow-blue-500/20 dark:from-blue-500/20 dark:to-blue-500/10'
              : 'border-slate-300 bg-gradient-to-br from-slate-50 to-white hover:border-blue-400 hover:from-blue-50/50 hover:to-blue-100/30 hover:shadow-md dark:border-white/20 dark:from-white/5 dark:to-white/10 dark:hover:border-blue-400 dark:hover:from-blue-500/10 dark:hover:to-blue-500/5',
            error && 'border-red-500 bg-red-50 dark:bg-red-500/10'
          )}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 p-5 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl dark:from-blue-500/30 dark:to-blue-600/30">
              <svg
                className={cn(
                  'h-10 w-10 text-blue-600 transition-transform duration-300 dark:text-blue-400',
                  isDragging && 'animate-bounce'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="mb-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {t('dragDrop')}
            </p>
            <p className="text-sm text-slate-500 dark:text-white/60">
              {t('fileSizeLimit')}
            </p>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'animate-in fade-in slide-in-from-bottom-4 rounded-xl border-2 bg-gradient-to-br p-6 shadow-lg duration-300',
            getFileTypeColor(uploadedFile.file_name || localFile?.name || '')
              .border,
            getFileTypeColor(uploadedFile.file_name || localFile?.name || '').bg
          )}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-24 items-center justify-center transition-transform duration-300 hover:scale-105">
              <FileIcon
                fileName={uploadedFile.file_name || localFile?.name || ''}
                size={64}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {uploadedFile.file_name || localFile?.name || ''}
              </h4>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-white/60">
                <span>
                  {formatFileSize(
                    uploadedFile.file_size_kb ||
                      (localFile ? Math.round(localFile.size / 1024) : 0)
                  )}
                </span>
                {isUploading ? (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                      <svg
                        className="h-3 w-3 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Đang upload và tính số trang...
                    </span>
                  </>
                ) : uploadedFile.page_count !== undefined ? (
                  <>
                    <span>•</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {uploadedFile.page_count}{' '}
                      {uploadedFile.page_count === 1 ? 'trang' : 'trang'}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              disabled={isUploading}
              className="flex-shrink-0 self-center rounded-full text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 hover:shadow-md disabled:opacity-50 dark:text-white/60 dark:hover:bg-red-500/20 dark:hover:text-red-400"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {(uploadedFile.file_name || localFile) && !isUploading && (
        <div className="flex justify-end gap-3">
          <Button
            onClick={onNext}
            className="min-w-32"
            disabled={!uploadedFile.uploaded_file_id}
          >
            {t('next')}
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}
