import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [show, setShow] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
    }
    setShow(true);
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
      className={cn('inline-block', className)}
    >
      {children}
      {show &&
        createPortal(
          <div
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[220px] max-w-[300px]"
            style={{ top: pos.top - 8, left: pos.left, transform: 'translateY(-100%)' }}
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
}
