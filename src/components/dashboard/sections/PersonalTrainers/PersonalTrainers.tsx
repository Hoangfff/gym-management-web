import { useState } from 'react';
import { Search, ChevronDown, Pencil, Trash2, Star, Upload } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { PersonalTrainer, TrainerStatus, Gender } from '../../../../types/index.ts';
import './PersonalTrainers.css';

// Mock data
const mockTrainers: PersonalTrainer[] = [
  {
    id: 'pt-1',
    name: 'Martell Chen',
    email: 'Martell008@yahoo.com',
    phone: '0923346529',
    dateOfBirth: '20/01/2000',
    gender: 'male',
    cccd: '023432149213',
    avatar: '/images/trainer1.jpg',
    about: 'Interested in strength since I was a child',
    specialization: ['Strength Training', 'Weight Loss'],
    certifications: 'NASM-CPT, ACE',
    yearsOfExperience: 5,
    rating: 4.7,
    activeClients: 12,
    status: 'active'
  },
  {
    id: 'pt-2',
    name: 'Peter Johnson',
    email: 'Martell008@yahoo.com',
    phone: '0912345678',
    dateOfBirth: '15/05/1995',
    gender: 'male',
    cccd: '023432149214',
    about: 'Passionate about helping others achieve their fitness goals',
    specialization: ['CrossFit', 'HIIT'],
    certifications: 'CrossFit Level 2, ISSA',
    yearsOfExperience: 3,
    rating: 4.7,
    activeClients: 8,
    status: 'active'
  },
  {
    id: 'pt-3',
    name: 'John Nguyen',
    email: 'Martell008@yahoo.com',
    phone: '0987654321',
    dateOfBirth: '22/03/1998',
    gender: 'male',
    cccd: '023432149215',
    avatar: '/images/trainer2.jpg',
    about: 'Experienced trainer with focus on strength',
    specialization: ['Strength Training', 'Weight Loss'],
    certifications: 'NASM-CPT, ACE',
    yearsOfExperience: 5,
    rating: 4.7,
    activeClients: 12,
    status: 'on-leave'
  },
  {
    id: 'pt-4',
    name: 'John Doe',
    email: 'Martell008@yahoo.com',
    phone: '0956789012',
    dateOfBirth: '10/08/1992',
    gender: 'male',
    cccd: '023432149216',
    about: 'CrossFit enthusiast and certified trainer',
    specialization: ['CrossFit', 'HIIT'],
    certifications: 'CrossFit Level 2, ISSA',
    yearsOfExperience: 3,
    rating: 0,
    activeClients: 0,
    status: 'pending'
  }
];

const SPECIALIZATION_OPTIONS = [
  'Strength Training',
  'Weight Loss',
  'Yoga',
  'Pilates',
  'Nutrition',
  'Cardio',
  'Bodybuilding',
  'CrossFit',
  'HIIT'
];

