// ===== Common Types =====

export interface NavItem {
  label: string;
  href: string;
}

export interface Coach {
  id: number;
  name: string;
  image: string;
}

export interface PlanFeature {
  icon: string;
  title: string;
  subtitle: string;
}

export interface MembershipPlan {
  id: number;
  icon: string;
  duration: string;
  label: string;
  isActive?: boolean;
}

export interface ContactInfo {
  address: string;
  email: string;
  phone: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

// ===== Form Types =====

export interface RegisterFormData {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
}

// ===== API Types =====

export interface ReqRegisterDTO {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
}

export interface ResRegisterDTO {
  success: boolean;
  message: string;
}

// ===== Dashboard Types =====

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'pt';
}

export interface StatCard {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
}

export interface TopCoach {
  id: number;
  name: string;
  clientCount: number;
  rating: number;
  avatar?: string;
}

export interface ActiveMember {
  id: number;
  name: string;
  datePaid: string;
  dateExpiry: string;
  status: 'active' | 'expired';
  avatar?: string;
}

// ===== Service Package Types =====

export type PackageType = 'pt' | 'no-pt';

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  type: PackageType;
  duration: number; // days
  sessions: number | 'unlimited';
  price: number;
  isActive: boolean;
  createdBy: string;
  createdById?: string;
}

// ===== Booking Types =====

export type BookingStatus = 'pending' | 'confirmed' | 'checked-in' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  packageName: string;
  trainerId?: string;
  trainerName?: string;
  date: string;
  timeSlot: string;
  duration: number; // minutes
  sessionNumber: number;
  totalSessions: number | 'unlimited';
  status: BookingStatus;
  note?: string;
}

// ===== Contract Types =====

export type ContractStatus = 'active' | 'pending' | 'expired' | 'cancelled';

export interface Contract {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  trainerId?: string;
  trainerName?: string;
  trainerAvatar?: string;
  packageId: string;
  packageName: string;
  startDate: string;
  endDate: string;
  duration: number; // days
  sessions: number | 'unlimited';
  completedSessions: number;
  price: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  notes?: string;
  status: ContractStatus;
  signedAt?: string;
}

// ===== Time Slot Types =====

export interface TimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: string;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface PTAvailability {
  id: string;
  ptId: string;
  slotId: string;
  slotName: string;
  slotTime: string;
  day: DayOfWeek;
  fromDate: string;
  toDate?: string;
}
