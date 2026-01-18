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
  ApiBodyMetric,
  ReqCreateBodyMetricDTO,
  ReqUpdateBodyMetricDTO,
  ResultPaginationDTO,
  ApiAdditionalService,
  ReqCreateAdditionalServiceDTO,
  ReqUpdateAdditionalServiceDTO,
  ApiFood,
  ReqCreateFoodDTO,
  ReqUpdateFoodDTO,
  FoodTypeEnum,
  ApiDailyDiet,
  ReqCreateDailyDietDTO,
  ReqUpdateDailyDietDTO,
  ApiDietDetail,
  ReqCreateDietDetailDTO,
  ReqUpdateDietDetailDTO,
  ApiWorkout,
  ReqCreateWorkoutDTO,
  ReqUpdateWorkoutDTO,
  WorkoutDifficultyEnum,
  WorkoutTypeEnum,
  ApiWorkoutDevice,
  ReqCreateWorkoutDeviceDTO,
  ReqUpdateWorkoutDeviceDTO,
  ApiContract,
  ReqCreateContractDTO,
  ContractStatusEnum,
  // Auth types
  ReqLoginDTO,
  LoginResponse,
  AccountInfo,
  RefreshTokenResponse,
  // Booking types
  ApiBooking,
  ReqCreateBookingDTO,
  ReqUpdateBookingPtDTO,
  // Available Slot types
  ApiAvailableSlot,
  ApiPtAvailableSlot,
  ReqCreateAvailableSlotDTO,
  ReqUpdateAvailableSlotDTO,
  AvailableSlotStatusEnum,
  // Invoice types
  ApiInvoice,
  ReqAddServiceToInvoiceDTO,
  ReqUpdatePaymentStatusDTO,
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

// ===== Body Metrics API =====

export const bodyMetricsApi = {
  // Get all body metrics
  getAll: async (): Promise<ApiResponse<ApiBodyMetric[]>> => {
    const response = await apiClient.get<ApiResponse<ApiBodyMetric[]>>('/api/v1/body-metrics');
    return response.data;
  },

  // Get by member ID
  getByMemberId: async (memberId: number): Promise<ApiResponse<ApiBodyMetric[]>> => {
    const response = await apiClient.get<ApiResponse<ApiBodyMetric[]>>(`/api/v1/body-metrics/member/${memberId}`);
    return response.data;
  },

  // Get by ID
  getById: async (id: number): Promise<ApiResponse<ApiBodyMetric>> => {
    const response = await apiClient.get<ApiResponse<ApiBodyMetric>>(`/api/v1/body-metrics/${id}`);
    return response.data;
  },

  // Create body metric
  create: async (data: ReqCreateBodyMetricDTO): Promise<ApiResponse<ApiBodyMetric>> => {
    const response = await apiClient.post<ApiResponse<ApiBodyMetric>>('/api/v1/body-metrics', data);
    return response.data;
  },

  // Update body metric
  update: async (id: number, data: ReqUpdateBodyMetricDTO): Promise<ApiResponse<ApiBodyMetric>> => {
    const response = await apiClient.put<ApiResponse<ApiBodyMetric>>(`/api/v1/body-metrics/${id}`, data);
    return response.data;
  },

  // Delete body metric
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/body-metrics/${id}`);
    return response.data;
  },

  // Fetch with pagination & filter
  fetch: async (params: {
    memberId?: number;
    fromDate?: string;
    toDate?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<ResultPaginationDTO<ApiBodyMetric>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiBodyMetric>>>(
      '/api/v1/body-metrics/fetch',
      { params }
    );
    return response.data;
  },
};

// ===== Additional Service API =====

export const additionalServiceApi = {
  // Get all additional services
  getAll: async (): Promise<ApiResponse<ApiAdditionalService[]>> => {
    const response = await apiClient.get<ApiResponse<ApiAdditionalService[]>>('/api/v1/additional-services');
    return response.data;
  },

  // Get all active additional services
  getAllActive: async (): Promise<ApiResponse<ApiAdditionalService[]>> => {
    const response = await apiClient.get<ApiResponse<ApiAdditionalService[]>>('/api/v1/additional-services/active');
    return response.data;
  },

  // Get by ID
  getById: async (id: number): Promise<ApiResponse<ApiAdditionalService>> => {
    const response = await apiClient.get<ApiResponse<ApiAdditionalService>>(`/api/v1/additional-services/${id}`);
    return response.data;
  },

  // Create additional service
  create: async (data: ReqCreateAdditionalServiceDTO): Promise<ApiResponse<ApiAdditionalService>> => {
    const response = await apiClient.post<ApiResponse<ApiAdditionalService>>('/api/v1/additional-services', data);
    return response.data;
  },

  // Update additional service
  update: async (id: number, data: ReqUpdateAdditionalServiceDTO): Promise<ApiResponse<ApiAdditionalService>> => {
    const response = await apiClient.put<ApiResponse<ApiAdditionalService>>(`/api/v1/additional-services/${id}`, data);
    return response.data;
  },

  // Activate additional service
  activate: async (id: number): Promise<ApiResponse<ApiAdditionalService>> => {
    const response = await apiClient.put<ApiResponse<ApiAdditionalService>>(`/api/v1/additional-services/${id}/activate`);
    return response.data;
  },

  // Deactivate additional service
  deactivate: async (id: number): Promise<ApiResponse<ApiAdditionalService>> => {
    const response = await apiClient.put<ApiResponse<ApiAdditionalService>>(`/api/v1/additional-services/${id}/deactivate`);
    return response.data;
  },

  // Delete additional service
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/additional-services/${id}`);
    return response.data;
  },

  // Fetch with filter & pagination
  fetch: async (params: {
    name?: string;
    isActive?: boolean;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<ResultPaginationDTO<ApiAdditionalService>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiAdditionalService>>>(
      '/api/v1/additional-services/fetch',
      { params }
    );
    return response.data;
  },
};

