import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  afterLeave?: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  draggable?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const EDGE_MARGIN = 16;

interface DragState {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  minDx: number;
  maxDx: number;
  minDy: number;
  maxDy: number;
}

export function Dialog({ open, onClose, afterLeave, title, children, className, size = 'md', draggable = false }: DialogProps) {
  const { t } = useTranslation();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<DragState | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (open) setOffset({ x: 0, y: 0 });
  }, [open]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const state = dragRef.current;
    if (!state) return;
    let dx = e.clientX - state.startX;
    let dy = e.clientY - state.startY;
    if (state.maxDx >= state.minDx) dx = Math.min(Math.max(dx, state.minDx), state.maxDx);
    if (state.maxDy >= state.minDy) dy = Math.min(Math.max(dy, state.minDy), state.maxDy);
    setOffset({ x: state.originX + dx, y: state.originY + dy });
  }, []);

  const endDrag = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    window.removeEventListener('blur', endDrag);
  }, [handlePointerMove]);

  useEffect(() => endDrag, [endDrag]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    const panel = headerRef.current?.parentElement;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
      minDx: EDGE_MARGIN - rect.left,
      maxDx: window.innerWidth - EDGE_MARGIN - rect.width - rect.left,
      minDy: EDGE_MARGIN - rect.top,
      maxDy: window.innerHeight - EDGE_MARGIN - rect.height - rect.top,
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    window.addEventListener('blur', endDrag);
    e.preventDefault();
  }, [offset.x, offset.y, handlePointerMove, endDrag]);

  const handleDoubleClick = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  const isDragging = offset.x !== 0 || offset.y !== 0;

  return (
    <Transition appear show={open} as={Fragment} afterLeave={afterLeave}>
      <HeadlessDialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <HeadlessDialog.Panel
                className={cn(
                  'w-full bg-white rounded-xl shadow-xl p-6',
                  sizes[size],
                  className,
                )}
                style={
                  draggable && isDragging
                    ? { transform: `translate(${offset.x}px, ${offset.y}px)` }
                    : undefined
                }
              >
                {title && (
                  <div
                    ref={headerRef}
                    className={cn(
                      'flex items-center justify-between mb-4',
                      draggable && 'cursor-grab active:cursor-grabbing touch-none select-none',
                    )}
                    title={draggable ? t('common.dragHint') : undefined}
                    onPointerDown={draggable ? handlePointerDown : undefined}
                    onDoubleClick={draggable ? handleDoubleClick : undefined}
                  >
                    <HeadlessDialog.Title className="text-lg font-semibold text-gray-900">
                      {title}
                    </HeadlessDialog.Title>
                    <button
                      onClick={onClose}
                      aria-label={t('common.close')}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
                {children}
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}
