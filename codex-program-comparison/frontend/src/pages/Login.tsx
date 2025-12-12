import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { useAuth } from '../store/AuthContext';

type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, status } = useAuth();

  useEffect(() => {
    const state = location.state as { registeredEmail?: string } | undefined;
    if (state?.registeredEmail) {
      setEmail(state.registeredEmail);
      setToastMessage('Registration successful. Please log in.');
    }
  }, [location.state]);

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
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await login({ email: email.trim(), password, remember: rememberMe });
    setIsSubmitting(false);

    if (result.ok) {
      const redirectTo = (location.state as any)?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } else {
      setFormError(result.message || 'Invalid credentials');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 520 }}>
      <Card title="Login" subtitle="Short-lived access token + refresh token, refreshed automatically before expiry.">
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
            hint="Tokens stay in memory; refresh token is stored securely only if you choose Remember me."
          />

          <label className="input-wrapper" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            <span className="section-subtitle">Remember me (stores refresh token for this device)</span>
          </label>

          {formError && <div className="input-message error">{formError}</div>}

          <Button type="submit" isLoading={isSubmitting || status === 'loading'}>
            {isSubmitting || status === 'loading' ? 'Signing in…' : 'Login'}
          </Button>
        </form>

        <div style={{ marginTop: 12 }}>
          <span className="section-subtitle">
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary-500)' }}>
              Create one
            </Link>
            .
          </span>
        </div>
      </Card>

      {toastMessage && <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />}
    </div>
  );
}
