import { useState, useEffect } from 'react';
import { Search, ChevronDown, Pencil, Trash2, Eye, RefreshCw } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { ConfirmModal, useToast } from '../../../ui/index.ts';
import { memberApi } from '../../../../services/index.ts';
import type { ApiMember, GenderEnum, ReqCreateMemberDTO, ReqUpdateMemberDTO } from '../../../../types/api.ts';
import './Customers.css';

interface CustomersProps {
  userRole: 'admin' | 'pt';
  currentUserId?: string;
}

// Helper to format date from YYYY-MM-DD to DD/MM/YYYY
const formatDateDisplay = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
};

// Helper to format date from DD/MM/YYYY to YYYY-MM-DD for API
const formatDateForApi = (dateStr: string): string => {
  if (!dateStr) return '';
  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Convert from DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateStr;
};

// Helper to convert API gender to display
const getGenderDisplay = (gender: GenderEnum): string => {
  return gender === 'MALE' ? 'Male' : 'Female';
};

// Helper to get status badge
const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string }> = {
    'ACTIVE': { label: 'Active', className: 'customers__status--active' },
    'INACTIVE': { label: 'Inactive', className: 'customers__status--inactive' }
  };
  return config[status] || { label: status, className: 'customers__status--default' };
};

function Customers({ userRole, currentUserId }: CustomersProps) {
  void currentUserId; // Reserved for future self-edit restrictions
  const { showToast } = useToast();
  
  // Data state
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter/pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showEntities, setShowEntities] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ApiMember | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullname: '',
    dob: '',
    gender: '' as GenderEnum | '',
    phoneNumber: '',
    cccd: '',
    avatarUrl: ''
  });

  // Fetch members on mount
  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const response = await memberApi.getAll();
      setMembers(response.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải danh sách hội viên'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort members
  const getFilteredMembers = () => {
    let filtered = [...members];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.user.fullname.toLowerCase().includes(term) ||
        m.user.email.toLowerCase().includes(term) ||
        m.cccd.includes(searchTerm) ||
        m.id.toString().includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.user.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredMembers = getFilteredMembers();
  const totalPages = Math.ceil(filteredMembers.length / showEntities);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * showEntities,
    currentPage * showEntities
  );

  const handleView = async (member: ApiMember) => {
    try {
      const response = await memberApi.search({ memberId: member.id });
      setSelectedMember(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Failed to fetch member details:', error);
      setSelectedMember(member);
      setShowViewModal(true);
    }
  };

  const handleEdit = (member: ApiMember) => {
    setSelectedMember(member);
    setFormData({
      email: member.user.email,
      password: '',
      fullname: member.user.fullname,
      dob: member.user.dob,
      gender: member.user.gender,
      phoneNumber: member.user.phoneNumber,
      cccd: member.cccd,
      avatarUrl: member.user.avatarUrl || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (member: ApiMember) => {
    setSelectedMember(member);
    setShowDeleteModal(true);
  };

  const handleAddMember = async () => {
    if (!formData.fullname || !formData.email || !formData.password || !formData.gender || !formData.dob || !formData.phoneNumber || !formData.cccd) {
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ReqCreateMemberDTO = {
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        avatarUrl: formData.avatarUrl || 'string',
        dob: formatDateForApi(formData.dob),
        gender: formData.gender as GenderEnum,
        status: 'ACTIVE',
        cccd: formData.cccd
      };

      await memberApi.create(requestData);
      
      showToast({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm hội viên mới'
      });

      setShowAddModal(false);
      resetForm();
      fetchMembers();
    } catch (error: unknown) {
      console.error('Failed to create member:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể thêm hội viên'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!selectedMember) return;

    setIsSubmitting(true);
    try {
      const requestData: ReqUpdateMemberDTO = {
        fullname: formData.fullname,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        avatarUrl: formData.avatarUrl || 'string',
        dob: formatDateForApi(formData.dob),
        gender: formData.gender as GenderEnum,
        cccd: formData.cccd
      };

      await memberApi.update(selectedMember.id, requestData);
      
      showToast({
        type: 'success',
        title: 'Thành công',
        message: 'Đã cập nhật thông tin hội viên'
      });

      setShowEditModal(false);
      resetForm();
      fetchMembers();
    } catch (error: unknown) {
      console.error('Failed to update member:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể cập nhật thông tin'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    setIsSubmitting(true);
    try {
      await memberApi.delete(selectedMember.id);
      
      showToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã xóa hội viên ${selectedMember.user.fullname}`
      });

      setShowDeleteModal(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (error: unknown) {
      console.error('Failed to delete member:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể xóa hội viên'
      });
    } finally {
      setIsSubmitting(false);
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
      cccd: '',
      avatarUrl: ''
    });
    setSelectedMember(null);
  };

  const sectionTitle = userRole === 'admin' ? 'Customers' : 'Members';
  const sectionSubtitle = userRole === 'admin' 
    ? 'Manage gym members and their information' 
    : 'View your assigned members';

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
    <div className="customers">
      <div className="customers__header">
        <div>
          <h1 className="customers__title">{sectionTitle}</h1>
          <p className="customers__subtitle">{sectionSubtitle}</p>
        </div>
        <div className="customers__header-actions">
          <button 
            className="customers__refresh-btn" 
            onClick={fetchMembers}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          {userRole === 'admin' && (
            <button className="customers__add-btn" onClick={() => setShowAddModal(true)}>
              + Add Member
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="customers__filters">
        <div className="customers__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, ID, or CCCD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="customers__filter-group">
          <div className="customers__select-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'ACTIVE' | 'INACTIVE')}
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
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
        {isLoading ? (
          <div className="customers__loading">
            <RefreshCw size={32} className="spinning" />
            <p>Loading members...</p>
          </div>
        ) : (
          <table className="customers__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="customers__empty">
                    No members found
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => {
                  const statusBadge = getStatusBadge(member.user.status);
                  return (
                    <tr key={member.id}>
                      <td>#{member.id}</td>
                      <td>
                        <div className="customers__name-cell">
                          <div className="customers__avatar">
                            <img 
                              src={member.user.avatarUrl || '/images/user-icon-placeholder.png'} 
                              alt={member.user.fullname}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/user-icon-placeholder.png';
                              }}
                            />
                          </div>
                          {member.user.fullname}
                        </div>
                      </td>
                      <td>{member.user.email}</td>
                      <td>{member.user.phoneNumber}</td>
                      <td>{formatDateDisplay(member.joinDate)}</td>
                      <td>
                        <span className={`customers__status ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td>
                        <div className="customers__actions">
                          <button 
                            className="customers__action-btn"
                            onClick={() => handleView(member)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {userRole === 'admin' && (
                            <>
                              <button 
                                className="customers__action-btn"
                                onClick={() => handleEdit(member)}
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                className="customers__action-btn customers__action-btn--delete"
                                onClick={() => handleDeleteClick(member)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
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

      {/* Pagination */}
      <div className="customers__pagination">
        <span className="customers__pagination-info">
          Showing {paginatedMembers.length} of {filteredMembers.length} members
        </span>
        <div className="customers__pagination-controls">
          <button 
            className="customers__page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          <span className="customers__page-indicator">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button 
            className="customers__page-btn"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
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
                placeholder="Minimum 8 characters"
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
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">CCCD (Citizen ID)</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="012345678901"
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
          'Update Member'
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
          <h3 className="customers__form-section">Account Information</h3>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Email</label>
            <input
              type="email"
              className="modal-form__input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Personal Information */}
          <h3 className="customers__form-section">Personal Information</h3>
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
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">CCCD (Citizen ID)</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.cccd}
              onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* View Member Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedMember(null); }}
        title="Member Details"
        size="md"
      >
        {selectedMember && (
          <div className="customers__view-modal">
            <div className="customers__view-header">
              <div className="customers__view-avatar">
                <img 
                  src={selectedMember.user.avatarUrl || '/images/user-icon-placeholder.png'} 
                  alt={selectedMember.user.fullname}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/user-icon-placeholder.png';
                  }}
                />
              </div>
              <div className="customers__view-title">
                <h3>{selectedMember.user.fullname}</h3>
                <span className={`customers__status ${getStatusBadge(selectedMember.user.status).className}`}>
                  {getStatusBadge(selectedMember.user.status).label}
                </span>
              </div>
            </div>

            <div className="customers__view-grid">
              <div className="customers__view-item">
                <span className="customers__view-label">Member ID</span>
                <span className="customers__view-value">#{selectedMember.id}</span>
              </div>
              <div className="customers__view-item">
                <span className="customers__view-label">Email</span>
                <span className="customers__view-value">{selectedMember.user.email}</span>
              </div>
              <div className="customers__view-item">
                <span className="customers__view-label">Phone</span>
                <span className="customers__view-value">{selectedMember.user.phoneNumber}</span>
              </div>
              <div className="customers__view-item">
                <span className="customers__view-label">CCCD</span>
                <span className="customers__view-value">{selectedMember.cccd}</span>
              </div>
              <div className="customers__view-item">
                <span className="customers__view-label">Date of Birth</span>
                <span className="customers__view-value">{formatDateDisplay(selectedMember.user.dob)}</span>
              </div>
              <div className="customers__view-item">
                <span className="customers__view-label">Gender</span>
                <span className="customers__view-value">{getGenderDisplay(selectedMember.user.gender)}</span>
              </div>
              <div className="customers__view-item">
                <span className="customers__view-label">Join Date</span>
                <span className="customers__view-value">{formatDateDisplay(selectedMember.joinDate)}</span>
              </div>
              <div className="customers__view-item">
                <span className="customers__view-label">Money Spent</span>
                <span className="customers__view-value">{selectedMember.moneySpent.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="customers__view-item">
                <span className="customers__view-label">Money Debt</span>
                <span className="customers__view-value">{selectedMember.moneyDebt.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="customers__view-item">
                <span className="customers__view-label">Created At</span>
                <span className="customers__view-value">{new Date(selectedMember.createdAt).toLocaleString('vi-VN')}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedMember(null); }}
        onConfirm={handleDeleteMember}
        title="Delete Member"
        message={`Are you sure you want to delete "${selectedMember?.user.fullname}"? This will set their status to inactive.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default Customers;
