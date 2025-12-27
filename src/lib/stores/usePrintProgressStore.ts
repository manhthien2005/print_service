import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MockUploadedFile,
  MockPrinter,
  MockPrintConfig,
} from '@/app/[locale]/student/print/types';

export interface PrintProgress {
  currentStep: number;
  uploadedFile: MockUploadedFile | null;
  selectedPrinter: MockPrinter | null;
  config: MockPrintConfig;
  timestamp: number;
}

interface PrintProgressState {
  progress: PrintProgress | null;
  saveProgress: (
    currentStep: number,
    uploadedFile: MockUploadedFile | null,
    selectedPrinter: MockPrinter | null,
    config: MockPrintConfig
  ) => void;
  loadProgress: () => PrintProgress | null;
  clearProgress: () => void;
  hasProgress: () => boolean;
}

const STORAGE_KEY = 'print-progress';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export const usePrintProgressStore = create<PrintProgressState>()(
  persist(
    (set, get) => ({
      progress: null,
      saveProgress: (
        currentStep: number,
        uploadedFile: MockUploadedFile | null,
        selectedPrinter: MockPrinter | null,
        config: MockPrintConfig
      ) => {
        // Only save if user has uploaded file or is past step 1
        if (
          currentStep > 1 ||
          (uploadedFile && uploadedFile.uploaded_file_id)
        ) {
          const progress: PrintProgress = {
            currentStep,
            uploadedFile: uploadedFile
              ? {
                  // Don't save File object, only metadata
                  file: null,
                  file_name: uploadedFile.file_name,
                  file_type: uploadedFile.file_type,
                  file_size_kb: uploadedFile.file_size_kb,
                  preview_url: uploadedFile.preview_url,
                  page_count: uploadedFile.page_count,
                  uploaded_file_id: uploadedFile.uploaded_file_id,
                }
              : null,
            selectedPrinter,
            config,
            timestamp: Date.now(),
          };
          set({ progress });
        } else {
          // Clear progress if back to step 1 without file
          set({ progress: null });
        }
      },
      loadProgress: () => {
        const progress = get().progress;

        if (!progress) {
          return null;
        }

        // Validate timestamp (not older than 24 hours)
        const age = Date.now() - progress.timestamp;
        if (age > MAX_AGE_MS) {
          set({ progress: null });
          return null;
        }

        // Validate data structure
        if (
          !progress.currentStep ||
          progress.currentStep < 1 ||
          progress.currentStep > 4
        ) {
          set({ progress: null });
          return null;
        }

        return progress;
      },
      clearProgress: () => {
        set({ progress: null });
      },
      hasProgress: (): boolean => {
        const progress = get().progress;
        if (!progress) {
          return false;
        }

        // Check if progress is still valid
        const age = Date.now() - progress.timestamp;
        if (age > MAX_AGE_MS) {
          set({ progress: null });
          return false;
        }

        // Check if progress has meaningful data
        return !!(
          progress.currentStep > 1 ||
          (progress.uploadedFile && !!progress.uploadedFile.uploaded_file_id)
        );
      },
    }),
    {
      name: STORAGE_KEY,
      // Only persist progress, not the functions
      partialize: state => ({ progress: state.progress }),
    }
  )
);
