import { useState } from 'react';
import { Search, ChevronDown, Pencil, Trash2, Clock, Flame, Dumbbell, Upload } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { Workout, WorkoutDifficulty, EquipmentType } from '../../../../types/index.ts';
import './Workouts.css';

interface WorkoutsProps {
  userRole: 'admin' | 'pt';
  currentUserId?: string;
}

// Mock data
const mockWorkouts: Workout[] = [
  {
    id: 'wk-1',
    name: 'Full Body Strength',
    description: 'Complete strength training routine targeting all major muscle groups',
    duration: 60,
    difficulty: 'intermediate',
    equipment: 'free-weights',
    calories: 350,
    images: ['/images/workout1.jpg', '/images/workout2.jpg'],
    createdBy: 'Martell Chen',
    createdById: 'pt-1'
  },
  {
    id: 'wk-2',
    name: 'HIIT Cardio Blast',
    description: 'High-intensity interval training for maximum calorie burn',
    duration: 30,
    difficulty: 'advanced',
    equipment: 'none',
    calories: 400,
    createdBy: 'Peter Johnson',
    createdById: 'pt-2'
  },
  {
    id: 'wk-3',
    name: 'Full Body Strength',
    description: 'Complete strength training routine targeting all major muscle groups',
    duration: 60,
    difficulty: 'intermediate',
    equipment: 'free-weights',
    calories: 350,
    images: ['/images/workout1.jpg'],
    createdBy: 'Martell Chen',
    createdById: 'pt-1'
  }
];

const EQUIPMENT_OPTIONS: { value: EquipmentType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'free-weights', label: 'Free Weights' },
  { value: 'strength', label: 'Strength' }
];

