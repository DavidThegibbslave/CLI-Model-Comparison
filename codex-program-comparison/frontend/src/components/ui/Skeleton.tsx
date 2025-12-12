import type { CSSProperties } from 'react';
import { classNames } from '../../utils/classNames';

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function Skeleton({ width = '100%', height = 12, rounded = true, className, style }: SkeletonProps) {
  return (
    <div
      className={classNames('skeleton', className)}
      style={{ width, height, borderRadius: rounded ? '999px' : 4, ...style }}
    />
  );
}
