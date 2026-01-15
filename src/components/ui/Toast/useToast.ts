import { createContext, useContext } from 'react';
import type { ToastContextType } from './types.ts';

// ===== Toast Context =====

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
