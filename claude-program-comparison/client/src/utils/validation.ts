/**
 * Form Validation Utilities
 *
 * Provides reusable validation functions for forms
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validate password strength
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain an uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain a lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain a number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must contain a special character' };
  }

  return { isValid: true };
};

/**
 * Calculate password strength (0-4)
 * 0 = Very Weak, 1 = Weak, 2 = Fair, 3 = Good, 4 = Strong
 */
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;

  let strength = 0;

  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character type checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  // Cap at 4
  return Math.min(strength, 4);
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (strength: number): string => {
  switch (strength) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return '';
  }
};

/**
 * Get password strength color (Tailwind class)
 */
export const getPasswordStrengthColor = (strength: number): string => {
  switch (strength) {
    case 0:
    case 1:
      return 'bg-danger-500';
    case 2:
      return 'bg-yellow-500';
    case 3:
      return 'bg-primary-500';
    case 4:
      return 'bg-success-500';
    default:
      return 'bg-gray-300';
  }
};

/**
 * Validate password confirmation
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true };
};

/**
 * Validate name (first/last name)
 */
export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
  if (!name) {
    return { isValid: false, message: `${fieldName} is required` };
  }

  if (name.length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters` };
  }

  if (name.length > 50) {
    return { isValid: false, message: `${fieldName} must be less than 50 characters` };
  }

  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { isValid: false, message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }

  return { isValid: true };
};
