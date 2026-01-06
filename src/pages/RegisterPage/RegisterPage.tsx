import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Checkbox } from '../../components/ui/index.ts';
import './RegisterPage.css';

interface RegisterFormData {
  email: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const type = (e.target as HTMLInputElement).type;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register submitted:', formData);
    // TODO: Implement registration logic
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-background">
        <img src="/images/bg.jpg" alt="" />
      </div>

      <div className="register-container">
        <div className="auth-form-section register-form-section">
          <div className="auth-header">
            <button className="auth-back-btn" onClick={() => navigate('/')}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <h1 className="auth-title">Sign Up</h1>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-row">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Full name"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="auth-form-row">
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                options={GENDER_OPTIONS}
                required
              />

              <Input
                label="Date of birth"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
              />
            </div>

            <Input
              label="Phone number"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />

            <div className="auth-form-row">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                showPasswordToggle
                required
              />

              <Input
                label="Re-type Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                showPasswordToggle
                required
              />
            </div>

            <div className="auth-footer">
              <Button type="submit" variant="primary" fullWidth size="lg">
                Register
              </Button>

              <Checkbox
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                label={
                  <>
                    By registering, I accept the{' '}
                    <a href="/terms">Terms and Conditions</a>
                  </>
                }
              />
            </div>
          </form>
        </div>

        <div className="register-logo-right">
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

export default RegisterPage;