function PersonalTrainers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TrainerStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<PersonalTrainer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    dateOfBirth: '',
    gender: '' as Gender | '',
    phone: '',
    cccd: '',
    avatar: '',
    about: '',
    specialization: [] as string[],
    specializationInput: '',
    certifications: '',
    yearsOfExperience: 0
  });

  const stats = {
    totalTrainers: mockTrainers.length,
    activeTrainers: mockTrainers.filter(t => t.status === 'active').length,
    totalClients: mockTrainers.reduce((sum, t) => sum + t.activeClients, 0),
    avgRating: mockTrainers.filter(t => t.rating > 0).length > 0
      ? (mockTrainers.reduce((sum, t) => sum + t.rating, 0) / mockTrainers.filter(t => t.rating > 0).length).toFixed(1)
      : '0'
  };

  const getFilteredTrainers = () => {
    let filtered = mockTrainers;

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    return filtered;
  };

  const filteredTrainers = getFilteredTrainers();

  const handleEdit = (trainer: PersonalTrainer) => {
    setSelectedTrainer(trainer);
    setFormData({
      email: trainer.email,
      password: '********',
      name: trainer.name,
      dateOfBirth: trainer.dateOfBirth,
      gender: trainer.gender,
      phone: trainer.phone,
      cccd: trainer.cccd,
      avatar: trainer.avatar || '',
      about: trainer.about,
      specialization: trainer.specialization,
      specializationInput: trainer.specialization.join(', '),
      certifications: trainer.certifications,
      yearsOfExperience: trainer.yearsOfExperience
    });
    setShowEditModal(true);
  };

  const handleDelete = (trainer: PersonalTrainer) => {
    if (confirm(`Are you sure you want to delete ${trainer.name}?`)) {
      console.log('Deleting trainer:', trainer.id);
    }
  };

  const handleAddTrainer = () => {
    console.log('Adding trainer:', formData);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateTrainer = () => {
    console.log('Updating trainer:', formData);
    setShowEditModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      cccd: '',
      avatar: '',
      about: '',
      specialization: [],
      specializationInput: '',
      certifications: '',
      yearsOfExperience: 0
    });
    setSelectedTrainer(null);
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => {
      const isSelected = prev.specialization.includes(spec);
      const newSpecs = isSelected
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec];
      return {
        ...prev,
        specialization: newSpecs,
        specializationInput: newSpecs.join(', ')
      };
    });
  };

  const getStatusBadge = (status: TrainerStatus) => {
    const config = {
      'active': { label: 'Active', className: 'trainers__card-status--active' },
      'on-leave': { label: 'On Leave', className: 'trainers__card-status--on-leave' },
      'pending': { label: 'Pending', className: 'trainers__card-status--pending' }
    };
    return config[status];
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
    <div className="trainers">
      <div className="trainers__header">
        <div>
          <h1 className="trainers__title">Personal Trainers</h1>
          <p className="trainers__subtitle">Manage personal trainers and their schedules</p>
        </div>
        <button className="trainers__add-btn" onClick={() => setShowAddModal(true)}>
          + Add Trainer
        </button>
      </div>

      {/* Stats */}
      <div className="trainers__stats">
        <div className="trainers__stat">
          <span className="trainers__stat-label">Total trainers</span>
          <span className="trainers__stat-value">{stats.totalTrainers}</span>
        </div>
        <div className="trainers__stat">
          <span className="trainers__stat-label">Active trainers</span>
          <span className="trainers__stat-value">{stats.activeTrainers}</span>
        </div>
        <div className="trainers__stat">
          <span className="trainers__stat-label">Total clients</span>
          <span className="trainers__stat-value">{stats.totalClients}</span>
        </div>
        <div className="trainers__stat">
          <span className="trainers__stat-label">Avg. Rating</span>
          <span className="trainers__stat-value trainers__stat-value--rating">
            {stats.avgRating}
            <Star size={20} fill="#E7B900" stroke="#E7B900" />
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="trainers__filters">
        <div className="trainers__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by PT name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="trainers__filter-group">
          <div className="trainers__select-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TrainerStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="pending">Pending</option>
            </select>
            <ChevronDown size={16} />
          </div>
          <div className="trainers__select-wrapper">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Trainer Cards Grid */}
      <div className="trainers__grid">
        {filteredTrainers.map((trainer) => {
          const statusBadge = getStatusBadge(trainer.status);
          return (
            <div key={trainer.id} className="trainers__card">
              <div className="trainers__card-header">
                <div className="trainers__card-profile">
                  <div className="trainers__card-avatar">
                    <img 
                      src={trainer.avatar || '/images/user-icon-placeholder.png'} 
                      alt={trainer.name} 
                    />
                  </div>
                  <div className="trainers__card-info">
                    <h3 className="trainers__card-name">{trainer.name}</h3>
                    <p className="trainers__card-email">
                      {trainer.email}
                      {trainer.rating > 0 && (
                        <span className="trainers__card-rating">
                          • {trainer.rating} <Star size={12} fill="#E7B900" stroke="#E7B900" />
                        </span>
                      )}
                      {trainer.rating === 0 && (
                        <span className="trainers__card-rating trainers__card-rating--empty">
                          • - <Star size={12} fill="#ccc" stroke="#ccc" />
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="trainers__card-actions">
                  <button 
                    className="trainers__card-action"
                    onClick={() => handleEdit(trainer)}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    className="trainers__card-action trainers__card-action--delete"
                    onClick={() => handleDelete(trainer)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="trainers__card-details">
                <div className="trainers__card-detail">
                  <span className="trainers__card-label">Specialization</span>
                  <span className="trainers__card-value">{trainer.specialization.join(', ')}</span>
                </div>
                <div className="trainers__card-detail">
                  <span className="trainers__card-label">Certifications</span>
                  <span className="trainers__card-value">{trainer.certifications}</span>
                </div>
              </div>

              <div className="trainers__card-footer">
                <div className="trainers__card-metric">
                  <span className="trainers__card-metric-label">Experience</span>
                  <span className="trainers__card-metric-value">{trainer.yearsOfExperience} years</span>
                </div>
                <div className="trainers__card-metric">
                  <span className="trainers__card-metric-label">Active clients</span>
                  <span className="trainers__card-metric-value">{trainer.activeClients}</span>
                </div>
                <span className={`trainers__card-status ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Trainer Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add new trainer"
        size="md"
        footer={renderFooter(
          () => { setShowAddModal(false); resetForm(); },
          handleAddTrainer,
          'Add Trainer'
        )}
      >
        <div className="modal-form">
          {/* Profile Photo */}
          <div className="modal-form__group">
            <label className="modal-form__label">Profile Photo</label>
            <div className="trainers__photo-upload">
              <div className="trainers__photo-preview">
                <img src="/images/user-icon-placeholder.png" alt="Preview" />
              </div>
              <div className="trainers__photo-dropzone">
                <Upload size={24} />
                <span>Click to upload or drag and drop</span>
                <span className="trainers__photo-hint">PNG, JPG, JPEG Up to 5MB</span>
              </div>
            </div>
            <span className="modal-form__hint">Recommended: Square image, minimum 300x300px for best quality</span>
          </div>

          {/* Account Information */}
          <h3 className="trainers__form-section">Account Information</h3>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Email</label>
              <input
                type="email"
                className="modal-form__input"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Password</label>
              <input
                type="password"
                className="modal-form__input"
                placeholder="********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {/* Personal Information */}
          <h3 className="trainers__form-section">Personal Information</h3>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Full Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Date of birth</label>
              <input
                type="text"
                className="modal-form__input"
                placeholder="dd/mm/yyyy"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Gender</label>
              <select
                className="modal-form__select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
              >
                <option value="">Select Type</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Phone number</label>
            <input
              type="tel"
              className="modal-form__input"
              placeholder="0000000000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">CCCD</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="000000000000"
              value={formData.cccd}
              onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
            />
          </div>

          {/* Professional Information */}
          <h3 className="trainers__form-section">Professional Information</h3>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">About</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Brief introduction about yourself..."
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Specialization</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g. Strength Training..."
              value={formData.specializationInput}
              readOnly
            />
            <div className="trainers__spec-chips">
              {SPECIALIZATION_OPTIONS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  className={`trainers__spec-chip ${formData.specialization.includes(spec) ? 'trainers__spec-chip--selected' : ''}`}
                  onClick={() => toggleSpecialization(spec)}
                >
                  + {spec}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Certification</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g. NASM-CPT, ACE, CSCS..."
              value={formData.certifications}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Years of experience</label>
            <input
              type="number"
              className="modal-form__input"
              placeholder="0"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>

      {/* Edit Trainer Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit trainer"
        size="md"
        footer={renderFooter(
          () => { setShowEditModal(false); resetForm(); },
          handleUpdateTrainer,
          'Confirm'
        )}
      >
        <div className="modal-form">
          {/* Profile Photo */}
          <div className="modal-form__group">
            <label className="modal-form__label">Profile Photo</label>
            <div className="trainers__photo-upload">
              <div className="trainers__photo-preview trainers__photo-preview--has-image">
                <img 
                  src={selectedTrainer?.avatar || '/images/user-icon-placeholder.png'} 
                  alt={selectedTrainer?.name || 'Preview'} 
                />
                {selectedTrainer?.avatar && (
                  <button className="trainers__photo-remove">×</button>
                )}
              </div>
              <div className="trainers__photo-dropzone">
                <Upload size={24} />
                <span>Click to upload or drag and drop</span>
                <span className="trainers__photo-hint">PNG, JPG, JPEG Up to 5MB</span>
              </div>
            </div>
            <span className="modal-form__hint">Recommended: Square image, minimum 300x300px for best quality</span>
          </div>

          {/* Account Information */}
          <h3 className="trainers__form-section">Account Information</h3>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Email</label>
              <input
                type="email"
                className="modal-form__input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Password</label>
              <input
                type="password"
                className="modal-form__input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {/* Personal Information */}
          <h3 className="trainers__form-section">Personal Information</h3>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Full Name</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Date of birth</label>
              <input
                type="text"
                className="modal-form__input"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Gender</label>
              <select
                className="modal-form__select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
              >
                <option value="">Select Type</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Phone number</label>
            <input
              type="tel"
              className="modal-form__input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">CCCD</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.cccd}
              onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
            />
          </div>

          {/* Professional Information */}
          <h3 className="trainers__form-section">Professional Information</h3>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">About</label>
            <textarea
              className="modal-form__textarea"
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Specialization</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.specializationInput}
              readOnly
            />
            <div className="trainers__spec-chips">
              {SPECIALIZATION_OPTIONS.filter(spec => !formData.specialization.includes(spec)).map((spec) => (
                <button
                  key={spec}
                  type="button"
                  className="trainers__spec-chip"
                  onClick={() => toggleSpecialization(spec)}
                >
                  + {spec}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Certification</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.certifications}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Years of experience</label>
            <input
              type="number"
              className="modal-form__input"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default PersonalTrainers;
