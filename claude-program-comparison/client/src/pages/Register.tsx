import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '@/contexts';
import { Button, Input, Card, PasswordStrengthIndicator } from '@/components/ui';
import { validateEmail, validatePassword, validatePasswordMatch, validateName } from '@/utils/validation';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    general?: string;
  }>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields(new Set(touchedFields).add(field));
    validateField(field);
  };

  const validateField = (field: string): boolean => {
    let validation;
    const newErrors = { ...errors };

    switch (field) {
      case 'email':
        validation = validateEmail(formData.email);
        if (!validation.isValid) {
          newErrors.email = validation.message;
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        validation = validatePassword(formData.password);
        if (!validation.isValid) {
          newErrors.password = validation.message;
        } else {
          delete newErrors.password;
        }
        // Also revalidate confirmPassword if it's been touched
        if (touchedFields.has('confirmPassword')) {
          validation = validatePasswordMatch(formData.password, formData.confirmPassword);
          if (!validation.isValid) {
            newErrors.confirmPassword = validation.message;
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;

      case 'confirmPassword':
        validation = validatePasswordMatch(formData.password, formData.confirmPassword);
        if (!validation.isValid) {
          newErrors.confirmPassword = validation.message;
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case 'firstName':
        validation = validateName(formData.firstName, 'First name');
        if (!validation.isValid) {
          newErrors.firstName = validation.message;
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        validation = validateName(formData.lastName, 'Last name');
        if (!validation.isValid) {
          newErrors.lastName = validation.message;
        } else {
          delete newErrors.lastName;
        }
        break;
    }

    setErrors(newErrors);
    return !newErrors[field as keyof typeof newErrors];
  };

  const validateForm = (): boolean => {
    const fields = ['email', 'password', 'confirmPassword', 'firstName', 'lastName'];
    const allValid = fields.every((field) => validateField(field));
    return allValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Mark all fields as touched
    setTouchedFields(new Set(['email', 'password', 'confirmPassword', 'firstName', 'lastName']));

    // Client-side validation
    if (!validateForm()) {
      showError('Validation failed', 'Please check the form for errors');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      showSuccess('Registration successful', 'Welcome to CryptoMarket!');
      navigate('/');
    } catch (error: any) {
      // Extract error message from API response
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.error?.details) {
        // Handle validation errors from backend
        const details = error.response.data.error.details;
        const newErrors: any = {};
        details.forEach((detail: any) => {
          if (detail.field) {
            newErrors[detail.field] = detail.message;
          }
        });
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          errorMessage = 'Please correct the errors below';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
      showError('Registration failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card padding="lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Start tracking your crypto portfolio</p>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="mb-4 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
            <p className="text-sm text-danger-700 dark:text-danger-300">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              onBlur={() => handleFieldBlur('firstName')}
              error={touchedFields.has('firstName') ? errors.firstName : undefined}
              required
              autoComplete="given-name"
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              onBlur={() => handleFieldBlur('lastName')}
              error={touchedFields.has('lastName') ? errors.lastName : undefined}
              required
              autoComplete="family-name"
            />
          </div>

          <Input
            label="Email"
            inputType="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleFieldBlur('email')}
            error={touchedFields.has('email') ? errors.email : undefined}
            placeholder="your.email@example.com"
            required
            autoComplete="email"
          />

          <div>
            <Input
              label="Password"
              inputType="password"
              value={formData.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              onBlur={() => handleFieldBlur('password')}
              error={touchedFields.has('password') ? errors.password : undefined}
              helperText="Min 8 characters with uppercase, lowercase, number & special character"
              required
              autoComplete="new-password"
            />
            <PasswordStrengthIndicator password={formData.password} show={formData.password.length > 0} />
          </div>

          <Input
            label="Confirm Password"
            inputType="password"
            value={formData.confirmPassword}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
            onBlur={() => handleFieldBlur('confirmPassword')}
            error={touchedFields.has('confirmPassword') ? errors.confirmPassword : undefined}
            required
            autoComplete="new-password"
          />

          <Button type="submit" fullWidth isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms and Privacy Notice */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
