import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  leftElement,
  rightElement,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const baseInputClasses = 'w-full px-4 py-2.5 bg-muted border rounded-lg text-sm text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all-smooth';
  const errorClasses = hasError ? 'border-destructive focus:ring-destructive' : 'border-[#E6E6E6]';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-primary mb-2">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && !leftElement && (
          <i className={`fa-solid ${icon} absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary pointer-events-none`}></i>
        )}
        {leftElement && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
            {leftElement}
          </div>
        )}
        <input
          id={inputId}
          className={`${baseInputClasses} ${errorClasses} ${
            icon && iconPosition === 'left' && !leftElement ? 'pl-11' : leftElement ? 'pl-12' : ''
          } ${
            icon && iconPosition === 'right' && !rightElement ? 'pr-11' : rightElement ? 'pr-12' : ''
          } ${className}`}
          {...props}
        />
        {icon && iconPosition === 'right' && !rightElement && (
          <i className={`fa-solid ${icon} absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary pointer-events-none`}></i>
        )}
        {rightElement && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
            {rightElement}
          </div>
        )}
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

