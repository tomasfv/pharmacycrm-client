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
}

export function DropdownSelect({
  options,
  value,
  onChange,
  placeholder,
  className,
  error,
}: DropdownSelectProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0, openUp: false });

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest?.('[data-dropdown-menu]')
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const estimatedHeight = Math.min(options.length, 10) * 36 + 16;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < estimatedHeight;
      setMenuPos({
        top: openUp ? rect.top - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        openUp,
      });
    }
    setOpen(!open);
  };

  const select = (optValue: string) => {
    onChange(optValue);
    setOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
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
                  onClick={() => select('')}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  {placeholder}
                </button>
              )}
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => select(opt.value)}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-gray-50',
                    opt.value === value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-900',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
