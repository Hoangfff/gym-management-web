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
