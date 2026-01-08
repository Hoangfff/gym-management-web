import { useState } from 'react';
import { Plus, Search, ChevronDown, Eye, Download } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { Contract, ContractStatus } from '../../../../types/index.ts';
import './Contracts.css';

interface ContractsProps {
  userRole: 'admin' | 'pt';
}

// Mock contracts
const mockContracts: Contract[] = [
  {
    id: '#0001',
    memberId: 'U3542325234',
    memberName: 'Juan Dela Cruz',
    trainerId: 'U2354325234',
    trainerName: 'Martell Chen',
    packageId: 'PKG001',
    packageName: 'Premium Pack',
    startDate: '10/12/2024',
    endDate: '10/01/2025',
    duration: 30,
    sessions: 8,
    completedSessions: 5,
    price: 120,
    totalAmount: 120,
    paymentMethod: 'cash',
    notes: "Client has mental disability; he's a bit slow to learn",
    status: 'active',
    signedAt: '10/12/2024'
  },
  {
    id: '#0002',
    memberId: 'U3542325235',
    memberName: 'Juan Dela Cruz',
    trainerId: 'U2354325234',
    trainerName: 'Martell Chen',
    packageId: 'PKG001',
    packageName: 'Premium Pack',
    startDate: 'Jan 10',
    endDate: 'Feb 10',
    duration: 30,
    sessions: 8,
    completedSessions: 5,
    price: 120,
    totalAmount: 120,
    paymentMethod: 'cash',
    status: 'active'
  },
  {
    id: '#0003',
    memberId: 'U3542325236',
    memberName: 'Juan Dela Cruz',
    trainerId: 'U2354325234',
    trainerName: 'Martell Chen',
    packageId: 'PKG001',
    packageName: 'Premium Pack',
    startDate: 'Jan 10',
    endDate: 'Feb 10',
    duration: 30,
    sessions: 8,
    completedSessions: 5,
    price: 120,
    totalAmount: 120,
    paymentMethod: 'cash',
    status: 'active'
  }
];

const initialFormData = {
  memberId: '',
  packageId: '',
  trainerId: '',
  startDate: '',
  endDate: '',
  totalAmount: 0,
  paymentMethod: 'cash' as 'cash' | 'card' | 'transfer',
  notes: ''
};