// ===== Food API =====

export const foodApi = {
  // Get all foods
  getAll: async (): Promise<ApiResponse<ApiFood[]>> => {
    const response = await apiClient.get<ApiResponse<ApiFood[]>>('/api/v1/foods');
    return response.data;
  },

  // Get food by ID
  getById: async (id: number): Promise<ApiResponse<ApiFood>> => {
    const response = await apiClient.get<ApiResponse<ApiFood>>(`/api/v1/foods/${id}`);
    return response.data;
  },

  // Get foods by type with pagination
  getByType: async (type: FoodTypeEnum, page: number = 1, size: number = 20): Promise<ApiResponse<ResultPaginationDTO<ApiFood>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiFood>>>(`/api/v1/foods/by-type/${type}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Search foods by keyword with pagination
  search: async (keyword: string, page: number = 1, size: number = 20): Promise<ApiResponse<ResultPaginationDTO<ApiFood>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiFood>>>('/api/v1/foods/search', {
      params: { keyword, page, size }
    });
    return response.data;
  },

  // Create food
  create: async (data: ReqCreateFoodDTO): Promise<ApiResponse<ApiFood>> => {
    const response = await apiClient.post<ApiResponse<ApiFood>>('/api/v1/foods', data);
    return response.data;
  },

  // Update food
  update: async (id: number, data: ReqUpdateFoodDTO): Promise<ApiResponse<ApiFood>> => {
    const response = await apiClient.put<ApiResponse<ApiFood>>(`/api/v1/foods/${id}`, data);
    return response.data;
  },

  // Delete food
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/foods/${id}`);
    return response.data;
  },
};

// ===== Daily Diet API =====

