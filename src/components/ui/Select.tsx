import type { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  icon?: string;
  children?: ReactNode;
}

export function Select({
  label,
  error,
  helperText,
  options,
  placeholder,
  icon = 'fa-chevron-down',
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const baseSelectClasses = 'w-full pl-4 pr-10 py-2.5 bg-muted border rounded-lg text-sm text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all-smooth';
  const errorClasses = hasError ? 'border-destructive focus:ring-destructive' : 'border-[#E6E6E6]';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-primary mb-2">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`${baseSelectClasses} ${errorClasses} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <i className={`fa-solid ${icon} absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none`}></i>
      </div>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary">{helperText}</p>
      )}
    </div>
  );
}

