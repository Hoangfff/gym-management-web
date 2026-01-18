import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Checkbox } from '../../components/ui/index.ts';
import { authApi } from '../../services/index.ts';
import './LoginPage.css';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login({
        username: formData.username,
        password: formData.password
      });

      if (response.data) {
        const { token, user } = response.data;
        
        // Store token
        if (formData.rememberMe) {
          localStorage.setItem('accessToken', token);
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          sessionStorage.setItem('accessToken', token);
          sessionStorage.setItem('user', JSON.stringify(user));
        }

        // Navigate based on user role
        const role = user.role?.toLowerCase();
        if (role === 'ADMIN') {
          navigate('/admin');
        } else if (role === 'PT' || role === 'personal_trainer') {
          navigate('/pt');
        } else {
          navigate('/');
        }
      }
    } catch (err: unknown) {
      console.error('Login failed:', err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <img src="/images/bg.jpg" alt="" />
      </div>

      <div className="auth-container">
        <div className="auth-form-section">
          <div className="auth-header">
            <button className="auth-back-btn" onClick={() => navigate('/')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <h1 className="auth-title">Sign in</h1>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Enter your username"
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              showPasswordToggle
              required
              placeholder="********"
              disabled={isLoading}
            />

            <div className="auth-options">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                label="Remember me"
                disabled={isLoading}
              />
              <Link to="/forgot-password" className="auth-link">
                Forgot Password?
              </Link>
            </div>

            <div className="auth-footer">
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Login'}
              </Button>
            </div>
          </form>
        </div>

        <div className="auth-logo-section">
          <img
            src="/images/Main_Logo.png"
            alt="Stamina Fitness Centre"
            className="auth-logo"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
