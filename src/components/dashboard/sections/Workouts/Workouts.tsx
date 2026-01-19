import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Pencil, Trash2, Clock, Dumbbell, RefreshCw, Eye } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { ConfirmModal, useToast } from '../../../ui/index.ts';
import { workoutApi } from '../../../../services/index.ts';
import type { 
  ApiWorkout, 
  ReqCreateWorkoutDTO, 
  ReqUpdateWorkoutDTO,
  WorkoutDifficultyEnum, 
  WorkoutTypeEnum 
} from '../../../../types/api.ts';
import './Workouts.css';

interface WorkoutsProps {
  userRole: 'admin' | 'pt';
  currentUserId?: string;
}

// Options for filters and forms
const DIFFICULTY_OPTIONS: { value: WorkoutDifficultyEnum; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' }
];

const TYPE_OPTIONS: { value: WorkoutTypeEnum; label: string }[] = [
  { value: 'Strength', label: 'Strength' },
  { value: 'Cardio', label: 'Cardio' },
  { value: 'HIIT', label: 'HIIT' },
  { value: 'Core', label: 'Core' },
  { value: 'Flexibility', label: 'Flexibility' }
];

// Helper functions
const getDifficultyBadge = (difficulty: WorkoutDifficultyEnum) => {
  const config: Record<WorkoutDifficultyEnum, { label: string; className: string }> = {
    'BEGINNER': { label: 'Beginner', className: 'workouts__badge--beginner' },
    'INTERMEDIATE': { label: 'Intermediate', className: 'workouts__badge--intermediate' },
    'ADVANCED': { label: 'Advanced', className: 'workouts__badge--advanced' }
  };
  return config[difficulty] || { label: difficulty, className: '' };
};

const getTypeBadge = (type: WorkoutTypeEnum) => {
  const config: Record<WorkoutTypeEnum, { label: string; className: string }> = {
    'Strength': { label: 'Strength', className: 'workouts__type--strength' },
    'Cardio': { label: 'Cardio', className: 'workouts__type--cardio' },
    'HIIT': { label: 'HIIT', className: 'workouts__type--hiit' },
    'Core': { label: 'Core', className: 'workouts__type--core' },
    'Flexibility': { label: 'Flexibility', className: 'workouts__type--flexibility' }
  };
  return config[type] || { label: type, className: '' };
};