function Contracts({ userRole: _userRole }: ContractsProps) {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [statusFilter, setStatusFilter] = useState<'all' | ContractStatus>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  // Stats
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const pendingContracts = contracts.filter(c => c.status === 'pending').length;
  const expiredContracts = contracts.filter(c => c.status === 'expired').length;

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateContract = () => {
    const newContract: Contract = {
      id: `#${String(contracts.length + 1).padStart(4, '0')}`,
      memberId: formData.memberId,
      memberName: 'New Member',
      trainerId: formData.trainerId,
      trainerName: 'Trainer Name',
      packageId: formData.packageId,
      packageName: 'Package Name',
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: 30,
      sessions: 8,
      completedSessions: 0,
      price: formData.totalAmount,
      totalAmount: formData.totalAmount,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      status: 'pending',
      signedAt: new Date().toLocaleDateString()
    };
    setContracts([...contracts, newContract]);
    setIsCreateModalOpen(false);
    setFormData(initialFormData);
  };

  const openDetailsModal = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailsModalOpen(true);
  };

  const getStatusClass = (status: ContractStatus) => {
    switch (status) {
      case 'active': return 'contract-card__status--active';
      case 'pending': return 'contract-card__status--pending';
      case 'expired': return 'contract-card__status--expired';
      case 'cancelled': return 'contract-card__status--cancelled';
      default: return '';
    }
  };

  return (
    <div className="contracts">
      <div className="contracts__header">
        <div>
          <h1 className="contracts__title">Contracts</h1>
          <p className="contracts__subtitle">View and manage membership contracts</p>
        </div>
        <button className="contracts__create-btn" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} />
          New Contract
        </button>
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
          <span className="stat-box__label">Pending</span>
          <span className="stat-box__value stat-box__value--yellow">{pendingContracts}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Expired</span>
          <span className="stat-box__value stat-box__value--red">{expiredContracts}</span>
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
        <button 
          className={`contracts__filter-tab ${statusFilter === 'all' ? 'contracts__filter-tab--active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button 
          className={`contracts__filter-tab ${statusFilter === 'active' ? 'contracts__filter-tab--active' : ''}`}
          onClick={() => setStatusFilter('active')}
        >
          Active
        </button>
        <button 
          className={`contracts__filter-tab ${statusFilter === 'pending' ? 'contracts__filter-tab--active' : ''}`}
          onClick={() => setStatusFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`contracts__filter-tab ${statusFilter === 'expired' ? 'contracts__filter-tab--active' : ''}`}
          onClick={() => setStatusFilter('expired')}
        >
          Expired
        </button>
        <button 
          className={`contracts__filter-tab ${statusFilter === 'cancelled' ? 'contracts__filter-tab--active' : ''}`}
          onClick={() => setStatusFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      <div className="contracts__list">
        {filteredContracts.map(contract => (
          <div key={contract.id} className="contract-card">
            <div className="contract-card__header">
              <div className="contract-card__member">
                <div className="contract-card__avatar">
                  {contract.memberAvatar ? (
                    <img src={contract.memberAvatar} alt={contract.memberName} />
                  ) : (
                    <span>{contract.memberName.charAt(0)}</span>
                  )}
                </div>
                <div className="contract-card__member-info">
                  <h4 className="contract-card__member-name">{contract.memberName}</h4>
                  <span className="contract-card__contract-id">Contract {contract.id}</span>
                </div>
              </div>
              <div className="contract-card__actions">
                <button className="contract-card__action-btn" onClick={() => openDetailsModal(contract)}>
                  <Eye size={18} />
                </button>
                <button className="contract-card__action-btn">
                  <Download size={18} />
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
                <span className="contract-card__detail-value">{contract.startDate} - {contract.endDate}</span>
              </div>
              <div className="contract-card__detail">
                <span className="contract-card__detail-label">Sessions</span>
                <span className="contract-card__detail-value">{contract.completedSessions}/{contract.sessions}</span>
              </div>
              <div className="contract-card__detail">
                <span className="contract-card__detail-label">Price</span>
                <span className="contract-card__detail-value">${contract.price}</span>
              </div>
              <div className="contract-card__detail">
                <span className="contract-card__detail-label">Status</span>
                <span className={`contract-card__status ${getStatusClass(contract.status)}`}>
                  <span className="contract-card__status-dot"></span>
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Contract Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create new contract">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleCreateContract(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Member</label>
            <select className="modal-form__select" value={formData.memberId} onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}>
              <option value="">Select member</option>
              <option value="M001">Juan Dela Cruz</option>
              <option value="M002">Maria Santos</option>
            </select>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Package</label>
            <select className="modal-form__select" value={formData.packageId} onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}>
              <option value="">Select package</option>
              <option value="PKG001">Premium Pack</option>
              <option value="PKG002">VIP Pack</option>
            </select>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label">Personal Trainer</label>
            <select className="modal-form__select" value={formData.trainerId} onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}>
              <option value="">Select PT to train the member</option>
              <option value="PT001">Martell Chen</option>
              <option value="PT002">John Trainer</option>
            </select>
          </div>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Start date</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">End date</label>
              <input
                type="date"
                className="modal-form__input"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-form__section">Payment Details</div>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Total amount ($)</label>
              <input
                type="number"
                className="modal-form__input"
                value={formData.totalAmount || ''}
                onChange={(e) => setFormData({ ...formData, totalAmount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Method</label>
              <select className="modal-form__select" value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'cash' | 'card' | 'transfer' })}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Additional Notes</label>
            <textarea
              className="modal-form__textarea"
              placeholder="Describe any special terms..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="modal-form__actions">
            <button type="button" className="modal-form__btn modal-form__btn--secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="modal-form__btn modal-form__btn--primary">
              Create Contract
            </button>
          </div>
        </form>
      </Modal>

      {/* Contract Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Contract details" size="lg">
        {selectedContract && (
          <div className="contract-details">
            <p className="contract-details__id">Contract {selectedContract.id}</p>
            
            <div className="contract-details__parties">
              <div className="contract-details__party">
                <span className="contract-details__party-label">Member</span>
                <div className="contract-details__party-info">
                  <div className="contract-details__party-avatar">
                    <span>{selectedContract.memberName.charAt(0)}</span>
                  </div>
                  <div>
                    <h4>{selectedContract.memberName}</h4>
                    <span>ID: {selectedContract.memberId}</span>
                  </div>
                </div>
              </div>
              <div className="contract-details__party">
                <span className="contract-details__party-label">Personal Trainer</span>
                <div className="contract-details__party-info">
                  <div className="contract-details__party-avatar">
                    <span>{selectedContract.trainerName?.charAt(0) || 'N'}</span>
                  </div>
                  <div>
                    <h4>{selectedContract.trainerName || 'Not assigned'}</h4>
                    <span>ID: {selectedContract.trainerId || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="contract-details__grid">
              <div className="contract-details__item">
                <span className="contract-details__item-label">Package</span>
                <span className="contract-details__item-value">{selectedContract.packageName}</span>
              </div>
              <div className="contract-details__item">
                <span className="contract-details__item-label">Price</span>
                <span className="contract-details__item-value contract-details__item-value--primary">${selectedContract.price}</span>
              </div>
              <div className="contract-details__item">
                <span className="contract-details__item-label">Duration (days)</span>
                <span className="contract-details__item-value contract-details__item-value--primary">{selectedContract.duration}</span>
              </div>
            </div>

            <div className="contract-details__dates">
              <div className="contract-details__item">
                <span className="contract-details__item-label">Start date</span>
                <span className="contract-details__item-value">{selectedContract.startDate}</span>
              </div>
              <div className="contract-details__item">
                <span className="contract-details__item-label">End date</span>
                <span className="contract-details__item-value">{selectedContract.endDate}</span>
              </div>
            </div>

            <div className="contract-details__sessions">
              <div className="contract-details__item">
                <span className="contract-details__item-label">Sessions</span>
                <span className="contract-details__item-value">{selectedContract.sessions}</span>
              </div>
              <div className="contract-details__item">
                <span className="contract-details__item-label">Completed Sessions</span>
                <span className="contract-details__item-value">{selectedContract.completedSessions}</span>
              </div>
              <div className="contract-details__item">
                <span className="contract-details__item-label">Remaining Sessions</span>
                <span className="contract-details__item-value">
                  {typeof selectedContract.sessions === 'number' 
                    ? selectedContract.sessions - selectedContract.completedSessions 
                    : 'Unlimited'}
                </span>
              </div>
            </div>

            <div className="contract-details__item">
              <span className="contract-details__item-label">Total amount</span>
              <span className="contract-details__item-value contract-details__item-value--primary">${selectedContract.totalAmount}</span>
            </div>

            {selectedContract.notes && (
              <div className="contract-details__item">
                <span className="contract-details__item-label">Notes</span>
                <span className="contract-details__item-value contract-details__item-value--italic">{selectedContract.notes}</span>
              </div>
            )}

            <div className="contract-details__item">
              <span className="contract-details__item-label">Signed at</span>
              <span className="contract-details__item-value">{selectedContract.signedAt || 'Not signed'}</span>
            </div>

            <div className="contract-details__item">
              <span className="contract-details__item-label">Status</span>
              <span className={`contract-card__status ${getStatusClass(selectedContract.status)}`}>
                <span className="contract-card__status-dot"></span>
                {selectedContract.status.charAt(0).toUpperCase() + selectedContract.status.slice(1)}
              </span>
            </div>

            <div className="modal-form__actions">
              <button type="button" className="modal-form__btn modal-form__btn--secondary" onClick={() => setIsDetailsModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="modal-form__btn modal-form__btn--primary">
                Confirm
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Contracts;
