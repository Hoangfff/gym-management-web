import type { ReactNode } from 'react';
import { Settings, Bell } from 'lucide-react';
import './DashboardHeader.css';

interface DashboardHeaderProps {
  children?: ReactNode;
}

function DashboardHeader({ children }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header__logo">
        <img src="/images/Main_Logo.png" alt="Stamina Fitness" className="dashboard-header__logo-img" />
        <div className="dashboard-header__logo-text">
          <span className="dashboard-header__logo-stamina">STAMINA</span>
          <span className="dashboard-header__logo-fitness">FITNESS</span>
        </div>
      </div>

      <div className="dashboard-header__actions">
        {children}
        <button className="dashboard-header__icon-btn">
          <Settings size={22} />
        </button>
        <button className="dashboard-header__icon-btn">
          <Bell size={22} />
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
