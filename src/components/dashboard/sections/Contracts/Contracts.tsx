import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, ChevronDown, Eye, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { ConfirmModal, useToast } from '../../../ui/index.ts';
import { contractApi, memberApi, ptApi, packageApi } from '../../../../services/index.ts';
import type {
  ApiContract,
  ContractStatusEnum,
  ReqCreateContractDTO,
  ReqUpdateContractDTO,
  ApiMember,
  ApiPersonalTrainer,
  ApiServicePackage
} from '../../../../types/api.ts';
import './Contracts.css';

interface ContractsProps {
  userRole: 'admin' | 'pt';
}

const STATUS_OPTIONS: { value: ContractStatusEnum | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'E_WALLET', label: 'E-Wallet' }
];

interface CreateContractFormData {
  memberId: number;
  packageId: number;
  ptId?: number;
  startDate: string;
  paymentMethod: string;
  discountAmount?: number;
  notes?: string;
}

const initialFormData: CreateContractFormData = {
  memberId: 0,
  packageId: 0,
  ptId: undefined,
  startDate: '',
  paymentMethod: 'CASH',
  discountAmount: 0,
  notes: ''
};

function Contracts({ userRole: _userRole }: ContractsProps) {
  // Data states
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [pts, setPts] = useState<ApiPersonalTrainer[]>([]);
  const [packages, setPackages] = useState<ApiServicePackage[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [statusFilter, setStatusFilter] = useState<ContractStatusEnum | 'all'>('all');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ApiContract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateContractFormData>(initialFormData);
  
  // Toast
  const { showToast } = useToast();

  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    try {
      let response;
      if (statusFilter !== 'all') {
        response = await contractApi.getByStatus(statusFilter);
      } else {
        response = await contractApi.getAll();
      }
      
      if (response.data) {
        setContracts(Array.isArray(response.data) ? response.data : []);
      } else {
        setContracts([]);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch contracts'
      });
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, showToast]);

  // Fetch dropdown data
  const fetchDropdownData = useCallback(async () => {
    try {
      const [membersRes, ptsRes, packagesRes] = await Promise.all([
        memberApi.getAll(),
        ptApi.getAll(),
        packageApi.getAllActive()
      ]);
      
      if (membersRes.data) {
        setMembers(membersRes.data);
      }
      if (ptsRes.data) {
        setPts(ptsRes.data);
      }
      if (packagesRes.data) {
        setPackages(packagesRes.data);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  // Stats
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;
  const expiredContracts = contracts.filter(c => c.status === 'EXPIRED').length;
  const cancelledContracts = contracts.filter(c => c.status === 'CANCELLED').length;

  // Filter contracts
  const filteredContracts = contracts
    .filter(contract => {
      const matchesSearch = 
        contract.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.id.toString().includes(searchQuery);
      return matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Calculate end date based on package duration
  const calculateEndDate = (startDate: string, durationInDays: number): string => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationInDays * 24 * 60 * 60 * 1000);
    return end.toISOString().split('T')[0];
  };

  // Create contract
  const handleCreateContract = async () => {
    if (!formData.memberId || !formData.packageId || !formData.startDate || !formData.paymentMethod) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    const selectedPackage = packages.find(p => p.id === formData.packageId);
    if (!selectedPackage) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Invalid package selected'
      });
      return;
    }

    // Check if PT is required but not selected
    if (selectedPackage.type === 'PT_INCLUDED' && !formData.ptId) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'This package requires a Personal Trainer'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const endDate = calculateEndDate(formData.startDate, selectedPackage.durationInDays);
      
      const createData: ReqCreateContractDTO = {
        memberId: formData.memberId,
        packageId: formData.packageId,
        startDate: formData.startDate,
        endDate: endDate,
        paymentMethod: formData.paymentMethod,
        ptId: formData.ptId || undefined,
        discountAmount: formData.discountAmount || undefined,
        notes: formData.notes || undefined
      };
      
      await contractApi.create(createData);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Contract created successfully'
      });
      setIsCreateModalOpen(false);
      setFormData(initialFormData);
      fetchContracts();
    } catch (error) {
      console.error('Error creating contract:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create contract'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modals
  const openDetailsModal = (contract: ApiContract) => {
    setSelectedContract(contract);
    setIsDetailsModalOpen(true);
  };

  const openEditModal = (contract: ApiContract) => {
    setSelectedContract(contract);
    setFormData({
      memberId: contract.memberId,
      packageId: contract.packageId,
      ptId: contract.ptId || undefined,
      startDate: contract.startDate,
      paymentMethod: 'CASH', // Not used in update
      discountAmount: 0,
      notes: contract.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (contract: ApiContract) => {
    setSelectedContract(contract);
    setIsDeleteModalOpen(true);
  };

  // Update contract
  const handleUpdateContract = async () => {
    if (!selectedContract) return;

    if (!formData.packageId || !formData.startDate) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPackage = packages.find(p => p.id === formData.packageId);
      const endDate = selectedPackage 
        ? calculateEndDate(formData.startDate, selectedPackage.durationInDays)
        : formData.startDate;

      const updateData: ReqUpdateContractDTO = {
        packageId: formData.packageId,
        ptId: formData.ptId || undefined,
        startDate: formData.startDate,
        endDate: endDate,
        totalSessions: selectedPackage?.numberOfSessions,
        notes: formData.notes || undefined
      };
      
      await contractApi.update(selectedContract.id, updateData);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Contract updated successfully'
      });
      setIsEditModalOpen(false);
      setFormData(initialFormData);
      setSelectedContract(null);
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update contract'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete contract
  const handleDeleteContract = async () => {
    if (!selectedContract) return;

    setIsSubmitting(true);
    try {
      await contractApi.delete(selectedContract.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Contract deleted successfully'
      });
      setIsDeleteModalOpen(false);
      setSelectedContract(null);
      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete contract'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helpers
  const getStatusClass = (status: ContractStatusEnum) => {
    switch (status) {
      case 'ACTIVE': return 'contract-card__status--active';
      case 'EXPIRED': return 'contract-card__status--expired';
      case 'CANCELLED': return 'contract-card__status--cancelled';
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const getSelectedPackageInfo = () => {
    if (!formData.packageId) return null;
    return packages.find(p => p.id === formData.packageId);
  };

  // Check if selected package requires PT
  const selectedPackageRequiresPT = () => {
    const pkg = getSelectedPackageInfo();
    return pkg?.type === 'PT_INCLUDED';
  };

  return (
    <div className="contracts">
      <div className="contracts__header">
        <div>
          <h1 className="contracts__title">Contracts</h1>
          <p className="contracts__subtitle">View and manage membership contracts</p>
        </div>
        <div className="contracts__header-actions">
          <button className="contracts__refresh-btn" onClick={fetchContracts} disabled={isLoading}>
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          <button className="contracts__create-btn" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} />
            New Contract
          </button>
        </div>
      </div>

      <div className="contracts__stats">
        <div className="stat-box">
          <span className="stat-box__label">Total contracts</span>
          <span className="stat-box__value">{totalContracts}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Active</span>
          <span className="stat-box__value stat-box__value--green">{activeContracts}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Expired</span>
          <span className="stat-box__value stat-box__value--red">{expiredContracts}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Cancelled</span>
          <span className="stat-box__value stat-box__value--yellow">{cancelledContracts}</span>
        </div>
      </div>

      <div className="contracts__filters">
        <div className="contracts__search">
          <Search size={18} className="contracts__search-icon" />
          <input
            type="text"
            placeholder="Search by member name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="contracts__select">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <ChevronDown size={16} />
        </div>
      </div>

      <div className="contracts__filter-tabs">
        {STATUS_OPTIONS.map(option => (
          <button
            key={option.value}
            className={`contracts__filter-tab ${statusFilter === option.value ? 'contracts__filter-tab--active' : ''}`}
            onClick={() => setStatusFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="contracts__loading">
          <RefreshCw size={32} className="spinning" />
          <p>Loading contracts...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredContracts.length === 0 && (
        <div className="contracts__empty">
          <p>No contracts found</p>
          <span>Create a new contract to get started</span>
        </div>
      )}

      {/* Contracts list */}
      {!isLoading && filteredContracts.length > 0 && (
        <div className="contracts__list">
          {filteredContracts.map(contract => (
            <div key={contract.id} className="contract-card">
              <div className="contract-card__header">
                <div className="contract-card__member">
                  <div className="contract-card__avatar">
                    <span>{contract.memberName.charAt(0)}</span>
                  </div>
                  <div className="contract-card__member-info">
                    <h4 className="contract-card__member-name">{contract.memberName}</h4>
                    <span className="contract-card__contract-id">Contract #{contract.id}</span>
                  </div>
                </div>
                <div className="contract-card__actions">
                  <button 
                    className="contract-card__action-btn" 
                    onClick={() => openDetailsModal(contract)}
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    className="contract-card__action-btn contract-card__action-btn--edit" 
                    onClick={() => openEditModal(contract)}
                    title="Edit Contract"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    className="contract-card__action-btn contract-card__action-btn--delete" 
                    onClick={() => openDeleteModal(contract)}
                    title="Delete Contract"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="contract-card__details">
                <div className="contract-card__detail">
                  <span className="contract-card__detail-label">Package</span>
                  <span className="contract-card__detail-value">{contract.packageName}</span>
                </div>
                <div className="contract-card__detail">
                  <span className="contract-card__detail-label">Duration</span>
                  <span className="contract-card__detail-value">
                    {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                  </span>
                </div>
                <div className="contract-card__detail">
                  <span className="contract-card__detail-label">Sessions</span>
                  <span className="contract-card__detail-value">
                    {contract.totalSessions - contract.remainingSessions}/{contract.totalSessions}
                  </span>
                </div>
                <div className="contract-card__detail">
                  <span className="contract-card__detail-label">Price</span>
                  <span className="contract-card__detail-value">
                    {formatCurrency(contract.packagePrice)}
                  </span>
                </div>
                <div className="contract-card__detail">
                  <span className="contract-card__detail-label">Status</span>
                  <span className={`contract-card__status ${getStatusClass(contract.status)}`}>
                    <span className="contract-card__status-dot"></span>
                    {contract.status.charAt(0) + contract.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
              {contract.ptName && (
                <div className="contract-card__trainer">
                  <span className="contract-card__trainer-label">Personal Trainer:</span>
                  <span className="contract-card__trainer-name">{contract.ptName}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Contract Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData(initialFormData);
        }} 
        title="Create new contract"
      >
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleCreateContract(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Member</label>
            <select 
              className="modal-form__select" 
              value={formData.memberId || ''} 
              onChange={(e) => setFormData({ ...formData, memberId: parseInt(e.target.value) || 0 })}
              required
            >
              <option value="">Select member</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.user.fullname} ({member.user.email})
                </option>
              ))}
            </select>
          </div>
          
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Service Package</label>
            <select 
              className="modal-form__select" 
              value={formData.packageId || ''} 
              onChange={(e) => setFormData({ 
                ...formData, 
                packageId: parseInt(e.target.value) || 0,
                // Reset ptId if package doesn't require PT
                ptId: undefined
              })}
              required
            >
              <option value="">Select package</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.packageName} - {formatCurrency(pkg.price)} ({pkg.durationInDays} days, {pkg.numberOfSessions} sessions)
                  {pkg.type === 'PT_INCLUDED' ? ' [PT Included]' : ''}
                </option>
              ))}
            </select>
          </div>
          
          {getSelectedPackageInfo() && (
            <div className="modal-form__package-info">
              <h4>Package Details</h4>
              <div className="modal-form__package-details">
                <div className="modal-form__package-detail">
                  <span>Price:</span>
                  <strong>{formatCurrency(getSelectedPackageInfo()?.price || 0)}</strong>
                </div>
                <div className="modal-form__package-detail">
                  <span>Duration:</span>
                  <strong>{getSelectedPackageInfo()?.durationInDays} days</strong>
                </div>
                <div className="modal-form__package-detail">
                  <span>Sessions:</span>
                  <strong>{getSelectedPackageInfo()?.numberOfSessions}</strong>
                </div>
                <div className="modal-form__package-detail">
                  <span>PT Included:</span>
                  <strong>{getSelectedPackageInfo()?.type === 'PT_INCLUDED' ? 'Yes' : 'No'}</strong>
                </div>
              </div>
            </div>
          )}
          
          {selectedPackageRequiresPT() && (
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Personal Trainer</label>
              <select 
                className="modal-form__select" 
                value={formData.ptId || ''} 
                onChange={(e) => setFormData({ ...formData, ptId: parseInt(e.target.value) || undefined })}
                required
              >
                <option value="">Select Personal Trainer</option>
                {pts.map(pt => (
                  <option key={pt.id} value={pt.id}>
                    {pt.user.fullname}
                  </option>
                ))}
              </select>
              <p className="modal-form__hint">
                This package includes PT sessions. Please select a trainer.
              </p>
            </div>
          )}

          {!selectedPackageRequiresPT() && formData.packageId > 0 && (
            <div className="modal-form__group">
              <label className="modal-form__label">Personal Trainer (Optional)</label>
              <select 
                className="modal-form__select" 
                value={formData.ptId || ''} 
                onChange={(e) => setFormData({ ...formData, ptId: parseInt(e.target.value) || undefined })}
              >
                <option value="">No PT assigned</option>
                {pts.map(pt => (
                  <option key={pt.id} value={pt.id}>
                    {pt.user.fullname}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Start Date</label>
            <input
              type="date"
              className="modal-form__input"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            {formData.startDate && getSelectedPackageInfo() && (
              <p className="modal-form__hint">
                End date will be: <strong>{formatDate(calculateEndDate(formData.startDate, getSelectedPackageInfo()?.durationInDays || 0))}</strong>
              </p>
            )}
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Payment Method</label>
            <select 
              className="modal-form__select" 
              value={formData.paymentMethod} 
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              required
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label">Discount Amount</label>
            <input
              type="number"
              className="modal-form__input"
              placeholder="Enter discount amount"
              value={formData.discountAmount || ''}
              onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
              min="0"
            />
            {formData.discountAmount && formData.discountAmount > 0 && getSelectedPackageInfo() && (
              <p className="modal-form__hint">
                Final price: <strong>{formatCurrency((getSelectedPackageInfo()?.price || 0) - formData.discountAmount)}</strong>
              </p>
            )}
          </div>
          
          <div className="modal-form__group">
            <label className="modal-form__label">Notes (Optional)</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Add any special notes or terms..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="modal-form__actions">
            <button 
              type="button" 
              className="modal-form__btn modal-form__btn--secondary" 
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData(initialFormData);
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Contract'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Contract Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setFormData(initialFormData);
          setSelectedContract(null);
        }} 
        title="Edit contract"
      >
        {selectedContract && (
          <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleUpdateContract(); }}>
            <div className="modal-form__group">
              <label className="modal-form__label">Member</label>
              <input
                type="text"
                className="modal-form__input"
                value={selectedContract.memberName}
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
              />
              <p className="modal-form__hint">Member cannot be changed</p>
            </div>
            
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Service Package</label>
              <select 
                className="modal-form__select" 
                value={formData.packageId || ''} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  packageId: parseInt(e.target.value) || 0,
                  ptId: undefined
                })}
                required
              >
                <option value="">Select package</option>
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.packageName} - {formatCurrency(pkg.price)} ({pkg.durationInDays} days, {pkg.numberOfSessions} sessions)
                    {pkg.type === 'PT_INCLUDED' ? ' [PT Included]' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {getSelectedPackageInfo() && (
              <div className="modal-form__package-info">
                <h4>Package Details</h4>
                <div className="modal-form__package-details">
                  <div className="modal-form__package-detail">
                    <span>Price:</span>
                    <strong>{formatCurrency(getSelectedPackageInfo()?.price || 0)}</strong>
                  </div>
                  <div className="modal-form__package-detail">
                    <span>Duration:</span>
                    <strong>{getSelectedPackageInfo()?.durationInDays} days</strong>
                  </div>
                  <div className="modal-form__package-detail">
                    <span>Sessions:</span>
                    <strong>{getSelectedPackageInfo()?.numberOfSessions}</strong>
                  </div>
                  <div className="modal-form__package-detail">
                    <span>PT Included:</span>
                    <strong>{getSelectedPackageInfo()?.type === 'PT_INCLUDED' ? 'Yes' : 'No'}</strong>
                  </div>
                </div>
              </div>
            )}
            
            {selectedPackageRequiresPT() && (
              <div className="modal-form__group">
                <label className="modal-form__label modal-form__label--required">Personal Trainer</label>
                <select 
                  className="modal-form__select" 
                  value={formData.ptId || ''} 
                  onChange={(e) => setFormData({ ...formData, ptId: parseInt(e.target.value) || undefined })}
                  required
                >
                  <option value="">Select Personal Trainer</option>
                  {pts.map(pt => (
                    <option key={pt.id} value={pt.id}>
                      {pt.user.fullname}
                    </option>
                  ))}
                </select>
                <p className="modal-form__hint">
                  This package includes PT sessions. Please select a trainer.
                </p>
              </div>
            )}

            {!selectedPackageRequiresPT() && formData.packageId > 0 && (
              <div className="modal-form__group">
                <label className="modal-form__label">Personal Trainer (Optional)</label>
                <select 
                  className="modal-form__select" 
                  value={formData.ptId || ''} 
                  onChange={(e) => setFormData({ ...formData, ptId: parseInt(e.target.value) || undefined })}
                >
                  <option value="">No PT assigned</option>
                  {pts.map(pt => (
                    <option key={pt.id} value={pt.id}>
                      {pt.user.fullname}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Start Date</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              {formData.startDate && getSelectedPackageInfo() && (
                <p className="modal-form__hint">
                  End date will be: <strong>{formatDate(calculateEndDate(formData.startDate, getSelectedPackageInfo()?.durationInDays || 0))}</strong>
                </p>
              )}
            </div>
            
            <div className="modal-form__group">
              <label className="modal-form__label">Notes (Optional)</label>
              <textarea
                className="modal-form__textarea"
                placeholder="Add any special notes or terms..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="modal-form__actions">
              <button 
                type="button" 
                className="modal-form__btn modal-form__btn--secondary" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setFormData(initialFormData);
                  setSelectedContract(null);
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="modal-form__btn modal-form__btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Contract'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Contract Details Modal */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedContract(null);
        }} 
        title="Contract Details" 
        size="lg"
      >
        {selectedContract && (
          <div className="contract-details">
            <div className="contract-details__header">
              <p className="contract-details__id">Contract #{selectedContract.id}</p>
              <span className={`contract-card__status ${getStatusClass(selectedContract.status)}`}>
                <span className="contract-card__status-dot"></span>
                {selectedContract.status.charAt(0) + selectedContract.status.slice(1).toLowerCase()}
              </span>
            </div>
            
            <div className="contract-details__parties">
              <div className="contract-details__party">
                <span className="contract-details__party-label">Member</span>
                <div className="contract-details__party-info">
                  <div className="contract-details__party-avatar">
                    <span>{selectedContract.memberName.charAt(0)}</span>
                  </div>
                  <div>
                    <h4>{selectedContract.memberName}</h4>
                    <span>Member ID: {selectedContract.memberId}</span>
                  </div>
                </div>
              </div>
              <div className="contract-details__party">
                <span className="contract-details__party-label">Personal Trainer</span>
                <div className="contract-details__party-info">
                  {selectedContract.ptName ? (
                    <>
                      <div className="contract-details__party-avatar">
                        <span>{selectedContract.ptName.charAt(0)}</span>
                      </div>
                      <div>
                        <h4>{selectedContract.ptName}</h4>
                        <span>PT ID: {selectedContract.ptId}</span>
                      </div>
                    </>
                  ) : (
                    <span className="contract-details__no-pt">Not assigned</span>
                  )}
                </div>
              </div>
            </div>

            <div className="contract-details__section">
              <h4 className="contract-details__section-title">Package Information</h4>
              <div className="contract-details__grid">
                <div className="contract-details__item">
                  <span className="contract-details__item-label">Package Name</span>
                  <span className="contract-details__item-value">{selectedContract.packageName}</span>
                </div>
                <div className="contract-details__item">
                  <span className="contract-details__item-label">Package ID</span>
                  <span className="contract-details__item-value">{selectedContract.packageId}</span>
                </div>
                <div className="contract-details__item">
                  <span className="contract-details__item-label">Price</span>
                  <span className="contract-details__item-value contract-details__item-value--primary">
                    {formatCurrency(selectedContract.packagePrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="contract-details__section">
              <h4 className="contract-details__section-title">Contract Period</h4>
              <div className="contract-details__dates">
                <div className="contract-details__item">
                  <span className="contract-details__item-label">Start Date</span>
                  <span className="contract-details__item-value">{formatDate(selectedContract.startDate)}</span>
                </div>
                <div className="contract-details__item">
                  <span className="contract-details__item-label">End Date</span>
                  <span className="contract-details__item-value">{formatDate(selectedContract.endDate)}</span>
                </div>
                <div className="contract-details__item">
                  <span className="contract-details__item-label">Signed At</span>
                  <span className="contract-details__item-value">{formatDate(selectedContract.signedAt)}</span>
                </div>
              </div>
            </div>

            <div className="contract-details__section">
              <h4 className="contract-details__section-title">Sessions</h4>
              <div className="contract-details__sessions">
                <div className="contract-details__item">
                  <span className="contract-details__item-label">Total Sessions</span>
                  <span className="contract-details__item-value">{selectedContract.totalSessions}</span>
                </div>
                <div className="contract-details__item">
                  <span className="contract-details__item-label">Used Sessions</span>
                  <span className="contract-details__item-value">
                    {selectedContract.totalSessions - selectedContract.remainingSessions}
                  </span>
                </div>
                <div className="contract-details__item">
                  <span className="contract-details__item-label">Remaining Sessions</span>
                  <span className="contract-details__item-value contract-details__item-value--primary">
                    {selectedContract.remainingSessions}
                  </span>
                </div>
              </div>
              
              <div className="contract-details__progress">
                <div className="contract-details__progress-bar">
                  <div 
                    className="contract-details__progress-fill"
                    style={{ 
                      width: `${selectedContract.totalSessions > 0 
                        ? ((selectedContract.totalSessions - selectedContract.remainingSessions) / selectedContract.totalSessions) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
                <span className="contract-details__progress-text">
                  {selectedContract.totalSessions > 0 
                    ? Math.round(((selectedContract.totalSessions - selectedContract.remainingSessions) / selectedContract.totalSessions) * 100)
                    : 0}% used
                </span>
              </div>
            </div>

            {selectedContract.notes && (
              <div className="contract-details__section">
                <h4 className="contract-details__section-title">Notes</h4>
                <p className="contract-details__notes">{selectedContract.notes}</p>
              </div>
            )}

            <div className="contract-details__section">
              <h4 className="contract-details__section-title">Audit Information</h4>
              <div className="contract-details__audit">
                <div className="contract-details__item">
                  <span className="contract-details__item-label">Created At</span>
                  <span className="contract-details__item-value">{formatDate(selectedContract.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="modal-form__actions">
              <button 
                type="button" 
                className="modal-form__btn modal-form__btn--secondary" 
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedContract(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedContract(null);
        }}
        onConfirm={handleDeleteContract}
        title="Delete Contract"
        message={
          selectedContract 
            ? `Are you sure you want to delete Contract #${selectedContract.id} for ${selectedContract.memberName}? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default Contracts;
