import { useState } from 'react';
import { Search, ChevronDown, Pencil, FileText, Eye, Upload } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { Member, MemberStatus, Gender, Contract } from '../../../../types/index.ts';
import './Customers.css';

interface CustomersProps {
  userRole: 'admin' | 'pt';
  currentUserId?: string;
}

// Mock data
const mockMembers: Member[] = [
  {
    id: 'SFM2301N1',
    name: 'Johnny Sins',
    email: 'johnny@gmail.com',
    phone: '0923346529',
    dateOfBirth: '20/01/2000',
    gender: 'male',
    cccd: '023432149213',
    avatar: '/images/avatar1.jpg',
    dateJoined: '11/01/2026',
    dateExpiration: '11/2/2026',
    status: 'active',
    contractId: 'CTR001',
    trainerId: 'pt-1'
  },
  {
    id: 'SFM2301N2',
    name: 'Juan Dela Cruz',
    email: 'juan@gmail.com',
    phone: '0912345678',
    dateOfBirth: '15/05/1995',
    gender: 'male',
    cccd: '023432149214',
    dateJoined: '11/01/2026',
    dateExpiration: '11/2/2026',
    status: 'active',
    contractId: 'CTR002',
    trainerId: 'pt-2'
  },
  {
    id: 'SFM2301N3',
    name: 'Jen Velasquez',
    email: 'jen@gmail.com',
    phone: '0987654321',
    dateOfBirth: '22/03/1998',
    gender: 'female',
    cccd: '023432149215',
    dateJoined: '20/01/2026',
    status: 'no-contract'
  },
  {
    id: 'SFM2301N4',
    name: 'Tom Hall',
    email: 'tom@gmail.com',
    phone: '0956789012',
    dateOfBirth: '10/08/1992',
    gender: 'male',
    cccd: '023432149216',
    dateJoined: '15/01/2025',
    dateExpiration: '15/07/2025',
    status: 'expired',
    contractId: 'CTR003',
    trainerId: 'pt-1'
  }
];

const mockContract: Contract = {
  id: 'CTR001',
  memberId: 'SFM2301N1',
  memberName: 'Johnny Sins',
  memberAvatar: '/images/avatar1.jpg',
  trainerId: 'pt-1',
  trainerName: 'Martell Chen',
  trainerAvatar: '/images/trainer1.jpg',
  packageId: 'pkg-1',
  packageName: 'Premium PT Package',
  startDate: '11/01/2026',
  endDate: '11/02/2026',
  duration: 30,
  sessions: 12,
  completedSessions: 4,
  price: 2500000,
  totalAmount: 2500000,
  paymentMethod: 'transfer',
  status: 'active',
  signedAt: '11/01/2026'
};

