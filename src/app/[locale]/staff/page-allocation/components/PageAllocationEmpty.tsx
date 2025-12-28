'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface PageAllocationEmptyProps {
  onInitialize: () => void;
  translations: {
    title: string;
    message: string;
    action: string;
  };
}

export default function PageAllocationEmpty({
  onInitialize,
  translations,
}: PageAllocationEmptyProps) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <div className="text-center max-w-md">
          <div className="mb-4 text-6xl">📄</div>
          <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
            {translations.title}
          </h3>
          <p className="mb-6 text-slate-600 dark:text-white/70">
            {translations.message}
          </p>
          <Button onClick={onInitialize} variant="default" size="lg">
            {translations.action}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

