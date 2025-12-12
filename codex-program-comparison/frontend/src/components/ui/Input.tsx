import type { InputHTMLAttributes } from 'react';
import { classNames } from '../../utils/classNames';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className, ...props }: InputProps) {
  return (
    <label className="input-wrapper">
      {label && <span className="input-label">{label}</span>}
      <input className={classNames('input-field', error && 'input-error', className)} {...props} />
      {error ? <span className="input-message error">{error}</span> : hint ? <span className="input-message">{hint}</span> : null}
    </label>
  );
}
