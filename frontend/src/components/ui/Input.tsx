import type { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-secondary mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 rounded-xl border-2 transition-colors',
          'focus:outline-none focus:border-primary',
          'placeholder:text-secondary/40',
          error ? 'border-primary bg-primary/5' : 'border-secondary/20 bg-surface',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-primary">{error}</p>
      )}
    </div>
  );
}
