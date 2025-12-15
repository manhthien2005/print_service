'use client';

import Image from 'next/image';

interface FileIconProps {
  fileName: string;
  className?: string;
  size?: number;
}

export function FileIcon({
  fileName,
  className = '',
  size = 64,
}: FileIconProps) {
  const ext = fileName.split('.').pop()?.toLowerCase();

  // Map file extensions to SVG icons
  const getIconPath = () => {
    switch (ext) {
      case 'pdf':
        return '/images/pdf-document-svgrepo-com.svg';
      case 'doc':
      case 'docx':
        return '/images/word-document-svgrepo-com.svg';
      case 'xls':
      case 'xlsx':
        return '/images/excel-document-svgrepo-com.svg';
      case 'csv':
        return '/images/csv-document-svgrepo-com.svg';
      case 'ppt':
      case 'pptx':
        return '/images/ppt-document-svgrepo-com.svg';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return '/images/image-document-svgrepo-com.svg';
      case 'txt':
        return '/images/txt-document-svgrepo-com.svg';
      default:
        return null;
    }
  };

  const iconPath = getIconPath();

  if (!iconPath) {
    // Fallback to generic clip icon for unsupported types
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-2xl">📎</span>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={iconPath}
        alt={`${ext} icon`}
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
}
