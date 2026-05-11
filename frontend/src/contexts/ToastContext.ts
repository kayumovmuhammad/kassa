import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'warning' | 'danger';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/**
 * Global function to show a toast message from anywhere in the codebase.
 * 
 * @param message The text to display
 * @param type The type of toast (info, success, warning, danger)
 * @param duration Duration in milliseconds before auto-closing (default 5000ms)
 */
export const showToast = (message: string, type: ToastType = 'info', duration: number = 5000) => {
  useToastStore.getState().addToast({ message, type, duration });
};
