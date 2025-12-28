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
      <CardContent className="flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-md text-center">
          <div className="mb-4 text-6xl">📄</div>
          <h3 className="mb-2 text-xl font-semibold text-foreground dark:text-foreground">
            {translations.title}
          </h3>
          <p className="mb-6 text-muted-foreground dark:text-muted-foreground">
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
