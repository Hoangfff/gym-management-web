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

// ===== Member/Customer Types =====

export type MemberStatus = 'active' | 'no-contract' | 'expired';
export type Gender = 'male' | 'female' | 'other';

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  cccd: string;
  avatar?: string;
  dateJoined: string;
  dateExpiration?: string;
  status: MemberStatus;
  contractId?: string;
  trainerId?: string;
}

// ===== Personal Trainer Types =====

export type TrainerStatus = 'active' | 'on-leave' | 'pending';

export interface PersonalTrainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  cccd: string;
  avatar?: string;
  about: string;
  specialization: string[];
  certifications: string;
  yearsOfExperience: number;
  rating: number;
  activeClients: number;
  status: TrainerStatus;
}

// ===== Workout Types =====

export type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type EquipmentType = 'none' | 'cardio' | 'free-weights' | 'strength';

export interface Workout {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  difficulty: WorkoutDifficulty;
  equipment: EquipmentType;
  calories: number;
  images?: string[];
  createdBy: string;
  createdById: string;
}

// ===== Diet & Nutrition Types =====

export type FoodType = 'protein' | 'carbs' | 'fats' | 'vegetables' | 'fruits' | 'dairy';

export interface FoodItem {
  id: string;
  name: string;
  type: FoodType;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  note: string;
  image?: string;
  createdBy: string;
  createdById: string;
}

export interface DietFoodItem {
  foodId: string;
  foodName: string;
  quantity: number;
  calories: number;
  mealType: string;
  prepMethod: string;
}

export interface DietPlan {
  id: string;
  name: string;
  description: string;
  memberId: string;
  memberName: string;
  foods: DietFoodItem[];
  totalCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
  note?: string;
  createdBy: string;
  createdById: string;
}

// ===== Additional Services Types =====

export type ServiceCategory = 'wellness' | 'recovery' | 'assessment' | 'other';

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  costPrice: number;
  sellPrice: number;
  maxCapacity: number;
  isActive: boolean;
  image?: string;
}

// ===== Payment Types =====

export type PaymentStatus = 'paid' | 'pending' | 'cancelled' | 'refunded';
export type PaymentItemType = 'service-package' | 'additional-service' | 'contract' | 'pt-session' | 'other';

export interface PaymentItem {
  name: string;
  type: PaymentItemType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar?: string;
  items: PaymentItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'credit-card' | 'transfer';
  status: PaymentStatus;
  createdAt: string;
  processedAt?: string;
}

// ===== Inventory Types =====

export type InventoryStatus = 'in-stock' | 'in-use' | 'maintenance';
export type InventoryCategory = 'cardio' | 'free-weights' | 'strength' | 'accessories';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: InventoryCategory;
  status: InventoryStatus;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  location: string;
  quantity: number;
  maintenanceNotes?: string;
  image?: string;
}

// ===== Report Types =====

export interface PackageBreakdown {
  packageName: string;
  memberCount: number;
  percentage: number;
  revenue: number;
  color: string;
}
