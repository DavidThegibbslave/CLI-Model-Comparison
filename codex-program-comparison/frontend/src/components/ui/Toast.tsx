import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Button } from './Button';
import { classNames } from '../../utils/classNames';

type ToastProps = {
  message: string;
  type?: 'info' | 'success' | 'danger';
  onClose?: () => void;
  action?: ReactNode;
  durationMs?: number;
};

export function Toast({ message, type = 'info', onClose, action, durationMs = 4000 }: ToastProps) {
  useEffect(() => {
    if (!onClose) return undefined;
    const id = setTimeout(onClose, durationMs);
    return () => clearTimeout(id);
  }, [onClose, durationMs]);

  return (
    <div className={classNames('toast', type === 'success' && 'success', type === 'danger' && 'danger')}>
      <div>
        <strong style={{ display: 'block', marginBottom: 4 }}>{type === 'success' ? 'Success' : type === 'danger' ? 'Error' : 'Notice'}</strong>
        <span>{message}</span>
      </div>
      {action}
      {onClose && (
        <Button variant="ghost" onClick={onClose} aria-label="Dismiss notification">
          ✕
        </Button>
      )}
    </div>
  );
}
