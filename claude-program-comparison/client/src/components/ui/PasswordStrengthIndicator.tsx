import React from 'react';
import { getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  show?: boolean;
}

/**
 * Password Strength Indicator Component
 *
 * Displays a visual indicator of password strength with bars and label
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  show = true,
}) => {
  if (!show || !password) return null;

  const strength = getPasswordStrength(password);
  const label = getPasswordStrengthLabel(strength);
  const colorClass = getPasswordStrengthColor(strength);

  return (
    <div className="mt-2">
      {/* Strength Bars */}
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index < strength ? colorClass : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Strength Label */}
      <p
        className={`text-xs font-medium ${
          strength === 0 || strength === 1
            ? 'text-danger-600 dark:text-danger-400'
            : strength === 2
            ? 'text-yellow-600 dark:text-yellow-400'
            : strength === 3
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-success-600 dark:text-success-400'
        }`}
      >
        Password Strength: {label}
      </p>
    </div>
  );
};
