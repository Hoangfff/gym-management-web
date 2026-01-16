import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Power, PowerOff, Eye, Search, Package, DollarSign, TrendingUp } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { ConfirmModal, useToast } from '../../../ui/index.ts';
import { additionalServiceApi } from '../../../../services/index.ts';
import type { ApiAdditionalService, ReqCreateAdditionalServiceDTO, ReqUpdateAdditionalServiceDTO } from '../../../../types/api.ts';
import './AdditionalServices.css';

interface AdditionalServicesProps {
  userRole?: 'admin' | 'pt';
}

// Helper functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const calculateProfit = (costPrice: number, sellPrice: number): number => {
  return sellPrice - costPrice;
};

const calculateProfitMargin = (costPrice: number, sellPrice: number): number => {
  if (sellPrice === 0) return 0;
  return ((sellPrice - costPrice) / sellPrice) * 100;
};

function AdditionalServices({ userRole }: AdditionalServicesProps) {
  void userRole; // Reserved for role-based features
  const { showToast } = useToast();

  // Data state
  const [services, setServices] = useState<ApiAdditionalService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ApiAdditionalService | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    costPrice: '',
    suggestSellPrice: ''
  });

  // Fetch data on mount
  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await additionalServiceApi.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải danh sách dịch vụ'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stats
  const totalServices = services.length;
  const activeServices = services.filter(s => s.isActive).length;
  const avgProfit = services.length > 0 
    ? services.reduce((sum, s) => sum + calculateProfit(s.costPrice, s.suggestSellPrice), 0) / services.length 
    : 0;
  const totalPotentialRevenue = services.filter(s => s.isActive).reduce((sum, s) => sum + s.suggestSellPrice, 0);

  // Filtered services
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && service.isActive) ||
      (filterStatus === 'inactive' && !service.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleAddService = async () => {
    if (!formData.name || !formData.costPrice || !formData.suggestSellPrice) {
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ReqCreateAdditionalServiceDTO = {
        name: formData.name,
        description: formData.description || undefined,
        costPrice: parseFloat(formData.costPrice),
        suggestSellPrice: parseFloat(formData.suggestSellPrice)
      };

      await additionalServiceApi.create(requestData);

      showToast({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm dịch vụ mới'
      });

      setIsAddModalOpen(false);
      resetForm();
      fetchServices();
    } catch (error: unknown) {
      console.error('Failed to create service:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể thêm dịch vụ'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      const requestData: ReqUpdateAdditionalServiceDTO = {
        name: formData.name || undefined,
        description: formData.description || undefined,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        suggestSellPrice: formData.suggestSellPrice ? parseFloat(formData.suggestSellPrice) : undefined
      };

      await additionalServiceApi.update(selectedService.id, requestData);

      showToast({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật dịch vụ'
      });

      setIsEditModalOpen(false);
      setSelectedService(null);
      resetForm();
      fetchServices();
    } catch (error: unknown) {
      console.error('Failed to update service:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể cập nhật dịch vụ'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      await additionalServiceApi.delete(selectedService.id);

      showToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã xóa dịch vụ ${selectedService.name}`
      });

      setIsDeleteModalOpen(false);
      setSelectedService(null);
      fetchServices();
    } catch (error: unknown) {
      console.error('Failed to delete service:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể xóa dịch vụ'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateService = async (service: ApiAdditionalService) => {
    try {
      await additionalServiceApi.activate(service.id);
      showToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã kích hoạt dịch vụ ${service.name}`
      });
      fetchServices();
    } catch (error: unknown) {
      console.error('Failed to activate service:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể kích hoạt dịch vụ'
      });
    }
  };

  const handleDeactivateService = async (service: ApiAdditionalService) => {
    try {
      await additionalServiceApi.deactivate(service.id);
      showToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã vô hiệu hóa dịch vụ ${service.name}`
      });
      fetchServices();
    } catch (error: unknown) {
      console.error('Failed to deactivate service:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể vô hiệu hóa dịch vụ'
      });
    }
  };

  const handleViewService = (service: ApiAdditionalService) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  const openEditModal = (service: ApiAdditionalService) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      costPrice: service.costPrice.toString(),
      suggestSellPrice: service.suggestSellPrice.toString()
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (service: ApiAdditionalService) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      costPrice: '',
      suggestSellPrice: ''
    });
  };

  // Calculate preview profit
  const previewProfit = formData.costPrice && formData.suggestSellPrice
    ? calculateProfit(parseFloat(formData.costPrice), parseFloat(formData.suggestSellPrice))
    : 0;
  const previewMargin = formData.costPrice && formData.suggestSellPrice
    ? calculateProfitMargin(parseFloat(formData.costPrice), parseFloat(formData.suggestSellPrice))
    : 0;

  return (
    <div className="additional-services">
      <div className="additional-services__header">
        <div>
          <h1 className="additional-services__title">Additional Services</h1>
          <p className="additional-services__subtitle">Manage extra services and products for members</p>
        </div>
        <div className="additional-services__header-actions">
          <button
            className="additional-services__refresh-btn"
            onClick={fetchServices}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          <button className="additional-services__create-btn" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} />
            Add Service
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="additional-services__stats">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--blue">
            <Package size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Total Services</span>
            <span className="stat-card__value">{totalServices}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--green">
            <Power size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Active Services</span>
            <span className="stat-card__value">{activeServices}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--purple">
            <TrendingUp size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Avg. Profit/Service</span>
            <span className="stat-card__value">{formatCurrency(avgProfit)}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--yellow">
            <DollarSign size={24} />
          </div>
          <div className="stat-card__content">
            <span className="stat-card__label">Total Active Value</span>
            <span className="stat-card__value">{formatCurrency(totalPotentialRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="additional-services__filters">
        <div className="additional-services__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="additional-services__filter-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="additional-services__table-container">
        {isLoading ? (
          <div className="additional-services__loading">
            <RefreshCw size={32} className="spinning" />
            <p>Loading services...</p>
          </div>
        ) : (
          <table className="additional-services__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SERVICE NAME</th>
                <th>COST PRICE</th>
                <th>SELL PRICE</th>
                <th>PROFIT</th>
                <th>MARGIN</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="additional-services__empty">
                    No services found
                  </td>
                </tr>
              ) : (
                filteredServices.map(service => {
                  const profit = calculateProfit(service.costPrice, service.suggestSellPrice);
                  const margin = calculateProfitMargin(service.costPrice, service.suggestSellPrice);
                  return (
                    <tr key={service.id} className={!service.isActive ? 'additional-services__row--inactive' : ''}>
                      <td>#{service.id}</td>
                      <td className="additional-services__name">
                        <div className="additional-services__name-cell">
                          <span className="additional-services__name-text">{service.name}</span>
                          {service.description && (
                            <span className="additional-services__description">{service.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="additional-services__price additional-services__price--cost">
                        {formatCurrency(service.costPrice)}
                      </td>
                      <td className="additional-services__price additional-services__price--sell">
                        {formatCurrency(service.suggestSellPrice)}
                      </td>
                      <td className={`additional-services__profit ${profit >= 0 ? 'additional-services__profit--positive' : 'additional-services__profit--negative'}`}>
                        {formatCurrency(profit)}
                      </td>
                      <td className={`additional-services__margin ${margin >= 20 ? 'additional-services__margin--good' : 'additional-services__margin--low'}`}>
                        {margin.toFixed(1)}%
                      </td>
                      <td>
                        <span className={`additional-services__status additional-services__status--${service.isActive ? 'active' : 'inactive'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="additional-services__actions">
                          <button
                            className="additional-services__action-btn"
                            onClick={() => handleViewService(service)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="additional-services__action-btn"
                            onClick={() => openEditModal(service)}
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          {service.isActive ? (
                            <button
                              className="additional-services__action-btn additional-services__action-btn--deactivate"
                              onClick={() => handleDeactivateService(service)}
                              title="Deactivate"
                            >
                              <PowerOff size={16} />
                            </button>
                          ) : (
                            <button
                              className="additional-services__action-btn additional-services__action-btn--activate"
                              onClick={() => handleActivateService(service)}
                              title="Activate"
                            >
                              <Power size={16} />
                            </button>
                          )}
                          <button
                            className="additional-services__action-btn additional-services__action-btn--delete"
                            onClick={() => openDeleteModal(service)}
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

      {/* Add Service Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetForm(); }} title="Add New Service">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleAddService(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Service Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g., Protein Shake, Towel Rental"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Description</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Service description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Cost Price (VND)</label>
              <input
                type="number"
                className="modal-form__input"
                placeholder="e.g., 20000"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Suggested Sell Price (VND)</label>
              <input
                type="number"
                className="modal-form__input"
                placeholder="e.g., 35000"
                value={formData.suggestSellPrice}
                onChange={(e) => setFormData({ ...formData, suggestSellPrice: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          {/* Profit Preview */}
          {formData.costPrice && formData.suggestSellPrice && (
            <div className="additional-services__profit-preview">
              <div className="additional-services__profit-preview-item">
                <span className="additional-services__profit-preview-label">Profit:</span>
                <span className={`additional-services__profit-preview-value ${previewProfit >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(previewProfit)}
                </span>
              </div>
              <div className="additional-services__profit-preview-item">
                <span className="additional-services__profit-preview-label">Margin:</span>
                <span className={`additional-services__profit-preview-value ${previewMargin >= 20 ? 'good' : 'low'}`}>
                  {previewMargin.toFixed(1)}%
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
              {isSubmitting ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Service Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedService(null); resetForm(); }} title="Edit Service">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleUpdateService(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Service Name</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Description</label>
            <textarea
              className="modal-form__textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Cost Price (VND)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Suggested Sell Price (VND)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.suggestSellPrice}
                onChange={(e) => setFormData({ ...formData, suggestSellPrice: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          {/* Profit Preview */}
          {formData.costPrice && formData.suggestSellPrice && (
            <div className="additional-services__profit-preview">
              <div className="additional-services__profit-preview-item">
                <span className="additional-services__profit-preview-label">Profit:</span>
                <span className={`additional-services__profit-preview-value ${previewProfit >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(previewProfit)}
                </span>
              </div>
              <div className="additional-services__profit-preview-item">
                <span className="additional-services__profit-preview-label">Margin:</span>
                <span className={`additional-services__profit-preview-value ${previewMargin >= 20 ? 'good' : 'low'}`}>
                  {previewMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => { setIsEditModalOpen(false); setSelectedService(null); resetForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Service'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Service Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedService(null); }} title="Service Details">
        {selectedService && (
          <div className="additional-services__view-modal">
            <div className="additional-services__view-grid">
              <div className="additional-services__view-item">
                <span className="additional-services__view-label">ID</span>
                <span className="additional-services__view-value">#{selectedService.id}</span>
              </div>
              <div className="additional-services__view-item">
                <span className="additional-services__view-label">Service Name</span>
                <span className="additional-services__view-value">{selectedService.name}</span>
              </div>
              <div className="additional-services__view-item additional-services__view-item--full">
                <span className="additional-services__view-label">Description</span>
                <span className="additional-services__view-value">{selectedService.description || '-'}</span>
              </div>
              <div className="additional-services__view-item">
                <span className="additional-services__view-label">Cost Price</span>
                <span className="additional-services__view-value additional-services__view-value--cost">
                  {formatCurrency(selectedService.costPrice)}
                </span>
              </div>
              <div className="additional-services__view-item">
                <span className="additional-services__view-label">Suggested Sell Price</span>
                <span className="additional-services__view-value additional-services__view-value--sell">
                  {formatCurrency(selectedService.suggestSellPrice)}
                </span>
              </div>
              <div className="additional-services__view-item">
                <span className="additional-services__view-label">Profit</span>
                <span className={`additional-services__view-value ${calculateProfit(selectedService.costPrice, selectedService.suggestSellPrice) >= 0 ? 'additional-services__view-value--positive' : 'additional-services__view-value--negative'}`}>
                  {formatCurrency(calculateProfit(selectedService.costPrice, selectedService.suggestSellPrice))}
                </span>
              </div>
              <div className="additional-services__view-item">
                <span className="additional-services__view-label">Profit Margin</span>
                <span className="additional-services__view-value">
                  {calculateProfitMargin(selectedService.costPrice, selectedService.suggestSellPrice).toFixed(1)}%
                </span>
              </div>
              <div className="additional-services__view-item">
                <span className="additional-services__view-label">Status</span>
                <span className={`additional-services__status additional-services__status--${selectedService.isActive ? 'active' : 'inactive'}`}>
                  {selectedService.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="additional-services__view-item">
                <span className="additional-services__view-label">Created By</span>
                <span className="additional-services__view-value">{selectedService.createdBy || '-'}</span>
              </div>
              <div className="additional-services__view-item">
                <span className="additional-services__view-label">Created At</span>
                <span className="additional-services__view-value">{formatDate(selectedService.createdAt)}</span>
              </div>
              {selectedService.updatedAt && (
                <div className="additional-services__view-item">
                  <span className="additional-services__view-label">Updated At</span>
                  <span className="additional-services__view-value">{formatDate(selectedService.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedService(null); }}
        onConfirm={handleDeleteService}
        title="Delete Service"
        message={`Are you sure you want to delete "${selectedService?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default AdditionalServices;
