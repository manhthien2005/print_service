import React from 'react';

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Print Service. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

