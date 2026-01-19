import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Search, Apple, Utensils, Droplets, Scale, ChevronRight, ChevronLeft, X } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { ConfirmModal, useToast } from '../../../ui/index.ts';
import { foodApi, dailyDietApi, dietDetailApi, memberApi, ptApi } from '../../../../services/index.ts';
import type { 
  ApiFood, 
  ApiDailyDiet,
  ApiDietSummary, 
  ApiDietDetail,
  ApiMember,
  ApiPersonalTrainer,
  ReqCreateFoodDTO, 
  ReqUpdateFoodDTO,
  ReqCreateDailyDietDTO,
  ReqUpdateDailyDietDTO,
  ReqCreateDietDetailDTO,
  ReqUpdateDietDetailDTO,
  FoodTypeEnum
} from '../../../../types/api.ts';
import './Diets.css';

interface DietsProps {
  userRole: 'admin' | 'pt';
  currentUserId?: string;
}

// Helper functions
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const getFoodTypeLabel = (type: FoodTypeEnum): string => {
  const labels: Record<FoodTypeEnum, string> = {
    PROTEIN: 'Protein',
    CARBOHYDRATE: 'Carbs',
    FAT: 'Fat'
  };
  return labels[type] || type;
};

const getFoodTypeColor = (type: FoodTypeEnum): string => {
  const colors: Record<FoodTypeEnum, string> = {
    PROTEIN: 'red',
    CARBOHYDRATE: 'yellow',
    FAT: 'blue'
  };
  return colors[type] || 'gray';
};

const FOOD_TYPES: { value: FoodTypeEnum; label: string }[] = [
  { value: 'PROTEIN', label: 'Protein' },
  { value: 'CARBOHYDRATE', label: 'Carbohydrate' },
  { value: 'FAT', label: 'Fat' }
];

