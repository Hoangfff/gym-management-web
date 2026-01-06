import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Checkbox } from '../../components/ui/index.ts';
import './LoginPage.css';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login submitted:', formData);
    // TODO: Implement login logic
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
            <h1 className="auth-title">Sign-in</h1>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              showPasswordToggle
              required
            />

            <div className="auth-options">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                label="Remember me"
              />
              <Link to="/forgot-password" className="auth-link">
                Forgot Password?
              </Link>
            </div>

            <div className="auth-footer">
              <Button type="submit" variant="primary" fullWidth size="lg">
                Login
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
