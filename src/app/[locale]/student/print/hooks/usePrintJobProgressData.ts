'use client';

import { useMemo } from 'react';
import { usePrintJobProgress } from '@/app/[locale]/student/print/api';
import { mapPrintJobProgressResponse } from '@/lib/utils/mappers/studentPrintMapper';

export function usePrintJobProgressData(jobId: string | null, enabled = true) {
  const {
    data: progressData,
    isLoading,
    error,
  } = usePrintJobProgress(jobId, enabled);

  const progress = useMemo(() => {
    if (progressData?.data?.data) {
      return mapPrintJobProgressResponse(progressData.data.data);
    }
    return null;
  }, [progressData]);

  return {
    progress,
    isLoading,
    error,
  };
}
