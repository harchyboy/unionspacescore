import type { ReactNode } from 'react';

interface SlideOverProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SlideOver({ isOpen, title, children, onClose, footer, size = 'lg' }: SlideOverProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slideover-title"
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className={`relative w-screen ${sizes[size]} transform transition-transform`}>
          <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
            <div className="sticky top-0 bg-white border-b border-[#E6E6E6] px-6 py-4 flex items-center justify-between z-10">
              <h2 id="slideover-title" className="text-xl font-semibold text-primary">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-secondary hover:text-primary transition-all-smooth"
                aria-label="Close"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <div className="flex-1 p-6">{children}</div>
            {footer && (
              <div className="sticky bottom-0 bg-white border-t border-[#E6E6E6] px-6 py-4">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

