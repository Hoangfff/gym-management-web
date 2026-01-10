import { useState } from 'react';
import { Pencil, Trash2, Search, Upload, X, DollarSign, Check } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { AdditionalService, ServiceCategory, Member } from '../../../../types/index.ts';
import './AdditionalServices.css';

interface AdditionalServicesProps {
  onNavigateToPayments?: () => void;
}

// Mock data
const mockServices: AdditionalService[] = [
  {
    id: 'AS-0001',
    name: 'Standard water bottle',
    description: '500ml water bottle.',
    category: 'other',
    costPrice: 1,
    sellPrice: 3,
    maxCapacity: 100,
    isActive: true,
    image: '/images/placeholder.jpg'
  },
  {
    id: 'AS-0002',
    name: 'Protein bar',
    description: '75g bar containing 20g protein.',
    category: 'wellness',
    costPrice: 3,
    sellPrice: 5,
    maxCapacity: 50,
    isActive: true,
    image: '/images/placeholder.jpg'
  }
];

const mockMembers: Member[] = [
  { id: 'SFM2301N1', name: 'Johnny Sins', email: '', phone: '', dateOfBirth: '', gender: 'male', cccd: '', avatar: '/images/user-icon-placeholder.png', dateJoined: '11/01/2026', status: 'active' },
  { id: 'SFM2301N2', name: 'Juan Dela Cruz', email: '', phone: '', dateOfBirth: '', gender: 'male', cccd: '', dateJoined: '11/01/2026', status: 'active' },
  { id: 'SFM2301N3', name: 'Jen Velasquez', email: '', phone: '', dateOfBirth: '', gender: 'female', cccd: '', dateJoined: '20/01/2026', status: 'no-contract' },
  { id: 'SFM2301N4', name: 'Tom Hall', email: '', phone: '', dateOfBirth: '', gender: 'male', cccd: '', dateJoined: '15/01/2025', status: 'expired' }
];

const CATEGORIES: { value: ServiceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'other', label: 'Other' }
];

