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
  Report,
  Modal
} from '../../components/dashboard/index.ts';
import { authApi } from '../../services/index.ts';
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  // Get user info from storage
  const getUserInfo = () => {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  };

  const userInfo = getUserInfo();
  const userName = userInfo?.name || 'Personal Trainer';
  const userEmail = userInfo?.email || 'pt@gym.com';

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
      
      // Clear all stored data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role');
      
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still logout locally even if API fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
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
        userName={userName}
        userEmail={userEmail}
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

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => !isLoggingOut && setShowLogoutModal(false)}
        title="Sign Out"
        size="sm"
      >
        <div className="modal-form">
          <p style={{ marginBottom: 'var(--spacing-xl)', color: 'var(--color-gray-600)' }}>
            Are you sure you want to sign out?
          </p>
          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </button>
            <button
              type="button"
              className="modal-form__btn modal-form__btn--danger"
              onClick={confirmLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="spinner" style={{ marginRight: '8px' }}></span>
                  Signing out...
                </>
              ) : (
                'Sign Out'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default PTPage;
