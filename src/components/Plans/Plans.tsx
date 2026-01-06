import { useState } from 'react';
import './Plans.css';

interface Plan {
  id: number;
  duration: string;
  label: string;
  sublabel: string;
  icon: string;
}

const PLANS: Plan[] = [
  { id: 1, duration: '7', label: 'Days', sublabel: 'Weekly Rate', icon: '📅' },
  { id: 2, duration: '1', label: 'Month', sublabel: 'Monthly Rate', icon: '📆' },
  { id: 3, duration: '6', label: 'Months', sublabel: 'Biannual Rate', icon: '🗓️' },
  { id: 4, duration: '1', label: 'Year', sublabel: 'Annual Rate', icon: '🎯' },
];

function Plans() {
  const [activePlan, setActivePlan] = useState<number | null>(null);

  return (
    <section className="plans" id="plan">
      <div className="plans-container">
        <div className="plans-header">
          <div className="plans-title-group">
            <span className="plans-label">Our Plans</span>
            <h2 className="plans-main-title">Join Our Membership</h2>
          </div>
          
          {/* <div className="annual-badge">
            <span className="annual-badge-icon">👤</span>
            <span className="annual-badge-text">Annual<br />Membership</span>
          </div> */}
        </div>

        <div className="plans-grid">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${activePlan === plan.id ? 'active' : ''}`}
              onClick={() => setActivePlan(plan.id)}
            >
              <div className="plan-icon">{plan.icon}</div>
              <div className="plan-duration">{plan.duration}</div>
              <div className="plan-label">{plan.label}</div>
              <div className="plan-sublabel">{plan.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Plans;