function AdditionalServices({ onNavigateToPayments }: AdditionalServicesProps) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [selectedService, setSelectedService] = useState<AdditionalService | null>(null);
  const [orderPaymentId, setOrderPaymentId] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as ServiceCategory | '',
    costPrice: 0,
    sellPrice: 0,
    maxCapacity: 1,
    isActive: true,
    image: ''
  });
  
  // Order state
  const [orderData, setOrderData] = useState({
    quantity: 1,
    memberId: '',
    memberName: ''
  });
  
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [memberPage, setMemberPage] = useState(1);

  const stats = {
    totalServices: mockServices.length,
    activeServices: mockServices.filter(s => s.isActive).length,
    totalBookings: 415,
    avgMargin: '42%',
    revenue: '$16500'
  };

  const filteredServices = activeCategory === 'all' 
    ? mockServices 
    : mockServices.filter(s => s.category === activeCategory);

  const filteredMembers = mockMembers.filter(m =>
    m.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );
  const paginatedMembers = filteredMembers.slice((memberPage - 1) * 4, memberPage * 4);
  const totalMemberPages = Math.ceil(filteredMembers.length / 4);

  const calculateMargin = (cost: number, sell: number) => {
    if (cost === 0) return { percentage: 0, profit: 0 };
    const profit = sell - cost;
    const percentage = Math.round((profit / cost) * 100);
    return { percentage, profit };
  };

  const handleAdd = () => {
    console.log('Adding service:', formData);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdate = () => {
    console.log('Updating service:', formData);
    setShowEditModal(false);
    resetForm();
  };

  const handleEdit = (service: AdditionalService) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      costPrice: service.costPrice,
      sellPrice: service.sellPrice,
      maxCapacity: service.maxCapacity,
      isActive: service.isActive,
      image: service.image || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (service: AdditionalService) => {
    if (confirm(`Delete "${service.name}"?`)) {
      console.log('Deleting service:', service.id);
    }
  };

  const handleOrder = (service: AdditionalService) => {
    setSelectedService(service);
    setOrderData({ quantity: 1, memberId: '', memberName: '' });
    setMemberSearchTerm('');
    setMemberPage(1);
    setShowOrderModal(true);
  };

  const selectMember = (member: Member) => {
    setOrderData({ ...orderData, memberId: member.id, memberName: member.name });
  };

  const submitOrder = () => {
    const paymentId = `000${Math.floor(Math.random() * 10)}`;
    setOrderPaymentId(paymentId);
    setShowOrderModal(false);
    setShowConfirmModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      costPrice: 0,
      sellPrice: 0,
      maxCapacity: 1,
      isActive: true,
      image: ''
    });
    setSelectedService(null);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string }> = {
      'active': { className: 'services__status--active' },
      'no-contract': { className: 'services__status--warning' },
      'expired': { className: 'services__status--expired' }
    };
    return config[status] || { className: '' };
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

  const margin = calculateMargin(formData.costPrice, formData.sellPrice);

  return (
    <div className="services">
      <div className="services__header">
        <div>
          <h1 className="services__title">Additional Services</h1>
          <p className="services__subtitle">Manage extra services and amenities</p>
        </div>
        <button className="services__add-btn" onClick={() => setShowAddModal(true)}>
          + Add New Service
        </button>
      </div>

      {/* Stats */}
      <div className="services__stats">
        <div className="services__stat">
          <span className="services__stat-label">Total Services</span>
          <span className="services__stat-value">{stats.totalServices}</span>
        </div>
        <div className="services__stat">
          <span className="services__stat-label">Active Services</span>
          <span className="services__stat-value">{stats.activeServices}</span>
        </div>
        <div className="services__stat">
          <span className="services__stat-label">Total Bookings</span>
          <span className="services__stat-value">{stats.totalBookings}</span>
        </div>
        <div className="services__stat">
          <span className="services__stat-label">Avg. margin</span>
          <span className="services__stat-value">{stats.avgMargin}</span>
        </div>
        <div className="services__stat">
          <span className="services__stat-label">Revenue</span>
          <span className="services__stat-value">{stats.revenue}</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="services__categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            className={`services__category ${activeCategory === cat.value ? 'services__category--active' : ''}`}
            onClick={() => setActiveCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="services__grid">
        {filteredServices.map((service) => {
          const serviceMargin = calculateMargin(service.costPrice, service.sellPrice);
          return (
            <div key={service.id} className="services__card">
              <div className="services__card-header">
                <div className="services__card-image">
                  <img src={service.image || '/images/placeholder.jpg'} alt={service.name} />
                </div>
                <div className="services__card-info">
                  <h3 className="services__card-name">{service.name}</h3>
                  <p className="services__card-id">ID: {service.id}</p>
                </div>
                <div className="services__card-actions">
                  <button onClick={() => handleEdit(service)}><Pencil size={16} /></button>
                  <button className="services__card-action--delete" onClick={() => handleDelete(service)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="services__card-desc">{service.description}</p>

              <div className="services__card-pricing">
                <div className="services__card-price">
                  <span className="services__card-price-label">Cost price</span>
                  <span className="services__card-price-value">${service.costPrice}</span>
                </div>
                <div className="services__card-price">
                  <span className="services__card-price-label">Sell price</span>
                  <span className="services__card-price-value">${service.sellPrice}</span>
                </div>
              </div>

              <div className="services__card-footer">
                <div className="services__card-margin">
                  <DollarSign size={16} />
                  <span>Profit margin</span>
                  <span className="services__card-margin-value">
                    {serviceMargin.percentage}% (${serviceMargin.profit})
                  </span>
                </div>
                <button className="services__order-btn" onClick={() => handleOrder(service)}>
                  Order
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add New Service"
        size="md"
        footer={renderFooter(
          () => { setShowAddModal(false); resetForm(); },
          handleAdd,
          'Add Service'
        )}
      >
        <div className="modal-form">
          <div className="modal-form__group">
            <label className="modal-form__label">Service Photo</label>
            <div className="services__photo-upload">
              <div className="services__photo-preview">
                <img src="/images/placeholder.jpg" alt="Preview" />
              </div>
              <div className="services__photo-dropzone">
                <Upload size={24} />
                <span>Click to upload or drag and drop</span>
                <span className="services__photo-hint">PNG, JPG, JPEG up to 5MB</span>
              </div>
            </div>
            <span className="modal-form__hint">Recommended: Square image, minimum 300x300px for best quality</span>
          </div>

          <h3 className="services__form-section">Basic Information</h3>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Service Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g., Sports Massage"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Description</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Brief description of the service..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <h3 className="services__form-section">Pricing</h3>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Cost Price ($)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.costPrice || ''}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
              />
              <span className="modal-form__hint">Your cost to provide this service</span>
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Selling Price ($)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.sellPrice || ''}
                onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
              />
              <span className="modal-form__hint">Price charged to members</span>
            </div>
          </div>

          <h3 className="services__form-section">Settings</h3>

          <div className="modal-form__group">
            <label className="modal-form__label">Max Capacity</label>
            <input
              type="number"
              className="modal-form__input"
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
            />
            <span className="modal-form__hint">Maximum number of people per session</span>
          </div>
        </div>
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit Service"
        size="md"
        footer={renderFooter(
          () => { setShowEditModal(false); resetForm(); },
          handleUpdate,
          'Update Service'
        )}
      >
        <div className="modal-form">
          <div className="modal-form__group">
            <label className="modal-form__label">Service Photo</label>
            <div className="services__photo-upload">
              <div className="services__photo-preview services__photo-preview--has-image">
                <img src={selectedService?.image || '/images/placeholder.jpg'} alt="Preview" />
                {selectedService?.image && (
                  <button className="services__photo-remove"><X size={12} /></button>
                )}
              </div>
            </div>
            <span className="modal-form__hint">Recommended: Square image, minimum 300x300px for best quality</span>
          </div>

          <h3 className="services__form-section">Basic Information</h3>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Service Name</label>
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

          <h3 className="services__form-section">Pricing</h3>

          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Cost Price ($)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.costPrice || ''}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
              />
              <span className="modal-form__hint">Your cost to provide this service</span>
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Selling Price ($)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.sellPrice || ''}
                onChange={(e) => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
              />
              <span className="modal-form__hint">Price charged to members</span>
            </div>
          </div>

          {formData.costPrice > 0 && formData.sellPrice > 0 && (
            <div className="services__margin-display">
              <div className="services__margin-item">
                <span className="services__margin-label">Profit Margin</span>
                <span className="services__margin-value services__margin-value--green">{margin.percentage}%</span>
              </div>
              <div className="services__margin-item">
                <span className="services__margin-label">Profit per Sale</span>
                <span className="services__margin-value">${margin.profit.toFixed(2)}</span>
              </div>
            </div>
          )}

          <h3 className="services__form-section">Settings</h3>

          <div className="modal-form__group">
            <label className="modal-form__label">Max Capacity</label>
            <input
              type="number"
              className="modal-form__input"
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
            />
            <span className="modal-form__hint">Maximum number of people per session</span>
          </div>

          <div className="modal-form__checkbox">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive">Active (available for booking)</label>
          </div>
        </div>
      </Modal>

      {/* Order Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Order Service"
        size="md"
        footer={renderFooter(
          () => setShowOrderModal(false),
          submitOrder,
          'Confirm'
        )}
      >
        {selectedService && (
          <div className="services__order-form">
            <div className="services__order-service">
              <div className="services__order-image">
                <img src={selectedService.image || '/images/placeholder.jpg'} alt={selectedService.name} />
              </div>
              <div>
                <h3 className="services__order-name">{selectedService.name}</h3>
                <p className="services__order-desc">{selectedService.description}</p>
              </div>
            </div>

            <div className="modal-form__group">
              <label className="modal-form__label">Quantity</label>
              <input
                type="number"
                className="modal-form__input"
                min={1}
                value={orderData.quantity}
                onChange={(e) => setOrderData({ ...orderData, quantity: Number(e.target.value) })}
              />
            </div>

            <div className="services__order-pricing">
              <h4>Price Information</h4>
              <div className="services__order-pricing-row">
                <div className="services__order-pricing-item">
                  <span>Cost price</span>
                  <strong>${selectedService.costPrice}</strong>
                </div>
                <div className="services__order-pricing-item">
                  <span>Sell price</span>
                  <strong>${selectedService.sellPrice}</strong>
                </div>
              </div>
              <div className="services__order-total">
                <span>Total price</span>
                <strong>${selectedService.sellPrice * orderData.quantity}</strong>
              </div>
            </div>

            <div className="services__order-member">
              <h4>Person receiving this service</h4>
              <div className="modal-form__group">
                <label className="modal-form__label modal-form__label--required">Selected User</label>
                <input
                  type="text"
                  className="modal-form__input"
                  value={orderData.memberName}
                  readOnly
                  placeholder="Select a member below"
                />
              </div>

              <div className="services__member-select">
                <div className="services__member-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by member name or ID..."
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                  />
                </div>
                <table className="services__member-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>PFP</th>
                      <th>Member ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.map((member) => (
                      <tr 
                        key={member.id}
                        className={orderData.memberId === member.id ? 'services__member-row--selected' : ''}
                        onClick={() => selectMember(member)}
                      >
                        <td>{member.name}</td>
                        <td>
                          <img 
                            src={member.avatar || '/images/user-icon-placeholder.png'} 
                            alt={member.name}
                            className="services__member-avatar"
                          />
                        </td>
                        <td>{member.id}</td>
                        <td>
                          <span className={`services__status ${getStatusBadge(member.status).className}`}>
                            {member.status === 'no-contract' ? 'No Contract' : member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="services__member-pagination">
                  <button disabled={memberPage === 1} onClick={() => setMemberPage(p => p - 1)}>
                    Previous
                  </button>
                  <button disabled={memberPage >= totalMemberPages} onClick={() => setMemberPage(p => p + 1)}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmation"
        size="sm"
      >
        <div className="services__confirm">
          <div className="services__confirm-icon">
            <Check size={32} />
          </div>
          <h3 className="services__confirm-title">Order successful!</h3>
          <p className="services__confirm-id">Payment ID: {orderPaymentId}</p>
          <div className="services__confirm-actions">
            <button 
              className="modal-form__btn modal-form__btn--primary"
              onClick={() => {
                setShowConfirmModal(false);
                onNavigateToPayments?.();
              }}
            >
              Go to Payments
            </button>
            <button 
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdditionalServices;
