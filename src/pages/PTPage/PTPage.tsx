import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Apple, DollarSign } from 'lucide-react';
import {
  Sidebar,
  DashboardHeader,
  StatCard,
  WelcomeCard,
  ActiveMembersTable,
  ServicePackages,
  Bookings,
  Contracts,
  PTAvailability,
  Customers,
  Workouts,
  Diets,
  BodyMetrics,
  Report
} from '../../components/dashboard/index.ts';
import type { ActiveMember } from '../../types/index.ts';
import './PTPage.css';

// Mock data
const mockMembers: ActiveMember[] = [
  { id: 1, name: 'James Medalla', datePaid: 'Jan 15', dateExpiry: 'Feb 15', status: 'active' },
  { id: 2, name: 'Kent Charl Mabutas', datePaid: 'Jan 10', dateExpiry: 'Jul 10', status: 'active' },
  { id: 3, name: 'John Elmar Rodrigo', datePaid: 'Jan 2', dateExpiry: 'Feb 2', status: 'expired' },
];

function PTPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="pt-dashboard">
            <WelcomeCard 
              userName="Personal Trainer" 
              userRole="pt" 
              subtitle="You have 4 sessions scheduled for today."
            />

            <div className="pt-dashboard__stats">
              <StatCard
                label="Active clients"
                value={12}
                icon={<Users size={24} />}
                iconBgColor="purple"
              />
              <StatCard
                label="Active packages"
                value={3}
                icon={<Package size={24} />}
                iconBgColor="blue"
              />
              <StatCard
                label="Diet plans"
                value={8}
                icon={<Apple size={24} />}
                iconBgColor="yellow"
              />
              <StatCard
                label="Monthly earnings"
                value="$7.8K"
                icon={<DollarSign size={24} />}
                iconBgColor="green"
              />
            </div>

            <ActiveMembersTable members={mockMembers} title="Most Active Members" />
          </div>
        );
      case 'service-packages':
        return <ServicePackages userRole="pt" />;
      case 'bookings':
        return <Bookings userRole="pt" />;
      case 'contracts':
        return <Contracts userRole="pt" />;
      case 'slots':
        return <PTAvailability />;
      case 'members':
        return <Customers userRole="pt" currentUserId="pt-1" />;
      case 'workouts':
        return <Workouts userRole="pt" currentUserId="pt-1" />;
      case 'diets':
        return <Diets userRole="pt" currentUserId="pt-1" />;
      case 'body-metrics':
        return <BodyMetrics userRole="pt" />;
      case 'report':
        return <Report />;
      default:
        return (
          <div className="pt-placeholder">
            <h2>{activeTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h2>
            <p>This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="pt-page">
      <Sidebar
        userRole="pt"
        userName="Personal Trainer"
        userEmail="juan.delacruz@gmail.com"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="pt-page__main">
        <DashboardHeader />
        <div className="pt-page__content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default PTPage;
