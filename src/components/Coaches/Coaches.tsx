import { COACHES } from '../../utils/constants.ts';
import './Coaches.css';

function Coaches() {
  return (
    <section className="coaches" id="coaches">
      <div className="coaches-container">
        <h2 className="coaches-title">Coaches</h2>

        <div className="coaches-grid">
          {COACHES.map((coach) => (
            <div key={coach.id} className="coach-card">
              <img
                src={coach.image}
                alt={coach.name}
                className="coach-image"
              />

              <h3 className="coach-name">{coach.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Coaches;
