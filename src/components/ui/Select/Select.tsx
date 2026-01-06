import type { SelectHTMLAttributes } from 'react';
import './Select.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

function Select({
  label,
  error,
  required = false,
  options,
  placeholder = 'Select an option',
  className = '',
  ...props
}: SelectProps) {
  const selectClasses = ['select', error ? 'select--error' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="select-group">
      {label && (
        <label className={`select-label ${required ? 'select-label--required' : ''}`}>
          {label}
        </label>
      )}
      <div className="select-wrapper">
        <select className={selectClasses} {...props}>
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="select-icon">▼</span>
      </div>
      {error && <span className="select-error-message">{error}</span>}
    </div>
  );
}

export default Select;
