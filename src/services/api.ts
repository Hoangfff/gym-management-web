import axios from 'axios';
import type {
  ApiResponse,
  ApiMember,
  ReqCreateMemberDTO,
  ReqUpdateMemberDTO,
  ReqSearchMemberParams,
  ApiPersonalTrainer,
  ReqCreatePTDTO,
  ReqUpdatePTDTO,
  ReqSearchPTParams,
  ApiTimeSlot,
  ReqCreateSlotDTO,
  ReqUpdateSlotDTO,
  ApiServicePackage,
  ReqCreatePackageDTO,
  ReqUpdatePackageDTO,
} from '../types/api.ts';

// ===== Axios Instance Configuration =====

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Member/Customer API =====

export const memberApi = {
  // Get all members
  getAll: async (): Promise<ApiResponse<ApiMember[]>> => {
    const response = await apiClient.get<ApiResponse<ApiMember[]>>('/api/v1/members');
    return response.data;
  },

  // Get all active members
  getAllActive: async (): Promise<ApiResponse<ApiMember[]>> => {
    const response = await apiClient.get<ApiResponse<ApiMember[]>>('/api/v1/members/active');
    return response.data;
  },

  // Search member by ID, email, or CCCD
  search: async (params: ReqSearchMemberParams): Promise<ApiResponse<ApiMember>> => {
    const response = await apiClient.get<ApiResponse<ApiMember>>('/api/v1/members/search', { params });
    return response.data;
  },

  // Create new member
  create: async (data: ReqCreateMemberDTO): Promise<ApiResponse<ApiMember>> => {
    const response = await apiClient.post<ApiResponse<ApiMember>>('/api/v1/members', data);
    return response.data;
  },

  // Update member
  update: async (id: number, data: ReqUpdateMemberDTO): Promise<ApiResponse<ApiMember>> => {
    const response = await apiClient.put<ApiResponse<ApiMember>>(`/api/v1/members/${id}`, data);
    return response.data;
  },

  // Delete member (set status to INACTIVE)
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/members/${id}`);
    return response.data;
  },
};

// ===== Personal Trainer API =====

export const ptApi = {
  // Get all personal trainers
  getAll: async (): Promise<ApiResponse<ApiPersonalTrainer[]>> => {
    const response = await apiClient.get<ApiResponse<ApiPersonalTrainer[]>>('/api/v1/pts');
    return response.data;
  },

  // Get all active personal trainers
  getAllActive: async (): Promise<ApiResponse<ApiPersonalTrainer[]>> => {
    const response = await apiClient.get<ApiResponse<ApiPersonalTrainer[]>>('/api/v1/pts/active');
    return response.data;
  },

  // Search personal trainer by ID or email
  search: async (params: ReqSearchPTParams): Promise<ApiResponse<ApiPersonalTrainer>> => {
    const response = await apiClient.get<ApiResponse<ApiPersonalTrainer>>('/api/v1/pts/search', { params });
    return response.data;
  },

  // Create new personal trainer
  create: async (data: ReqCreatePTDTO): Promise<ApiResponse<ApiPersonalTrainer>> => {
    const response = await apiClient.post<ApiResponse<ApiPersonalTrainer>>('/api/v1/pts', data);
    return response.data;
  },

  // Update personal trainer
  update: async (id: number, data: ReqUpdatePTDTO): Promise<ApiResponse<ApiPersonalTrainer>> => {
    const response = await apiClient.put<ApiResponse<ApiPersonalTrainer>>(`/api/v1/pts/${id}`, data);
    return response.data;
  },

  // Set PT status to BUSY
  setBusy: async (id: number): Promise<ApiResponse<ApiPersonalTrainer>> => {
    const response = await apiClient.put<ApiResponse<ApiPersonalTrainer>>(`/api/v1/pts/${id}/go-busy`);
    return response.data;
  },

  // Set PT status to AVAILABLE
  setAvailable: async (id: number): Promise<ApiResponse<ApiPersonalTrainer>> => {
    const response = await apiClient.put<ApiResponse<ApiPersonalTrainer>>(`/api/v1/pts/${id}/go-available`);
    return response.data;
  },

  // Delete personal trainer (set status to INACTIVE)
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/pts/${id}`);
    return response.data;
  },
};

// ===== Time Slot API =====

