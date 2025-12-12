import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '@/contexts';
import { Button, Input, Card } from '@/components/ui';
import { validateEmail } from '@/utils/validation';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
    }

    // Password validation (just check if empty)
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      showSuccess('Login successful', 'Welcome back!');
      navigate('/');
    } catch (error: any) {
      // Extract error message from API response
      let errorMessage = 'Invalid email or password';

      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ general: errorMessage });
      showError('Login failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card padding="lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="mb-4 p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
            <p className="text-sm text-danger-700 dark:text-danger-300">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            inputType="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            placeholder="demo@cryptomarket.com"
            error={errors.email}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            inputType="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            placeholder="Enter your password"
            error={errors.password}
            required
            autoComplete="current-password"
          />

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth isLoading={isLoading} disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Credentials Banner */}
        <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <p className="text-xs font-medium text-primary-800 dark:text-primary-200 mb-1">
            Demo Credentials
          </p>
          <p className="text-xs text-primary-700 dark:text-primary-300">
            <strong>Email:</strong> demo@cryptomarket.com<br />
            <strong>Password:</strong> Demo123!
          </p>
        </div>
      </Card>
    </div>
  );
};
