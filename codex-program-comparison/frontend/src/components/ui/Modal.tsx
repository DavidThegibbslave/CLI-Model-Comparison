import type { ReactNode } from 'react';
import { Button } from './Button';

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
};

export function Modal({ open, title, children, onClose, actions }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          {title && <h3 className="card-title">{title}</h3>}
          <Button variant="ghost" onClick={onClose} aria-label="Close dialog">
            ✕
          </Button>
        </div>
        <div className="card-body">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
