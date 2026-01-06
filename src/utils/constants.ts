import type { NavItem, Coach, MembershipPlan, ContactInfo, SocialLink } from '../types/index.ts';

// ===== Navigation =====
export const NAV_ITEMS: NavItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Why Join Us?', href: '#why-join' },
  { label: 'Plan', href: '#plan' },
  { label: 'Coaches', href: '#coaches' },
  { label: 'Visit our Gym', href: '#visit' },
];

// ===== Coaches Data =====
export const COACHES: Coach[] = [
  { id: 1, name: 'Coach John', image: '/images/coach-john.jpg' },
  { id: 2, name: 'Coach Martell', image: '/images/coach-martell.jpg' },
  { id: 3, name: 'Coach Ansel', image: '/images/coach-ansel.jpg' },
];

// ===== Membership Plans =====
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  { id: 1, icon: '👤', duration: '7', label: 'Days', isActive: false },
  { id: 2, icon: '📅', duration: '1', label: 'Month', isActive: false },
  { id: 3, icon: '📆', duration: '6', label: 'Months', isActive: false },
  { id: 4, icon: '🎯', duration: '1', label: 'Year', isActive: false },
];

// ===== Contact Information =====
export const CONTACT_INFO: ContactInfo = {
  address: '12th St. General Matha Villamor Air Base Pasay City',
  email: 'Martell008@yahoo.com',
  phone: '09260417050',
};

// ===== Social Links =====
export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'Facebook', url: '#', icon: 'facebook' },
  { platform: 'Messenger', url: '#', icon: 'messenger' },
  { platform: 'Instagram', url: '#', icon: 'instagram' },
];

// ===== Services =====
export const SERVICES = [
  {
    id: 1,
    title: '24/7',
    subtitle: 'service',
    icon: '🕐',
  },
  {
    id: 2,
    title: '1 on 1',
    subtitle: 'Coaching',
    icon: '🏋️',
  },
  {
    id: 3,
    title: 'Nutrition',
    subtitle: 'Plan Guide',
    icon: '🎯',
  },
];