export const dailyDietApi = {
  // Get diet by ID
  getById: async (id: number): Promise<ApiResponse<ApiDailyDiet>> => {
    const response = await apiClient.get<ApiResponse<ApiDailyDiet>>(`/api/v1/daily-diets/${id}`);
    return response.data;
  },

  // Create daily diet
  create: async (data: ReqCreateDailyDietDTO): Promise<ApiResponse<ApiDailyDiet>> => {
    const response = await apiClient.post<ApiResponse<ApiDailyDiet>>('/api/v1/daily-diets', data);
    return response.data;
  },

  // Update daily diet
  update: async (id: number, data: ReqUpdateDailyDietDTO): Promise<ApiResponse<ApiDailyDiet>> => {
    const response = await apiClient.put<ApiResponse<ApiDailyDiet>>(`/api/v1/daily-diets/${id}`, data);
    return response.data;
  },

  // Delete daily diet
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/daily-diets/${id}`);
    return response.data;
  },
};

// ===== Diet Detail API =====

export const dietDetailApi = {
  // Get all foods in a daily diet
  getByDietId: async (dietId: number): Promise<ApiResponse<ApiDietDetail[]>> => {
    const response = await apiClient.get<ApiResponse<ApiDietDetail[]>>(`/api/v1/diet-details/by-diet/${dietId}`);
    return response.data;
  },

  // Add food to daily diet
  addFood: async (data: ReqCreateDietDetailDTO): Promise<ApiResponse<ApiDietDetail>> => {
    const response = await apiClient.post<ApiResponse<ApiDietDetail>>('/api/v1/diet-details', data);
    return response.data;
  },

  // Update diet detail
  updateFood: async (dietId: number, foodId: number, data: ReqUpdateDietDetailDTO): Promise<ApiResponse<ApiDietDetail>> => {
    const response = await apiClient.put<ApiResponse<ApiDietDetail>>(`/api/v1/diet-details/diet/${dietId}/food/${foodId}`, data);
    return response.data;
  },

  // Remove food from daily diet
  removeFood: async (dietId: number, foodId: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/diet-details/diet/${dietId}/food/${foodId}`);
    return response.data;
  },
};

// ===== Workout API =====

