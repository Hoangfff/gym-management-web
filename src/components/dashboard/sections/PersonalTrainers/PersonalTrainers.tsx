import { useState, useEffect } from 'react';
import { Search, ChevronDown, Pencil, Trash2, Star, Eye, RefreshCw, UserCheck, UserX, FileText } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { ConfirmModal, useToast } from '../../../ui/index.ts';
import { ptApi, contractApi } from '../../../../services/index.ts';
import type { ApiPersonalTrainer, GenderEnum, PTStatusEnum, ReqCreatePTDTO, ReqUpdatePTDTO, ApiContract, ContractStatusEnum } from '../../../../types/api.ts';
import './PersonalTrainers.css';

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

// Helper to format date
const formatDateDisplay = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
};

// Helper to get status badge
const getStatusBadge = (status: PTStatusEnum) => {
  const config: Record<PTStatusEnum, { label: string; className: string }> = {
    'AVAILABLE': { label: 'Available', className: 'trainers__card-status--active' },
    'BUSY': { label: 'Busy', className: 'trainers__card-status--busy' },
    'INACTIVE': { label: 'Inactive', className: 'trainers__card-status--inactive' }
  };
  return config[status] || { label: status, className: '' };
};

// Helper to get gender display
const getGenderDisplay = (gender: GenderEnum): string => {
  return gender === 'MALE' ? 'Male' : 'Female';
};

