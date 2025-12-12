import React from 'react';

/**
 * Skip to content link for keyboard accessibility
 * Allows keyboard users to skip navigation and go directly to main content
 */
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      aria-label="Skip to main content"
    >
      Skip to content
    </a>
  );
};