export const workoutApi = {
  // Get all workouts
  getAll: async (): Promise<ApiResponse<ApiWorkout[]>> => {
    const response = await apiClient.get<ApiResponse<ApiWorkout[]>>('/api/v1/workouts');
    return response.data;
  },

  // Get workout by ID
  getById: async (id: number): Promise<ApiResponse<ApiWorkout>> => {
    const response = await apiClient.get<ApiResponse<ApiWorkout>>(`/api/v1/workouts/${id}`);
    return response.data;
  },

  // Get workout by exact name
  getByName: async (name: string): Promise<ApiResponse<ApiWorkout>> => {
    const response = await apiClient.get<ApiResponse<ApiWorkout>>('/api/v1/workouts/by-name', {
      params: { name }
    });
    return response.data;
  },

  // Search workouts by name (partial match)
  search: async (name: string, page: number = 0, size: number = 20): Promise<ApiResponse<ResultPaginationDTO<ApiWorkout>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiWorkout>>>('/api/v1/workouts/search', {
      params: { name, page, size }
    });
    return response.data;
  },

  // Get workouts by difficulty
  getByDifficulty: async (difficulty: WorkoutDifficultyEnum): Promise<ApiResponse<ApiWorkout[]>> => {
    const response = await apiClient.get<ApiResponse<ApiWorkout[]>>(`/api/v1/workouts/by-difficulty/${difficulty}`);
    return response.data;
  },

  // Get workouts by type
  getByType: async (type: WorkoutTypeEnum): Promise<ApiResponse<ApiWorkout[]>> => {
    const response = await apiClient.get<ApiResponse<ApiWorkout[]>>(`/api/v1/workouts/by-type/${type}`);
    return response.data;
  },

  // Get workouts by duration range
  getByDurationRange: async (minDuration: number, maxDuration: number, page: number = 0, size: number = 20): Promise<ApiResponse<ResultPaginationDTO<ApiWorkout>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiWorkout>>>('/api/v1/workouts/by-duration-range', {
      params: { minDuration, maxDuration, page, size }
    });
    return response.data;
  },

  // Create workout
  create: async (data: ReqCreateWorkoutDTO): Promise<ApiResponse<ApiWorkout>> => {
    const response = await apiClient.post<ApiResponse<ApiWorkout>>('/api/v1/workouts', data);
    return response.data;
  },

  // Update workout
  update: async (id: number, data: ReqUpdateWorkoutDTO): Promise<ApiResponse<ApiWorkout>> => {
    const response = await apiClient.put<ApiResponse<ApiWorkout>>(`/api/v1/workouts/${id}`, data);
    return response.data;
  },

  // Delete workout
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/workouts/${id}`);
    return response.data;
  },
};

// ===== Workout Device API =====

export const workoutDeviceApi = {
  // Get all workout devices
  getAll: async (): Promise<ApiResponse<ApiWorkoutDevice[]>> => {
    const response = await apiClient.get<ApiResponse<ApiWorkoutDevice[]>>('/api/v1/workout-devices');
    return response.data;
  },

  // Get device by ID
  getById: async (id: number): Promise<ApiResponse<ApiWorkoutDevice>> => {
    const response = await apiClient.get<ApiResponse<ApiWorkoutDevice>>(`/api/v1/workout-devices/${id}`);
    return response.data;
  },

  // Search by name
  searchByName: async (name: string): Promise<ApiResponse<ApiWorkoutDevice[]>> => {
    const response = await apiClient.get<ApiResponse<ApiWorkoutDevice[]>>('/api/v1/workout-devices/by-name', {
      params: { name }
    });
    return response.data;
  },

  // Get devices by type (Cardio, Strength, Free Weights, Functional)
  getByType: async (type: string, page: number = 0, size: number = 20): Promise<ApiResponse<ResultPaginationDTO<ApiWorkoutDevice>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiWorkoutDevice>>>('/api/v1/workout-devices/by-type', {
      params: { type, page, size }
    });
    return response.data;
  },

  // Get devices requiring maintenance
  getMaintenanceRequired: async (beforeDate: string, page: number = 0, size: number = 20): Promise<ApiResponse<ResultPaginationDTO<ApiWorkoutDevice>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiWorkoutDevice>>>('/api/v1/workout-devices/maintenance-required', {
      params: { beforeDate, page, size }
    });
    return response.data;
  },

  // Get devices imported after date
  getImportedAfter: async (afterDate: string, page: number = 0, size: number = 20): Promise<ApiResponse<ResultPaginationDTO<ApiWorkoutDevice>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiWorkoutDevice>>>('/api/v1/workout-devices/imported-after', {
      params: { afterDate, page, size }
    });
    return response.data;
  },

  // Count devices by type
  countByType: async (type: string): Promise<ApiResponse<number>> => {
    const response = await apiClient.get<ApiResponse<number>>('/api/v1/workout-devices/count-by-type', {
      params: { type }
    });
    return response.data;
  },

  // Create workout device
  create: async (data: ReqCreateWorkoutDeviceDTO): Promise<ApiResponse<ApiWorkoutDevice>> => {
    const response = await apiClient.post<ApiResponse<ApiWorkoutDevice>>('/api/v1/workout-devices', data);
    return response.data;
  },

  // Update workout device
  update: async (id: number, data: ReqUpdateWorkoutDeviceDTO): Promise<ApiResponse<ApiWorkoutDevice>> => {
    const response = await apiClient.put<ApiResponse<ApiWorkoutDevice>>(`/api/v1/workout-devices/${id}`, data);
    return response.data;
  },

  // Delete workout device
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/workout-devices/${id}`);
    return response.data;
  },
};

// ===== Contract API =====

