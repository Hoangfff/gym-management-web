import './Footer.css';

const GYM_LINKS = [
  { label: 'Why Join Us', href: '#about' },
  { label: 'About', href: '#about' },
  { label: 'Plan', href: '#plan' },
  { label: 'Coaches', href: '#coaches' },
  { label: 'Inquiry', href: '#register' },
];

const MEMBER_LINKS = [
  { label: 'FAQs', href: '#faq' },
  { label: 'Contact Us', href: '#visit' },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-column">
            <h4>Gym</h4>
            <nav className="footer-links">
              {GYM_LINKS.map((link) => (
                <a key={link.label} href={link.href} className="footer-link">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="footer-column">
            <h4>Members</h4>
            <nav className="footer-links">
              {MEMBER_LINKS.map((link) => (
                <a key={link.label} href={link.href} className="footer-link">
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Stamina Fitness. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
