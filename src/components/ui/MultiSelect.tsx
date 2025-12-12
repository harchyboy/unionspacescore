import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(o => o.value));
    }
  };

  const displayText = value.length === 0 
    ? placeholder 
    : value.length === 1 
      ? options.find(o => o.value === value[0])?.label || value[0]
      : `${value.length} selected`;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-primary mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between min-w-[200px]"
      >
        <span className="truncate">{displayText}</span>
        <i className={`fa-solid fa-chevron-down text-secondary text-xs transition-transform ${isOpen ? 'transform rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#E6E6E6] rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div 
            className="px-4 py-2 hover:bg-[#FAFAFA] cursor-pointer border-b border-[#E6E6E6]"
            onClick={handleSelectAll}
          >
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={value.length > 0 && value.length === options.length}
                ref={input => {
                  if (input) {
                    input.indeterminate = value.length > 0 && value.length < options.length;
                  }
                }}
                readOnly
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-primary">All Submarkets</span>
            </div>
          </div>
          {options.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 hover:bg-[#FAFAFA] cursor-pointer flex items-center space-x-2"
              onClick={() => toggleOption(option.value)}
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                readOnly
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-primary">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