export const slotApi = {
  // Get all slots
  getAll: async (): Promise<ApiResponse<ApiTimeSlot[]>> => {
    const response = await apiClient.get<ApiResponse<ApiTimeSlot[]>>('/api/v1/slots');
    return response.data;
  },

  // Get all active slots
  getAllActive: async (): Promise<ApiResponse<ApiTimeSlot[]>> => {
    const response = await apiClient.get<ApiResponse<ApiTimeSlot[]>>('/api/v1/slots/active');
    return response.data;
  },

  // Get slot by ID
  getById: async (id: number): Promise<ApiResponse<ApiTimeSlot>> => {
    const response = await apiClient.get<ApiResponse<ApiTimeSlot>>(`/api/v1/slots/${id}`);
    return response.data;
  },

  // Create new slot
  create: async (data: ReqCreateSlotDTO): Promise<ApiResponse<ApiTimeSlot>> => {
    const response = await apiClient.post<ApiResponse<ApiTimeSlot>>('/api/v1/slots', data);
    return response.data;
  },

  // Update slot
  update: async (id: number, data: ReqUpdateSlotDTO): Promise<ApiResponse<ApiTimeSlot>> => {
    const response = await apiClient.put<ApiResponse<ApiTimeSlot>>(`/api/v1/slots/${id}`, data);
    return response.data;
  },

  // Activate slot
  activate: async (id: number): Promise<ApiResponse<ApiTimeSlot>> => {
    const response = await apiClient.put<ApiResponse<ApiTimeSlot>>(`/api/v1/slots/${id}/activate`);
    return response.data;
  },

  // Delete slot (set isActive to false)
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/slots/${id}`);
    return response.data;
  },
};

// ===== Service Package API =====

export const packageApi = {
  // Get all service packages
  getAll: async (): Promise<ApiResponse<ApiServicePackage[]>> => {
    const response = await apiClient.get<ApiResponse<ApiServicePackage[]>>('/api/v1/service-packages');
    return response.data;
  },

  // Get all active service packages
  getAllActive: async (): Promise<ApiResponse<ApiServicePackage[]>> => {
    const response = await apiClient.get<ApiResponse<ApiServicePackage[]>>('/api/v1/service-packages/active');
    return response.data;
  },

  // Get by ID
  getById: async (id: number): Promise<ApiResponse<ApiServicePackage>> => {
    const response = await apiClient.get<ApiResponse<ApiServicePackage>>(`/api/v1/service-packages/${id}`);
    return response.data;
  },

  // Get by type
  getByType: async (type: string, activeOnly: boolean = false): Promise<ApiResponse<ApiServicePackage[]>> => {
    const response = await apiClient.get<ApiResponse<ApiServicePackage[]>>(`/api/v1/service-packages/type/${type}`, {
      params: { activeOnly },
    });
    return response.data;
  },

  // Search by name
  searchByName: async (packageName: string): Promise<ApiResponse<ApiServicePackage[]>> => {
    const response = await apiClient.get<ApiResponse<ApiServicePackage[]>>('/api/v1/service-packages/search', {
      params: { packageName },
    });
    return response.data;
  },

  // Create new service package
  create: async (data: ReqCreatePackageDTO): Promise<ApiResponse<ApiServicePackage>> => {
    const response = await apiClient.post<ApiResponse<ApiServicePackage>>('/api/v1/service-packages', data);
    return response.data;
  },

  // Update service package
  update: async (id: number, data: ReqUpdatePackageDTO): Promise<ApiResponse<ApiServicePackage>> => {
    const response = await apiClient.put<ApiResponse<ApiServicePackage>>(`/api/v1/service-packages/${id}`, data);
    return response.data;
  },

  // Deactivate service package
  deactivate: async (id: number): Promise<ApiResponse<ApiServicePackage>> => {
    const response = await apiClient.put<ApiResponse<ApiServicePackage>>(`/api/v1/service-packages/${id}/deactivate`);
    return response.data;
  },

  // Activate service package
  activate: async (id: number): Promise<ApiResponse<ApiServicePackage>> => {
    const response = await apiClient.put<ApiResponse<ApiServicePackage>>(`/api/v1/service-packages/${id}/activate`);
    return response.data;
  },

  // Delete service package
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/service-packages/${id}`);
    return response.data;
  },
};

export default {
  memberApi,
  ptApi,
  slotApi,
  packageApi,
};
