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
  const [tempValue, setTempValue] = useState<string[]>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync tempValue when opening or when props change (if closed)
  useEffect(() => {
    if (isOpen) {
      setTempValue(value);
    }
  }, [isOpen, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onChange(tempValue); // Apply changes on close
          setIsOpen(false);
        }
      }
    }

    // Handle Enter key to apply
    function handleKeyDown(event: KeyboardEvent) {
      if (isOpen && event.key === 'Enter') {
        onChange(tempValue);
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, tempValue, onChange]);

  const toggleOption = (optionValue: string) => {
    if (tempValue.includes(optionValue)) {
      setTempValue(tempValue.filter((v) => v !== optionValue));
    } else {
      setTempValue([...tempValue, optionValue]);
    }
  };

  const handleSelectAll = () => {
    if (tempValue.length === options.length) {
      setTempValue([]);
    } else {
      setTempValue(options.map(o => o.value));
    }
  };

  // Display text should reflect tempValue while open, or value while closed?
  // Usually it reflects what's currently checked in the dropdown.
  // But the trigger button should probably reflect the *applied* value until applied?
  // Let's make the trigger reflect the *checked* state if open, to show what will be applied?
  // No, standard is: Trigger shows applied. Dropdown shows pending.
  // Actually, if I select items, I want to see "2 selected" in the box?
  // If the box is what I click to open, it's fine.
  // Let's stick to: Trigger shows `value` (applied). Dropdown items show `tempValue` (pending).
  
  const displayValue = isOpen ? tempValue : value;
  
  const displayText = displayValue.length === 0 
    ? placeholder 
    : displayValue.length === 1 
      ? options.find(o => o.value === displayValue[0])?.label || displayValue[0]
      : `${displayValue.length} selected`;

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
                checked={tempValue.length > 0 && tempValue.length === options.length}
                ref={input => {
                  if (input) {
                    input.indeterminate = tempValue.length > 0 && tempValue.length < options.length;
                  }
                }}
                readOnly
                className="w-4 h-4 rounded border-[#E6E6E6] text-primary focus:ring-primary accent-primary cursor-pointer"
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
                checked={tempValue.includes(option.value)}
                readOnly
                className="w-4 h-4 rounded border-[#E6E6E6] text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <span className="text-sm text-primary">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

