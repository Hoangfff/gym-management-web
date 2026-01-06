import { SERVICES } from '../../utils/constants.ts';
import './About.css';

function About() {
  return (
    <section className="about" id="about">
      <div className="about-container">
        <div className="about-header">
          <p className="about-label">About</p>
          <h2 className="about-title">The Gym for Anyone Willing to Lift</h2>
        </div>

        <div className="about-content">
          <div className="about-image">
            <img src="/images/about-image.jpg" alt="Gym member working out" />
          </div>

          <div className="about-info">
            <p className="about-description">
              Stamina Gym Fitness Center provides proper training and conditioning for members 
              who want to improve and transform their body with Program depend on the body composition.
            </p>

            <div>
              <h3 className="services-title">What we offer:</h3>
              <div className="services-grid">
                {SERVICES.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="service-icon">{service.icon}</div>
                    <div className="service-title">{service.title}</div>
                    <div className="service-subtitle">{service.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