function PersonalTrainers() {
  const { showToast } = useToast();

  // Data state
  const [trainers, setTrainers] = useState<ApiPersonalTrainer[]>([]);
  const [ptContracts, setPtContracts] = useState<ApiContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewModalTab, setViewModalTab] = useState<'details' | 'contracts'>('details');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PTStatusEnum | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<ApiPersonalTrainer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullname: '',
    dob: '',
    gender: '' as GenderEnum | '',
    phoneNumber: '',
    avatarUrl: '',
    about: '',
    specialization: '',
    certifications: '',
    experienceYears: 0,
    note: ''
  });

  // Fetch trainers on mount
  useEffect(() => {
    fetchTrainers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTrainers = async () => {
    setIsLoading(true);
    try {
      const response = await ptApi.getAll();
      setTrainers(response.data);
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load personal trainers'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPtContracts = async (ptId: number) => {
    setIsLoadingContracts(true);
    try {
      const response = await contractApi.getByPtId(ptId);
      setPtContracts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch PT contracts:', error);
      setPtContracts([]);
    } finally {
      setIsLoadingContracts(false);
    }
  };

  const getContractStatusClass = (status: ContractStatusEnum) => {
    switch (status) {
      case 'ACTIVE': return 'trainers__contract-status--active';
      case 'EXPIRED': return 'trainers__contract-status--expired';
      case 'CANCELLED': return 'trainers__contract-status--cancelled';
      default: return '';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Stats
  const stats = {
    totalTrainers: trainers.length,
    activeTrainers: trainers.filter(t => t.status === 'AVAILABLE').length,
    busyTrainers: trainers.filter(t => t.status === 'BUSY').length,
    avgRating: trainers.filter(t => t.rating > 0).length > 0
      ? (trainers.reduce((sum, t) => sum + t.rating, 0) / trainers.filter(t => t.rating > 0).length).toFixed(1)
      : '0'
  };

  // Filter trainers
  const getFilteredTrainers = () => {
    let filtered = [...trainers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.user.fullname.toLowerCase().includes(term) ||
        t.user.email.toLowerCase().includes(term) ||
        t.id.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredTrainers = getFilteredTrainers();

  const handleView = async (trainer: ApiPersonalTrainer) => {
    try {
      const response = await ptApi.search({ ptId: trainer.id });
      setSelectedTrainer(response.data);
      setViewModalTab('details');
      setShowViewModal(true);
      fetchPtContracts(trainer.id);
    } catch (error) {
      console.error('Failed to fetch trainer details:', error);
      setSelectedTrainer(trainer);
      setViewModalTab('details');
      setShowViewModal(true);
      fetchPtContracts(trainer.id);
    }
  };

  const handleEdit = (trainer: ApiPersonalTrainer) => {
    setSelectedTrainer(trainer);
    setFormData({
      email: trainer.user.email,
      password: '',
      fullname: trainer.user.fullname,
      dob: trainer.user.dob,
      gender: trainer.user.gender,
      phoneNumber: trainer.user.phoneNumber,
      avatarUrl: trainer.user.avatarUrl || '',
      about: trainer.about,
      specialization: trainer.specialization,
      certifications: trainer.certifications,
      experienceYears: trainer.experienceYears,
      note: trainer.note || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (trainer: ApiPersonalTrainer) => {
    setSelectedTrainer(trainer);
    setShowDeleteModal(true);
  };

  const handleAddTrainer = async () => {
    if (!formData.fullname || !formData.email || !formData.password || !formData.gender || !formData.dob || !formData.phoneNumber) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ReqCreatePTDTO = {
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        avatarUrl: formData.avatarUrl || 'string',
        dob: formData.dob,
        gender: formData.gender as GenderEnum,
        status: 'ACTIVE',
        about: formData.about || 'string',
        specialization: formData.specialization || 'string',
        certifications: formData.certifications || 'string',
        experienceYears: formData.experienceYears,
        note: formData.note || 'string'
      };

      await ptApi.create(requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Added new Personal Trainer'
      });

      setShowAddModal(false);
      resetForm();
      fetchTrainers();
    } catch (error: unknown) {
      console.error('Failed to create trainer:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to add personal trainer'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTrainer = async () => {
    if (!selectedTrainer) return;

    setIsSubmitting(true);
    try {
      const requestData: ReqUpdatePTDTO = {
        fullname: formData.fullname,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        avatarUrl: formData.avatarUrl || 'string',
        dob: formData.dob,
        gender: formData.gender as GenderEnum,
        status: 'ACTIVE',
        about: formData.about || 'string',
        specialization: formData.specialization || 'string',
        certifications: formData.certifications || 'string',
        experienceYears: formData.experienceYears,
        note: formData.note || 'string'
      };

      if (formData.password) {
        requestData.password = formData.password;
      }

      await ptApi.update(selectedTrainer.id, requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Updated personal trainer information'
      });

      setShowEditModal(false);
      resetForm();
      fetchTrainers();
    } catch (error: unknown) {
      console.error('Failed to update trainer:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to update personal trainer information'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTrainer = async () => {
    if (!selectedTrainer) return;

    setIsSubmitting(true);
    try {
      await ptApi.delete(selectedTrainer.id);

      showToast({
        type: 'success',
        title: 'Success',
        message: `Deleted PT ${selectedTrainer.user.fullname}`
      });

      setShowDeleteModal(false);
      setSelectedTrainer(null);
      fetchTrainers();
    } catch (error: unknown) {
      console.error('Failed to delete trainer:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to delete personal trainer'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetBusy = async (trainer: ApiPersonalTrainer) => {
    try {
      await ptApi.setBusy(trainer.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: `${trainer.user.fullname} status changed to Busy`
      });
      fetchTrainers();
    } catch (error: unknown) {
      console.error('Failed to set busy:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to change status'
      });
    }
  };

  const handleSetAvailable = async (trainer: ApiPersonalTrainer) => {
    try {
      await ptApi.setAvailable(trainer.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: `${trainer.user.fullname} status changed to Available`
      });
      fetchTrainers();
    } catch (error: unknown) {
      console.error('Failed to set available:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to change status'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullname: '',
      dob: '',
      gender: '',
      phoneNumber: '',
      avatarUrl: '',
      about: '',
      specialization: '',
      certifications: '',
      experienceYears: 0,
      note: ''
    });
    setSelectedTrainer(null);
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => {
      const currentSpecs = prev.specialization ? prev.specialization.split(', ').filter(s => s) : [];
      const isSelected = currentSpecs.includes(spec);
      const newSpecs = isSelected
        ? currentSpecs.filter(s => s !== spec)
        : [...currentSpecs, spec];
      return {
        ...prev,
        specialization: newSpecs.join(', ')
      };
    });
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
    <div className="trainers">
      <div className="trainers__header">
        <div>
          <h1 className="trainers__title">Personal Trainers</h1>
          <p className="trainers__subtitle">Manage personal trainers and their schedules</p>
        </div>
        <div className="trainers__header-actions">
          <button
            className="trainers__refresh-btn"
            onClick={fetchTrainers}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          <button className="trainers__add-btn" onClick={() => setShowAddModal(true)}>
            + Add Trainer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="trainers__stats">
        <div className="trainers__stat">
          <span className="trainers__stat-label">Total trainers</span>
          <span className="trainers__stat-value">{stats.totalTrainers}</span>
        </div>
        <div className="trainers__stat">
          <span className="trainers__stat-label">Available</span>
          <span className="trainers__stat-value">{stats.activeTrainers}</span>
        </div>
        <div className="trainers__stat">
          <span className="trainers__stat-label">Busy</span>
          <span className="trainers__stat-value">{stats.busyTrainers}</span>
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
            placeholder="Search by PT name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="trainers__filter-group">
          <div className="trainers__select-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PTStatusEnum | 'all')}
            >
              <option value="all">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="INACTIVE">Inactive</option>
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

      {/* Loading State */}
      {isLoading ? (
        <div className="trainers__loading">
          <RefreshCw size={32} className="spinning" />
          <p>Loading trainers...</p>
        </div>
      ) : (
        /* Trainer Cards Grid */
        <div className="trainers__grid">
          {filteredTrainers.length === 0 ? (
            <div className="trainers__empty">No trainers found</div>
          ) : (
            filteredTrainers.map((trainer) => {
              const statusBadge = getStatusBadge(trainer.status);
              return (
                <div key={trainer.id} className="trainers__card">
                  <div className="trainers__card-header">
                    <div className="trainers__card-profile">
                      <div className="trainers__card-avatar">
                        <img
                          src={trainer.user.avatarUrl || '/images/user-icon-placeholder.png'}
                          alt={trainer.user.fullname}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/user-icon-placeholder.png';
                          }}
                        />
                      </div>
                      <div className="trainers__card-info">
                        <h3 className="trainers__card-name">{trainer.user.fullname}</h3>
                        <p className="trainers__card-email">
                          {trainer.user.email}
                          {trainer.rating > 0 && (
                            <span className="trainers__card-rating">
                              • {trainer.rating} <Star size={12} fill="#E7B900" stroke="#E7B900" />
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="trainers__card-actions">
                      <button
                        className="trainers__card-action"
                        onClick={() => handleView(trainer)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="trainers__card-action"
                        onClick={() => handleEdit(trainer)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      {trainer.status === 'AVAILABLE' && (
                        <button
                          className="trainers__card-action trainers__card-action--warning"
                          onClick={() => handleSetBusy(trainer)}
                          title="Set Busy"
                        >
                          <UserX size={16} />
                        </button>
                      )}
                      {trainer.status === 'BUSY' && (
                        <button
                          className="trainers__card-action trainers__card-action--success"
                          onClick={() => handleSetAvailable(trainer)}
                          title="Set Available"
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                      <button
                        className="trainers__card-action trainers__card-action--delete"
                        onClick={() => handleDeleteClick(trainer)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="trainers__card-details">
                    <div className="trainers__card-detail">
                      <span className="trainers__card-label">Specialization</span>
                      <span className="trainers__card-value">{trainer.specialization || '-'}</span>
                    </div>
                    <div className="trainers__card-detail">
                      <span className="trainers__card-label">Certifications</span>
                      <span className="trainers__card-value">{trainer.certifications || '-'}</span>
                    </div>
                  </div>

                  <div className="trainers__card-footer">
                    <div className="trainers__card-metric">
                      <span className="trainers__card-metric-label">Experience</span>
                      <span className="trainers__card-metric-value">{trainer.experienceYears} years</span>
                    </div>
                    <div className="trainers__card-metric">
                      <span className="trainers__card-metric-label">ID</span>
                      <span className="trainers__card-metric-value">#{trainer.id}</span>
                    </div>
                    <span className={`trainers__card-status ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

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
            <label className="modal-form__label">Profile Photo URL</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="https://example.com/avatar.jpg"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
            />
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
                placeholder="Minimum 8 characters"
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
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            />
          </div>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Date of Birth</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Gender</label>
              <select
                className="modal-form__select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as GenderEnum })}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Phone Number</label>
            <input
              type="tel"
              className="modal-form__input"
              placeholder="0912345678"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          {/* Professional Information */}
          <h3 className="trainers__form-section">Professional Information</h3>
          <div className="modal-form__group">
            <label className="modal-form__label">About</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Brief introduction..."
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label">Specialization</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g. Strength Training, HIIT..."
              value={formData.specialization}
              readOnly
            />
            <div className="trainers__spec-chips">
              {SPECIALIZATION_OPTIONS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  className={`trainers__spec-chip ${formData.specialization?.includes(spec) ? 'trainers__spec-chip--selected' : ''}`}
                  onClick={() => toggleSpecialization(spec)}
                >
                  + {spec}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label">Certifications</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g. NASM-CPT, ACE, CSCS..."
              value={formData.certifications}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label">Years of Experience</label>
            <input
              type="number"
              className="modal-form__input"
              placeholder="0"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label">Note</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Additional notes..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
          'Update Trainer'
        )}
      >
        <div className="modal-form">
          {/* Profile Photo */}
          <div className="modal-form__group">
            <label className="modal-form__label">Profile Photo URL</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
            />
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
              <label className="modal-form__label">Password (leave empty to keep current)</label>
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
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            />
          </div>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Date of Birth</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Gender</label>
              <select
                className="modal-form__select"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as GenderEnum })}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Phone Number</label>
            <input
              type="tel"
              className="modal-form__input"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          {/* Professional Information */}
          <h3 className="trainers__form-section">Professional Information</h3>
          <div className="modal-form__group">
            <label className="modal-form__label">About</label>
            <textarea
              className="modal-form__textarea"
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label">Specialization</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.specialization}
              readOnly
            />
            <div className="trainers__spec-chips">
              {SPECIALIZATION_OPTIONS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  className={`trainers__spec-chip ${formData.specialization?.includes(spec) ? 'trainers__spec-chip--selected' : ''}`}
                  onClick={() => toggleSpecialization(spec)}
                >
                  + {spec}
                </button>
              ))}
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label">Certifications</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.certifications}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label">Years of Experience</label>
            <input
              type="number"
              className="modal-form__input"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label">Note</label>
            <textarea
              className="modal-form__textarea"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* View Trainer Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => { 
          setShowViewModal(false); 
          setSelectedTrainer(null); 
          setPtContracts([]);
          setViewModalTab('details');
        }}
        title="Trainer Details"
        size="md"
      >
        {selectedTrainer && (
          <div className="trainers__view-modal">
            <div className="trainers__view-header">
              <div className="trainers__view-avatar">
                <img
                  src={selectedTrainer.user.avatarUrl || '/images/user-icon-placeholder.png'}
                  alt={selectedTrainer.user.fullname}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/user-icon-placeholder.png';
                  }}
                />
              </div>
              <div className="trainers__view-title">
                <h3>{selectedTrainer.user.fullname}</h3>
                <div className="trainers__view-badges">
                  <span className={`trainers__card-status ${getStatusBadge(selectedTrainer.status).className}`}>
                    {getStatusBadge(selectedTrainer.status).label}
                  </span>
                  {selectedTrainer.rating > 0 && (
                    <span className="trainers__view-rating">
                      {selectedTrainer.rating} <Star size={14} fill="#E7B900" stroke="#E7B900" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="trainers__view-tabs">
              <button
                className={`trainers__view-tab ${viewModalTab === 'details' ? 'trainers__view-tab--active' : ''}`}
                onClick={() => setViewModalTab('details')}
              >
                Details
              </button>
              <button
                className={`trainers__view-tab ${viewModalTab === 'contracts' ? 'trainers__view-tab--active' : ''}`}
                onClick={() => setViewModalTab('contracts')}
              >
                <FileText size={16} />
                Contracts ({ptContracts.length})
              </button>
            </div>

            {/* Details Tab */}
            {viewModalTab === 'details' && (
              <div className="trainers__view-grid">
                <div className="trainers__view-item">
                  <span className="trainers__view-label">PT ID</span>
                  <span className="trainers__view-value">#{selectedTrainer.id}</span>
                </div>
                <div className="trainers__view-item">
                  <span className="trainers__view-label">Email</span>
                  <span className="trainers__view-value">{selectedTrainer.user.email}</span>
                </div>
                <div className="trainers__view-item">
                  <span className="trainers__view-label">Phone</span>
                  <span className="trainers__view-value">{selectedTrainer.user.phoneNumber}</span>
                </div>
                <div className="trainers__view-item">
                  <span className="trainers__view-label">Gender</span>
                  <span className="trainers__view-value">{getGenderDisplay(selectedTrainer.user.gender)}</span>
                </div>
                <div className="trainers__view-item">
                  <span className="trainers__view-label">Date of Birth</span>
                  <span className="trainers__view-value">{formatDateDisplay(selectedTrainer.user.dob)}</span>
                </div>
                <div className="trainers__view-item">
                  <span className="trainers__view-label">Experience</span>
                  <span className="trainers__view-value">{selectedTrainer.experienceYears} years</span>
                </div>
                <div className="trainers__view-item trainers__view-item--full">
                  <span className="trainers__view-label">Specialization</span>
                  <span className="trainers__view-value">{selectedTrainer.specialization || '-'}</span>
                </div>
                <div className="trainers__view-item trainers__view-item--full">
                  <span className="trainers__view-label">Certifications</span>
                  <span className="trainers__view-value">{selectedTrainer.certifications || '-'}</span>
                </div>
                <div className="trainers__view-item trainers__view-item--full">
                  <span className="trainers__view-label">About</span>
                  <span className="trainers__view-value">{selectedTrainer.about || '-'}</span>
                </div>
                {selectedTrainer.note && (
                  <div className="trainers__view-item trainers__view-item--full">
                    <span className="trainers__view-label">Notes</span>
                    <span className="trainers__view-value">{selectedTrainer.note}</span>
                  </div>
                )}
                <div className="trainers__view-item">
                  <span className="trainers__view-label">Created At</span>
                  <span className="trainers__view-value">{new Date(selectedTrainer.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
            )}

            {/* Contracts Tab */}
            {viewModalTab === 'contracts' && (
              <div className="trainers__contracts-tab">
                {isLoadingContracts ? (
                  <div className="trainers__contracts-loading">
                    <RefreshCw size={24} className="spinning" />
                    <p>Loading contracts...</p>
                  </div>
                ) : ptContracts.length === 0 ? (
                  <div className="trainers__contracts-empty">
                    <FileText size={48} />
                    <h4>No contracts found</h4>
                    <p>This trainer has no assigned contracts yet.</p>
                  </div>
                ) : (
                  <div className="trainers__contracts-list">
                    {ptContracts.map((contract) => (
                      <div key={contract.id} className="trainers__contract-card">
                        <div className="trainers__contract-header">
                          <span className="trainers__contract-id">
                            Contract #{contract.id}
                          </span>
                          <span className={`trainers__contract-status ${getContractStatusClass(contract.status)}`}>
                            {contract.status}
                          </span>
                        </div>
                        <div className="trainers__contract-details">
                          <div className="trainers__contract-item">
                            <span className="trainers__contract-label">Member</span>
                            <span className="trainers__contract-value">{contract.memberName}</span>
                          </div>
                          <div className="trainers__contract-item">
                            <span className="trainers__contract-label">Package</span>
                            <span className="trainers__contract-value">{contract.packageName}</span>
                          </div>
                          <div className="trainers__contract-item">
                            <span className="trainers__contract-label">Price</span>
                            <span className="trainers__contract-value">{formatCurrency(contract.packagePrice)}</span>
                          </div>
                          <div className="trainers__contract-item">
                            <span className="trainers__contract-label">Duration</span>
                            <span className="trainers__contract-value">
                              {formatDateDisplay(contract.startDate)} - {formatDateDisplay(contract.endDate)}
                            </span>
                          </div>
                          <div className="trainers__contract-item">
                            <span className="trainers__contract-label">Sessions</span>
                            <span className="trainers__contract-value">
                              {contract.remainingSessions}/{contract.totalSessions} remaining
                            </span>
                          </div>
                          <div className="trainers__contract-item">
                            <span className="trainers__contract-label">Signed At</span>
                            <span className="trainers__contract-value">{formatDateDisplay(contract.signedAt)}</span>
                          </div>
                        </div>
                        {contract.notes && (
                          <div className="trainers__contract-notes">
                            <span className="trainers__contract-label">Notes:</span>
                            <p>{contract.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedTrainer(null); }}
        onConfirm={handleDeleteTrainer}
        title="Delete Personal Trainer"
        message={`Are you sure you want to delete "${selectedTrainer?.user.fullname}"? This will set their status to inactive.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default PersonalTrainers;
