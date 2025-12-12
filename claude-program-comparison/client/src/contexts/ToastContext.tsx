import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage } from '@/types';
import { ToastContainer } from '@/components/ui';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (
    type: ToastMessage['type'],
    title: string,
    message?: string,
    duration?: number
  ) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
}) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (
      type: ToastMessage['type'],
      title: string,
      message?: string,
      duration: number = 5000
    ) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const toast: ToastMessage = {
        id,
        type,
        title,
        message,
        duration,
      };

      setToasts((prev) => [...prev, toast]);
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      showToast('success', title, message);
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      showToast('error', title, message, 7000); // Longer duration for errors
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      showToast('warning', title, message);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      showToast('info', title, message);
    },
    [showToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value: ToastContextType = {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} position={position} />
    </ToastContext.Provider>
  );
};
