import { FormEvent, useState } from 'react';
import { apiRequest } from '../services/api';

interface LoginResponse {
  access_token?: string;
  token?: string;
  message?: string;
  user?: {
    username?: string;
    role?: string;
  };
}

interface LoginProps {
  onLogin: (user: { username: string; role: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const data = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const token = data.access_token || data.token;

      if (!token) {
        throw new Error('Login succeeded but no JWT token was returned.');
      }

      localStorage.setItem('token', token);

      const user = {
        username: data.user?.username || username,
        role: data.user?.role || 'Admin',
      };

      localStorage.setItem('user', JSON.stringify(user));

      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-icon">ERP</div>
          <div>
            <h1>Mini ERP</h1>
            <p>CRM Operations Portal</p>
          </div>
        </div>

        <div className="login-heading">
          <h2>Welcome back</h2>
          <p>Sign in to access the operations portal.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
            />
          </label>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}