// ===== Common Enums (matching backend) =====

export type GenderEnum = 'MALE' | 'FEMALE';
export type PackageTypeEnum = 'PT_INCLUDED' | 'NO_PT';
export type PTStatusEnum = 'AVAILABLE' | 'BUSY' | 'INACTIVE';
export type UserStatusEnum = 'ACTIVE' | 'INACTIVE';

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
