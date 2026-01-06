import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components/ui/index.ts';
import './ForgotPasswordPage.css';

type Step = 1 | 2 | 3;

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    // TODO: Send OTP to email
    setCurrentStep(2);
    startResendTimer();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    console.log('OTP submitted:', otpValue);
    // TODO: Verify OTP
    setCurrentStep(3);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New password submitted:', newPassword);
    // TODO: Reset password
    navigate('/login');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    console.log('Resending OTP to:', email);
    startResendTimer();
  };

  const getStepClass = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return '';
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <img src="/images/bg.jpg" alt="" />
      </div>

      <div className="auth-container">
        <div className="auth-form-section">
          <div className="auth-header">
            <button 
              className="auth-back-btn" 
              onClick={() => currentStep === 1 ? navigate('/login') : setCurrentStep((currentStep - 1) as Step)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <h1 className="auth-title">Forgot Password</h1>
          </div>

          {/* Step Indicator */}
          <div className="auth-steps">
            <div className={`auth-step ${getStepClass(1)}`}>
              <span className="auth-step-number">1</span>
            </div>
            <div className={`auth-step ${getStepClass(2)}`}>
              <span className="auth-step-line"></span>
              <span className="auth-step-number">2</span>
            </div>
            <div className={`auth-step ${getStepClass(3)}`}>
              <span className="auth-step-line"></span>
              <span className="auth-step-number">3</span>
            </div>
          </div>

          {/* Step 1: Email */}
          {currentStep === 1 && (
            <form className="auth-form" onSubmit={handleEmailSubmit}>
              <p className="auth-subtitle">
                Enter your email address and we'll send you a verification code.
              </p>
              <Input
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="auth-footer">
                <Button type="submit" variant="primary" fullWidth size="lg">
                  Send Code
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: OTP */}
          {currentStep === 2 && (
            <form className="auth-form" onSubmit={handleOtpSubmit}>
              <p className="auth-subtitle">
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
              <div className="otp-input-group">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    required
                  />
                ))}
              </div>
              <div className="auth-resend">
                {resendTimer > 0 ? (
                  <span className="auth-resend-btn" style={{ cursor: 'default' }}>
                    Resend code in {resendTimer}s
                  </span>
                ) : (
                  <button type="button" className="auth-resend-btn" onClick={handleResendOtp}>
                    Resend Code
                  </button>
                )}
              </div>
              <div className="auth-footer">
                <Button type="submit" variant="primary" fullWidth size="lg">
                  Verify Code
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {currentStep === 3 && (
            <form className="auth-form" onSubmit={handlePasswordSubmit}>
              <p className="auth-subtitle">
                Create a new password for your account.
              </p>
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                showPasswordToggle
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                showPasswordToggle
                required
              />
              <div className="auth-footer">
                <Button type="submit" variant="primary" fullWidth size="lg">
                  Reset Password
                </Button>
              </div>
            </form>
          )}
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

export default ForgotPasswordPage;
