import { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/utils';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarItem {
  id: string;
  message: string;
  type: SnackbarType;
}

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
};

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
};

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snacks, setSnacks] = useState<SnackbarItem[]>([]);

  const showSnackbar = useCallback((message: string, type: SnackbarType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setSnacks((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setSnacks((prev) => prev.filter((s) => s.id !== id));
    }, 4000);
  }, []);

  const removeSnack = (id: string) => {
    setSnacks((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {snacks.map((snack) => {
          const Icon = icons[snack.type];
          return (
            <div
              key={snack.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] animate-slide-in',
                colors[snack.type],
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', iconColors[snack.type])} />
              <p className="text-sm flex-1">{snack.message}</p>
              <button onClick={() => removeSnack(snack.id)} className="shrink-0 hover:opacity-70">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </SnackbarContext.Provider>
  );
}
