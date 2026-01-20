// ===== Common Enums (matching backend) =====

export type GenderEnum = 'MALE' | 'FEMALE';
export type PackageTypeEnum = 'PT_INCLUDED' | 'NO_PT';
export type PTStatusEnum = 'AVAILABLE' | 'BUSY' | 'INACTIVE';
export type UserStatusEnum = 'ACTIVE' | 'INACTIVE';
export type RoleEnum = 'ADMIN' | 'MEMBER' | 'PT';

// Const objects for enum values (to use as runtime values)
export const PackageType = {
  PT_INCLUDED: 'PT_INCLUDED' as PackageTypeEnum,
  NO_PT: 'NO_PT' as PackageTypeEnum
};

export const Gender = {
  MALE: 'MALE' as GenderEnum,
  FEMALE: 'FEMALE' as GenderEnum
};

export const PTStatus = {
  AVAILABLE: 'AVAILABLE' as PTStatusEnum,
  BUSY: 'BUSY' as PTStatusEnum,
  INACTIVE: 'INACTIVE' as PTStatusEnum
};

export const UserStatus = {
  ACTIVE: 'ACTIVE' as UserStatusEnum,
  INACTIVE: 'INACTIVE' as UserStatusEnum
};

// ===== API Response Wrapper =====

export interface ApiResponse<T> {
  statusCode: number;
  error: string | null;
  message: string;
  data: T;
}

// ===== Auth Types =====

export interface ReqLoginDTO {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface AuthRole {
  roleId: number;
  roleName: string;
}

export interface LoginResponse {
  user: AuthUser;
  role: AuthRole;
  access_token: string;
}

export interface AccountInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: RoleEnum;
  status: UserStatusEnum;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

// ===== User Types =====

export interface ApiUser {
  id: number;
  fullname: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  dob: string; // ISO date string YYYY-MM-DD
  gender: GenderEnum;
  status: UserStatusEnum;
}

// ===== Member Types =====

export interface ApiMember {
  id: number;
  user: ApiUser;
  cccd: string;
  moneySpent: number;
  moneyDebt: number;
  joinDate: string; // ISO date string YYYY-MM-DD
  createdAt: string; // ISO timestamp
  updatedAt: string | null;
}

export interface ReqCreateMemberDTO {
  fullname: string;
  email: string;
  password: string;
  phoneNumber: string;
  avatarUrl: string;
  dob: string; // ISO date string YYYY-MM-DD
  gender: GenderEnum;
  status: UserStatusEnum;
  cccd: string;
}

export interface ReqUpdateMemberDTO {
  fullname: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  dob: string; // ISO date string YYYY-MM-DD
  gender: GenderEnum;
  cccd: string;
}

export interface ReqSearchMemberParams {
  memberId?: number;
  email?: string;
  cccd?: string;
}

// ===== Personal Trainer Types =====

export interface ApiPersonalTrainer {
  id: number;
  user: ApiUser;
  about: string;
  specialization: string;
  certifications: string;
  experienceYears: number;
  rating: number;
  status: PTStatusEnum;
  note: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReqCreatePTDTO {
  fullname: string;
  email: string;
  password: string;
  phoneNumber: string;
  avatarUrl: string;
  dob: string;
  gender: GenderEnum;
  status: UserStatusEnum;
  about: string;
  specialization: string;
  certifications: string;
  experienceYears: number;
  note: string;
}

export interface ReqUpdatePTDTO {
  fullname: string;
  email: string;
  password?: string;
  phoneNumber: string;
  avatarUrl: string;
  dob: string;
  gender: GenderEnum;
  status: UserStatusEnum;
  about: string;
  specialization: string;
  certifications: string;
  experienceYears: number;
  note: string;
}

export interface ReqSearchPTParams {
  ptId?: number;
  email?: string;
}

// ===== Time Slot Types =====

export interface ApiTimeSlot {
  id: number;
  slotName: string;
  startTime: string; // HH:mm:ss format
  endTime: string; // HH:mm:ss format
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface ReqCreateSlotDTO {
  slotName: string;
  startTime: string; // HH:mm:ss format
  endTime: string; // HH:mm:ss format
}

export interface ReqUpdateSlotDTO {
  slotName: string;
  startTime: string;
  endTime: string;
}

// ===== Service Package Types =====

export interface ApiServicePackage {
  id: number;
  packageName: string;
  price: number;
  type: PackageTypeEnum;
  isActive: boolean;
  description: string;
  durationInDays: number;
  numberOfSessions: number;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface ReqCreatePackageDTO {
  packageName: string;
  price: number;
  type: PackageTypeEnum;
  isActive: boolean;
  description: string;
  durationInDays: number;
  numberOfSessions: number;
}

export interface ReqUpdatePackageDTO {
  packageName: string;
  price: number;
  type: PackageTypeEnum;
  isActive: boolean;
  description: string;
  durationInDays: number;
  numberOfSessions: number;
}
// ===== Common Pagination DTO =====

export interface ResultPaginationDTO<T = any> {
  meta: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  result: T[];
}

// ===== Body Metrics =====

export interface ApiBodyMetric {
  id: number;

