import { CONTACT_INFO, SOCIAL_LINKS } from '../../utils/constants.ts';
import './Visit.css';

function Visit() {
  return (
    <section className="visit" id="visit">
      <div className="visit-container">
        <div className="visit-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.802979372961!2d120.99686807457088!3d14.52508628599694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90c4d3f4c5d%3A0x8e1d0b4f9e8b8b8b!2sVillamor%20Air%20Base%2C%20Pasay%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1704412800000!5m2!1sen!2sph"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Gym Location Map"
          ></iframe>
        </div>

        <div className="visit-info">
          <h2 className="visit-title">Visit Our Gym</h2>

          <div className="visit-details">
            <div className="visit-item">
              <span className="visit-item-label">Address:</span>
              <span className="visit-item-value">{CONTACT_INFO.address}</span>
            </div>
            <div className="visit-item">
              <span className="visit-item-label">Email:</span>
              <span className="visit-item-value">
                <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
              </span>
            </div>
            <div className="visit-item">
              <span className="visit-item-label">Contact Number:</span>
              <span className="visit-item-value">
                <a href={`tel:${CONTACT_INFO.phone}`}>{CONTACT_INFO.phone}</a>
              </span>
            </div>
          </div>

          <div className="socials-section">
            <h3 className="socials-title">Our Socials:</h3>
            <div className="socials-links">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  className="social-link"
                  aria-label={social.platform}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon === 'facebook' && '📘'}
                  {social.icon === 'messenger' && '💬'}
                  {social.icon === 'instagram' && '📷'}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Visit;
