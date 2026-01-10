import { useState } from 'react';
import { Pencil, Trash2, Search, Upload, X, Package } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { InventoryItem, InventoryStatus, InventoryCategory } from '../../../../types/index.ts';
import './Inventory.css';

// Mock data
const mockInventory: InventoryItem[] = [
  {
    id: 'EQ-0001',
    name: 'Treadmill Pro X500',
    description: 'Commercial grade treadmill with heart rate monitor and entertainment screen.',
    category: 'cardio',
    status: 'in-use',
    purchaseDate: '2025-01-15',
    purchasePrice: 2500,
    currentValue: 2000,
    location: 'Main Floor - Zone A',
    quantity: 5,
    image: '/images/placeholder.jpg'
  },
  {
    id: 'EQ-0002',
    name: 'Dumbbell Set (5-50 lbs)',
    description: 'Professional rubber hex dumbbell set with rack.',
    category: 'free-weights',
    status: 'in-stock',
    purchaseDate: '2024-06-20',
    purchasePrice: 1200,
    currentValue: 1000,
    location: 'Free Weights Area',
    quantity: 2,
    image: '/images/placeholder.jpg'
  },
  {
    id: 'EQ-0003',
    name: 'Cable Machine',
    description: 'Dual adjustable pulley system for various exercises.',
    category: 'strength',
    status: 'maintenance',
    purchaseDate: '2024-03-10',
    purchasePrice: 3500,
    currentValue: 2800,
    location: 'Strength Zone',
    quantity: 1,
    maintenanceNotes: 'Cable replacement scheduled',
    image: '/images/placeholder.jpg'
  },
  {
    id: 'EQ-0004',
    name: 'Yoga Mat Premium',
    description: 'Extra thick eco-friendly yoga mat.',
    category: 'accessories',
    status: 'in-stock',
    purchaseDate: '2025-01-01',
    purchasePrice: 30,
    currentValue: 30,
    location: 'Studio B',
    quantity: 25,
    image: '/images/placeholder.jpg'
  }
];

const CATEGORIES: { value: InventoryCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'free-weights', label: 'Free Weights' },
  { value: 'strength', label: 'Strength' },
  { value: 'accessories', label: 'Accessories' }
];

const STATUS_OPTIONS: { value: InventoryStatus; label: string }[] = [
  { value: 'in-stock', label: 'In Stock' },
  { value: 'in-use', label: 'In Use' },
  { value: 'maintenance', label: 'Maintenance' }
];

