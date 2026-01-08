import type { ReactNode } from 'react';
import './StatCard.css';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: 'purple' | 'blue' | 'yellow' | 'green';
}

function StatCard({ label, value, icon, iconBgColor }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${iconBgColor}`}>
        {icon}
      </div>
      <div className="stat-card__content">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
      </div>
    </div>
  );
}

export default StatCard;
