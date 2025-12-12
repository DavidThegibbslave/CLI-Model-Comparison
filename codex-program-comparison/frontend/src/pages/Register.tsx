import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../store/AuthContext';

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function getPasswordStrength(value: string) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  const labels = ['Too weak', 'Weak', 'Good', 'Strong'];
  const colors = ['var(--color-danger-500)', '#f59e0b', '#22c55e', '#16a34a'];

  return {
    score,
    label: labels[Math.max(0, score - 1)] || 'Too weak',
    color: colors[Math.max(0, score - 1)] || 'var(--color-danger-500)',
  };
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const strength = getPasswordStrength(password);

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextErrors.password = 'Must be at least 8 characters';
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords must match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await register({ email: email.trim(), password });
    setIsSubmitting(false);

    if (result.ok) {
      setToastMessage('Account created. Log in to start exploring the dashboard.');
      setTimeout(() => {
        navigate('/login', { state: { registeredEmail: email.trim() } });
      }, 600);
    } else {
      setFormError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 560 }}>
      <Card title="Create account" subtitle="Passwords are hashed server-side; tokens are short-lived.">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={errors.email}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={errors.password}
            hint="Use at least 8 characters with upper/lowercase, numbers, and a symbol."
          />

          <div className="strength-meter" aria-label="Password strength indicator">
            <div className="strength-track">
              <div className="strength-bar" style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }} />
            </div>
            <span className="strength-label">{strength.label}</span>
          </div>

          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={errors.confirmPassword}
          />

          {formError && <div className="input-message error">{formError}</div>}

          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <div style={{ marginTop: 12 }}>
          <span className="section-subtitle">
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary-500)' }}>
              Log in
            </Link>
            .
          </span>
        </div>
      </Card>

      {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />}
    </div>
  );
}
