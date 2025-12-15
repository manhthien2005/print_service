'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'auto-rotate'?: boolean;
          'camera-controls'?: boolean;
          'interaction-policy'?: string;
          'environment-image'?: string;
          exposure?: number;
          'shadow-intensity'?: number;
          ar?: boolean;
          'ar-modes'?: string;
          'ar-scale'?: string;
          loading?: string;
          reveal?: string;
          poster?: string;
        },
        HTMLElement
      >;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

interface Model3DViewerProps {
  src: string;
  alt?: string;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  poster?: string;
  onError?: () => void;
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({
  src,
  alt = '3D Model',
  className,
  autoRotate = false,
  cameraControls = true,
  poster,
  onError,
}) => {
  const modelViewerRef = useRef<HTMLElement>(null);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const scriptLoadingRef = useRef(false);

  useEffect(() => {
    // Check if script is already loaded
    if (typeof window !== 'undefined' && 'customElements' in window) {
      if (customElements.get('model-viewer')) {
        setScriptLoaded(true);
        return;
      }
    }

    // Load model-viewer script if not already loading
    if (!scriptLoadingRef.current && typeof window !== 'undefined') {
      scriptLoadingRef.current = true;
      const script = document.createElement('script');
      script.type = 'module';
      script.src =
        'https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js';
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
        scriptLoadingRef.current = false;
      };
      script.onerror = () => {
        console.error('Failed to load model-viewer');
        scriptLoadingRef.current = false;
        if (onError) onError();
      };
      document.head.appendChild(script);
    }
  }, [onError]);

  // Check if file is a 3D model format
  const is3DFormat = (url: string): boolean => {
    const extension = url.toLowerCase().split('.').pop();
    return ['glb', 'gltf', 'usdz'].includes(extension || '');
  };

  if (!is3DFormat(src)) {
    // Fallback to image if not a 3D model
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center',
          className
        )}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-contain"
          onError={onError}
        />
      </div>
    );
  }

  // Show loading state while script is loading
  if (!scriptLoaded) {
    return (
      <div className={cn('relative h-full w-full', className)}>
        <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 animate-spin text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
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
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Đang tải viewer 3D...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative h-full w-full', className)}>
      <model-viewer
        ref={modelViewerRef}
        src={src}
        alt={alt}
        auto-rotate={autoRotate}
        camera-controls={cameraControls}
        interaction-policy="allow-when-focused"
        environment-image="neutral"
        exposure={1}
        shadow-intensity={1}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        loading="eager"
        reveal="auto"
        poster={poster}
        className="h-full w-full"
        style={{
          backgroundColor: 'transparent',
          display: 'block',
          width: '100%',
          height: '100%',
        }}
        onError={(e: React.SyntheticEvent<HTMLElement, Event>) => {
          console.error('Model viewer error:', e);
          if (onError) onError();
        }}
      >
        {/* Loading placeholder */}
        <div
          slot="poster"
          className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800"
        >
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 animate-spin text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
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
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Đang tải model 3D...
            </p>
          </div>
        </div>
      </model-viewer>
    </div>
  );
};
