interface SlideOverProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}

export function SlideOver({ isOpen, title, children, onClose, footer }: SlideOverProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="slideover-title"
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="relative w-screen max-w-md">
          <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E6E6E6] px-6 py-4">
              <h2 id="slideover-title" className="text-lg font-semibold text-[#252525]">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-[#8e8e8e] hover:text-[#252525]"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 px-6 py-4">{children}</div>
            {footer && <div className="border-t border-[#E6E6E6] px-6 py-4">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