function Customers({ userRole, currentUserId }: CustomersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showEntities, setShowEntities] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    dateOfBirth: '',
    gender: '' as Gender | '',
    phone: '',
    cccd: '',
    avatar: ''
  });

  // Filter members based on role
  const getFilteredMembers = () => {
    let filtered = mockMembers;

    // PT can only see members with contracts that include them
    if (userRole === 'pt' && currentUserId) {
      filtered = filtered.filter(m => m.trainerId === currentUserId);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.dateJoined.split('/').reverse().join('-'));
      const dateB = new Date(b.dateJoined.split('/').reverse().join('-'));
      return sortBy === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    });

    return filtered;
  };

  const filteredMembers = getFilteredMembers();
  const totalPages = Math.ceil(filteredMembers.length / showEntities);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * showEntities,
    currentPage * showEntities
  );

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      email: member.email,
      password: '********',
      name: member.name,
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      phone: member.phone,
      cccd: member.cccd,
      avatar: member.avatar || ''
    });
    setShowEditModal(true);
  };

  const handleViewContract = (member: Member) => {
    // In real app, fetch contract by member.contractId
    setSelectedMember(member);
    setSelectedContract(mockContract);
    setShowContractModal(true);
  };

  const handleAddMember = () => {
    console.log('Adding member:', formData);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateMember = () => {
    console.log('Updating member:', formData);
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
      avatar: ''
    });
    setSelectedMember(null);
  };

  const getStatusBadge = (status: MemberStatus) => {
    const config = {
      'active': { label: 'Active', className: 'customers__status--active' },
      'no-contract': { label: 'No Contract', className: 'customers__status--no-contract' },
      'expired': { label: 'Expired', className: 'customers__status--expired' }
    };
    return config[status];
  };

  const sectionTitle = userRole === 'admin' ? 'Customers' : 'Members';
  const sectionSubtitle = userRole === 'admin' 
    ? 'Manage gym members and their information' 
    : 'View your assigned members';

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
    <div className="customers">
      <div className="customers__header">
        <div>
          <h1 className="customers__title">{sectionTitle}</h1>
          <p className="customers__subtitle">{sectionSubtitle}</p>
        </div>
        {userRole === 'admin' && (
          <button className="customers__add-btn" onClick={() => setShowAddModal(true)}>
            + Add Member
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="customers__filters">
        <div className="customers__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by member name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="customers__filter-group">
          <div className="customers__select-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MemberStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="no-contract">No Contract</option>
              <option value="expired">Expired</option>
            </select>
            <ChevronDown size={16} />
          </div>
          <div className="customers__select-wrapper">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Show entities */}
      <div className="customers__entities">
        <span>Show Entities</span>
        <div className="customers__select-wrapper customers__select-wrapper--small">
          <select value={showEntities} onChange={(e) => setShowEntities(Number(e.target.value))}>
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={12}>12</option>
          </select>
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Table */}
      <div className="customers__table-container">
        <table className="customers__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>PFP</th>
              <th>Member ID</th>
              <th>Date Joined</th>
              <th>Date Expiration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMembers.map((member) => {
              const statusBadge = getStatusBadge(member.status);
              return (
                <tr key={member.id}>
                  <td>{member.name}</td>
                  <td>
                    <div className="customers__avatar">
                      <img 
                        src={member.avatar || '/images/user-icon-placeholder.png'} 
                        alt={member.name} 
                      />
                    </div>
                  </td>
                  <td>{member.id}</td>
                  <td>{member.dateJoined}</td>
                  <td>{member.dateExpiration || '-'}</td>
                  <td>
                    <span className={`customers__status ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td>
                    <div className="customers__actions">
                      {userRole === 'admin' && (
                        <button 
                          className="customers__action-btn"
                          onClick={() => handleEdit(member)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {member.contractId ? (
                        <button 
                          className="customers__action-btn"
                          onClick={() => handleViewContract(member)}
                          title="View Contract"
                        >
                          <FileText size={16} />
                        </button>
                      ) : (
                        <button 
                          className="customers__action-btn customers__action-btn--disabled"
                          disabled
                          title="No Contract"
                        >
                          <FileText size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="customers__pagination">
        <button 
          className="customers__page-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </button>
        <button 
          className="customers__page-btn customers__page-btn--active"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add new member"
        size="md"
        footer={renderFooter(
          () => { setShowAddModal(false); resetForm(); },
          handleAddMember,
          'Add Member'
        )}
      >
        <div className="modal-form">
          {/* Profile Photo */}
          <div className="modal-form__group">
            <label className="modal-form__label">Profile Photo</label>
            <div className="customers__photo-upload">
              <div className="customers__photo-preview">
                <img src="/images/user-icon-placeholder.png" alt="Preview" />
              </div>
              <div className="customers__photo-dropzone">
                <Upload size={24} />
                <span>Click to upload or drag and drop</span>
                <span className="customers__photo-hint">PNG, JPG, JPEG Up to 5MB</span>
              </div>
            </div>
            <span className="modal-form__hint">Recommended: Square image, minimum 300x300px for best quality</span>
          </div>

          {/* Account Information */}
          <h3 className="customers__form-section">Account Information</h3>
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
          <h3 className="customers__form-section">Personal Information</h3>
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
        </div>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit member"
        size="md"
        footer={renderFooter(
          () => { setShowEditModal(false); resetForm(); },
          handleUpdateMember,
          'Confirm'
        )}
      >
        <div className="modal-form">
          {/* Profile Photo */}
          <div className="modal-form__group">
            <label className="modal-form__label">Profile Photo</label>
            <div className="customers__photo-upload">
              <div className="customers__photo-preview customers__photo-preview--has-image">
                <img 
                  src={selectedMember?.avatar || '/images/user-icon-placeholder.png'} 
                  alt={selectedMember?.name || 'Preview'} 
                />
                {selectedMember?.avatar && (
                  <button className="customers__photo-remove">×</button>
                )}
              </div>
              <div className="customers__photo-dropzone">
                <Upload size={24} />
                <span>Click to upload or drag and drop</span>
                <span className="customers__photo-hint">PNG, JPG, JPEG Up to 5MB</span>
              </div>
            </div>
            <span className="modal-form__hint">Recommended: Square image, minimum 300x300px for best quality</span>
          </div>

          {/* Account Information */}
          <h3 className="customers__form-section">Account Information</h3>
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
              <div className="customers__password-field">
                <input
                  type="password"
                  className="modal-form__input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Eye size={18} className="customers__password-toggle" />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <h3 className="customers__form-section">Personal Information</h3>
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
        </div>
      </Modal>

      {/* Contract Details Modal */}
      <Modal
        isOpen={showContractModal}
        onClose={() => { setShowContractModal(false); setSelectedContract(null); }}
        title="Contract Details"
        size="lg"
      >
        {selectedContract && (
          <div className="customers__contract-modal">
            <div className="customers__contract-modal-section">
              <h3 className="customers__contract-modal-title">Contract Information</h3>
              <div className="customers__contract-modal-grid">
                <div className="customers__contract-modal-item">
                  <span className="customers__contract-modal-label">Contract ID</span>
                  <span className="customers__contract-modal-value">{selectedContract.id}</span>
                </div>
                <div className="customers__contract-modal-item">
                  <span className="customers__contract-modal-label">Status</span>
                  <span className={`customers__contract-status-badge customers__contract-status-badge--${selectedContract.status}`}>
                    {selectedContract.status}
                  </span>
                </div>
                <div className="customers__contract-modal-item">
                  <span className="customers__contract-modal-label">Package</span>
                  <span className="customers__contract-modal-value">{selectedContract.packageName}</span>
                </div>
                <div className="customers__contract-modal-item">
                  <span className="customers__contract-modal-label">Duration</span>
                  <span className="customers__contract-modal-value">{selectedContract.duration} days</span>
                </div>
              </div>
            </div>

            <div className="customers__contract-modal-section">
              <h3 className="customers__contract-modal-title">Member Information</h3>
              <div className="customers__contract-modal-profile">
                <div className="customers__contract-modal-avatar">
                  {selectedContract.memberAvatar ? (
                    <img src={selectedContract.memberAvatar} alt={selectedContract.memberName} />
                  ) : (
                    <img src="/images/user-icon-placeholder.png" alt="Member" />
                  )}
                </div>
                <div>
                  <div className="customers__contract-modal-name">{selectedContract.memberName}</div>
                  <div className="customers__contract-modal-id">ID: {selectedContract.memberId}</div>
                </div>
              </div>
            </div>

            {selectedContract.trainerName && (
              <div className="customers__contract-modal-section">
                <h3 className="customers__contract-modal-title">Trainer Information</h3>
                <div className="customers__contract-modal-profile">
                  <div className="customers__contract-modal-avatar">
                    {selectedContract.trainerAvatar ? (
                      <img src={selectedContract.trainerAvatar} alt={selectedContract.trainerName} />
                    ) : (
                      <img src="/images/user-icon-placeholder.png" alt="Trainer" />
                    )}
                  </div>
                  <div>
                    <div className="customers__contract-modal-name">{selectedContract.trainerName}</div>
                    <div className="customers__contract-modal-id">ID: {selectedContract.trainerId}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="customers__contract-modal-section">
              <h3 className="customers__contract-modal-title">Contract Details</h3>
              <div className="customers__contract-modal-grid">
                <div className="customers__contract-modal-item">
                  <span className="customers__contract-modal-label">Start Date</span>
                  <span className="customers__contract-modal-value">{selectedContract.startDate}</span>
                </div>
                <div className="customers__contract-modal-item">
                  <span className="customers__contract-modal-label">End Date</span>
                  <span className="customers__contract-modal-value">{selectedContract.endDate}</span>
                </div>
                <div className="customers__contract-modal-item">
                  <span className="customers__contract-modal-label">Total Sessions</span>
                  <span className="customers__contract-modal-value">
                    {selectedContract.sessions === 'unlimited' ? 'Unlimited' : selectedContract.sessions}
                  </span>
                </div>
                <div className="customers__contract-modal-item">
                  <span className="customers__contract-modal-label">Completed Sessions</span>
                  <span className="customers__contract-modal-value">{selectedContract.completedSessions}</span>
                </div>
                <div className="customers__contract-modal-item">
                  <span className="customers__contract-modal-label">Price</span>
                  <span className="customers__contract-modal-value">
                    {selectedContract.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="customers__contract-modal-item">
                  <span className="customers__contract-modal-label">Payment Method</span>
                  <span className="customers__contract-modal-value" style={{ textTransform: 'capitalize' }}>
                    {selectedContract.paymentMethod}
                  </span>
                </div>
              </div>
              {selectedContract.notes && (
                <div className="customers__contract-modal-notes">
                  <span className="customers__contract-modal-label">Notes</span>
                  <p className="customers__contract-modal-notes-text">{selectedContract.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Customers;
