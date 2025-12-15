'use client';

import React, {
  SelectHTMLAttributes,
  forwardRef,
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> {
  error?: boolean;
  onChange?: (e: { target: { value: string } }) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, error, children, value, onChange, disabled, ...props },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownMenuRef = useRef<HTMLDivElement>(null);
    const internalRef = useRef<HTMLSelectElement>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{
      top: number;
      left: number;
      width: number;
    } | null>(null);

    // Parse options from children
    const options = useRef<
      Array<{ value: string; label: string; disabled?: boolean }>
    >([]);

    useEffect(() => {
      if (children) {
        const opts: Array<{
          value: string;
          label: string;
          disabled?: boolean;
        }> = [];
        React.Children.forEach(children, child => {
          if (React.isValidElement(child) && child.type === 'option') {
            opts.push({
              value: child.props.value || '',
              label: (child.props.children as string) || '',
              disabled: child.props.disabled || false,
            });
          }
        });
        options.current = opts;
      }
    }, [children]);

    // Expose ref to parent
    useImperativeHandle(
      ref,
      () => internalRef.current as HTMLSelectElement,
      []
    );

    // Calculate dropdown position
    useEffect(() => {
      if (isOpen && buttonRef.current) {
        const updatePosition = () => {
          if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
              top: rect.bottom + 6, // 6px spacing
              left: rect.left,
              width: rect.width,
            });
          }
        };

        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
          window.removeEventListener('scroll', updatePosition, true);
          window.removeEventListener('resize', updatePosition);
        };
      } else {
        setDropdownPosition(null);
      }
    }, [isOpen]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          dropdownMenuRef.current &&
          !dropdownMenuRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
          document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Sync with native select for form compatibility
    useEffect(() => {
      if (internalRef.current && value !== undefined) {
        internalRef.current.value = String(value);
      }
    }, [value]);

    const selectedOption = options.current.find(
      opt => opt.value === String(value || '')
    );

    const handleSelect = (optionValue: string) => {
      if (disabled) return;

      // Update native select
      if (internalRef.current) {
        internalRef.current.value = optionValue;
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        internalRef.current.dispatchEvent(event);
      }

      // Call onChange prop
      onChange?.({ target: { value: optionValue } });
      setIsOpen(false);
    };

    return (
      <>
        {/* Hidden native select for form compatibility */}
        <select
          ref={internalRef}
          value={value}
          onChange={e => onChange?.({ target: { value: e.target.value } })}
          disabled={disabled}
          className="sr-only"
          {...props}
        >
          {children}
        </select>

        {/* Custom dropdown UI */}
        <div ref={dropdownRef} className="relative w-full">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 transition-colors',
              'hover:border-slate-400 hover:bg-slate-50',
              'focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-50 disabled:hover:border-slate-300 disabled:hover:bg-slate-50',
              'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
              'dark:hover:border-slate-500 dark:hover:bg-slate-700',
              'dark:focus:border-sky-400 dark:focus:ring-sky-400/20',
              'dark:disabled:bg-slate-900 dark:disabled:text-slate-600 dark:disabled:hover:bg-slate-900',
              error &&
                'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20 dark:border-rose-400 dark:focus:border-rose-400 dark:focus:ring-rose-400/20',
              isOpen &&
                'border-sky-500 ring-2 ring-sky-500/20 ring-offset-0 dark:border-sky-400 dark:ring-sky-400/20',
              className
            )}
          >
            <span
              className={cn(
                'flex-1 truncate text-left',
                !selectedOption && 'text-slate-400 dark:text-slate-500',
                selectedOption && 'text-slate-900 dark:text-slate-100'
              )}
            >
              {selectedOption ? selectedOption.label : 'Chọn...'}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={cn(
                'ml-2 h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500',
                isOpen && 'rotate-180'
              )}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          {isOpen &&
            dropdownPosition &&
            typeof window !== 'undefined' &&
            createPortal(
              <div
                ref={dropdownMenuRef}
                className="fixed z-[10000] min-w-[200px] overflow-hidden rounded-lg border-0 bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                }}
              >
                <div className="max-h-60 overflow-auto py-1.5">
                  {options.current.length === 0 ? (
                    <div className="px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">
                      Không có tùy chọn
                    </div>
                  ) : (
                    options.current.map((option, index) => {
                      const isSelected = option.value === String(value || '');
                      return (
                        <button
                          key={`${option.value}-${index}`}
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          disabled={option.disabled || disabled}
                          className={cn(
                            'mx-1.5 w-[calc(100%-0.75rem)] cursor-pointer rounded-md px-3 py-2.5 text-left text-sm transition-all duration-150',
                            'text-slate-900 dark:text-slate-100',
                            'hover:bg-sky-100 hover:text-sky-900',
                            'focus:bg-sky-100 focus:text-sky-900 focus:outline-none',
                            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-900 dark:disabled:hover:text-slate-100',
                            'dark:hover:bg-sky-500/20 dark:hover:text-sky-300',
                            'dark:focus:bg-sky-500/20 dark:focus:text-sky-300',
                            isSelected &&
                              'bg-sky-50 font-semibold text-sky-900 shadow-sm dark:bg-sky-500/20 dark:text-sky-300'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex-1 truncate">
                              {option.label}
                            </span>
                            {isSelected && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                className="h-4 w-4 flex-shrink-0"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.5 12.75l6 6 9-13.5"
                                />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>,
              document.body
            )}
        </div>
      </>
    );
  }
);

Select.displayName = 'Select';