export const contractApi = {
  // Get all contracts
  getAll: async (): Promise<ApiResponse<ApiContract[]>> => {
    const response = await apiClient.get<ApiResponse<{ data: ApiContract[] }>>('/api/v1/contracts');
    // Handle nested data structure
    return {
      ...response.data,
      data: response.data.data?.data || response.data.data || []
    } as ApiResponse<ApiContract[]>;
  },

  // Get contracts by status
  getByStatus: async (status: ContractStatusEnum): Promise<ApiResponse<ApiContract[]>> => {
    const response = await apiClient.get<ApiResponse<{ data: ApiContract[] }>>(`/api/v1/contracts/status/${status}`);
    return {
      ...response.data,
      data: response.data.data?.data || response.data.data || []
    } as ApiResponse<ApiContract[]>;
  },

  // Get contract by ID
  getById: async (id: number): Promise<ApiResponse<ApiContract>> => {
    const response = await apiClient.get<ApiResponse<{ data: ApiContract }>>(`/api/v1/contracts/id/${id}`);
    return {
      ...response.data,
      data: response.data.data?.data || response.data.data
    } as ApiResponse<ApiContract>;
  },

  // Get contracts by member ID
  getByMemberId: async (memberId: number): Promise<ApiResponse<ApiContract[]>> => {
    const response = await apiClient.get<ApiResponse<{ data: ApiContract[] }>>(`/api/v1/contracts/member/${memberId}`);
    return {
      ...response.data,
      data: response.data.data?.data || response.data.data || []
    } as ApiResponse<ApiContract[]>;
  },

  // Get contracts by PT ID
  getByPtId: async (ptId: number): Promise<ApiResponse<ApiContract[]>> => {
    const response = await apiClient.get<ApiResponse<{ data: ApiContract[] }>>(`/api/v1/contracts/pt/${ptId}`);
    return {
      ...response.data,
      data: response.data.data?.data || response.data.data || []
    } as ApiResponse<ApiContract[]>;
  },

  // Create contract
  create: async (data: ReqCreateContractDTO): Promise<ApiResponse<ApiContract>> => {
    const response = await apiClient.post<ApiResponse<{ data: ApiContract }>>('/api/v1/contracts', data);
    return {
      ...response.data,
      data: response.data.data?.data || response.data.data
    } as ApiResponse<ApiContract>;
  },
};

// ===== Auth API =====

export const authApi = {
  // Login
  login: async (data: ReqLoginDTO): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', data);
    return response.data;
  },

  // Get account info
  getAccount: async (): Promise<ApiResponse<AccountInfo>> => {
    const response = await apiClient.get<ApiResponse<AccountInfo>>('/api/v1/auth/account');
    return response.data;
  },

  // Refresh token
  refresh: async (): Promise<ApiResponse<RefreshTokenResponse>> => {
    const response = await apiClient.get<ApiResponse<RefreshTokenResponse>>('/api/v1/auth/refresh');
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/api/v1/auth/logout');
    return response.data;
  },
};

// ===== Booking API =====

