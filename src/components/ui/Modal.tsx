import { cn } from '@/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/25" onClick={onClose} />
      <div
        className={cn(
          'relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
