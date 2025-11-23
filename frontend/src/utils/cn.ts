import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility para combinar clases de Tailwind de forma condicional
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