export const bookingApi = {
  // Get all bookings
  getAll: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<ApiBooking[]>> => {
    const response = await apiClient.get<ApiResponse<ApiBooking[]>>('/api/v1/bookings', { params });
    return response.data;
  },

  // Get booking by ID
  getById: async (id: number): Promise<ApiResponse<ApiBooking>> => {
    const response = await apiClient.get<ApiResponse<ApiBooking>>(`/api/v1/bookings/${id}`);
    return response.data;
  },

  // Create booking
  create: async (data: ReqCreateBookingDTO): Promise<ApiResponse<ApiBooking>> => {
    const response = await apiClient.post<ApiResponse<ApiBooking>>('/api/v1/bookings', data);
    return response.data;
  },

  // Update booking PT
  updatePt: async (id: number, data: ReqUpdateBookingPtDTO): Promise<ApiResponse<ApiBooking>> => {
    const response = await apiClient.put<ApiResponse<ApiBooking>>(`/api/v1/bookings/${id}/pt`, data);
    return response.data;
  },

  // Delete/cancel booking
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/bookings/${id}`);
    return response.data;
  },

  // Get available slots for booking
  getAvailableSlots: async (params?: {
    date?: string;
    servicePackageId?: number;
    ptId?: number;
  }): Promise<ApiResponse<ApiAvailableSlot[]>> => {
    const response = await apiClient.get<ApiResponse<ApiAvailableSlot[]>>('/api/v1/bookings/available-slots', { params });
    return response.data;
  },
};

// ===== Available Slot API (PT Availability) =====

export const availableSlotApi = {
  // Get all available slots with pagination
  getAll: async (params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<ApiResponse<ResultPaginationDTO<ApiAvailableSlot>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiAvailableSlot>>>('/api/v1/available-slots', { params });
    return response.data;
  },

  // Fetch with filter
  fetch: async (params?: {
    filter?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<ApiResponse<ResultPaginationDTO<ApiAvailableSlot>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiAvailableSlot>>>('/api/v1/available-slots/fetch', { params });
    return response.data;
  },

  // Get by ID
  getById: async (id: number): Promise<ApiResponse<ApiAvailableSlot>> => {
    const response = await apiClient.get<ApiResponse<ApiAvailableSlot>>(`/api/v1/available-slots/${id}`);
    return response.data;
  },

  // Get slots by PT
  getByPtId: async (ptId: number, params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<ResultPaginationDTO<ApiAvailableSlot>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiAvailableSlot>>>(`/api/v1/available-slots/by-pt/${ptId}`, { params });
    return response.data;
  },

  // Get available (AVAILABLE status only) slots by PT - returns ApiPtAvailableSlot[]
  getAvailableByPtId: async (ptId: number): Promise<ApiResponse<ApiPtAvailableSlot[]>> => {
    const response = await apiClient.get<ApiResponse<ApiPtAvailableSlot[]>>(`/api/v1/available-slots/pt/${ptId}/available`);
    return response.data;
  },

  // Get slots by status
  getByStatus: async (status: AvailableSlotStatusEnum, params?: {
    page?: number;
    size?: number;
  }): Promise<ApiResponse<ResultPaginationDTO<ApiAvailableSlot>>> => {
    const response = await apiClient.get<ApiResponse<ResultPaginationDTO<ApiAvailableSlot>>>(`/api/v1/available-slots/by-status/${status}`, { params });
    return response.data;
  },

  // Create available slot
  create: async (data: ReqCreateAvailableSlotDTO): Promise<ApiResponse<ApiAvailableSlot>> => {
    const response = await apiClient.post<ApiResponse<ApiAvailableSlot>>('/api/v1/available-slots', data);
    return response.data;
  },

  // Update available slot
  update: async (id: number, data: ReqUpdateAvailableSlotDTO): Promise<ApiResponse<ApiAvailableSlot>> => {
    const response = await apiClient.put<ApiResponse<ApiAvailableSlot>>(`/api/v1/available-slots/${id}`, data);
    return response.data;
  },

  // Delete available slot
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/available-slots/${id}`);
    return response.data;
  },
};

// ===== Invoice API =====

export const invoiceApi = {
  // Get invoice by ID
  getById: async (id: number): Promise<ApiResponse<ApiInvoice>> => {
    const response = await apiClient.get<ApiResponse<ApiInvoice>>(`/api/v1/invoices/${id}`);
    return response.data;
  },

  // Get invoices by member
  getByMemberId: async (memberId: number, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<ApiInvoice[]>> => {
    const response = await apiClient.get<ApiResponse<ApiInvoice[]>>(`/api/v1/invoices/member/${memberId}`, { params });
    return response.data;
  },

  // Add service to invoice
  addService: async (id: number, data: ReqAddServiceToInvoiceDTO): Promise<ApiResponse<ApiInvoice>> => {
    const response = await apiClient.put<ApiResponse<ApiInvoice>>(`/api/v1/invoices/${id}/add-service`, data);
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (id: number, data: ReqUpdatePaymentStatusDTO): Promise<ApiResponse<ApiInvoice>> => {
    const response = await apiClient.put<ApiResponse<ApiInvoice>>(`/api/v1/invoices/${id}/payment-status`, data);
    return response.data;
  },
};

export default {
  memberApi,
  ptApi,
  slotApi,
  packageApi,
  bodyMetricsApi,
  additionalServiceApi,
  foodApi,
  dailyDietApi,
  dietDetailApi,
  workoutApi,
  workoutDeviceApi,
  contractApi,
  authApi,
  bookingApi,
  availableSlotApi,
  invoiceApi,
};
