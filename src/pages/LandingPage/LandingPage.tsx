import {
  Header,
  Hero,
  About,
  Plans,
  Coaches,
  Visit,
  Register,
  Footer,
} from '../../components/index.ts';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <Header />
      <main>
        <Hero />
        <About />
        <Plans />
        <Coaches />
        <Visit />
        <Register />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
