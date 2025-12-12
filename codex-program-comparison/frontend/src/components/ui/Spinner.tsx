import { classNames } from '../../utils/classNames';

type SpinnerProps = {
  size?: 'sm' | 'md';
};

export function Spinner({ size = 'md' }: SpinnerProps) {
  return <span className={classNames('spinner', size === 'sm' ? 'spinner-sm' : 'spinner-md')} role="status" aria-label="Loading" />;
}
