import { useState, useEffect } from 'react';
import { Pencil, Trash2, Search, Eye, RefreshCw, Package, Calendar, Wrench, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { ConfirmModal, useToast } from '../../../ui/index.ts';
import { workoutDeviceApi } from '../../../../services/index.ts';
import type { 
  ApiWorkoutDevice, 
  ReqCreateWorkoutDeviceDTO, 
  ReqUpdateWorkoutDeviceDTO 
} from '../../../../types/api.ts';
import './Inventory.css';

// Device type options (API uses string values)
const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'Cardio', label: 'Cardio' },
  { value: 'Strength', label: 'Strength' },
  { value: 'Free Weights', label: 'Free Weights' },
  { value: 'Functional', label: 'Functional' },
  { value: 'Accessories', label: 'Accessories' }
];

// Helper functions
const getTypeBadge = (type: string) => {
  const config: Record<string, { label: string; className: string }> = {
    'Cardio': { label: 'Cardio', className: 'inventory__type--cardio' },
    'Strength': { label: 'Strength', className: 'inventory__type--strength' },
    'Free Weights': { label: 'Free Weights', className: 'inventory__type--freeweights' },
    'Functional': { label: 'Functional', className: 'inventory__type--functional' },
    'Accessories': { label: 'Accessories', className: 'inventory__type--accessories' }
  };
  return config[type] || { label: type, className: '' };
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const isMaintenanceDue = (maintenanceDate: string | null): boolean => {
  if (!maintenanceDate) return false;
  const today = new Date();
  const mDate = new Date(maintenanceDate);
  return mDate <= today;
};

const isMaintenanceSoon = (maintenanceDate: string | null): boolean => {
  if (!maintenanceDate) return false;
  const today = new Date();
  const mDate = new Date(maintenanceDate);
  const diffDays = Math.ceil((mDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 7;
};

function Inventory() {
  const { showToast } = useToast();
  
  // Data state
  const [devices, setDevices] = useState<ApiWorkoutDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<ApiWorkoutDevice | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    quantity: 1,
    price: 0,
    description: '',
    dateImported: '',
    dateMaintenance: '',
    imageUrl: ''
  });

  // Fetch devices on mount and page change
  useEffect(() => {
    fetchDevices(currentPage);
  }, [currentPage]);

  const fetchDevices = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await workoutDeviceApi.getAll(page, pageSize);
      // Handle paginated response: data contains { meta, result }
      const paginatedData = response.data as { meta?: { totalPages: number; totalItems: number }; result?: ApiWorkoutDevice[] };
      setDevices(paginatedData.result || []);
      setTotalPages(paginatedData.meta?.totalPages || 1);
      setTotalItems(paginatedData.meta?.totalItems || 0);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load equipment list'
      });
      setDevices([]);
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

  // Filter and sort devices
  const getFilteredDevices = () => {
    let filtered = [...devices];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(term) ||
        d.type.toLowerCase().includes(term) ||
        d.id.toString().includes(term)
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(d => d.type === typeFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredDevices = getFilteredDevices();

  // Stats
  const stats = {
    totalValue: devices.reduce((sum, d) => sum + d.price, 0),
    totalDevices: devices.length,
    maintenanceDue: devices.filter(d => isMaintenanceDue(d.dateMaintenance)).length,
    maintenanceSoon: devices.filter(d => isMaintenanceSoon(d.dateMaintenance)).length
  };

  const handleView = (device: ApiWorkoutDevice) => {
    setSelectedDevice(device);
    setShowViewModal(true);
  };

  const handleEdit = (device: ApiWorkoutDevice) => {
    setSelectedDevice(device);
    setFormData({
      name: device.name,
      type: device.type,
      quantity: 1, // Not used by API but kept for form state
      price: device.price || 0,
      description: '', // Not in API
      dateImported: device.dateImported,
      dateMaintenance: device.dateMaintenance || '',
      imageUrl: device.imageUrl || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (device: ApiWorkoutDevice) => {
    setSelectedDevice(device);
    setShowDeleteModal(true);
  };

  const handleAddDevice = async () => {
    if (!formData.name || !formData.type || formData.quantity <= 0 || !formData.dateImported) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ReqCreateWorkoutDeviceDTO = {
        name: formData.name,
        type: formData.type,
        price: formData.price || 0,
        dateImported: formData.dateImported,
        dateMaintenance: formData.dateMaintenance || undefined,
        imageUrl: formData.imageUrl || undefined
      };

      await workoutDeviceApi.create(requestData);
      
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Added new equipment'
      });

      setShowAddModal(false);
      resetForm();
      fetchDevices(currentPage);
    } catch (error: unknown) {
      console.error('Failed to create device:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to add equipment'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDevice = async () => {
    if (!selectedDevice) return;

    setIsSubmitting(true);
    try {
      const requestData: ReqUpdateWorkoutDeviceDTO = {
        name: formData.name,
        type: formData.type,
        price: formData.price || undefined,
        dateMaintenance: formData.dateMaintenance || undefined,
        imageUrl: formData.imageUrl || undefined
      };

      await workoutDeviceApi.update(selectedDevice.id, requestData);
      
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Updated equipment'
      });

      setShowEditModal(false);
      resetForm();
      fetchDevices(currentPage);
    } catch (error: unknown) {
      console.error('Failed to update device:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to update equipment'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!selectedDevice) return;

    setIsSubmitting(true);
    try {
      await workoutDeviceApi.delete(selectedDevice.id);
      
      showToast({
        type: 'success',
        title: 'Success',
        message: `Deleted equipment "${selectedDevice.name}"`
      });

      setShowDeleteModal(false);
      setSelectedDevice(null);
      fetchDevices(currentPage);
    } catch (error: unknown) {
      console.error('Failed to delete device:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to delete equipment'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      quantity: 1,
      price: 0,
      description: '',
      dateImported: '',
      dateMaintenance: '',
      imageUrl: ''
    });
    setSelectedDevice(null);
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
    <div className="inventory">
      <div className="inventory__header">
        <div>
          <h1 className="inventory__title">Inventory</h1>
          <p className="inventory__subtitle">Manage gym equipment and devices</p>
        </div>
        <div className="inventory__header-actions">
          <button 
            className="inventory__refresh-btn" 
            onClick={() => fetchDevices(currentPage)}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          <button className="inventory__add-btn" onClick={() => setShowAddModal(true)}>
            + Add Equipment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="inventory__stats">
        <div className="inventory__stat">
          <span className="inventory__stat-label">Total Value</span>
          <span className="inventory__stat-value">{formatCurrency(stats.totalValue)}</span>
        </div>
        <div className="inventory__stat">
          <span className="inventory__stat-label">Device Types</span>
          <span className="inventory__stat-value">{stats.totalDevices}</span>
        </div>
        <div className="inventory__stat">
          <span className="inventory__stat-label">Maintenance Due</span>
          <span className="inventory__stat-value inventory__stat-value--red">{stats.maintenanceDue}</span>
        </div>
        <div className="inventory__stat">
          <span className="inventory__stat-label">Due Soon (7 days)</span>
          <span className="inventory__stat-value inventory__stat-value--yellow">{stats.maintenanceSoon}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="inventory__filters">
        <div className="inventory__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search equipment by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="inventory__filter-group">
          <div className="inventory__select-wrapper">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
          <div className="inventory__select-wrapper">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name A-Z</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="inventory__loading">
          <RefreshCw size={32} className="spinning" />
          <p>Loading equipment...</p>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="inventory__empty">
          <Package size={48} />
          <h3>No equipment found</h3>
          <p>Try adjusting your filters or add new equipment.</p>
        </div>
      ) : (
        <>
        {/* Inventory Grid */}
        <div className="inventory__grid">
          {filteredDevices.map((device) => {
            const typeBadge = getTypeBadge(device.type);
            const maintenanceDue = isMaintenanceDue(device.dateMaintenance);
            const maintenanceSoon = isMaintenanceSoon(device.dateMaintenance);
            
            return (
              <div key={device.id} className={`inventory__card ${maintenanceDue ? 'inventory__card--maintenance-due' : ''}`}>
                <div className="inventory__card-image">
                  <img 
                    src={device.imageUrl || '/images/placeholder.jpg'} 
                    alt={device.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                  <span className={`inventory__type-badge ${typeBadge.className}`}>
                    {typeBadge.label}
                  </span>
                </div>
                
                <div className="inventory__card-body">
                  <div className="inventory__card-header">
                    <div>
                      <h3 className="inventory__card-name">{device.name}</h3>
                      <p className="inventory__card-id">ID: #{device.id}</p>
                    </div>
                    <div className="inventory__card-actions">
                      <button onClick={() => handleView(device)} title="View Details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEdit(device)} title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button className="inventory__card-action--delete" onClick={() => handleDeleteClick(device)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="inventory__card-desc">{formatCurrency(device.price)}</p>

                  <div className="inventory__card-info">
                    <div className="inventory__card-info-item">
                      <Calendar size={14} />
                      <span>Import: {formatDate(device.dateImported)}</span>
                    </div>
                  </div>

                  {device.dateMaintenance && (
                    <div className={`inventory__card-maintenance ${maintenanceDue ? 'inventory__card-maintenance--due' : maintenanceSoon ? 'inventory__card-maintenance--soon' : ''}`}>
                      <Wrench size={14} />
                      <span>
                        Maintenance: {formatDate(device.dateMaintenance)}
                        {maintenanceDue && ' (OVERDUE)'}
                        {maintenanceSoon && ' (Soon)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="inventory__pagination">
            <button 
              className="inventory__pagination-btn"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <span className="inventory__pagination-info">
              Page {currentPage} of {totalPages} ({totalItems} items)
            </span>
            <button 
              className="inventory__pagination-btn"
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

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add New Equipment"
        size="md"
        footer={renderFooter(
          () => { setShowAddModal(false); resetForm(); },
          handleAddDevice,
          'Add Equipment'
        )}
      >
        <div className="modal-form">
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Equipment Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g., Treadmill Pro X500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Type</label>
              <select
                className="modal-form__select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">Select Type</option>
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Price (VND)</label>
              <input
                type="number"
                className="modal-form__input"
                min={0}
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Import Date</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.dateImported}
                onChange={(e) => setFormData({ ...formData, dateImported: e.target.value })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Maintenance Date</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.dateMaintenance}
                onChange={(e) => setFormData({ ...formData, dateMaintenance: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Image URL</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit Equipment"
        size="md"
        footer={renderFooter(
          () => { setShowEditModal(false); resetForm(); },
          handleUpdateDevice,
          'Update Equipment'
        )}
      >
        <div className="modal-form">
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Equipment Name</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Type</label>
              <select
                className="modal-form__select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="">Select Type</option>
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Price (VND)</label>
              <input
                type="number"
                className="modal-form__input"
                min={0}
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label">Import Date</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.dateImported}
                onChange={(e) => setFormData({ ...formData, dateImported: e.target.value })}
                disabled
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Maintenance Date</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.dateMaintenance}
                onChange={(e) => setFormData({ ...formData, dateMaintenance: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Image URL</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedDevice(null); }}
        title="Equipment Details"
        size="md"
      >
        {selectedDevice && (
          <div className="inventory__view-modal">
            <div className="inventory__view-image">
              <img 
                src={selectedDevice.imageUrl || '/images/placeholder.jpg'} 
                alt={selectedDevice.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                }}
              />
            </div>

            <div className="inventory__view-header">
              <h3>{selectedDevice.name}</h3>
              <span className={`inventory__type-badge ${getTypeBadge(selectedDevice.type).className}`}>
                {getTypeBadge(selectedDevice.type).label}
              </span>
            </div>

            <div className="inventory__view-grid">
              <div className="inventory__view-item">
                <span className="inventory__view-label">ID</span>
                <span className="inventory__view-value">#{selectedDevice.id}</span>
              </div>
              <div className="inventory__view-item">
                <span className="inventory__view-label">Price</span>
                <span className="inventory__view-value">{formatCurrency(selectedDevice.price)}</span>
              </div>
              <div className="inventory__view-item">
                <span className="inventory__view-label">Import Date</span>
                <span className="inventory__view-value">{formatDate(selectedDevice.dateImported)}</span>
              </div>
              <div className="inventory__view-item">
                <span className="inventory__view-label">Maintenance Date</span>
                <span className={`inventory__view-value ${isMaintenanceDue(selectedDevice.dateMaintenance) ? 'inventory__view-value--red' : ''}`}>
                  {formatDate(selectedDevice.dateMaintenance)}
                  {isMaintenanceDue(selectedDevice.dateMaintenance) && ' (OVERDUE)'}
                </span>
              </div>
              <div className="inventory__view-item">
                <span className="inventory__view-label">Created At</span>
                <span className="inventory__view-value">
                  {new Date(selectedDevice.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedDevice(null); }}
        onConfirm={handleDeleteDevice}
        title="Delete Equipment"
        message={`Are you sure you want to delete "${selectedDevice?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default Inventory;
