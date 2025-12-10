import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  error?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          'h-4 w-4 cursor-pointer rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';
