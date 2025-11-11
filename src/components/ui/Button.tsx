import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    outline: 'border border-[#E6E6E6] text-primary hover:bg-muted',
    ghost: 'text-primary hover:bg-muted',
    destructive: 'bg-destructive text-white hover:bg-destructive/90',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-5 h-5',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <i className={`fa-solid fa-spinner fa-spin ${iconSizes[size]} mr-2`}></i>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <i className={`fa-solid ${icon} ${iconSizes[size]} mr-2`}></i>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <i className={`fa-solid ${icon} ${iconSizes[size]} ml-2`}></i>
          )}
        </>
      )}
    </button>
  );
}

