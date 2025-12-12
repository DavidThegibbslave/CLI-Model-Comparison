import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { classNames } from '../../utils/classNames';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    isLoading?: boolean;
  }
>;

export function Button({ children, variant = 'primary', isLoading, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={classNames('btn', `btn-${variant}`, isLoading && 'is-loading', className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      <span>{children}</span>
    </button>
  );
}
