import { useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './Input.css';
import { Eye, EyeClosed, EyeOff } from 'lucide-react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  required?: boolean;
  icon?: ReactNode;
  showPasswordToggle?: boolean;
  placeholder?: string;
}

function Input({
  label,
  error,
  required = false,
  icon,
  showPasswordToggle = false,
  type = 'text',
  className = '',
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  const inputClasses = [
    'input',
    error ? 'input--error' : '',
    (icon || showPasswordToggle) ? 'input--with-icon' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="input-group">
      {label && (
        <label className={`input-label ${required ? 'input-label--required' : ''}`}>
          {label}
        </label>
      )}
      <div className="input-wrapper">
        <input type={inputType} className={inputClasses} {...props} />
        {showPasswordToggle && (
          <button
            type="button"
            className="input-icon"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <Eye size={20}/> : <EyeOff size={20}/>}
          </button>
        )}
        {icon && !showPasswordToggle && <span className="input-icon">{icon}</span>}
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
}

export default Input;
