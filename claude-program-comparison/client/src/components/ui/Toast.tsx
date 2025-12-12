import React, { useEffect } from 'react';
import { ToastMessage } from '@/types';
import clsx from 'clsx';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const iconMap = {
  success: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const styleMap = {
  success: 'bg-success-50 dark:bg-success-900 border-success-200 dark:border-success-700',
  error: 'bg-danger-50 dark:bg-danger-900 border-danger-200 dark:border-danger-700',
  warning: 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700',
  info: 'bg-primary-50 dark:bg-primary-900 border-primary-200 dark:border-primary-700',
};

const iconColorMap = {
  success: 'text-success-600 dark:text-success-400',
  error: 'text-danger-600 dark:text-danger-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-primary-600 dark:text-primary-400',
};

const textColorMap = {
  success: 'text-success-900 dark:text-success-100',
  error: 'text-danger-900 dark:text-danger-100',
  warning: 'text-yellow-900 dark:text-yellow-100',
  info: 'text-primary-900 dark:text-primary-100',
};

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg',
        'animate-fade-in pointer-events-auto',
        styleMap[toast.type]
      )}
    >
      <div className={iconColorMap[toast.type]}>{iconMap[toast.type]}</div>

      <div className="flex-1 min-w-0">
        <p className={clsx('font-semibold text-sm', textColorMap[toast.type])}>{toast.title}</p>
        {toast.message && (
          <p className={clsx('mt-1 text-sm', textColorMap[toast.type])}>{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className={clsx(
          'flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
          'transition-colors'
        )}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
}) => {
  return (
    <div
      className={clsx(
        'fixed z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none',
        positionClasses[position]
      )}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};
