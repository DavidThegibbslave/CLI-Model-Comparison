import type { PropsWithChildren, ReactNode } from 'react';

type CardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}>;

export function Card({ children, title, subtitle, actions }: CardProps) {
  return (
    <div className="card">
      {(title || actions) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
