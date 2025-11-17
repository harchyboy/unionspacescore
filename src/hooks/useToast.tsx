import { useState, useCallback } from 'react';
import { ToastContainer, type ToastContainerProps } from '../components/ui/Toast';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface UseToastReturn {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
  ToastComponent: typeof ToastContainer;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { 
    showToast, 
    toasts,
    removeToast,
    ToastComponent: ToastContainer
  };
}

