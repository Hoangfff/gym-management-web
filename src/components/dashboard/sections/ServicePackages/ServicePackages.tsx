import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Power, PowerOff, Eye, Search } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { ConfirmModal, useToast } from '../../../ui/index.ts';
import { packageApi } from '../../../../services/index.ts';
import type { ApiServicePackage, ReqCreatePackageDTO, ReqUpdatePackageDTO, PackageTypeEnum } from '../../../../types/api.ts';
import { PackageType } from '../../../../types/api.ts';
import './ServicePackages.css';

interface ServicePackagesProps {
  userRole: 'admin' | 'pt';
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

const getPackageTypeLabel = (type: PackageTypeEnum): string => {
  switch (type) {
    case PackageType.PT_INCLUDED:
      return 'PT Included';
    case PackageType.NO_PT:
      return 'No PT';
    default:
      return type;
  }
};

function ServicePackages({ userRole }: ServicePackagesProps) {
  void userRole; // Reserved for future role-based features
  const { showToast } = useToast();

  // Data state
  const [packages, setPackages] = useState<ApiServicePackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ApiServicePackage | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ApiServicePackage | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    price: '',
    durationInDays: '',
    type: PackageType.NO_PT as PackageTypeEnum,
    numberOfSessions: '',
    isActive: true
  });

  // Fetch packages on mount
  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await packageApi.getAll();
      setPackages(response.data);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load service packages'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search packages
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPackages();
      return;
    }

    setIsLoading(true);
    try {
      const response = await packageApi.searchByName(searchQuery.trim());
      setPackages(response.data);
    } catch (error) {
      console.error('Failed to search packages:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to search service packages'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter packages by type
  const handleFilterByType = async (typeValue: string) => {
    setFilterType(typeValue);
    if (typeValue === 'all') {
      fetchPackages();
      return;
    }

    setIsLoading(true);
    try {
      const response = await packageApi.getByType(typeValue as PackageTypeEnum);
      setPackages(response.data);
    } catch (error) {
      console.error('Failed to filter packages:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to filter service packages'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stats
  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p.isActive).length;
  const ptPackages = packages.filter(p => p.type === PackageType.PT_INCLUDED).length;
  const totalRevenue = packages.reduce((sum, p) => sum + p.price, 0);

  // Filtered packages for display
  const filteredPackages = packages.filter(pkg => {
    if (filterStatus === 'active' && !pkg.isActive) return false;
    if (filterStatus === 'inactive' && pkg.isActive) return false;
    return true;
  });

  const handleAddPackage = async () => {
    if (!formData.packageName || !formData.price || !formData.durationInDays || !formData.type) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ReqCreatePackageDTO = {
        packageName: formData.packageName,
        description: formData.description,
        price: parseFloat(formData.price),
        durationInDays: parseInt(formData.durationInDays),
        type: formData.type,
        numberOfSessions: formData.numberOfSessions ? parseInt(formData.numberOfSessions) : 0,
        isActive: formData.isActive
      };

      await packageApi.create(requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Added new service package'
      });

      setIsAddModalOpen(false);
      resetForm();
      fetchPackages();
    } catch (error: unknown) {
      console.error('Failed to create package:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to add service package'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPackage = async () => {
    if (!editingPackage) return;

    setIsSubmitting(true);
    try {
      const requestData: ReqUpdatePackageDTO = {
        packageName: formData.packageName,
        description: formData.description,
        price: parseFloat(formData.price),
        durationInDays: parseInt(formData.durationInDays),
        type: formData.type,
        numberOfSessions: formData.numberOfSessions ? parseInt(formData.numberOfSessions) : 0,
        isActive: formData.isActive
      };

      await packageApi.update(editingPackage.id, requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Updated service package'
      });

      setIsEditModalOpen(false);
      setEditingPackage(null);
      resetForm();
      fetchPackages();
    } catch (error: unknown) {
      console.error('Failed to update package:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to update service package'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePackage = async () => {
    if (!selectedPackage) return;

    setIsSubmitting(true);
    try {
      await packageApi.delete(selectedPackage.id);

      showToast({
        type: 'success',
        title: 'Success',
        message: `Deleted service package ${selectedPackage.packageName}`
      });

      setIsDeleteModalOpen(false);
      setSelectedPackage(null);
      fetchPackages();
    } catch (error: unknown) {
      console.error('Failed to delete package:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to delete service package'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivatePackage = async (pkg: ApiServicePackage) => {
    try {
      await packageApi.activate(pkg.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: `Activated package ${pkg.packageName}`
      });
      fetchPackages();
    } catch (error: unknown) {
      console.error('Failed to activate package:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to activate service package'
      });
    }
  };

  const handleDeactivatePackage = async (pkg: ApiServicePackage) => {
    try {
      await packageApi.deactivate(pkg.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: `Deactivated package ${pkg.packageName}`
      });
      fetchPackages();
    } catch (error: unknown) {
      console.error('Failed to deactivate package:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to deactivate service package'
      });
    }
  };

  const handleViewPackage = async (pkg: ApiServicePackage) => {
    try {
      const response = await packageApi.getById(pkg.id);
      setSelectedPackage(response.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch package details:', error);
      setSelectedPackage(pkg);
      setIsViewModalOpen(true);
    }
  };

  const openEditModal = (pkg: ApiServicePackage) => {
    setEditingPackage(pkg);
    setFormData({
      packageName: pkg.packageName,
      description: pkg.description || '',
      price: pkg.price.toString(),
      durationInDays: pkg.durationInDays.toString(),
      type: pkg.type,
      numberOfSessions: pkg.numberOfSessions?.toString() || '',
      isActive: pkg.isActive
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (pkg: ApiServicePackage) => {
    setSelectedPackage(pkg);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      packageName: '',
      description: '',
      price: '',
      durationInDays: '',
      type: PackageType.NO_PT,
      numberOfSessions: '',
      isActive: true
    });
  };

  return (
    <div className="service-packages">
      <div className="service-packages__header">
        <div>
          <h1 className="service-packages__title">Service Packages</h1>
          <p className="service-packages__subtitle">Manage gym membership packages and services</p>
        </div>
        <div className="service-packages__header-actions">
          <button
            className="service-packages__refresh-btn"
            onClick={fetchPackages}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          <button className="service-packages__create-btn" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} />
            Add Package
          </button>
        </div>
      </div>

      <div className="service-packages__stats">
        <div className="stat-box">
          <span className="stat-box__label">Total Packages</span>
          <span className="stat-box__value">{totalPackages}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Active Packages</span>
          <span className="stat-box__value">{activePackages}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">PT Packages</span>
          <span className="stat-box__value">{ptPackages}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Total Value</span>
          <span className="stat-box__value">{formatCurrency(totalRevenue)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="service-packages__filters">
        <div className="service-packages__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search packages by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="service-packages__filter-group">
          <select
            value={filterType}
            onChange={(e) => handleFilterByType(e.target.value)}
            className="service-packages__filter-select"
          >
            <option value="all">All Types</option>
            <option value={PackageType.PT_INCLUDED}>PT Included</option>
            <option value={PackageType.NO_PT}>No PT</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="service-packages__filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="service-packages__table-container">
        {isLoading ? (
          <div className="service-packages__loading">
            <RefreshCw size={32} className="spinning" />
            <p>Loading packages...</p>
          </div>
        ) : (
          <table className="service-packages__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>PACKAGE NAME</th>
                <th>TYPE</th>
                <th>DURATION</th>
                <th>SESSIONS</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="service-packages__empty">
                    No packages found
                  </td>
                </tr>
              ) : (
                filteredPackages.map(pkg => (
                  <tr key={pkg.id} className={!pkg.isActive ? 'service-packages__row--inactive' : ''}>
                    <td>#{pkg.id}</td>
                    <td className="service-packages__name">
                      <div className="service-packages__name-cell">
                        <span className="service-packages__name-text">{pkg.packageName}</span>
                        {pkg.description && (
                          <span className="service-packages__description">{pkg.description}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`service-packages__type service-packages__type--${pkg.type.toLowerCase().replace('_', '-')}`}>
                        {getPackageTypeLabel(pkg.type)}
                      </span>
                    </td>
                    <td>{pkg.durationInDays} days</td>
                    <td>
                      {pkg.numberOfSessions ? (
                        <span className="service-packages__sessions">{pkg.numberOfSessions}</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="service-packages__price">{formatCurrency(pkg.price)}</td>
                    <td>
                      <span className={`service-packages__status service-packages__status--${pkg.isActive ? 'active' : 'inactive'}`}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="service-packages__actions">
                        <button
                          className="service-packages__action-btn"
                          onClick={() => handleViewPackage(pkg)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="service-packages__action-btn"
                          onClick={() => openEditModal(pkg)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        {pkg.isActive ? (
                          <button
                            className="service-packages__action-btn service-packages__action-btn--deactivate"
                            onClick={() => handleDeactivatePackage(pkg)}
                            title="Deactivate"
                          >
                            <PowerOff size={16} />
                          </button>
                        ) : (
                          <button
                            className="service-packages__action-btn service-packages__action-btn--activate"
                            onClick={() => handleActivatePackage(pkg)}
                            title="Activate"
                          >
                            <Power size={16} />
                          </button>
                        )}
                        <button
                          className="service-packages__action-btn service-packages__action-btn--delete"
                          onClick={() => openDeleteModal(pkg)}
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

      {/* Add Package Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetForm(); }} title="Add New Package">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleAddPackage(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Package Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g., Premium Monthly"
              value={formData.packageName}
              onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
              required
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Description</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Package description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Price (VND)</label>
              <input
                type="number"
                className="modal-form__input"
                placeholder="e.g., 500000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Duration (days)</label>
              <input
                type="number"
                className="modal-form__input"
                placeholder="e.g., 30"
                value={formData.durationInDays}
                onChange={(e) => setFormData({ ...formData, durationInDays: e.target.value })}
                required
                min="1"
              />
            </div>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Package Type</label>
              <select
                className="modal-form__select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as PackageTypeEnum })}
                required
              >
                <option value={PackageType.NO_PT}>No PT</option>
                <option value={PackageType.PT_INCLUDED}>PT Included</option>
              </select>
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Number of Sessions</label>
              <input
                type="number"
                className="modal-form__input"
                placeholder="e.g., 12"
                value={formData.numberOfSessions}
                onChange={(e) => setFormData({ ...formData, numberOfSessions: e.target.value })}
                min="0"
              />
            </div>
          </div>

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
              {isSubmitting ? 'Adding...' : 'Add Package'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Package Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingPackage(null); resetForm(); }} title="Edit Package">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleEditPackage(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Package Name</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.packageName}
              onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
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
              <label className="modal-form__label modal-form__label--required">Price (VND)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Duration (days)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.durationInDays}
                onChange={(e) => setFormData({ ...formData, durationInDays: e.target.value })}
                required
                min="1"
              />
            </div>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Package Type</label>
              <select
                className="modal-form__select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as PackageTypeEnum })}
                required
              >
                <option value={PackageType.NO_PT}>No PT</option>
                <option value={PackageType.PT_INCLUDED}>PT Included</option>
              </select>
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Number of Sessions</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.numberOfSessions}
                onChange={(e) => setFormData({ ...formData, numberOfSessions: e.target.value })}
                min="0"
              />
            </div>
          </div>

          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => { setIsEditModalOpen(false); setEditingPackage(null); resetForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Package'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Package Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedPackage(null); }} title="Package Details">
        {selectedPackage && (
          <div className="service-packages__view-modal">
            <div className="service-packages__view-grid">
              <div className="service-packages__view-item">
                <span className="service-packages__view-label">ID</span>
                <span className="service-packages__view-value">#{selectedPackage.id}</span>
              </div>
              <div className="service-packages__view-item">
                <span className="service-packages__view-label">Package Name</span>
                <span className="service-packages__view-value">{selectedPackage.packageName}</span>
              </div>
              <div className="service-packages__view-item service-packages__view-item--full">
                <span className="service-packages__view-label">Description</span>
                <span className="service-packages__view-value">{selectedPackage.description || '-'}</span>
              </div>
              <div className="service-packages__view-item">
                <span className="service-packages__view-label">Price</span>
                <span className="service-packages__view-value service-packages__view-value--price">
                  {formatCurrency(selectedPackage.price)}
                </span>
              </div>
              <div className="service-packages__view-item">
                <span className="service-packages__view-label">Duration</span>
                <span className="service-packages__view-value">{selectedPackage.durationInDays} days</span>
              </div>
              <div className="service-packages__view-item">
                <span className="service-packages__view-label">Package Type</span>
                <span className={`service-packages__type service-packages__type--${selectedPackage.type.toLowerCase().replace('_', '-')}`}>
                  {getPackageTypeLabel(selectedPackage.type)}
                </span>
              </div>
              <div className="service-packages__view-item">
                <span className="service-packages__view-label">Number of Sessions</span>
                <span className="service-packages__view-value">{selectedPackage.numberOfSessions || '-'}</span>
              </div>
              <div className="service-packages__view-item">
                <span className="service-packages__view-label">Status</span>
                <span className={`service-packages__status service-packages__status--${selectedPackage.isActive ? 'active' : 'inactive'}`}>
                  {selectedPackage.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="service-packages__view-item">
                <span className="service-packages__view-label">Created By</span>
                <span className="service-packages__view-value">{selectedPackage.createdBy || '-'}</span>
              </div>
              <div className="service-packages__view-item">
                <span className="service-packages__view-label">Created At</span>
                <span className="service-packages__view-value">{formatDate(selectedPackage.createdAt)}</span>
              </div>
              {selectedPackage.updatedAt && (
                <div className="service-packages__view-item">
                  <span className="service-packages__view-label">Updated At</span>
                  <span className="service-packages__view-value">{formatDate(selectedPackage.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedPackage(null); }}
        onConfirm={handleDeletePackage}
        title="Delete Package"
        message={`Are you sure you want to delete "${selectedPackage?.packageName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default ServicePackages;
