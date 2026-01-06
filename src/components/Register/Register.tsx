import { useState } from 'react';
import type { RegisterFormData } from '../../types/index.ts';
import './Register.css';
import { Link } from 'react-router-dom';

const PROGRESS_IMAGES = [
  '/images/progress-1.jpg',
  '/images/progress-2.jpg',
  '/images/progress-3.jpg',
  '/images/progress-4.jpg',
  '/images/progress-5.jpg',
  '/images/progress-6.jpg',
];

function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Implement form submission
  };

  const handleClear = () => {
    setFormData({
      lastName: '',
      firstName: '',
      email: '',
      phone: '',
    });
  };

  return (
    <section className="register" id="register">
      <div className="register-container">
        <div className="register-row">
          <h2 className="register-title">Be a member today!</h2>
          <Link to="/register" className="register-bton">
            Register
          </Link>
        </div>
        <div className="progress-section">
          <h3 className="progress-title">Customers' Progress</h3>
          <div className="progress-gallery">
            {PROGRESS_IMAGES.map((image, index) => (
              <div key={index} className="progress-image">
                <img src={image} alt={`Customer progress ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