function Diets({ userRole }: DietsProps) {
  void userRole; // Reserved for role-based features
  const { showToast } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<'diets' | 'foods'>('diets');

  // Data state
  const [foods, setFoods] = useState<ApiFood[]>([]);
  const [diets, setDiets] = useState<ApiDietSummary[]>([]);
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [pts, setPts] = useState<ApiPersonalTrainer[]>([]);
  const [dietDetails, setDietDetails] = useState<Record<number, ApiDietDetail[]>>({});

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state for diets
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(20);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFoodType, setFilterFoodType] = useState<FoodTypeEnum | ''>('');

  // Modal state - Foods
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [isEditFoodModalOpen, setIsEditFoodModalOpen] = useState(false);
  const [isDeleteFoodModalOpen, setIsDeleteFoodModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<ApiFood | null>(null);

  // Modal state - Diets
  const [isAddDietModalOpen, setIsAddDietModalOpen] = useState(false);
  const [isEditDietModalOpen, setIsEditDietModalOpen] = useState(false);
  const [isViewDietModalOpen, setIsViewDietModalOpen] = useState(false);
  const [isDeleteDietModalOpen, setIsDeleteDietModalOpen] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState<ApiDailyDiet | null>(null);

  // Modal state - Diet Details (Add food to diet)
  const [isAddFoodToDietModalOpen, setIsAddFoodToDietModalOpen] = useState(false);
  const [isEditDietDetailModalOpen, setIsEditDietDetailModalOpen] = useState(false);
  const [isDeleteDietDetailModalOpen, setIsDeleteDietDetailModalOpen] = useState(false);
  const [selectedDietDetail, setSelectedDietDetail] = useState<ApiDietDetail | null>(null);

  // Food form
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    proteinG: '',
    carbsG: '',
    fatG: '',
    note: ''
  });

  // Diet form
  const [dietForm, setDietForm] = useState({
    memberId: '',
    ptId: '',
    dietDate: new Date().toISOString().split('T')[0],
    waterLiters: '2',
    note: ''
  });

  // Diet Detail form
  const [dietDetailForm, setDietDetailForm] = useState({
    foodId: '',
    prepMethod: '',
    amount: '100',
    note: ''
  });

  // Fetch data on mount
  useEffect(() => {
    fetchFoods();
    fetchMembers();
    fetchPTs();
  }, []);

  // Fetch diets when switching to diets tab
  useEffect(() => {
    if (activeTab === 'diets') {
      fetchDiets(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchFoods = async () => {
    setIsLoading(true);
    try {
      const response = await foodApi.getAll();
      setFoods(response.data);
    } catch (error) {
      console.error('Failed to fetch foods:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load food list'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await memberApi.getAllActive();
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const fetchPTs = async () => {
    try {
      const response = await ptApi.getAllActive();
      setPts(response.data);
    } catch (error) {
      console.error('Failed to fetch PTs:', error);
    }
  };

  const fetchDiets = async (page: number = 1) => {
    if (activeTab !== 'diets') return;
    setIsLoading(true);
    try {
      const response = await dailyDietApi.getAll(page, pageSize);
      const paginatedData = response.data;
      setDiets(paginatedData.result);
      setTotalPages(paginatedData.meta.totalPages);
      setTotalItems(paginatedData.meta.totalItems);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch diets:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load diet plans'
      });
      setDiets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDietDetails = async (dietId: number) => {
    try {
      const response = await dietDetailApi.getByDietId(dietId);
      setDietDetails(prev => ({ ...prev, [dietId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch diet details:', error);
    }
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchDiets(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchDiets(currentPage + 1);
    }
  };

  // Stats calculation
  const totalFoods = foods.length;
  const proteinFoods = foods.filter(f => f.type === 'PROTEIN').length;
  const carbFoods = foods.filter(f => f.type === 'CARBOHYDRATE').length;
  const fatFoods = foods.filter(f => f.type === 'FAT').length;

  // Filtered data
  const filteredFoods = foods.filter(food => {
    const matchesSearch = !searchQuery || 
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterFoodType || food.type === filterFoodType;
    return matchesSearch && matchesType;
  });

  // ===== FOOD HANDLERS =====
  const handleAddFood = async () => {
    if (!foodForm.name || !foodForm.proteinG || !foodForm.carbsG || !foodForm.fatG) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ReqCreateFoodDTO = {
        name: foodForm.name,
        description: foodForm.description || undefined,
        proteinG: parseFloat(foodForm.proteinG),
        carbsG: parseFloat(foodForm.carbsG),
        fatG: parseFloat(foodForm.fatG),
        note: foodForm.note || undefined
      };

      await foodApi.create(requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Added new food'
      });

      setIsAddFoodModalOpen(false);
      resetFoodForm();
      fetchFoods();
    } catch (error: unknown) {
      console.error('Failed to create food:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to add food'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFood = async () => {
    if (!selectedFood) return;

    setIsSubmitting(true);
    try {
      const requestData: ReqUpdateFoodDTO = {
        name: foodForm.name || undefined,
        description: foodForm.description || undefined,
        proteinG: foodForm.proteinG ? parseFloat(foodForm.proteinG) : undefined,
        carbsG: foodForm.carbsG ? parseFloat(foodForm.carbsG) : undefined,
        fatG: foodForm.fatG ? parseFloat(foodForm.fatG) : undefined,
        note: foodForm.note || undefined
      };

      await foodApi.update(selectedFood.id, requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Updated food'
      });

      setIsEditFoodModalOpen(false);
      setSelectedFood(null);
      resetFoodForm();
      fetchFoods();
    } catch (error: unknown) {
      console.error('Failed to update food:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to update food'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFood = async () => {
    if (!selectedFood) return;

    setIsSubmitting(true);
    try {
      await foodApi.delete(selectedFood.id);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Deleted food'
      });

      setIsDeleteFoodModalOpen(false);
      setSelectedFood(null);
      fetchFoods();
    } catch (error: unknown) {
      console.error('Failed to delete food:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to delete food'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditFoodModal = (food: ApiFood) => {
    setSelectedFood(food);
    setFoodForm({
      name: food.name,
      description: food.description || '',
      proteinG: food.proteinG.toString(),
      carbsG: food.carbsG.toString(),
      fatG: food.fatG.toString(),
      note: food.note || ''
    });
    setIsEditFoodModalOpen(true);
  };

  const openDeleteFoodModal = (food: ApiFood) => {
    setSelectedFood(food);
    setIsDeleteFoodModalOpen(true);
  };

  const resetFoodForm = () => {
    setFoodForm({
      name: '',
      description: '',
      proteinG: '',
      carbsG: '',
      fatG: '',
      note: ''
    });
  };

  // ===== DIET HANDLERS =====
  const handleAddDiet = async () => {
    if (!dietForm.memberId || !dietForm.ptId || !dietForm.dietDate) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please select member, PT and date'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ReqCreateDailyDietDTO = {
        memberId: parseInt(dietForm.memberId),
        ptId: parseInt(dietForm.ptId),
        dietDate: dietForm.dietDate,
        waterLiters: parseFloat(dietForm.waterLiters) || 2,
        note: dietForm.note || undefined
      };

      await dailyDietApi.create(requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Created new diet plan'
      });

      setIsAddDietModalOpen(false);
      resetDietForm();
      // Refresh diets list
      fetchDiets(1);
    } catch (error: unknown) {
      console.error('Failed to create diet:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to create diet plan'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDiet = async () => {
    if (!selectedDiet) return;

    setIsSubmitting(true);
    try {
      const requestData: ReqUpdateDailyDietDTO = {
        ptId: dietForm.ptId ? parseInt(dietForm.ptId) : undefined,
        dietDate: dietForm.dietDate || undefined,
        waterLiters: dietForm.waterLiters ? parseFloat(dietForm.waterLiters) : undefined,
        note: dietForm.note || undefined
      };

      await dailyDietApi.update(selectedDiet.id, requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Updated diet plan'
      });

      setIsEditDietModalOpen(false);
      setSelectedDiet(null);
      resetDietForm();
      // Refresh current page
      fetchDiets(currentPage);
    } catch (error: unknown) {
      console.error('Failed to update diet:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to update diet plan'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDiet = async () => {
    if (!selectedDiet) return;

    setIsSubmitting(true);
    try {
      await dailyDietApi.delete(selectedDiet.id);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Deleted diet plan'
      });

      setIsDeleteDietModalOpen(false);
      setSelectedDiet(null);
      // Refresh current page
      fetchDiets(currentPage);
    } catch (error: unknown) {
      console.error('Failed to delete diet:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to delete diet plan'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDiet = async (diet: ApiDietSummary) => {
    try {
      // Fetch full diet details with dietDetails array
      const response = await dailyDietApi.getById(diet.id);
      setSelectedDiet(response.data);
      await fetchDietDetails(diet.id);
      setIsViewDietModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch diet details:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load diet details'
      });
    }
  };

  const openEditDietModal = (diet: ApiDietSummary) => {
    // Convert summary to full diet for editing
    const fullDiet: ApiDailyDiet = {
      ...diet,
      dietDetails: []
    };
    setSelectedDiet(fullDiet);
    setDietForm({
      memberId: diet.memberId.toString(),
      ptId: diet.ptId.toString(),
      dietDate: diet.dietDate,
      waterLiters: diet.waterLiters.toString(),
      note: diet.note || ''
    });
    setIsEditDietModalOpen(true);
  };

  const openDeleteDietModal = (diet: ApiDietSummary) => {
    // Convert summary to full diet for deleting
    const fullDiet: ApiDailyDiet = {
      ...diet,
      dietDetails: []
    };
    setSelectedDiet(fullDiet);
    setIsDeleteDietModalOpen(true);
  };

  const resetDietForm = () => {
    setDietForm({
      memberId: '',
      ptId: '',
      dietDate: new Date().toISOString().split('T')[0],
      waterLiters: '2',
      note: ''
    });
  };

  // ===== DIET DETAIL HANDLERS =====
  const handleAddFoodToDiet = async () => {
    if (!selectedDiet || !dietDetailForm.foodId || !dietDetailForm.amount) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please select food and amount'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ReqCreateDietDetailDTO = {
        dietId: selectedDiet.id,
        foodId: parseInt(dietDetailForm.foodId),
        prepMethod: dietDetailForm.prepMethod || undefined,
        amount: parseInt(dietDetailForm.amount),
        note: dietDetailForm.note || undefined
      };

      await dietDetailApi.addFood(requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Added food to diet plan'
      });

      setIsAddFoodToDietModalOpen(false);
      resetDietDetailForm();
      fetchDietDetails(selectedDiet.id);
    } catch (error: unknown) {
      console.error('Failed to add food to diet:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to add food to diet plan'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDietDetail = async () => {
    if (!selectedDiet || !selectedDietDetail) return;

    setIsSubmitting(true);
    try {
      const requestData: ReqUpdateDietDetailDTO = {
        prepMethod: dietDetailForm.prepMethod || undefined,
        amount: dietDetailForm.amount ? parseInt(dietDetailForm.amount) : undefined,
        note: dietDetailForm.note || undefined
      };

      await dietDetailApi.updateFood(selectedDiet.id, selectedDietDetail.foodId, requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Updated food detail'
      });

      setIsEditDietDetailModalOpen(false);
      setSelectedDietDetail(null);
      resetDietDetailForm();
      fetchDietDetails(selectedDiet.id);
    } catch (error: unknown) {
      console.error('Failed to update diet detail:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to update food detail'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDietDetail = async () => {
    if (!selectedDiet || !selectedDietDetail) return;

    setIsSubmitting(true);
    try {
      await dietDetailApi.removeFood(selectedDiet.id, selectedDietDetail.foodId);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Removed food from diet plan'
      });

      setIsDeleteDietDetailModalOpen(false);
      setSelectedDietDetail(null);
      fetchDietDetails(selectedDiet.id);
    } catch (error: unknown) {
      console.error('Failed to remove food from diet:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to remove food'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddFoodToDietModal = () => {
    resetDietDetailForm();
    setIsAddFoodToDietModalOpen(true);
  };

  const openEditDietDetailModal = (detail: ApiDietDetail) => {
    setSelectedDietDetail(detail);
    setDietDetailForm({
      foodId: detail.foodId.toString(),
      prepMethod: detail.prepMethod || '',
      amount: detail.amount.toString(),
      note: detail.note || ''
    });
    setIsEditDietDetailModalOpen(true);
  };

  const openDeleteDietDetailModal = (detail: ApiDietDetail) => {
    setSelectedDietDetail(detail);
    setIsDeleteDietDetailModalOpen(true);
  };

  const resetDietDetailForm = () => {
    setDietDetailForm({
      foodId: '',
      prepMethod: '',
      amount: '100',
      note: ''
    });
  };

  // Calculate totals for current diet
  const currentDietDetails = selectedDiet ? dietDetails[selectedDiet.id] || [] : [];
  const totalCalories = currentDietDetails.reduce((sum, d) => sum + d.totalCalories, 0);
  const totalProtein = currentDietDetails.reduce((sum, d) => sum + d.totalProteinG, 0);
  const totalCarbs = currentDietDetails.reduce((sum, d) => sum + d.totalCarbsG, 0);
  const totalFat = currentDietDetails.reduce((sum, d) => sum + d.totalFatG, 0);

  return (
    <div className="diets">
      <div className="diets__header">
        <div>
          <h1 className="diets__title">Diet & Nutrition</h1>
          <p className="diets__subtitle">Manage diet plans and food database</p>
        </div>
        <div className="diets__header-actions">
          <button
            className="diets__refresh-btn"
            onClick={activeTab === 'diets' ? () => fetchDiets(currentPage) : fetchFoods}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          {activeTab === 'foods' ? (
            <button className="diets__create-btn" onClick={() => setIsAddFoodModalOpen(true)}>
              <Plus size={20} />
              Add Food
            </button>
          ) : (
            <button className="diets__create-btn" onClick={() => setIsAddDietModalOpen(true)}>
              <Plus size={20} />
              Create Diet
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="diets__stats">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--blue">
            <Apple size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Total Foods</span>
            <span className="stat-card__value">{totalFoods}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--red">
            <Scale size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Proteins</span>
            <span className="stat-card__value">{proteinFoods}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--yellow">
            <Utensils size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Carbs</span>
            <span className="stat-card__value">{carbFoods}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--green">
            <Droplets size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Fats</span>
            <span className="stat-card__value">{fatFoods}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="diets__tabs">
        <button
          className={`diets__tab ${activeTab === 'diets' ? 'diets__tab--active' : ''}`}
          onClick={() => setActiveTab('diets')}
        >
          Daily Diets
        </button>
        <button
          className={`diets__tab ${activeTab === 'foods' ? 'diets__tab--active' : ''}`}
          onClick={() => setActiveTab('foods')}
        >
          Food Database
        </button>
      </div>

      {/* Foods Tab */}
      {activeTab === 'foods' && (
        <>
          {/* Filters */}
          <div className="diets__filters">
            <div className="diets__search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={filterFoodType}
              onChange={(e) => setFilterFoodType(e.target.value as FoodTypeEnum | '')}
              className="diets__filter-select"
            >
              <option value="">All Types</option>
              {FOOD_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Foods Table */}
          <div className="diets__table-container">
            {isLoading ? (
              <div className="diets__loading">
                <RefreshCw size={32} className="spinning" />
                <p>Loading foods...</p>
              </div>
            ) : (
              <table className="diets__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>TYPE</th>
                    <th>CALORIES</th>
                    <th>PROTEIN</th>
                    <th>CARBS</th>
                    <th>FAT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="diets__empty">
                        No foods found
                      </td>
                    </tr>
                  ) : (
                    filteredFoods.map(food => (
                      <tr key={food.id}>
                        <td>#{food.id}</td>
                        <td>
                          <div className="diets__food-name">
                            <span>{food.name}</span>
                            {food.description && (
                              <span className="diets__food-desc">{food.description}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`diets__food-type diets__food-type--${getFoodTypeColor(food.type)}`}>
                            {getFoodTypeLabel(food.type)}
                          </span>
                        </td>
                        <td className="diets__calories">{food.calories.toFixed(0)} kcal</td>
                        <td>{food.proteinG}g</td>
                        <td>{food.carbsG}g</td>
                        <td>{food.fatG}g</td>
                        <td>
                          <div className="diets__actions">
                            <button
                              className="diets__action-btn"
                              onClick={() => openEditFoodModal(food)}
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="diets__action-btn diets__action-btn--delete"
                              onClick={() => openDeleteFoodModal(food)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Diets Tab */}
      {activeTab === 'diets' && (
        <div className="diets__diet-list">
          {diets.length === 0 ? (
            <div className="diets__empty-state">
              <Utensils size={48} />
              <h3>No diet plans yet</h3>
              <p>Create your first diet plan to get started</p>
              <button className="diets__create-btn" onClick={() => setIsAddDietModalOpen(true)}>
                <Plus size={20} />
                Create Diet
              </button>
            </div>
          ) : (
            diets.map(diet => (
              <div key={diet.id} className="diets__diet-card">
                <div className="diets__diet-card-header">
                  <div className="diets__diet-icon">
                    <Utensils size={24} />
                  </div>
                  <div className="diets__diet-info">
                    <h3 className="diets__diet-title">Diet #{diet.id}</h3>
                    <p className="diets__diet-meta">
                      <span>For: {diet.memberName}</span>
                      <span>•</span>
                      <span>By: {diet.ptName}</span>
                      <span>•</span>
                      <span>{formatDate(diet.dietDate)}</span>
                    </p>
                  </div>
                  <div className="diets__diet-water">
                    <Droplets size={16} />
                    <span>{diet.waterLiters}L water</span>
                  </div>
                  <button
                    className="diets__diet-view-btn"
                    onClick={() => handleViewDiet(diet)}
                  >
                    View Details
                    <ChevronRight size={16} />
                  </button>
                </div>
                {diet.note && (
                  <p className="diets__diet-note">{diet.note}</p>
                )}
                <div className="diets__diet-card-actions">
                  <button onClick={() => openEditDietModal(diet)} title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button className="diets__action-btn--delete" onClick={() => openDeleteDietModal(diet)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="diets__pagination">
              <button 
                className="diets__pagination-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <span className="diets__pagination-info">
                Page {currentPage} of {totalPages} ({totalItems} items)
              </span>
              <button 
                className="diets__pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== FOOD MODALS ===== */}

      {/* Add Food Modal */}
      <Modal isOpen={isAddFoodModalOpen} onClose={() => { setIsAddFoodModalOpen(false); resetFoodForm(); }} title="Add New Food">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleAddFood(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g., Chicken Breast"
              value={foodForm.name}
              onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
              required
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Description</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g., Lean protein source"
              value={foodForm.description}
              onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Protein (g)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                placeholder="31"
                value={foodForm.proteinG}
                onChange={(e) => setFoodForm({ ...foodForm, proteinG: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                placeholder="0"
                value={foodForm.carbsG}
                onChange={(e) => setFoodForm({ ...foodForm, carbsG: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Fat (g)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                placeholder="3.5"
                value={foodForm.fatG}
                onChange={(e) => setFoodForm({ ...foodForm, fatG: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Note</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Any additional notes..."
              value={foodForm.note}
              onChange={(e) => setFoodForm({ ...foodForm, note: e.target.value })}
              rows={3}
            />
          </div>

          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => { setIsAddFoodModalOpen(false); resetFoodForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Food'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Food Modal */}
      <Modal isOpen={isEditFoodModalOpen} onClose={() => { setIsEditFoodModalOpen(false); setSelectedFood(null); resetFoodForm(); }} title="Edit Food">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleUpdateFood(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Name</label>
            <input
              type="text"
              className="modal-form__input"
              value={foodForm.name}
              onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
              required
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Description</label>
            <input
              type="text"
              className="modal-form__input"
              value={foodForm.description}
              onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Protein (g)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                value={foodForm.proteinG}
                onChange={(e) => setFoodForm({ ...foodForm, proteinG: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                value={foodForm.carbsG}
                onChange={(e) => setFoodForm({ ...foodForm, carbsG: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Fat (g)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                value={foodForm.fatG}
                onChange={(e) => setFoodForm({ ...foodForm, fatG: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Note</label>
            <textarea
              className="modal-form__textarea"
              value={foodForm.note}
              onChange={(e) => setFoodForm({ ...foodForm, note: e.target.value })}
              rows={3}
            />
          </div>

          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => { setIsEditFoodModalOpen(false); setSelectedFood(null); resetFoodForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Food'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Food Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteFoodModalOpen}
        onClose={() => { setIsDeleteFoodModalOpen(false); setSelectedFood(null); }}
        onConfirm={handleDeleteFood}
        title="Delete Food"
        message={`Are you sure you want to delete "${selectedFood?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />

      {/* ===== DIET MODALS ===== */}

      {/* Add Diet Modal */}
      <Modal isOpen={isAddDietModalOpen} onClose={() => { setIsAddDietModalOpen(false); resetDietForm(); }} title="Create Daily Diet">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleAddDiet(); }}>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Member</label>
              <select
                className="modal-form__select"
                value={dietForm.memberId}
                onChange={(e) => setDietForm({ ...dietForm, memberId: e.target.value })}
                required
              >
                <option value="">Select member</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.user.fullname} (#{member.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Personal Trainer</label>
              <select
                className="modal-form__select"
                value={dietForm.ptId}
                onChange={(e) => setDietForm({ ...dietForm, ptId: e.target.value })}
                required
              >
                <option value="">Select PT</option>
                {pts.map(pt => (
                  <option key={pt.id} value={pt.id}>
                    {pt.user.fullname} (#{pt.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Diet Date</label>
              <input
                type="date"
                className="modal-form__input"
                value={dietForm.dietDate}
                onChange={(e) => setDietForm({ ...dietForm, dietDate: e.target.value })}
                required
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Water (Liters)</label>
              <input
                type="number"
                step="0.5"
                className="modal-form__input"
                placeholder="2"
                value={dietForm.waterLiters}
                onChange={(e) => setDietForm({ ...dietForm, waterLiters: e.target.value })}
                min="0"
              />
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Note</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Any special instructions or notes..."
              value={dietForm.note}
              onChange={(e) => setDietForm({ ...dietForm, note: e.target.value })}
              rows={3}
            />
          </div>

          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => { setIsAddDietModalOpen(false); resetDietForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Diet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Diet Modal */}
      <Modal isOpen={isEditDietModalOpen} onClose={() => { setIsEditDietModalOpen(false); setSelectedDiet(null); resetDietForm(); }} title="Edit Daily Diet">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleUpdateDiet(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label">Member</label>
            <input
              type="text"
              className="modal-form__input"
              value={selectedDiet?.memberName || ''}
              disabled
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Personal Trainer</label>
              <select
                className="modal-form__select"
                value={dietForm.ptId}
                onChange={(e) => setDietForm({ ...dietForm, ptId: e.target.value })}
                required
              >
                <option value="">Select PT</option>
                {pts.map(pt => (
                  <option key={pt.id} value={pt.id}>
                    {pt.user.fullname} (#{pt.id})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Diet Date</label>
              <input
                type="date"
                className="modal-form__input"
                value={dietForm.dietDate}
                onChange={(e) => setDietForm({ ...dietForm, dietDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Water (Liters)</label>
            <input
              type="number"
              step="0.5"
              className="modal-form__input"
              value={dietForm.waterLiters}
              onChange={(e) => setDietForm({ ...dietForm, waterLiters: e.target.value })}
              min="0"
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Note</label>
            <textarea
              className="modal-form__textarea"
              value={dietForm.note}
              onChange={(e) => setDietForm({ ...dietForm, note: e.target.value })}
              rows={3}
            />
          </div>

          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => { setIsEditDietModalOpen(false); setSelectedDiet(null); resetDietForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Diet'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Diet Modal (with foods) */}
      <Modal 
        isOpen={isViewDietModalOpen} 
        onClose={() => { setIsViewDietModalOpen(false); setSelectedDiet(null); }} 
        title={`Diet Details - ${selectedDiet?.memberName || ''}`}
      >
        {selectedDiet && (
          <div className="diets__view-modal">
            <div className="diets__view-header">
              <div className="diets__view-info">
                <div className="diets__view-item">
                  <span className="diets__view-label">Date</span>
                  <span className="diets__view-value">{formatDate(selectedDiet.dietDate)}</span>
                </div>
                <div className="diets__view-item">
                  <span className="diets__view-label">PT</span>
                  <span className="diets__view-value">{selectedDiet.ptName}</span>
                </div>
                <div className="diets__view-item">
                  <span className="diets__view-label">Water</span>
                  <span className="diets__view-value">{selectedDiet.waterLiters}L</span>
                </div>
              </div>
              {selectedDiet.note && (
                <p className="diets__view-note">Note: {selectedDiet.note}</p>
              )}
            </div>

            {/* Macros Summary */}
            <div className="diets__macros-summary">
              <div className="diets__macro-item">
                <span className="diets__macro-label">Total Calories</span>
                <span className="diets__macro-value diets__macro-value--calories">{totalCalories} kcal</span>
              </div>
              <div className="diets__macro-item">
                <span className="diets__macro-label">Protein</span>
                <span className="diets__macro-value diets__macro-value--protein">{totalProtein}g</span>
              </div>
              <div className="diets__macro-item">
                <span className="diets__macro-label">Carbs</span>
                <span className="diets__macro-value diets__macro-value--carbs">{totalCarbs}g</span>
              </div>
              <div className="diets__macro-item">
                <span className="diets__macro-label">Fat</span>
                <span className="diets__macro-value diets__macro-value--fat">{totalFat}g</span>
              </div>
            </div>

            {/* Foods List */}
            <div className="diets__foods-section">
              <div className="diets__foods-header">
                <h4>Foods in Diet</h4>
                <button className="diets__add-food-btn" onClick={openAddFoodToDietModal}>
                  <Plus size={16} />
                  Add Food
                </button>
              </div>
              
              {currentDietDetails.length === 0 ? (
                <p className="diets__no-foods">No foods added yet. Click "Add Food" to start.</p>
              ) : (
                <div className="diets__foods-list">
                  {currentDietDetails.map(detail => (
                    <div key={`${detail.dietId}-${detail.foodId}`} className="diets__food-item">
                      <div className="diets__food-item-info">
                        <span className="diets__food-item-name">{detail.foodName}</span>
                        <span className="diets__food-item-amount">{detail.amount}g</span>
                        {detail.prepMethod && (
                          <span className="diets__food-item-prep">Prep: {detail.prepMethod}</span>
                        )}
                      </div>
                      <div className="diets__food-item-macros">
                        <span>{detail.totalCalories} kcal</span>
                        <span>P: {detail.totalProteinG}g</span>
                        <span>C: {detail.totalCarbsG}g</span>
                        <span>F: {detail.totalFatG}g</span>
                      </div>
                      <div className="diets__food-item-actions">
                        <button onClick={() => openEditDietDetailModal(detail)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button className="diets__action-btn--delete" onClick={() => openDeleteDietDetailModal(detail)} title="Remove">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Diet Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteDietModalOpen}
        onClose={() => { setIsDeleteDietModalOpen(false); setSelectedDiet(null); }}
        onConfirm={handleDeleteDiet}
        title="Delete Diet"
        message={`Are you sure you want to delete this diet for ${selectedDiet?.memberName}? All foods in this diet will also be removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />

      {/* ===== DIET DETAIL MODALS ===== */}

      {/* Add Food to Diet Modal */}
      <Modal 
        isOpen={isAddFoodToDietModalOpen} 
        onClose={() => { setIsAddFoodToDietModalOpen(false); resetDietDetailForm(); }} 
        title="Add Food to Diet"
      >
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleAddFoodToDiet(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Food</label>
            <select
              className="modal-form__select"
              value={dietDetailForm.foodId}
              onChange={(e) => setDietDetailForm({ ...dietDetailForm, foodId: e.target.value })}
              required
            >
              <option value="">Select food</option>
              {foods.map(food => (
                <option key={food.id} value={food.id}>
                  {food.name} ({food.calories} kcal/100g)
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Amount (g)</label>
              <input
                type="number"
                className="modal-form__input"
                placeholder="100"
                value={dietDetailForm.amount}
                onChange={(e) => setDietDetailForm({ ...dietDetailForm, amount: e.target.value })}
                required
                min="1"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Prep Method</label>
              <input
                type="text"
                className="modal-form__input"
                placeholder="e.g., Grilled, Steamed"
                value={dietDetailForm.prepMethod}
                onChange={(e) => setDietDetailForm({ ...dietDetailForm, prepMethod: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Note</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Any special instructions..."
              value={dietDetailForm.note}
              onChange={(e) => setDietDetailForm({ ...dietDetailForm, note: e.target.value })}
              rows={2}
            />
          </div>

          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => { setIsAddFoodToDietModalOpen(false); resetDietDetailForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Food'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Diet Detail Modal */}
      <Modal 
        isOpen={isEditDietDetailModalOpen} 
        onClose={() => { setIsEditDietDetailModalOpen(false); setSelectedDietDetail(null); resetDietDetailForm(); }} 
        title="Edit Food in Diet"
      >
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleUpdateDietDetail(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label">Food</label>
            <input
              type="text"
              className="modal-form__input"
              value={selectedDietDetail?.foodName || ''}
              disabled
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Amount (g)</label>
              <input
                type="number"
                className="modal-form__input"
                value={dietDetailForm.amount}
                onChange={(e) => setDietDetailForm({ ...dietDetailForm, amount: e.target.value })}
                required
                min="1"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Prep Method</label>
              <input
                type="text"
                className="modal-form__input"
                value={dietDetailForm.prepMethod}
                onChange={(e) => setDietDetailForm({ ...dietDetailForm, prepMethod: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Note</label>
            <textarea
              className="modal-form__textarea"
              value={dietDetailForm.note}
              onChange={(e) => setDietDetailForm({ ...dietDetailForm, note: e.target.value })}
              rows={2}
            />
          </div>

          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => { setIsEditDietDetailModalOpen(false); setSelectedDietDetail(null); resetDietDetailForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Diet Detail Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteDietDetailModalOpen}
        onClose={() => { setIsDeleteDietDetailModalOpen(false); setSelectedDietDetail(null); }}
        onConfirm={handleDeleteDietDetail}
        title="Remove Food from Diet"
        message={`Are you sure you want to remove "${selectedDietDetail?.foodName}" from this diet?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default Diets;
