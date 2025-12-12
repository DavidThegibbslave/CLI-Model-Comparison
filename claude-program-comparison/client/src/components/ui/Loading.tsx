import React from 'react';
import clsx from 'clsx';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export const Loading: React.FC<LoadingProps> = ({ size = 'md', text, fullScreen = false }) => {
  const spinner = (
    <div className={clsx('flex flex-col items-center justify-center gap-3', fullScreen && 'h-full')}>
      <svg
        className={clsx('animate-spin text-primary-600 dark:text-primary-400', sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-950 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Skeleton Loader Component
interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
            className || 'h-4 w-full mb-2'
          )}
        />
      ))}
    </>
  );
};

// Table Skeleton Loader
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={clsx('h-10', colIndex === 0 ? 'w-1/4' : 'flex-1')}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
