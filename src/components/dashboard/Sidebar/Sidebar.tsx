import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Clock,
  FileText,
  Users,
  UserCog,
  Dumbbell,
  Apple,
  Sparkles,
  CreditCard,
  BoxIcon,
  BarChart3,
  LogOut,
  Home
} from 'lucide-react';
import './Sidebar.css';

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  userRole: 'admin' | 'pt';
  userName: string;
  userEmail: string;
  userAvatar?: string;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
}

const adminMenuItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'service-packages', label: 'Service Packages', icon: Package },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'time-slots', label: 'Time Slots', icon: Clock },
  { id: 'contracts', label: 'Contracts', icon: FileText },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'personal-trainers', label: 'Personal Trainers', icon: UserCog },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'diets', label: 'Diets', icon: Apple },
  { id: 'additional-services', label: 'Additional Services', icon: Sparkles },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'inventory', label: 'Inventory', icon: BoxIcon },
  { id: 'report', label: 'Report', icon: BarChart3 },
];

const ptMenuItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'slots', label: 'Slots', icon: Clock },
  { id: 'service-packages', label: 'Service Packages', icon: Package },
  { id: 'contracts', label: 'Contracts', icon: FileText },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'diets', label: 'Diets', icon: Apple },
  { id: 'report', label: 'Report', icon: BarChart3 },
];

function Sidebar({
  userRole,
  userName,
  userEmail,
  userAvatar,
  activeTab,
  onTabChange,
  onLogout
}: SidebarProps) {
  const menuItems = userRole === 'admin' ? adminMenuItems : ptMenuItems;
  const roleLabel = userRole === 'admin' ? 'Administrator' : 'Personal Trainer';

  return (
    <aside className="sidebar">
      <div className="sidebar__profile">
        <div className="sidebar__avatar">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} />
          ) : (
            <div className="sidebar__avatar-placeholder">
              <Users size={32} />
            </div>
          )}
        </div>
        <h3 className="sidebar__role">{roleLabel}</h3>
        <p className="sidebar__email">{userEmail}</p>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  className={`sidebar__menu-item ${activeTab === item.id ? 'sidebar__menu-item--active' : ''}`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <button className="sidebar__logout" onClick={onLogout}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;
