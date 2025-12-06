import React from 'react';

export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Print Service. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
