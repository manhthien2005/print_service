import React from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <p className="mb-8 text-muted-foreground">Page Not Found</p>
      <Link href="/vi">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
