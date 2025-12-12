import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, children, className = '', disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-all-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-[#252525] text-white hover:bg-[#252525]/90 focus:ring-[#252525]',
      secondary: 'bg-[#8E8E8E] text-white hover:bg-[#8E8E8E]/90 focus:ring-[#8E8E8E]',
      outline: 'border border-[#E6E6E6] bg-white text-[#252525] hover:bg-[#F0F0F0] focus:ring-[#252525]',
      ghost: 'text-[#252525] hover:bg-[#F0F0F0] focus:ring-[#252525]',
      destructive: 'bg-destructive text-white hover:bg-destructive/90 focus:ring-destructive',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2', // Increased to match brand feel (closer to 44px height)
      lg: 'px-8 py-3 text-base gap-2', // Matches brand 48px/32px padding more closely
    };
    
    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {icon && <i className={`fa-solid ${icon}`}></i>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

