import { useState } from 'react';
import { Eye, Download, Search, Calendar, FileText, X, Check } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { Payment, PaymentStatus } from '../../../../types/index.ts';
import './Payments.css';

// Mock data
const mockPayments: Payment[] = [
  {
    id: 'P-00001',
    memberId: 'SFM2301N1',
    memberName: 'Johnny Sins',
    memberAvatar: '/images/user-icon-placeholder.png',
    items: [
      { type: 'additional-service', name: 'Standard water bottle', quantity: 2, unitPrice: 3, totalPrice: 6 },
      { type: 'additional-service', name: 'Protein bar', quantity: 1, unitPrice: 5, totalPrice: 5 }
    ],
    totalAmount: 11,
    status: 'pending',
    paymentMethod: 'cash',
    createdAt: '2026-01-15 10:30',
    processedAt: undefined
  },
  {
    id: 'P-00002',
    memberId: 'SFM2301N2',
    memberName: 'Juan Dela Cruz',
    memberAvatar: '/images/user-icon-placeholder.png',
    items: [
      { type: 'contract', name: 'Premium Package - 6 months', quantity: 1, unitPrice: 300, totalPrice: 300 }
    ],
    totalAmount: 300,
    status: 'paid',
    paymentMethod: 'credit-card',
    createdAt: '2026-01-14 14:20',
    processedAt: '2026-01-14 14:25'
  },
  {
    id: 'P-00003',
    memberId: 'SFM2301N3',
    memberName: 'Jen Velasquez',
    memberAvatar: '/images/user-icon-placeholder.png',
    items: [
      { type: 'pt-session', name: 'PT Session with Alex Rivera', quantity: 5, unitPrice: 50, totalPrice: 250 }
    ],
    totalAmount: 250,
    status: 'refunded',
    paymentMethod: 'transfer',
    createdAt: '2026-01-13 09:00',
    processedAt: '2026-01-15 11:00'
  },
  {
    id: 'P-00004',
    memberId: 'SFM2301N4',
    memberName: 'Tom Hall',
    memberAvatar: '/images/user-icon-placeholder.png',
    items: [
      { type: 'contract', name: 'Basic Package - 1 month', quantity: 1, unitPrice: 50, totalPrice: 50 }
    ],
    totalAmount: 50,
    status: 'cancelled',
    paymentMethod: 'cash',
    createdAt: '2026-01-12 16:45',
    processedAt: '2026-01-12 16:50'
  }
];

const STATUS_OPTIONS: { value: PaymentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' }
];

