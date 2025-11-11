import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-primary text-white',
    error: 'bg-destructive text-white',
    info: 'bg-secondary text-white',
  };

  return (
    <div
      className={`fixed bottom-8 right-8 ${typeStyles[type]} px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 min-w-[200px]`}
    >
      <i
        className={`fa-solid ${
          type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
        }`}
      ></i>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-75">
        <i className="fa-solid fa-times"></i>
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type?: 'success' | 'error' | 'info' }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-8 right-8 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

