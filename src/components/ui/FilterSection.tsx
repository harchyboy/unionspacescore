import type { ReactNode } from 'react';
import { Button } from './Button';

interface FilterSectionProps {
  children: ReactNode;
  onClear?: () => void;
  className?: string;
}

export function FilterSection({ children, onClear, className = '' }: FilterSectionProps) {
  return (
    <div className={`bg-white border-b border-[#E6E6E6] px-8 py-4 ${className}`}>
      <div className="flex items-center space-x-3 flex-wrap gap-2">
        {children}
        {onClear && (
          <button
            onClick={onClear}
            className="text-secondary hover:text-primary text-sm ml-2 transition-all-smooth"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

interface FilterGroupProps {
  children: ReactNode;
  className?: string;
}

export function FilterGroup({ children, className = '' }: FilterGroupProps) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {children}
    </div>
  );
}