function Payments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const stats = {
    totalRevenue: '$45,230',
    pendingPayments: mockPayments.filter(p => p.status === 'pending').length,
    completedToday: 12,
    refundRate: '2.1%'
  };

  const filteredPayments = mockPayments.filter(p => {
    const matchesSearch = p.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleDownload = (payment: Payment) => {
    console.log('Downloading receipt for:', payment.id);
    alert(`Downloading receipt for Payment ${payment.id}`);
  };

  const handleConfirm = (payment: Payment) => {
    console.log('Confirming payment:', payment.id);
    alert(`Payment ${payment.id} confirmed!`);
  };

  const handleDeny = (payment: Payment) => {
    console.log('Denying payment:', payment.id);
    alert(`Payment ${payment.id} denied!`);
  };

  const handleExportReport = () => {
    console.log('Exporting payment report...');
    alert('Exporting payment report...');
  };

  const getStatusConfig = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { className: string; label: string }> = {
      'paid': { className: 'payments__status--paid', label: 'Paid' },
      'pending': { className: 'payments__status--pending', label: 'Pending' },
      'cancelled': { className: 'payments__status--cancelled', label: 'Cancelled' },
      'refunded': { className: 'payments__status--refunded', label: 'Refunded' }
    };
    return config[status];
  };

  const getItemTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'contract': 'Contract',
      'additional-service': 'Additional Service',
      'pt-session': 'PT Session',
      'service-package': 'Service Package',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  return (
    <div className="payments">
      <div className="payments__header">
        <div>
          <h1 className="payments__title">Payments</h1>
          <p className="payments__subtitle">Track and manage all payment transactions</p>
        </div>
        <button className="payments__export-btn" onClick={handleExportReport}>
          <FileText size={18} />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="payments__stats">
        <div className="payments__stat">
          <span className="payments__stat-label">Total Revenue</span>
          <span className="payments__stat-value payments__stat-value--green">{stats.totalRevenue}</span>
        </div>
        <div className="payments__stat">
          <span className="payments__stat-label">Pending Payments</span>
          <span className="payments__stat-value payments__stat-value--yellow">{stats.pendingPayments}</span>
        </div>
        <div className="payments__stat">
          <span className="payments__stat-label">Completed Today</span>
          <span className="payments__stat-value">{stats.completedToday}</span>
        </div>
        <div className="payments__stat">
          <span className="payments__stat-label">Refund Rate</span>
          <span className="payments__stat-value">{stats.refundRate}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="payments__filters">
        <div className="payments__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, ID, or member ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="payments__filter-group">
          <select
            className="payments__filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="payments__filter-btn">
            <Calendar size={18} />
            Date Range
          </button>
        </div>
      </div>

      {/* Payments Grid */}
      <div className="payments__grid">
        {filteredPayments.map((payment) => {
          const statusConfig = getStatusConfig(payment.status);
          return (
            <div key={payment.id} className="payments__card">
              <div className="payments__card-header">
                <div className="payments__card-member">
                  <img 
                    src={payment.memberAvatar || '/images/user-icon-placeholder.png'} 
                    alt={payment.memberName}
                    className="payments__card-avatar"
                  />
                  <div>
                    <h3 className="payments__card-name">{payment.memberName}</h3>
                    <p className="payments__card-id">{payment.memberId}</p>
                  </div>
                </div>
                <div className="payments__card-actions">
                  <button 
                    className="payments__card-action" 
                    title="View Details"
                    onClick={() => handleView(payment)}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="payments__card-action" 
                    title="Download Receipt"
                    onClick={() => handleDownload(payment)}
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              <div className="payments__card-body">
                <div className="payments__card-payment-info">
                  <span className="payments__card-payment-id">Payment ID: {payment.id}</span>
                  <span className={`payments__status ${statusConfig.className}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="payments__card-items">
                  {payment.items.map((item, idx) => (
                    <div key={idx} className="payments__card-item">
                      <span className="payments__card-item-name">{item.name}</span>
                      <span className="payments__card-item-qty">x{item.quantity}</span>
                      <span className="payments__card-item-price">${item.totalPrice}</span>
                    </div>
                  ))}
                </div>

                <div className="payments__card-total">
                  <span>Total Amount</span>
                  <strong>${payment.totalAmount}</strong>
                </div>
              </div>

              {payment.status === 'pending' && (
                <div className="payments__card-footer">
                  <button 
                    className="payments__action-btn payments__action-btn--deny"
                    onClick={() => handleDeny(payment)}
                  >
                    <X size={16} />
                    Deny
                  </button>
                  <button 
                    className="payments__action-btn payments__action-btn--confirm"
                    onClick={() => handleConfirm(payment)}
                  >
                    <Check size={16} />
                    Confirm
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Payment Details"
        size="md"
      >
        {selectedPayment && (
          <div className="payments__detail">
            <div className="payments__detail-header">
              <div className="payments__detail-member">
                <img 
                  src={selectedPayment.memberAvatar || '/images/user-icon-placeholder.png'} 
                  alt={selectedPayment.memberName}
                  className="payments__detail-avatar"
                />
                <div>
                  <h3 className="payments__detail-name">{selectedPayment.memberName}</h3>
                  <p className="payments__detail-id">{selectedPayment.memberId}</p>
                </div>
              </div>
              <span className={`payments__status ${getStatusConfig(selectedPayment.status).className}`}>
                {getStatusConfig(selectedPayment.status).label}
              </span>
            </div>

            <div className="payments__detail-info">
              <div className="payments__detail-row">
                <span className="payments__detail-label">Payment ID</span>
                <span className="payments__detail-value">{selectedPayment.id}</span>
              </div>
              <div className="payments__detail-row">
                <span className="payments__detail-label">Payment Method</span>
                <span className="payments__detail-value">{selectedPayment.paymentMethod}</span>
              </div>
              <div className="payments__detail-row">
                <span className="payments__detail-label">Created At</span>
                <span className="payments__detail-value">{selectedPayment.createdAt}</span>
              </div>
              {selectedPayment.processedAt && (
                <div className="payments__detail-row">
                  <span className="payments__detail-label">Processed At</span>
                  <span className="payments__detail-value">{selectedPayment.processedAt}</span>
                </div>
              )}
            </div>

            <div className="payments__detail-items">
              <h4>Items</h4>
              <table className="payments__detail-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPayment.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{getItemTypeLabel(item.type)}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unitPrice}</td>
                      <td>${item.totalPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="payments__detail-total">
              <span>Total Amount</span>
              <strong>${selectedPayment.totalAmount}</strong>
            </div>

            <div className="payments__detail-actions">
              <button 
                className="modal-form__btn modal-form__btn--secondary"
                onClick={() => handleDownload(selectedPayment)}
              >
                <Download size={16} />
                Download Receipt
              </button>
              {selectedPayment.status === 'pending' && (
                <>
                  <button 
                    className="modal-form__btn modal-form__btn--danger"
                    onClick={() => {
                      handleDeny(selectedPayment);
                      setShowDetailModal(false);
                    }}
                  >
                    Deny
                  </button>
                  <button 
                    className="modal-form__btn modal-form__btn--primary"
                    onClick={() => {
                      handleConfirm(selectedPayment);
                      setShowDetailModal(false);
                    }}
                  >
                    Confirm Payment
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Payments;
