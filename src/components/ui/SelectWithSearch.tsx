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

export interface SelectWithSearchProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> {
  error?: boolean;
  onChange?: (e: { target: { value: string } }) => void;
  searchPlaceholder?: string;
}

export const SelectWithSearch = forwardRef<
  HTMLSelectElement,
  SelectWithSearchProps
>(
  (
    {
      className,
      error,
      children,
      value,
      onChange,
      disabled,
      searchPlaceholder = 'Tìm kiếm...',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownMenuRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
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
        setSearchQuery(''); // Reset search when closing
      }
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
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

    // Filter options based on search query
    const filteredOptions = options.current.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
      setSearchQuery('');
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
              'flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-all',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground',
              error && 'border-destructive focus:ring-destructive',
              isOpen && 'ring-2 ring-ring ring-offset-2',
              className
            )}
          >
            <span
              className={cn(
                'flex-1 truncate text-left',
                !selectedOption && 'text-muted-foreground'
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
                'ml-2 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200',
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
                {/* Search Input */}
                <div className="border-b border-slate-200 p-2 dark:border-slate-700">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={cn(
                      'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
                      'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                      'dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-400',
                      'dark:focus:border-blue-400 dark:focus:ring-blue-400'
                    )}
                    onClick={e => e.stopPropagation()}
                  />
                </div>

                {/* Options List */}
                <div className="max-h-60 overflow-auto py-1.5">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">
                      {searchQuery
                        ? 'Không tìm thấy kết quả'
                        : 'Không có tùy chọn'}
                    </div>
                  ) : (
                    filteredOptions.map((option, index) => {
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
                            'hover:bg-blue-100 hover:text-blue-900',
                            'focus:bg-blue-100 focus:text-blue-900 focus:outline-none',
                            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-900 dark:disabled:hover:text-slate-100',
                            'dark:hover:bg-blue-800/50 dark:hover:text-white',
                            'dark:focus:bg-blue-800/50 dark:focus:text-white',
                            isSelected &&
                              'bg-blue-200 font-semibold text-blue-900 shadow-sm dark:bg-blue-600 dark:text-white'
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

SelectWithSearch.displayName = 'SelectWithSearch';