function Workouts({ userRole }: WorkoutsProps) {
  const { showToast } = useToast();
  
  // Data state
  const [workouts, setWorkouts] = useState<ApiWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<WorkoutDifficultyEnum | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<WorkoutTypeEnum | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<ApiWorkout | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 0,
    difficulty: '' as WorkoutDifficultyEnum | '',
    type: '' as WorkoutTypeEnum | ''
  });

  // Fetch workouts on mount and page change
  useEffect(() => {
    fetchWorkouts(currentPage);
  }, [currentPage]);

  const fetchWorkouts = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await workoutApi.getAll(page, pageSize);
      // Handle paginated response: data contains { meta, result }
      const paginatedData = response.data as { meta?: { totalPages: number; totalItems: number }; result?: ApiWorkout[] };
      setWorkouts(paginatedData.result || []);
      setTotalPages(paginatedData.meta?.totalPages || 1);
      setTotalItems(paginatedData.meta?.totalItems || 0);
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load workouts list'
      });
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Filter and sort workouts
  const getFilteredWorkouts = () => {
    let filtered = [...workouts];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(term) ||
        w.description.toLowerCase().includes(term)
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(w => w.difficulty === difficultyFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(w => w.type === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredWorkouts = getFilteredWorkouts();

  // Stats
  const stats = {
    totalWorkouts: workouts.length,
    types: new Set(workouts.map(w => w.type)).size,
    avgDuration: workouts.length > 0 
      ? Math.round(workouts.reduce((sum, w) => sum + w.duration, 0) / workouts.length) 
      : 0,
    byDifficulty: {
      beginner: workouts.filter(w => w.difficulty === 'BEGINNER').length,
      intermediate: workouts.filter(w => w.difficulty === 'INTERMEDIATE').length,
      advanced: workouts.filter(w => w.difficulty === 'ADVANCED').length
    }
  };

  const handleView = (workout: ApiWorkout) => {
    setSelectedWorkout(workout);
    setShowViewModal(true);
  };

  const handleEdit = (workout: ApiWorkout) => {
    setSelectedWorkout(workout);
    setFormData({
      name: workout.name,
      description: workout.description,
      duration: workout.duration,
      difficulty: workout.difficulty,
      type: workout.type
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (workout: ApiWorkout) => {
    setSelectedWorkout(workout);
    setShowDeleteModal(true);
  };

  const handleCreateWorkout = async () => {
    if (!formData.name || !formData.description || !formData.difficulty || !formData.type || formData.duration <= 0) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ReqCreateWorkoutDTO = {
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        difficulty: formData.difficulty as WorkoutDifficultyEnum,
        type: formData.type as WorkoutTypeEnum
      };

      await workoutApi.create(requestData);
      
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Created new workout'
      });

      setShowCreateModal(false);
      resetForm();
      fetchWorkouts(currentPage);
    } catch (error: unknown) {
      console.error('Failed to create workout:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to create workout'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWorkout = async () => {
    if (!selectedWorkout) return;

    setIsSubmitting(true);
    try {
      const requestData: ReqUpdateWorkoutDTO = {
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        difficulty: formData.difficulty as WorkoutDifficultyEnum,
        type: formData.type as WorkoutTypeEnum
      };

      await workoutApi.update(selectedWorkout.id, requestData);
      
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Updated workout'
      });

      setShowEditModal(false);
      resetForm();
      fetchWorkouts(currentPage);
    } catch (error: unknown) {
      console.error('Failed to update workout:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to update workout'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkout = async () => {
    if (!selectedWorkout) return;

    setIsSubmitting(true);
    try {
      await workoutApi.delete(selectedWorkout.id);
      
      showToast({
        type: 'success',
        title: 'Success',
        message: `Deleted workout "${selectedWorkout.name}"`
      });

      setShowDeleteModal(false);
      setSelectedWorkout(null);
      fetchWorkouts(currentPage);
    } catch (error: unknown) {
      console.error('Failed to delete workout:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to delete workout'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 0,
      difficulty: '',
      type: ''
    });
    setSelectedWorkout(null);
  };

  const renderFooter = (onCancel: () => void, onSubmit: () => void, submitLabel: string) => (
    <>
      <button 
        className="modal-form__btn modal-form__btn--secondary" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </button>
      <button 
        className="modal-form__btn modal-form__btn--primary" 
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Processing...' : submitLabel}
      </button>
    </>
  );

  return (
    <div className="workouts">
      <div className="workouts__header">
        <div>
          <h1 className="workouts__title">Workouts</h1>
          <p className="workouts__subtitle">Manage workout programs and exercises</p>
        </div>
        <div className="workouts__header-actions">
          <button 
            className="workouts__refresh-btn" 
            onClick={() => fetchWorkouts(currentPage)}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          {userRole === 'admin' && (
            <button className="workouts__add-btn" onClick={() => setShowCreateModal(true)}>
              + Create Workout
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="workouts__stats">
        <div className="workouts__stat">
          <span className="workouts__stat-label">Total workouts</span>
          <span className="workouts__stat-value">{stats.totalWorkouts}</span>
        </div>
        <div className="workouts__stat">
          <span className="workouts__stat-label">Types</span>
          <span className="workouts__stat-value">{stats.types}</span>
        </div>
        <div className="workouts__stat">
          <span className="workouts__stat-label">Avg. duration</span>
          <span className="workouts__stat-value">{stats.avgDuration} min</span>
        </div>
        <div className="workouts__stat">
          <span className="workouts__stat-label">Beginner</span>
          <span className="workouts__stat-value">{stats.byDifficulty.beginner}</span>
        </div>
        <div className="workouts__stat">
          <span className="workouts__stat-label">Intermediate</span>
          <span className="workouts__stat-value">{stats.byDifficulty.intermediate}</span>
        </div>
        <div className="workouts__stat">
          <span className="workouts__stat-label">Advanced</span>
          <span className="workouts__stat-value">{stats.byDifficulty.advanced}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="workouts__filters">
        <div className="workouts__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by workout name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="workouts__filter-group">
          <div className="workouts__select-wrapper">
            <select 
              value={difficultyFilter} 
              onChange={(e) => setDifficultyFilter(e.target.value as WorkoutDifficultyEnum | 'all')}
            >
              <option value="all">All Difficulty</option>
              {DIFFICULTY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          <div className="workouts__select-wrapper">
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value as WorkoutTypeEnum | 'all')}
            >
              <option value="all">All Types</option>
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          <div className="workouts__select-wrapper">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="workouts__loading">
          <RefreshCw size={32} className="spinning" />
          <p>Loading workouts...</p>
        </div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="workouts__empty">
          <Dumbbell size={48} />
          <h3>No workouts found</h3>
          <p>Try adjusting your filters or create a new workout.</p>
        </div>
      ) : (
        <>
        {/* Workout Cards Grid */}
        <div className="workouts__grid">
          {filteredWorkouts.map((workout) => {
            const difficultyBadge = getDifficultyBadge(workout.difficulty);
            const typeBadge = getTypeBadge(workout.type);
            
            return (
              <div key={workout.id} className="workouts__card">
                <div className="workouts__card-header">
                  <div className="workouts__card-icon">
                    <Dumbbell size={24} />
                  </div>
                  <div className="workouts__card-title-section">
                    <h3 className="workouts__card-name">{workout.name}</h3>
                    <span className={`workouts__card-type ${typeBadge.className}`}>
                      {typeBadge.label}
                    </span>
                  </div>
                  <div className="workouts__card-actions">
                    <button 
                      className="workouts__card-action"
                      onClick={() => handleView(workout)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    {userRole === 'admin' && (
                      <>
                        <button 
                          className="workouts__card-action"
                          onClick={() => handleEdit(workout)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          className="workouts__card-action workouts__card-action--delete"
                          onClick={() => handleDeleteClick(workout)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <p className="workouts__card-description">{workout.description}</p>

                <div className="workouts__card-badges">
                  <span className={`workouts__badge ${difficultyBadge.className}`}>
                    {difficultyBadge.label}
                  </span>
                </div>

                <div className="workouts__card-footer">
                  <div className="workouts__card-metric">
                    <Clock size={16} />
                    <span className="workouts__card-metric-value">{workout.duration} min</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="workouts__pagination">
            <button 
              className="workouts__pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <span className="workouts__pagination-info">
              Page {currentPage} of {totalPages} ({totalItems} items)
            </span>
            <button 
              className="workouts__pagination-btn"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        )}
        </>
      )}

      {/* Create Workout Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="Create new workout"
        size="md"
        footer={renderFooter(
          () => { setShowCreateModal(false); resetForm(); },
          handleCreateWorkout,
          'Create Workout'
        )}
      >
        <div className="modal-form">
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Workout Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g. Push-ups, Squats, Bench Press..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Description</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Describe the workout, target muscles, and proper form..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Duration (minutes)</label>
              <input
                type="number"
                className="modal-form__input"
                placeholder="30"
                min="1"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Type</label>
              <select
                className="modal-form__select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkoutTypeEnum })}
              >
                <option value="">Select Type</option>
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Difficulty</label>
            <select
              className="modal-form__select"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as WorkoutDifficultyEnum })}
            >
              <option value="">Select Difficulty</option>
              {DIFFICULTY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit Workout Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit workout"
        size="md"
        footer={renderFooter(
          () => { setShowEditModal(false); resetForm(); },
          handleUpdateWorkout,
          'Update Workout'
        )}
      >
        <div className="modal-form">
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Workout Name</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Description</label>
            <textarea
              className="modal-form__textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Duration (minutes)</label>
              <input
                type="number"
                className="modal-form__input"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Type</label>
              <select
                className="modal-form__select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkoutTypeEnum })}
              >
                <option value="">Select Type</option>
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Difficulty</label>
            <select
              className="modal-form__select"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as WorkoutDifficultyEnum })}
            >
              <option value="">Select Difficulty</option>
              {DIFFICULTY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* View Workout Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedWorkout(null); }}
        title="Workout Details"
        size="md"
      >
        {selectedWorkout && (
          <div className="workouts__view-modal">
            <div className="workouts__view-header">
              <div className="workouts__view-icon">
                <Dumbbell size={32} />
              </div>
              <div className="workouts__view-title">
                <h3>{selectedWorkout.name}</h3>
                <div className="workouts__view-badges">
                  <span className={`workouts__card-type ${getTypeBadge(selectedWorkout.type).className}`}>
                    {getTypeBadge(selectedWorkout.type).label}
                  </span>
                  <span className={`workouts__badge ${getDifficultyBadge(selectedWorkout.difficulty).className}`}>
                    {getDifficultyBadge(selectedWorkout.difficulty).label}
                  </span>
                </div>
              </div>
            </div>

            <div className="workouts__view-section">
              <h4>Description</h4>
              <p>{selectedWorkout.description}</p>
            </div>

            <div className="workouts__view-grid">
              <div className="workouts__view-item">
                <span className="workouts__view-label">Duration</span>
                <span className="workouts__view-value">{selectedWorkout.duration} minutes</span>
              </div>
              <div className="workouts__view-item">
                <span className="workouts__view-label">Type</span>
                <span className="workouts__view-value">{selectedWorkout.type}</span>
              </div>
              <div className="workouts__view-item">
                <span className="workouts__view-label">Difficulty</span>
                <span className="workouts__view-value">{selectedWorkout.difficulty}</span>
              </div>
              <div className="workouts__view-item">
                <span className="workouts__view-label">Created At</span>
                <span className="workouts__view-value">
                  {new Date(selectedWorkout.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedWorkout(null); }}
        onConfirm={handleDeleteWorkout}
        title="Delete Workout"
        message={`Are you sure you want to delete "${selectedWorkout?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default Workouts;
