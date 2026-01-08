import { useState } from 'react';
import { Plus, Search, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { ServicePackage, PackageType } from '../../../../types/index.ts';
import './ServicePackages.css';

interface ServicePackagesProps {
  userRole: 'admin' | 'pt';
  currentUserId?: string;
}

// Mock data
const mockPackages: ServicePackage[] = [
  {
    id: 'PKG0001',
    name: 'Starter Pack',
    description: 'Access to gym facilities and basic equipment',
    type: 'no-pt',
    duration: 30,
    sessions: 'unlimited',
    price: 50,
    isActive: true,
    createdBy: 'Administrator',
    createdById: 'admin-1'
  },
  {
    id: 'PKG0002',
    name: 'Premium Pack',
    description: 'Access to experienced personal trainers',
    type: 'pt',
    duration: 30,
    sessions: 8,
    price: 120,
    isActive: true,
    createdBy: 'Administrator',
    createdById: 'admin-1'
  },
  {
    id: 'PKG0003',
    name: 'VIP Pack',
    description: '48 PT sessions + High-quality amenities + nutrition plan',
    type: 'pt',
    duration: 180,
    sessions: 48,
    price: 250,
    isActive: true,
    createdBy: 'John Nguyen',
    createdById: 'pt-1'
  },
  {
    id: 'PKG0004',
    name: 'Elite Pack',
    description: 'Unlimited PT sessions + Top notch coaching',
    type: 'pt',
    duration: 365,
    sessions: 'unlimited',
    price: 500,
    isActive: true,
    createdBy: 'Juan Delacruz',
    createdById: 'pt-2'
  }
];

const initialFormData = {
  name: '',
  description: '',
  type: 'no-pt' as PackageType,
  duration: 0,
  sessions: 0,
  price: 0,
  isActive: true
};

function ServicePackages({ userRole, currentUserId = 'admin-1' }: ServicePackagesProps) {
  const [packages, setPackages] = useState<ServicePackage[]>(mockPackages);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price'>('newest');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  // Stats
  const totalPackages = packages.length;
  const activePackages = packages.filter(p => p.isActive).length;
  const avgPrice = Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length);
  const mostPopular = 'Premium'; // This would come from API

  // Filter packages
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && pkg.isActive) ||
                         (statusFilter === 'inactive' && !pkg.isActive);
    return matchesSearch && matchesStatus;
  });

  const canEditPackage = (pkg: ServicePackage) => {
    if (userRole === 'admin') return true;
    return pkg.createdById === currentUserId;
  };

  const handleCreatePackage = () => {
    const newPackage: ServicePackage = {
      id: `PKG${String(packages.length + 1).padStart(4, '0')}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      duration: formData.duration,
      sessions: formData.sessions === 0 ? 'unlimited' : formData.sessions,
      price: formData.price,
      isActive: formData.isActive,
      createdBy: userRole === 'admin' ? 'Administrator' : 'Personal Trainer',
      createdById: currentUserId
    };
    setPackages([...packages, newPackage]);
    setIsCreateModalOpen(false);
    setFormData(initialFormData);
  };

  const handleEditPackage = () => {
    if (!editingPackage) return;
    setPackages(packages.map(pkg => 
      pkg.id === editingPackage.id 
        ? {
            ...pkg,
            name: formData.name,
            description: formData.description,
            type: formData.type,
            duration: formData.duration,
            sessions: formData.sessions === 0 ? 'unlimited' : formData.sessions,
            price: formData.price,
            isActive: formData.isActive
          }
        : pkg
    ));
    setIsEditModalOpen(false);
    setEditingPackage(null);
    setFormData(initialFormData);
  };

  const handleDeletePackage = (pkgId: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      setPackages(packages.filter(pkg => pkg.id !== pkgId));
    }
  };

  const openEditModal = (pkg: ServicePackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      type: pkg.type,
      duration: pkg.duration,
      sessions: pkg.sessions === 'unlimited' ? 0 : pkg.sessions,
      price: pkg.price,
      isActive: pkg.isActive
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="service-packages">
      <div className="service-packages__header">
        <div>
          <h1 className="service-packages__title">Service Packages</h1>
          <p className="service-packages__subtitle">Manage membership packages and pricing</p>
        </div>
        <button className="service-packages__create-btn" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} />
          Create Package
        </button>
      </div>

      <div className="service-packages__stats">
        <div className="stat-box">
          <span className="stat-box__label">Total packages</span>
          <span className="stat-box__value">{totalPackages}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Active packages</span>
          <span className="stat-box__value">{activePackages}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Most popular</span>
          <span className="stat-box__value">{mostPopular}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Avg. price</span>
          <span className="stat-box__value">${avgPrice}</span>
        </div>
      </div>

      <div className="service-packages__filters">
        <div className="service-packages__search">
          <Search size={18} className="service-packages__search-icon" />
          <input
            type="text"
            placeholder="Search by package name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="service-packages__filter-group">
          <div className="service-packages__select">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={16} />
          </div>
          <div className="service-packages__select">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'price')}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price">Price</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <div className="service-packages__grid">
        {filteredPackages.map(pkg => (
          <div key={pkg.id} className="package-card">
            <div className="package-card__header">
              <div className="package-card__title-row">
                <h3 className="package-card__name">{pkg.name}</h3>
                <span className={`package-card__type package-card__type--${pkg.type}`}>
                  {pkg.type === 'pt' ? 'PT Included' : 'No PT'}
                </span>
              </div>
              {canEditPackage(pkg) && (
                <div className="package-card__actions">
                  <button className="package-card__action-btn" onClick={() => openEditModal(pkg)}>
                    <Pencil size={16} />
                  </button>
                  <button 
                    className="package-card__action-btn package-card__action-btn--delete"
                    onClick={() => handleDeletePackage(pkg.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <p className="package-card__id">ID: {pkg.id} | By: {pkg.createdBy}</p>
            <p className="package-card__description">{pkg.description}</p>
            <div className="package-card__details">
              <div className="package-card__detail">
                <span className="package-card__detail-label">Duration</span>
                <span className="package-card__detail-value">{pkg.duration} days</span>
              </div>
              <div className="package-card__detail">
                <span className="package-card__detail-label">Sessions</span>
                <span className="package-card__detail-value">
                  {pkg.sessions === 'unlimited' ? 'Unlimited' : pkg.sessions}
                </span>
              </div>
              <div className="package-card__detail">
                <span className="package-card__detail-label">Price</span>
                <span className="package-card__detail-value">${pkg.price}</span>
              </div>
            </div>
            <div className="package-card__footer">
              <span className={`package-card__status package-card__status--${pkg.isActive ? 'active' : 'inactive'}`}>
                <span className="package-card__status-dot"></span>
                {pkg.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Package Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create new package">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleCreatePackage(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="E.g., Premium..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Description</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Describe what's included..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Type</label>
            <select
              className="modal-form__select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PackageType })}
            >
              <option value="no-pt">No PT</option>
              <option value="pt">PT</option>
            </select>
          </div>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Duration (days)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Price ($)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Session count</label>
            <input
              type="number"
              className="modal-form__input"
              value={formData.sessions || ''}
              onChange={(e) => setFormData({ ...formData, sessions: parseInt(e.target.value) || 0 })}
            />
            <span className="modal-form__hint">Set as 0 for unlimited sessions</span>
          </div>
          <div className="modal-form__actions">
            <button type="button" className="modal-form__btn modal-form__btn--secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="modal-form__btn modal-form__btn--primary">
              Create Package
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Package Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Package">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleEditPackage(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Package Name</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Description</label>
            <textarea
              className="modal-form__textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Package Type</label>
            <select
              className="modal-form__select"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PackageType })}
            >
              <option value="no-pt">No PT</option>
              <option value="pt">Premium</option>
            </select>
          </div>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Duration (Days)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Price (₱)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label">Session Count</label>
            <input
              type="number"
              className="modal-form__input"
              value={formData.sessions || ''}
              onChange={(e) => setFormData({ ...formData, sessions: parseInt(e.target.value) || 0 })}
            />
            <span className="modal-form__hint">Leave as 0 for unlimited sessions</span>
          </div>
          <div className="modal-form__checkbox">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive">Active (visible to members)</label>
          </div>
          <div className="modal-form__actions">
            <button type="button" className="modal-form__btn modal-form__btn--secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="modal-form__btn modal-form__btn--primary">
              Update Package
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ServicePackages;
