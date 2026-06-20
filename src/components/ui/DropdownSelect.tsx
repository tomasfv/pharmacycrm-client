import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface DropdownSelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  searchable?: boolean;
}

export function DropdownSelect({
  options,
  value,
  onChange,
  placeholder,
  className,
  error,
  searchable,
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0, openUp: false });

  const selected = options.find((o) => o.value === value);

  const close = () => setOpen(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest?.('[data-dropdown-menu]')) return;
      if (buttonRef.current?.contains(target)) return;
      if (inputRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const positionMenu = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const estimatedHeight = Math.min(options.length, 10) * 36 + 16;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < estimatedHeight;
    setMenuPos({
      top: openUp ? rect.top - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      openUp,
    });
  };

  const select = (optValue: string) => {
    onChange(optValue);
    close();
  };

  // --- Searchable mode ---

  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = selected?.label || '';

  useEffect(() => {
    if (!open) setInputValue(selectedLabel);
  }, [selectedLabel, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!open) {
      if (inputRef.current) positionMenu(inputRef.current);
      setOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (!open) {
      setInputValue(selectedLabel);
      if (inputRef.current) positionMenu(inputRef.current);
      setOpen(true);
    }
    inputRef.current?.select();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
      setInputValue(selectedLabel);
    }
  };

  const filtered = inputValue
    ? options.filter((o) => o.label.toLowerCase().includes(inputValue.toLowerCase()))
    : options;

  const handleSelect = (optValue: string, optLabel: string) => {
    select(optValue);
    if (searchable) setInputValue(optLabel);
  };

  return (
    <div className={cn('relative', className)}>
      {searchable ? (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder || 'Search...'}
            className={cn(
              'flex w-full items-center rounded-lg border bg-white px-3 py-2 pr-8 text-sm outline-none transition-colors',
              open ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-300',
              error && 'border-red-500',
            )}
          />
          <ChevronDownIcon
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform',
              open && 'rotate-180',
            )}
          />
        </div>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!open && buttonRef.current) positionMenu(buttonRef.current);
            setOpen(!open);
          }}
          className={cn(
            'flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm transition-colors',
            open ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-300',
            !selected && placeholder ? 'text-gray-400' : 'text-gray-900',
            error && 'border-red-500',
          )}
        >
          <span className="truncate">{selected ? selected.label : placeholder || 'Select...'}</span>
          <ChevronDownIcon className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-180')} />
        </button>
      )}
      {open &&
        createPortal(
          <div
            data-dropdown-menu
            className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              width: Math.max(menuPos.width, 180),
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {placeholder && (
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => handleSelect('', placeholder)}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  {placeholder}
                </button>
              )}
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-sm text-gray-400 text-center">No results</p>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => handleSelect(opt.value, opt.label)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-gray-50',
                      opt.value === value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-900',
                    )}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
