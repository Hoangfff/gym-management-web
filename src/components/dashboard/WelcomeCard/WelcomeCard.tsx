import { Users } from 'lucide-react';
import './WelcomeCard.css';

interface WelcomeCardProps {
  userName: string;
  userRole: 'admin' | 'pt';
  subtitle?: string;
}

function WelcomeCard({ userName, userRole, subtitle }: WelcomeCardProps) {
  const defaultSubtitle = userRole === 'admin'
    ? "Here's what's happening with your gym today. Track your members, monitor performance, and manage operations all in one place."
    : `You have 4 sessions scheduled for today.`;

  return (
    <div className="welcome-card">
      <div className="welcome-card__content">
        <h2 className="welcome-card__title">
          Welcome Back, <span className="welcome-card__name">{userName}</span>
        </h2>
        <p className="welcome-card__subtitle">{subtitle || defaultSubtitle}</p>
      </div>
      <div className="welcome-card__icon">
        <Users size={40} />
      </div>
    </div>
  );
}

export default WelcomeCard;
