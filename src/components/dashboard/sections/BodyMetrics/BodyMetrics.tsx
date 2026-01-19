import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Eye, Search, TrendingDown, Activity, Scale, Ruler } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { ConfirmModal, useToast } from '../../../ui/index.ts';
import { bodyMetricsApi, memberApi } from '../../../../services/index.ts';
import type { ApiBodyMetric, ReqCreateBodyMetricDTO, ReqUpdateBodyMetricDTO, ApiMember } from '../../../../types/api.ts';
import './BodyMetrics.css';

interface BodyMetricsProps {
  userRole?: 'admin' | 'pt';
}

// Helper functions
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const getBMICategory = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'blue' };
  if (bmi < 25) return { label: 'Normal', color: 'green' };
  if (bmi < 30) return { label: 'Overweight', color: 'yellow' };
  return { label: 'Obese', color: 'red' };
};

const calculateBMI = (weight: number, height: number): number => {
  if (height <= 0) return 0;
  const heightInM = height / 100;
  return weight / (heightInM * heightInM);
};

function BodyMetrics({ userRole }: BodyMetricsProps) {
  void userRole; // Reserved for role-based features
  const { showToast } = useToast();

  // Data state
  const [metrics, setMetrics] = useState<ApiBodyMetric[]>([]);
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMemberId, setFilterMemberId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<ApiBodyMetric | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    memberId: '',
    measuredDate: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    muscleMass: '',
    bodyFatPercentage: '',
    bmi: ''
  });

  // Fetch data on mount
  useEffect(() => {
    fetchMetrics();
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await bodyMetricsApi.getAll();
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch body metrics:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load body metrics list'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const response = await memberApi.getAllActive();
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const fetchByMember = async (memberId: number) => {
    setIsLoading(true);
    try {
      const response = await bodyMetricsApi.getByMemberId(memberId);
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch body metrics:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load member body metrics'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stats
  const totalRecords = metrics.length;
  const avgWeight = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.weight, 0) / metrics.length : 0;
  const avgBMI = metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.bmi, 0) / metrics.length : 0;
  const avgBodyFat = metrics.length > 0 
    ? metrics.filter(m => m.bodyFatPercentage > 0).reduce((sum, m) => sum + m.bodyFatPercentage, 0) / metrics.filter(m => m.bodyFatPercentage > 0).length 
    : 0;

  // Filtered metrics
  const filteredMetrics = metrics.filter(metric => {
    const matchesSearch = !searchQuery || 
      metric.member.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.member.memberId.toString().includes(searchQuery);
    return matchesSearch;
  });

  // Auto-calculate BMI when weight/height change
  useEffect(() => {
    if (formData.weight && formData.height) {
      const bmi = calculateBMI(parseFloat(formData.weight), parseFloat(formData.height));
      setFormData(prev => ({ ...prev, bmi: bmi.toFixed(2) }));
    }
  }, [formData.weight, formData.height]);

  const handleAddMetric = async () => {
    if (!formData.memberId || !formData.weight || !formData.height || !formData.measuredDate) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ReqCreateBodyMetricDTO = {
        memberId: parseInt(formData.memberId),
        measuredDate: formData.measuredDate,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : undefined,
        bodyFatPercentage: formData.bodyFatPercentage ? parseFloat(formData.bodyFatPercentage) : undefined,
        bmi: formData.bmi ? parseFloat(formData.bmi) : undefined
      };

      await bodyMetricsApi.create(requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Added new body metrics'
      });

      setIsAddModalOpen(false);
      resetForm();
      fetchMetrics();
    } catch (error: unknown) {
      console.error('Failed to create metric:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to add body metrics'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMetric = async () => {
    if (!selectedMetric) return;

    setIsSubmitting(true);
    try {
      const requestData: ReqUpdateBodyMetricDTO = {
        measuredDate: formData.measuredDate || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        muscleMass: formData.muscleMass ? parseFloat(formData.muscleMass) : undefined,
        bodyFatPercentage: formData.bodyFatPercentage ? parseFloat(formData.bodyFatPercentage) : undefined,
        bmi: formData.bmi ? parseFloat(formData.bmi) : undefined
      };

      await bodyMetricsApi.update(selectedMetric.id, requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Updated body metrics'
      });

      setIsEditModalOpen(false);
      setSelectedMetric(null);
      resetForm();
      fetchMetrics();
    } catch (error: unknown) {
      console.error('Failed to update metric:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to update body metrics'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMetric = async () => {
    if (!selectedMetric) return;

    setIsSubmitting(true);
    try {
      await bodyMetricsApi.delete(selectedMetric.id);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Deleted body metrics'
      });

      setIsDeleteModalOpen(false);
      setSelectedMetric(null);
      fetchMetrics();
    } catch (error: unknown) {
      console.error('Failed to delete metric:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to delete body metrics'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewMetric = (metric: ApiBodyMetric) => {
    setSelectedMetric(metric);
    setIsViewModalOpen(true);
  };

  const openEditModal = (metric: ApiBodyMetric) => {
    setSelectedMetric(metric);
    setFormData({
      memberId: metric.member.memberId.toString(),
      measuredDate: metric.measuredDate,
      weight: metric.weight.toString(),
      height: metric.height.toString(),
      muscleMass: metric.muscleMass?.toString() || '',
      bodyFatPercentage: metric.bodyFatPercentage?.toString() || '',
      bmi: metric.bmi?.toString() || ''
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (metric: ApiBodyMetric) => {
    setSelectedMetric(metric);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      memberId: '',
      measuredDate: new Date().toISOString().split('T')[0],
      weight: '',
      height: '',
      muscleMass: '',
      bodyFatPercentage: '',
      bmi: ''
    });
  };

  const handleFilterByMember = (memberId: string) => {
    setFilterMemberId(memberId);
    if (memberId) {
      fetchByMember(parseInt(memberId));
    } else {
      fetchMetrics();
    }
  };

  return (
    <div className="body-metrics">
      <div className="body-metrics__header">
        <div>
          <h1 className="body-metrics__title">Body Metrics</h1>
          <p className="body-metrics__subtitle">Track and manage member body measurements</p>
        </div>
        <div className="body-metrics__header-actions">
          <button
            className="body-metrics__refresh-btn"
            onClick={fetchMetrics}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          <button className="body-metrics__create-btn" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} />
            Add Record
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="body-metrics__stats">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--blue">
            <Activity size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Total Records</span>
            <span className="stat-card__value">{totalRecords}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--green">
            <Scale size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Avg. Weight</span>
            <span className="stat-card__value">{avgWeight.toFixed(1)} kg</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--purple">
            <Ruler size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Avg. BMI</span>
            <span className="stat-card__value">{avgBMI.toFixed(1)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--yellow">
            <TrendingDown size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Avg. Body Fat</span>
            <span className="stat-card__value">{avgBodyFat.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="body-metrics__filters">
        <div className="body-metrics__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by member name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={filterMemberId}
          onChange={(e) => handleFilterByMember(e.target.value)}
          className="body-metrics__filter-select"
          disabled={isLoadingMembers}
        >
          <option value="">All Members</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {member.user.fullname} (#{member.id})
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="body-metrics__date-input"
          placeholder="From"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="body-metrics__date-input"
          placeholder="To"
        />
      </div>

      {/* Table */}
      <div className="body-metrics__table-container">
        {isLoading ? (
          <div className="body-metrics__loading">
            <RefreshCw size={32} className="spinning" />
            <p>Loading body metrics...</p>
          </div>
        ) : (
          <table className="body-metrics__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>MEMBER</th>
                <th>DATE</th>
                <th>WEIGHT</th>
                <th>HEIGHT</th>
                <th>BMI</th>
                <th>BODY FAT</th>
                <th>MUSCLE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.length === 0 ? (
                <tr>
                  <td colSpan={9} className="body-metrics__empty">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredMetrics.map(metric => {
                  const bmiCategory = getBMICategory(metric.bmi);
                  return (
                    <tr key={metric.id}>
                      <td>#{metric.id}</td>
                      <td className="body-metrics__member">
                        <span className="body-metrics__member-name">{metric.member.fullname}</span>
                        <span className="body-metrics__member-id">#{metric.member.memberId}</span>
                      </td>
                      <td>{formatDate(metric.measuredDate)}</td>
                      <td className="body-metrics__weight">{metric.weight} kg</td>
                      <td>{metric.height} cm</td>
                      <td>
                        <div className="body-metrics__bmi">
                          <span className="body-metrics__bmi-value">{metric.bmi.toFixed(1)}</span>
                          <span className={`body-metrics__bmi-category body-metrics__bmi-category--${bmiCategory.color}`}>
                            {bmiCategory.label}
                          </span>
                        </div>
                      </td>
                      <td>
                        {metric.bodyFatPercentage > 0 ? (
                          <span className="body-metrics__body-fat">{metric.bodyFatPercentage}%</span>
                        ) : '-'}
                      </td>
                      <td>
                        {metric.muscleMass > 0 ? (
                          <span className="body-metrics__muscle">{metric.muscleMass} kg</span>
                        ) : '-'}
                      </td>
                      <td>
                        <div className="body-metrics__actions">
                          <button
                            className="body-metrics__action-btn"
                            onClick={() => handleViewMetric(metric)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="body-metrics__action-btn"
                            onClick={() => openEditModal(metric)}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="body-metrics__action-btn body-metrics__action-btn--delete"
                            onClick={() => openDeleteModal(metric)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Metric Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetForm(); }} title="Add Body Metric Record">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleAddMetric(); }}>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Member</label>
              <select
                className="modal-form__select"
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
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
              <label className="modal-form__label modal-form__label--required">Measured Date</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.measuredDate}
                onChange={(e) => setFormData({ ...formData, measuredDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                placeholder="e.g., 70.5"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                placeholder="e.g., 175"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label">Body Fat (%)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                placeholder="e.g., 18.5"
                value={formData.bodyFatPercentage}
                onChange={(e) => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
                min="0"
                max="100"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Muscle Mass (kg)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                placeholder="e.g., 35"
                value={formData.muscleMass}
                onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
                min="0"
              />
            </div>
          </div>

          {/* BMI Preview */}
          {formData.weight && formData.height && (
            <div className="body-metrics__bmi-preview">
              <div className="body-metrics__bmi-preview-item">
                <span className="body-metrics__bmi-preview-label">Calculated BMI:</span>
                <span className="body-metrics__bmi-preview-value">{formData.bmi}</span>
                <span className={`body-metrics__bmi-category body-metrics__bmi-category--${getBMICategory(parseFloat(formData.bmi)).color}`}>
                  {getBMICategory(parseFloat(formData.bmi)).label}
                </span>
              </div>
            </div>
          )}

          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => { setIsAddModalOpen(false); resetForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Metric Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedMetric(null); resetForm(); }} title="Edit Body Metric">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleUpdateMetric(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label">Member</label>
            <input
              type="text"
              className="modal-form__input"
              value={selectedMetric?.member.fullname || ''}
              disabled
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Measured Date</label>
            <input
              type="date"
              className="modal-form__input"
              value={formData.measuredDate}
              onChange={(e) => setFormData({ ...formData, measuredDate: e.target.value })}
              required
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label">Body Fat (%)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                value={formData.bodyFatPercentage}
                onChange={(e) => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
                min="0"
                max="100"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Muscle Mass (kg)</label>
              <input
                type="number"
                step="0.1"
                className="modal-form__input"
                value={formData.muscleMass}
                onChange={(e) => setFormData({ ...formData, muscleMass: e.target.value })}
                min="0"
              />
            </div>
          </div>

          {/* BMI Preview */}
          {formData.weight && formData.height && (
            <div className="body-metrics__bmi-preview">
              <div className="body-metrics__bmi-preview-item">
                <span className="body-metrics__bmi-preview-label">Calculated BMI:</span>
                <span className="body-metrics__bmi-preview-value">{formData.bmi}</span>
                <span className={`body-metrics__bmi-category body-metrics__bmi-category--${getBMICategory(parseFloat(formData.bmi)).color}`}>
                  {getBMICategory(parseFloat(formData.bmi)).label}
                </span>
              </div>
            </div>
          )}

          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => { setIsEditModalOpen(false); setSelectedMetric(null); resetForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Metric Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedMetric(null); }} title="Body Metric Details">
        {selectedMetric && (
          <div className="body-metrics__view-modal">
            <div className="body-metrics__view-grid">
              <div className="body-metrics__view-item">
                <span className="body-metrics__view-label">Record ID</span>
                <span className="body-metrics__view-value">#{selectedMetric.id}</span>
              </div>
              <div className="body-metrics__view-item">
                <span className="body-metrics__view-label">Member</span>
                <span className="body-metrics__view-value">{selectedMetric.member.fullname} (#{selectedMetric.member.memberId})</span>
              </div>
              <div className="body-metrics__view-item">
                <span className="body-metrics__view-label">Measured Date</span>
                <span className="body-metrics__view-value">{formatDate(selectedMetric.measuredDate)}</span>
              </div>
              <div className="body-metrics__view-item">
                <span className="body-metrics__view-label">Measured By</span>
                <span className="body-metrics__view-value">{selectedMetric.measuredBy?.fullname || '-'}</span>
              </div>
              <div className="body-metrics__view-item">
                <span className="body-metrics__view-label">Weight</span>
                <span className="body-metrics__view-value body-metrics__view-value--highlight">{selectedMetric.weight} kg</span>
              </div>
              <div className="body-metrics__view-item">
                <span className="body-metrics__view-label">Height</span>
                <span className="body-metrics__view-value">{selectedMetric.height} cm</span>
              </div>
              <div className="body-metrics__view-item">
                <span className="body-metrics__view-label">BMI</span>
                <div className="body-metrics__view-bmi">
                  <span className="body-metrics__view-value">{selectedMetric.bmi.toFixed(1)}</span>
                  <span className={`body-metrics__bmi-category body-metrics__bmi-category--${getBMICategory(selectedMetric.bmi).color}`}>
                    {getBMICategory(selectedMetric.bmi).label}
                  </span>
                </div>
              </div>
              <div className="body-metrics__view-item">
                <span className="body-metrics__view-label">Body Fat</span>
                <span className="body-metrics__view-value">{selectedMetric.bodyFatPercentage > 0 ? `${selectedMetric.bodyFatPercentage}%` : '-'}</span>
              </div>
              <div className="body-metrics__view-item">
                <span className="body-metrics__view-label">Muscle Mass</span>
                <span className="body-metrics__view-value">{selectedMetric.muscleMass > 0 ? `${selectedMetric.muscleMass} kg` : '-'}</span>
              </div>
              <div className="body-metrics__view-item">
                <span className="body-metrics__view-label">Created By</span>
                <span className="body-metrics__view-value">{selectedMetric.createdBy || '-'}</span>
              </div>
              <div className="body-metrics__view-item">
                <span className="body-metrics__view-label">Created At</span>
                <span className="body-metrics__view-value">{formatDate(selectedMetric.createdAt)}</span>
              </div>
              {selectedMetric.updatedAt && (
                <div className="body-metrics__view-item">
                  <span className="body-metrics__view-label">Updated At</span>
                  <span className="body-metrics__view-value">{formatDate(selectedMetric.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedMetric(null); }}
        onConfirm={handleDeleteMetric}
        title="Delete Body Metric"
        message={`Are you sure you want to delete this body metric record for ${selectedMetric?.member.fullname}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default BodyMetrics;
