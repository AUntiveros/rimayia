import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl shadow-sm p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
