import './Hero.css';

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-background">
        <img src="/images/hero-bg.jpg" alt="" />
      </div>
      
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Start your journey<br />
            to a better you!<br />
            <span className="highlight">Come Join Us!</span>
          </h1>
          
          <a href="#about" className="hero-cta">
            Learn More
          </a>
        </div>

        <div className="hero-image">
          <div className="hero-logo-badge">
            <img src="/images/hero-flex.png" alt="Stamina Fitness Centre" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