function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | 'all'>('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as InventoryCategory | '',
      status: 'in-stock' as InventoryStatus,
    purchaseDate: '',
    purchasePrice: 0,
    currentValue: 0,
    location: '',
    quantity: 1,
    maintenanceNotes: '',
    image: ''
  });

  const stats = {
    totalItems: mockInventory.reduce((sum, item) => sum + item.quantity, 0),
    totalValue: mockInventory.reduce((sum, item) => sum + (item.currentValue * item.quantity), 0),
    inUse: mockInventory.filter(i => i.status === 'in-use').reduce((sum, item) => sum + item.quantity, 0),
    maintenance: mockInventory.filter(i => i.status === 'maintenance').length
  };

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    console.log('Adding item:', formData);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdate = () => {
    console.log('Updating item:', formData);
    setShowEditModal(false);
    resetForm();
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      category: item.category,
      status: item.status,
      purchaseDate: item.purchaseDate,
      purchasePrice: item.purchasePrice,
      currentValue: item.currentValue,
      location: item.location,
      quantity: item.quantity,
      maintenanceNotes: item.maintenanceNotes || '',
      image: item.image || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (item: InventoryItem) => {
    if (confirm(`Delete "${item.name}"?`)) {
      console.log('Deleting item:', item.id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      status: 'in-stock',
      purchaseDate: '',
      purchasePrice: 0,
      currentValue: 0,
      location: '',
      quantity: 1,
      maintenanceNotes: '',
      image: ''
    });
    setSelectedItem(null);
  };

  const getStatusConfig = (status: InventoryStatus) => {
    const config: Record<InventoryStatus, { className: string; label: string }> = {
      'in-stock': { className: 'inventory__status--in-stock', label: 'In Stock' },
      'in-use': { className: 'inventory__status--in-use', label: 'In Use' },
      'maintenance': { className: 'inventory__status--maintenance', label: 'Maintenance' }
    };
    return config[status];
  };

  const getCategoryLabel = (category: InventoryCategory) => {
    const labels: Record<InventoryCategory, string> = {
      'cardio': 'Cardio',
      'free-weights': 'Free Weights',
      'strength': 'Strength',
      'accessories': 'Accessories'
    };
    return labels[category];
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
    <div className="inventory">
      <div className="inventory__header">
        <div>
          <h1 className="inventory__title">Inventory</h1>
          <p className="inventory__subtitle">Manage gym equipment and supplies</p>
        </div>
        <button className="inventory__add-btn" onClick={() => setShowAddModal(true)}>
          + Add Equipment
        </button>
      </div>

      {/* Stats */}
      <div className="inventory__stats">
        <div className="inventory__stat">
          <span className="inventory__stat-label">Total Items</span>
          <span className="inventory__stat-value">{stats.totalItems}</span>
        </div>
        <div className="inventory__stat">
          <span className="inventory__stat-label">Total Value</span>
          <span className="inventory__stat-value inventory__stat-value--green">${stats.totalValue.toLocaleString()}</span>
        </div>
        <div className="inventory__stat">
          <span className="inventory__stat-label">In Use</span>
          <span className="inventory__stat-value">{stats.inUse}</span>
        </div>
        <div className="inventory__stat">
          <span className="inventory__stat-label">In Maintenance</span>
          <span className="inventory__stat-value inventory__stat-value--yellow">{stats.maintenance}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="inventory__filters">
        <div className="inventory__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="inventory__filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as InventoryCategory | 'all')}
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Inventory Grid */}
      <div className="inventory__grid">
        {filteredInventory.map((item) => {
          const statusConfig = getStatusConfig(item.status);
          return (
            <div key={item.id} className="inventory__card">
              <div className="inventory__card-image">
                <img src={item.image || '/images/placeholder.jpg'} alt={item.name} />
                <span className={`inventory__status ${statusConfig.className}`}>
                  {statusConfig.label}
                </span>
              </div>
              
              <div className="inventory__card-body">
                <div className="inventory__card-header">
                  <div>
                    <h3 className="inventory__card-name">{item.name}</h3>
                    <p className="inventory__card-id">{item.id}</p>
                  </div>
                  <div className="inventory__card-actions">
                    <button onClick={() => handleEdit(item)}><Pencil size={16} /></button>
                    <button className="inventory__card-action--delete" onClick={() => handleDelete(item)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="inventory__card-desc">{item.description}</p>

                <div className="inventory__card-category">
                  <Package size={14} />
                  <span>{getCategoryLabel(item.category)}</span>
                </div>

                <div className="inventory__card-details">
                  <div className="inventory__card-detail">
                    <span className="inventory__card-detail-label">Location</span>
                    <span className="inventory__card-detail-value">{item.location}</span>
                  </div>
                  <div className="inventory__card-detail">
                    <span className="inventory__card-detail-label">Quantity</span>
                    <span className="inventory__card-detail-value">{item.quantity}</span>
                  </div>
                </div>

                <div className="inventory__card-pricing">
                  <div className="inventory__card-price">
                    <span className="inventory__card-price-label">Purchase</span>
                    <span className="inventory__card-price-value">${item.purchasePrice}</span>
                  </div>
                  <div className="inventory__card-price">
                    <span className="inventory__card-price-label">Current Value</span>
                    <span className="inventory__card-price-value">${item.currentValue}</span>
                  </div>
                </div>

                {item.status === 'maintenance' && item.maintenanceNotes && (
                  <div className="inventory__card-maintenance">
                    <span>⚠️ {item.maintenanceNotes}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add New Equipment"
        size="md"
        footer={renderFooter(
          () => { setShowAddModal(false); resetForm(); },
          handleAdd,
          'Add Equipment'
        )}
      >
        <div className="modal-form">
          <div className="modal-form__group">
            <label className="modal-form__label">Equipment Photo</label>
            <div className="inventory__photo-upload">
              <div className="inventory__photo-preview">
                <img src="/images/placeholder.jpg" alt="Preview" />
              </div>
              <div className="inventory__photo-dropzone">
                <Upload size={24} />
                <span>Click to upload or drag and drop</span>
                <span className="inventory__photo-hint">PNG, JPG, JPEG up to 5MB</span>
              </div>
            </div>
          </div>

          <h3 className="inventory__form-section">Basic Information</h3>

          <div className="modal-form__row">
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
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Category</label>
              <select
                className="modal-form__select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
              >
                <option value="">Select category</option>
                {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Description</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Brief description of the equipment..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <h3 className="inventory__form-section">Details</h3>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Quantity</label>
              <input
                type="number"
                className="modal-form__input"
                min={1}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Location</label>
              <input
                type="text"
                className="modal-form__input"
                placeholder="e.g., Main Floor - Zone A"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <h3 className="inventory__form-section">Pricing & Status</h3>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Purchase Price ($)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.purchasePrice || ''}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Current Value ($)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.currentValue || ''}
                onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label">Purchase Date</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Status</label>
              <select
                className="modal-form__select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as InventoryStatus })}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.status === 'maintenance' && (
            <div className="modal-form__group">
              <label className="modal-form__label">Maintenance Notes</label>
              <textarea
                className="modal-form__textarea"
                placeholder="Describe the maintenance issue..."
                value={formData.maintenanceNotes}
                onChange={(e) => setFormData({ ...formData, maintenanceNotes: e.target.value })}
              />
            </div>
          )}
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
          handleUpdate,
          'Update Equipment'
        )}
      >
        <div className="modal-form">
          <div className="modal-form__group">
            <label className="modal-form__label">Equipment Photo</label>
            <div className="inventory__photo-upload">
              <div className="inventory__photo-preview inventory__photo-preview--has-image">
                <img src={selectedItem?.image || '/images/placeholder.jpg'} alt="Preview" />
                {selectedItem?.image && (
                  <button className="inventory__photo-remove"><X size={12} /></button>
                )}
              </div>
            </div>
          </div>

          <h3 className="inventory__form-section">Basic Information</h3>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Equipment Name</label>
              <input
                type="text"
                className="modal-form__input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Category</label>
              <select
                className="modal-form__select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
              >
                <option value="">Select category</option>
                {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Description</label>
            <textarea
              className="modal-form__textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <h3 className="inventory__form-section">Details</h3>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Quantity</label>
              <input
                type="number"
                className="modal-form__input"
                min={1}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Location</label>
              <input
                type="text"
                className="modal-form__input"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <h3 className="inventory__form-section">Pricing & Status</h3>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Purchase Price ($)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.purchasePrice || ''}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Current Value ($)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.currentValue || ''}
                onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label">Purchase Date</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label">Status</label>
              <select
                className="modal-form__select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as InventoryStatus })}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.status === 'maintenance' && (
            <div className="modal-form__group">
              <label className="modal-form__label">Maintenance Notes</label>
              <textarea
                className="modal-form__textarea"
                placeholder="Describe the maintenance issue..."
                value={formData.maintenanceNotes}
                onChange={(e) => setFormData({ ...formData, maintenanceNotes: e.target.value })}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Inventory;
