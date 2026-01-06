import type { InputHTMLAttributes, ReactNode } from 'react';
import './Checkbox.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  return (
    <div className={`checkbox-group ${className}`}>
      <input type="checkbox" id={id} className="checkbox" {...props} />
      {label && (
        <label htmlFor={id} className="checkbox-label">
          {label}
        </label>
      )}
    </div>
  );
}

export default Checkbox;
