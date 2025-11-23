import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  children,
  className,
  disabled,
  isLoading,
  ...props
}: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white shadow-lg shadow-primary/30 active:shadow-primary/50',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary/5',
    ghost: 'text-secondary hover:bg-secondary/5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Cargando...' : children}
    </button>
  );
}