const DIFFICULTY_OPTIONS: { value: WorkoutDifficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

function Workouts({ userRole, currentUserId }: WorkoutsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [_selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 0,
    difficulty: '' as WorkoutDifficulty | '',
    equipment: '' as EquipmentType | '',
    images: [] as string[]
  });

  const stats = {
    totalWorkouts: mockWorkouts.length,
    categories: new Set(mockWorkouts.map(w => w.equipment)).size,
    avgDuration: Math.round(mockWorkouts.reduce((sum, w) => sum + w.duration, 0) / mockWorkouts.length),
    avgCalories: Math.round(mockWorkouts.reduce((sum, w) => sum + w.calories, 0) / mockWorkouts.length)
  };

  const getFilteredWorkouts = () => {
    let filtered = mockWorkouts;

    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredWorkouts = getFilteredWorkouts();

  const canEditWorkout = (workout: Workout) => {
    if (userRole === 'admin') return true;
    return workout.createdById === currentUserId;
  };

  const handleEdit = (workout: Workout) => {
    setSelectedWorkout(workout);
    setFormData({
      name: workout.name,
      description: workout.description,
      duration: workout.duration,
      difficulty: workout.difficulty,
      equipment: workout.equipment,
      images: workout.images || []
    });
    setShowEditModal(true);
  };

  const handleDelete = (workout: Workout) => {
    if (confirm(`Are you sure you want to delete "${workout.name}"?`)) {
      console.log('Deleting workout:', workout.id);
    }
  };

  const handleCreateWorkout = () => {
    console.log('Creating workout:', formData);
    setShowCreateModal(false);
    resetForm();
  };

  const handleUpdateWorkout = () => {
    console.log('Updating workout:', formData);
    setShowEditModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 0,
      difficulty: '',
      equipment: '',
      images: []
    });
    setSelectedWorkout(null);
  };

  const getEquipmentLabel = (equipment: EquipmentType) => {
    return EQUIPMENT_OPTIONS.find(e => e.value === equipment)?.label || equipment;
  };

  const renderFooter = (onCancel: () => void, onSubmit: () => void, submitLabel: string) => (
    <>
      <button className="modal-form__btn modal-form__btn--secondary" onClick={onCancel}>
        Cancel
      </button>
      <button className="modal-form__btn modal-form__btn--primary" onClick={onSubmit}>
        {submitLabel}
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
        <button className="workouts__add-btn" onClick={() => setShowCreateModal(true)}>
          + Create Workout
        </button>
      </div>

      {/* Stats */}
      <div className="workouts__stats">
        <div className="workouts__stat">
          <span className="workouts__stat-label">Total workouts</span>
          <span className="workouts__stat-value">{stats.totalWorkouts}</span>
        </div>
        <div className="workouts__stat">
          <span className="workouts__stat-label">Categories</span>
          <span className="workouts__stat-value">{stats.categories}</span>
        </div>
        <div className="workouts__stat">
          <span className="workouts__stat-label">Avg. duration</span>
          <span className="workouts__stat-value">{stats.avgDuration} min</span>
        </div>
        <div className="workouts__stat">
          <span className="workouts__stat-label">Avg. Calories burnt</span>
          <span className="workouts__stat-value">{stats.avgCalories}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="workouts__filters">
        <div className="workouts__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by workout or creator name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="workouts__filter-group">
          <div className="workouts__select-wrapper">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Workout Cards Grid */}
      <div className="workouts__grid">
        {filteredWorkouts.map((workout) => (
          <div key={workout.id} className="workouts__card">
            <div className="workouts__card-header">
              <div className="workouts__card-icon">
                <Dumbbell size={24} />
              </div>
              <div className="workouts__card-title-section">
                <h3 className="workouts__card-name">{workout.name}</h3>
                <p className="workouts__card-author">by {workout.createdBy}</p>
              </div>
              {canEditWorkout(workout) && (
                <div className="workouts__card-actions">
                  <button 
                    className="workouts__card-action"
                    onClick={() => handleEdit(workout)}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    className="workouts__card-action workouts__card-action--delete"
                    onClick={() => handleDelete(workout)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <p className="workouts__card-description">{workout.description}</p>

            <div className="workouts__card-equipment">
              <span className="workouts__card-equipment-label">Equipment required</span>
              <span className="workouts__card-equipment-value">
                {getEquipmentLabel(workout.equipment)}
              </span>
            </div>

            <div className="workouts__card-footer">
              <div className="workouts__card-metric">
                <Clock size={16} />
                <span className="workouts__card-metric-label">Duration</span>
                <span className="workouts__card-metric-value">{workout.duration} min</span>
              </div>
              <div className="workouts__card-metric">
                <Flame size={16} />
                <span className="workouts__card-metric-label">Calories</span>
                <span className="workouts__card-metric-value">~{workout.calories}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
              placeholder="e.g. Bench Press"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Description</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Brief introduction about the workout..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Duration</label>
              <input
                type="number"
                className="modal-form__input"
                placeholder="0"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Difficulty</label>
              <select
                className="modal-form__select"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as WorkoutDifficulty })}
              >
                <option value="">Select Type</option>
                {DIFFICULTY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Workout images</label>
            <div className="workouts__image-upload">
              <div className="workouts__image-preview">
                <img src="/images/placeholder.jpg" alt="Preview" />
              </div>
              <div className="workouts__image-dropzone">
                <Upload size={24} />
                <span>Click to upload or drag and drop</span>
                <span className="workouts__image-hint">PNG, JPG, JPEG Up to 5MB</span>
              </div>
            </div>
            <span className="modal-form__hint">Recommended: Square image, minimum 300x300px for best quality</span>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Type of Equipment Required (optional)</label>
            <select
              className="modal-form__select"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value as EquipmentType })}
            >
              <option value="">Select Type</option>
              {EQUIPMENT_OPTIONS.map(opt => (
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
          'Confirm'
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
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Duration</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Difficulty</label>
              <select
                className="modal-form__select"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as WorkoutDifficulty })}
              >
                <option value="">Select Type</option>
                {DIFFICULTY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Workout images</label>
            <div className="workouts__image-upload workouts__image-upload--edit">
              {formData.images.length > 0 ? (
                <>
                  {formData.images.map((img, index) => (
                    <div key={index} className="workouts__image-item">
                      <img src={img} alt={`Workout ${index + 1}`} />
                      <button className="workouts__image-remove">×</button>
                    </div>
                  ))}
                </>
              ) : null}
              <div className="workouts__image-add">
                <Upload size={24} />
              </div>
            </div>
            <span className="modal-form__hint">Recommended: Square image, minimum 300x300px for best quality</span>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Type of Equipment Required (optional)</label>
            <select
              className="modal-form__select"
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value as EquipmentType })}
            >
              <option value="">Select Type</option>
              {EQUIPMENT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Workouts;
