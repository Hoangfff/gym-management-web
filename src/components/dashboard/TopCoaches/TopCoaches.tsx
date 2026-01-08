import { Star, MoreVertical } from 'lucide-react';
import type { TopCoach } from '../../../types/index.ts';
import './TopCoaches.css';

interface TopCoachesProps {
  coaches: TopCoach[];
}

function TopCoaches({ coaches }: TopCoachesProps) {
  return (
    <div className="top-coaches">
      <div className="top-coaches__header">
        <h3 className="top-coaches__title">Top Coaches</h3>
        <button className="top-coaches__more-btn">
          <MoreVertical size={20} />
        </button>
      </div>
      <ul className="top-coaches__list">
        {coaches.map((coach, index) => (
          <li key={coach.id} className="top-coaches__item">
            <div
              className="top-coaches__avatar"
              style={{
                backgroundColor: index === 0 ? '#1A1363' : index === 1 ? '#6F00D0' : '#E7B900'
              }}
            >
              {coach.avatar ? (
                <img src={coach.avatar} alt={coach.name} />
              ) : (
                <span>{coach.name.charAt(0)}</span>
              )}
            </div>
            <div className="top-coaches__info">
              <span className="top-coaches__name">{coach.name}</span>
              <span className="top-coaches__stats">
                {coach.clientCount} clients • <Star size={12} fill="currentColor" /> {coach.rating}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TopCoaches;
