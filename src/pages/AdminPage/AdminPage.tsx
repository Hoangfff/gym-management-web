import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, FileText, DollarSign } from 'lucide-react';
import {
  Sidebar,
  DashboardHeader,
  StatCard,
  WelcomeCard,
  TopCoaches,
  SalesChart,
  ActiveMembersTable,
  ServicePackages,
  Bookings,
  Contracts,
  TimeSlots,
  Customers,
  PersonalTrainers,
  Workouts,
  Diets,
  AdditionalServices,
  BodyMetrics,
  Payments,
  Inventory,
  Report
} from '../../components/dashboard/index.ts';
import type { TopCoach, ActiveMember } from '../../types/index.ts';
import './AdminPage.css';

// Mock data
const mockCoaches: TopCoach[] = [
  { id: 1, name: 'Juan Dela Cruz', clientCount: 12, rating: 4.5 },
  { id: 2, name: 'Sarah Martinez', clientCount: 12, rating: 4.5 },
  { id: 3, name: 'Peter J. Johnson', clientCount: 12, rating: 4.5 },
];

const mockMembers: ActiveMember[] = [
  { id: 1, name: 'James Medalla', datePaid: 'Jan 15', dateExpiry: 'Feb 15', status: 'active' },
  { id: 2, name: 'Kent Charl Mabutas', datePaid: 'Jan 10', dateExpiry: 'Jul 10', status: 'active' },
  { id: 3, name: 'John Elmar Rodrigo', datePaid: 'Jan 2', dateExpiry: 'Feb 2', status: 'expired' },
];

function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="admin-dashboard">
            <WelcomeCard userName="Administrator" userRole="admin" />

            <div className="admin-dashboard__stats">
              <StatCard
                label="Total members"
                value={156}
                icon={<Users size={24} />}
                iconBgColor="purple"
              />
              <StatCard
                label="Check-ins today"
                value={67}
                icon={<UserCheck size={24} />}
                iconBgColor="blue"
              />
              <StatCard
                label="Active contracts"
                value={14}
                icon={<FileText size={24} />}
                iconBgColor="yellow"
              />
              <StatCard
                label="Monthly revenue"
                value="$17.8K"
                icon={<DollarSign size={24} />}
                iconBgColor="green"
              />
            </div>

            <div className="admin-dashboard__row">
              <TopCoaches coaches={mockCoaches} />
              <SalesChart percentage={84} />
            </div>

            <ActiveMembersTable members={mockMembers} title="Active Members" />
          </div>
        );
      case 'service-packages':
        return <ServicePackages userRole="admin" />;
      case 'bookings':
        return <Bookings userRole="admin" />;
      case 'contracts':
        return <Contracts userRole="admin" />;
      case 'time-slots':
        return <TimeSlots userRole="admin" />;
      case 'customers':
        return <Customers userRole="admin" />;
      case 'personal-trainers':
        return <PersonalTrainers />;
      case 'workouts':
        return <Workouts userRole="admin" />;
      case 'diets':
        return <Diets userRole="admin" />;
      case 'additional-services':
        return <AdditionalServices userRole="admin" />;
      case 'body-metrics':
        return <BodyMetrics userRole="admin" />;
      case 'payments':
        return <Payments />;
      case 'inventory':
        return <Inventory />;
      case 'report':
        return <Report />;
      default:
        return (
          <div className="admin-placeholder">
            <h2>{activeTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h2>
            <p>This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="admin-page">
      <Sidebar
        userRole="admin"
        userName="Administrator"
        userEmail="juan.delacruz@gmail.com"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="admin-page__main">
        <DashboardHeader />
        <div className="admin-page__content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default AdminPage;