  member: {
    memberId: number;
    fullname: string;
  };

  measuredBy: {
    userId: number;
    fullname: string;
  } | null;

  measuredDate: string; // LocalDate (YYYY-MM-DD)

  weight: number;
  height: number;
  muscleMass: number;
  bodyFatPercentage: number;
  bmi: number;

  createdAt: string; // Instant
  updatedAt: string; // Instant
  createdBy: string;
  updatedBy: string;
}

export interface ReqCreateBodyMetricDTO {
  memberId: number;
  measuredById?: number;
  measuredDate: string;

  weight: number;
  height: number;
  muscleMass?: number;
  bodyFatPercentage?: number;
  bmi?: number;
}

export interface ReqUpdateBodyMetricDTO {
  measuredDate?: string;

  weight?: number;
  height?: number;
  muscleMass?: number;
  bodyFatPercentage?: number;
  bmi?: number;
}

// ===== Additional Service =====

export interface ApiAdditionalService {
  id: number;
  name: string;
  costPrice: number;
  suggestSellPrice: number;
  description: string;
  isActive: boolean;

  createdAt: string; // Instant
  updatedAt: string; // Instant
  createdBy: string;
  updatedBy: string;
}

export interface ReqCreateAdditionalServiceDTO {
  name: string;
  costPrice: number;
  suggestSellPrice: number;
  description?: string;
}

export interface ReqUpdateAdditionalServiceDTO {
  name?: string;
  costPrice?: number;
  suggestSellPrice?: number;
  description?: string;
  isActive?: boolean;
}

// ===== Food Types =====

export type FoodTypeEnum = 'PROTEIN' | 'CARBOHYDRATE' | 'FAT';

export const FoodType = {
  PROTEIN: 'PROTEIN' as FoodTypeEnum,
  CARBOHYDRATE: 'CARBOHYDRATE' as FoodTypeEnum,
  FAT: 'FAT' as FoodTypeEnum
};

export interface ApiFood {
  id: number;
  name: string;
  description: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  note: string;
  type: FoodTypeEnum;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReqCreateFoodDTO {
  name: string;
  description?: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  note?: string;
}

export interface ReqUpdateFoodDTO {
  name?: string;
  description?: string;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  note?: string;
}

// ===== Daily Diet Types =====

export interface ApiDietDetail {
  dietId: number;
  foodId: number;
  foodName: string;
  prepMethod: string;
  amount: number;
  note: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  createdAt: string;
  updatedAt: string | null;
}

// Diet summary (without details) - used in getAll list
export interface ApiDietSummary {
  id: number;
  memberId: number;
  memberName: string;
  ptId: number;
  ptName: string;
  dietDate: string;
  waterLiters: number;
  note: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface ApiDailyDiet {
  id: number;
  memberId: number;
  memberName: string;
  ptId: number;
  ptName: string;
  dietDate: string;
  waterLiters: number;
  note: string;
  dietDetails: ApiDietDetail[];
  createdAt: string;
  updatedAt: string | null;
}

export interface ReqCreateDailyDietDTO {
  memberId: number;
  ptId: number;
  dietDate: string;
  waterLiters: number;
  note?: string;
}

export interface ReqUpdateDailyDietDTO {
  ptId?: number;
  dietDate?: string;
  waterLiters?: number;
  note?: string;
}

// ===== Diet Detail Types =====

export interface ReqCreateDietDetailDTO {
  dietId: number;
  foodId: number;
  prepMethod?: string;
  amount: number;
  note?: string;
}

export interface ReqUpdateDietDetailDTO {
  prepMethod?: string;
  amount?: number;
  note?: string;
}

// ===== Workout Types =====

export type WorkoutDifficultyEnum = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type WorkoutTypeEnum = 'Strength' | 'Cardio' | 'HIIT' | 'Core' | 'Flexibility';

export const WorkoutDifficulty = {
  BEGINNER: 'BEGINNER' as WorkoutDifficultyEnum,
  INTERMEDIATE: 'INTERMEDIATE' as WorkoutDifficultyEnum,
  ADVANCED: 'ADVANCED' as WorkoutDifficultyEnum
};

export const WorkoutType = {
  STRENGTH: 'Strength' as WorkoutTypeEnum,
  CARDIO: 'Cardio' as WorkoutTypeEnum,
  HIIT: 'HIIT' as WorkoutTypeEnum,
  CORE: 'Core' as WorkoutTypeEnum,
  FLEXIBILITY: 'Flexibility' as WorkoutTypeEnum
};

export interface ApiWorkout {
  id: number;
  name: string;
  description: string;
  duration: number; // minutes
  difficulty: WorkoutDifficultyEnum;
  type: WorkoutTypeEnum;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface ReqCreateWorkoutDTO {
  name: string;
  description: string;
  duration: number;
  difficulty: WorkoutDifficultyEnum;
  type: WorkoutTypeEnum;
}

export interface ReqUpdateWorkoutDTO {
  name?: string;
  description?: string;
  duration?: number;
  difficulty?: WorkoutDifficultyEnum;
  type?: WorkoutTypeEnum;
}

// ===== Workout Device Types =====

// Device type is a string (e.g., 'Cardio', 'Strength', 'Free Weights', 'Functional')
export type DeviceTypeString = string;

export interface ApiWorkoutDevice {
  id: number;
  name: string;
  type: DeviceTypeString;
  price: number;
  dateImported: string; // YYYY-MM-DD
  dateMaintenance: string | null; // YYYY-MM-DD
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ReqCreateWorkoutDeviceDTO {
  name: string;
  type: string;
  price: number;
  dateImported: string;
  dateMaintenance?: string;
  imageUrl?: string;
}

export interface ReqUpdateWorkoutDeviceDTO {
  name?: string;
  type?: string;
  price?: number;
  dateMaintenance?: string;
  imageUrl?: string;
}

// ===== Contract Types =====

export type ContractStatusEnum = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export const ContractStatus = {
  ACTIVE: 'ACTIVE' as ContractStatusEnum,
  EXPIRED: 'EXPIRED' as ContractStatusEnum,
  CANCELLED: 'CANCELLED' as ContractStatusEnum
};

// New flat contract structure from API
export interface ApiContract {
  id: number;
  memberId: number;
  memberName: string;
  packageId: number;
  packageName: string;
  packagePrice: number;
  ptId: number | null;
  ptName: string | null;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalSessions: number;
  remainingSessions: number;
  status: ContractStatusEnum;
  notes: string | null;
  signedAt: string; // ISO timestamp
  createdAt: string; // ISO timestamp
}

export interface ReqCreateContractDTO {
  memberId: number;
  packageId: number;
  ptId?: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD (must be startDate + package duration)
  paymentMethod: string; // 'cash', 'card', etc.
  discountAmount?: number;
  notes?: string;
}

export interface ReqUpdateContractDTO {
  packageId?: number;
  ptId?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  totalSessions?: number;
  notes?: string;
}

// ===== Booking Types =====

export type BookingStatusEnum = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export const BookingStatus = {
  CONFIRMED: 'CONFIRMED' as BookingStatusEnum,
  CANCELLED: 'CANCELLED' as BookingStatusEnum,
  COMPLETED: 'COMPLETED' as BookingStatusEnum,
  NO_SHOW: 'NO_SHOW' as BookingStatusEnum
};

export interface ApiBooking {
  id: number;
  contractId: number;
  memberId: number;
  memberName: string;
  ptId: number;
  ptName: string;
  slotId: number;
  slotStartTime: string; // HH:mm:ss
  slotEndTime: string; // HH:mm:ss
  bookingDate: string; // YYYY-MM-DD
  createdBy: string;
}

export interface ReqCreateBookingDTO {
  memberId: number;
  ptId: number;
  slotId: number;
  bookingDate: string; // YYYY-MM-DD
}

export interface ReqUpdateBookingPtDTO {
  ptId: number;
}

// ===== Available Slot Types =====

export type AvailableSlotStatusEnum = 'AVAILABLE' | 'BOOKED' | 'CANCELLED';

export const AvailableSlotStatus = {
  AVAILABLE: 'AVAILABLE' as AvailableSlotStatusEnum,
  BOOKED: 'BOOKED' as AvailableSlotStatusEnum,
  CANCELLED: 'CANCELLED' as AvailableSlotStatusEnum
};

export interface ApiAvailableSlot {
  id: number;
  ptId: number;
  ptName: string;
  ptPhone?: string;
  slotId: number;
  slotCode: string;
  slotDescription: string;
  availableDate: string; // YYYY-MM-DD
  status: AvailableSlotStatusEnum;
  createdAt: string;
  updatedAt?: string;
}

// PT Available Slot (from GET /api/v1/available-slots/{ptId}/available)
export type DayOfWeekEnum = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface PtAvailableSlotPt {
  ptId: number;
  ptName: string;
}

export interface PtAvailableSlotSlot {
  slotId: number;
  slotName: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
}

export interface ApiPtAvailableSlot {
  id: number;
  pt: PtAvailableSlotPt;
  slot: PtAvailableSlotSlot;
  dayOfWeek: DayOfWeekEnum;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// User-based Available Slot (from GET /api/v1/available-slots/user/{userId}/available)
export interface AvailableSlotUser {
  userId: number;
  userName: string;
  userFullname: string;
}

export interface AvailableSlotInfo {
  slotId: number;
  slotName: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
}

export interface ApiUserAvailableSlot {
  id: number;
  user: AvailableSlotUser;
  slot: AvailableSlotInfo;
  dayOfWeek: DayOfWeekEnum;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface ReqCreateAvailableSlotDTO {
  ptId: number;
  slotId: number;
  availableDate: string; // YYYY-MM-DD
  status?: AvailableSlotStatusEnum;
}

export interface ReqUpdateAvailableSlotDTO {
  status: AvailableSlotStatusEnum;
}

// New DTOs for user-based available slot APIs
export interface ReqCreateMyAvailableSlotDTO {
  slotId: number;
  dayOfWeek: DayOfWeekEnum;
}

export interface ReqUpdateUserAvailableSlotDTO {
  slotId: number;
  dayOfWeek: DayOfWeekEnum;
}

// ===== Invoice Types (Updated to match actual API) =====

export type InvoicePaymentStatusEnum = 'UNPAID' | 'PAID' | 'PARTIAL';
export type InvoiceStatusEnum = 'DRAFT' | 'ISSUED' | 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export const InvoiceStatus = {
  DRAFT: 'DRAFT' as InvoiceStatusEnum,
  ISSUED: 'ISSUED' as InvoiceStatusEnum,
  PENDING: 'PENDING' as InvoiceStatusEnum,
  PARTIAL: 'PARTIAL' as InvoiceStatusEnum,
  PAID: 'PAID' as InvoiceStatusEnum,
  OVERDUE: 'OVERDUE' as InvoiceStatusEnum,
  CANCELLED: 'CANCELLED' as InvoiceStatusEnum
};

export interface InvoiceDetail {
  detailId: number;
  invoiceId: number;
  servicePackageId: number | null;
  servicePackageName: string | null;
  additionalServiceId: number | null;
  additionalServiceName: string | null;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  createdAt: string;
}

export interface ApiInvoice {
  invoiceId: number;
  memberId: number;
  memberName: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentStatus: InvoicePaymentStatusEnum;
  status: InvoiceStatusEnum;
  details: InvoiceDetail[];
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
}

export interface ReqOrderAdditionalServiceDTO {
  additionalServiceId: number;
  memberId: number;
  quantity: number;
  discountAmount?: number;
  paymentMethod: string;
  notes?: string;
}

export interface ReqAddServiceToInvoiceDTO {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ReqUpdatePaymentStatusDTO {
  paymentStatus: 'UNPAID' | 'PAID' | 'PARTIAL';
  amountPaid?: number;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
}

// ===== Check-in Types =====

export type CheckInStatusEnum = 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW';

export const CheckInStatus = {
  CHECKED_IN: 'CHECKED_IN' as CheckInStatusEnum,
  CHECKED_OUT: 'CHECKED_OUT' as CheckInStatusEnum,
  CANCELLED: 'CANCELLED' as CheckInStatusEnum,
  NO_SHOW: 'NO_SHOW' as CheckInStatusEnum
};

export interface ApiCheckIn {
  checkinId: number;
  bookingId: number;
  memberId: number;
  memberName: string;
  checkinTime: string;
  checkoutTime: string | null;
  status: CheckInStatusEnum;
  createdBy: string;
}

export interface ReqCheckInDTO {
  bookingId: number;
}

export interface ReqCheckOutDTO {
  notes?: string;
}

export interface ReqCancelCheckInDTO {
  reason?: string;
}
