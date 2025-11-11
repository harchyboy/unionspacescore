import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const baseTextareaClasses = 'w-full px-4 py-2.5 bg-muted border rounded-lg text-sm text-primary placeholder-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all-smooth resize-none';
  const errorClasses = hasError ? 'border-destructive focus:ring-destructive' : 'border-[#E6E6E6]';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-primary mb-2">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`${baseTextareaClasses} ${errorClasses} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary">{helperText}</p>
      )}
    </div>
  );
}

