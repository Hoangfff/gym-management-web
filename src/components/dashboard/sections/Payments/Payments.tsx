import { useState, useEffect } from 'react';
import { Eye, Download, Search, FileText, RefreshCw, DollarSign, User } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { useToast } from '../../../ui/index.ts';
import { invoiceApi, memberApi } from '../../../../services/index.ts';
import type { 
  ApiInvoice, 
  InvoiceStatusEnum,
  InvoicePaymentStatusEnum,
  ApiMember,
  InvoiceDetail
} from '../../../../types/api.ts';
import './Payments.css';

const InvoiceStatus = {
  DRAFT: 'DRAFT' as InvoiceStatusEnum,
  ISSUED: 'ISSUED' as InvoiceStatusEnum,
  PENDING: 'PENDING' as InvoiceStatusEnum,
  PARTIAL: 'PARTIAL' as InvoiceStatusEnum,
  PAID: 'PAID' as InvoiceStatusEnum,
  OVERDUE: 'OVERDUE' as InvoiceStatusEnum,
  CANCELLED: 'CANCELLED' as InvoiceStatusEnum
};

const PaymentStatus = {
  UNPAID: 'UNPAID' as InvoicePaymentStatusEnum,
  PAID: 'PAID' as InvoicePaymentStatusEnum,
  PARTIAL: 'PARTIAL' as InvoicePaymentStatusEnum
};

const STATUS_OPTIONS: { value: InvoiceStatusEnum | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ISSUED', label: 'Issued' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const PAYMENT_STATUS_OPTIONS: { value: InvoicePaymentStatusEnum | 'all'; label: string }[] = [
  { value: 'all', label: 'All Payment Status' },
  { value: 'UNPAID', label: 'Unpaid' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PARTIAL', label: 'Partial' }
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'MOMO', label: 'MoMo' },
  { value: 'VNPAY', label: 'VNPay' }
];

function Payments() {
  const { showToast } = useToast();
  
  // Data states
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number>(0);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusEnum | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<InvoicePaymentStatusEnum | 'all'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ApiInvoice | null>(null);
  
  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: 0,
    paymentMethod: '',
    paymentDate: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchMembers();
  }, []);

  // Fetch invoices when member selected
  useEffect(() => {
    if (selectedMemberId > 0) {
      fetchInvoices(selectedMemberId);
    } else {
      setInvoices([]);
    }
  }, [selectedMemberId]);

  const fetchMembers = async () => {
    try {
      const response = await memberApi.getAll();
      setMembers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const fetchInvoices = async (memberId: number) => {
    setIsLoading(true);
    try {
      const response = await invoiceApi.getByMemberId(memberId);
      const data = response.data;
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      setInvoices([]);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load invoices'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stats
  const stats = {
    totalInvoices: invoices.length,
    pending: invoices.filter(i => i.paymentStatus === PaymentStatus.UNPAID).length,
    paid: invoices.filter(i => i.paymentStatus === PaymentStatus.PAID).length,
    partial: invoices.filter(i => i.paymentStatus === PaymentStatus.PARTIAL).length,
    totalRevenue: invoices.filter(i => i.paymentStatus === PaymentStatus.PAID).reduce((sum, i) => sum + i.finalAmount, 0)
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.invoiceId.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || invoice.paymentStatus === paymentStatusFilter;
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const handleView = (invoice: ApiInvoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const handlePayClick = (invoice: ApiInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amountPaid: invoice.finalAmount,
      paymentMethod: invoice.paymentMethod || '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedInvoice || !paymentForm.paymentMethod || paymentForm.amountPaid <= 0) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine payment status based on amount
      const paymentStatus: 'PAID' | 'PARTIAL' = 
        paymentForm.amountPaid >= selectedInvoice.finalAmount ? 'PAID' : 'PARTIAL';

      await invoiceApi.updatePaymentStatus(selectedInvoice.invoiceId, {
        paymentStatus,
        amountPaid: paymentForm.amountPaid,
        paymentMethod: paymentForm.paymentMethod,
        paymentDate: paymentForm.paymentDate,
        notes: paymentForm.notes || undefined
      });
      
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Payment recorded successfully'
      });
      
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      if (selectedMemberId > 0) {
        fetchInvoices(selectedMemberId);
      }
    } catch (error: unknown) {
      console.error('Failed to process payment:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to process payment'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (invoice: ApiInvoice) => {
    console.log('Downloading receipt for:', invoice.invoiceId);
    showToast({
      type: 'info',
      title: 'Info',
      message: `Downloading invoice #${invoice.invoiceId}`
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US');
  };

  const getStatusConfig = (status: InvoiceStatusEnum) => {
    const config: Record<InvoiceStatusEnum, { className: string; label: string }> = {
      'DRAFT': { className: 'payments__status--draft', label: 'Draft' },
      'ISSUED': { className: 'payments__status--issued', label: 'Issued' },
      'PENDING': { className: 'payments__status--pending', label: 'Pending' },
      'PARTIAL': { className: 'payments__status--partial', label: 'Partial' },
      'PAID': { className: 'payments__status--paid', label: 'Paid' },
      'OVERDUE': { className: 'payments__status--overdue', label: 'Overdue' },
      'CANCELLED': { className: 'payments__status--cancelled', label: 'Cancelled' }
    };
    return config[status] || { className: '', label: status };
  };

  const getPaymentStatusConfig = (status: InvoicePaymentStatusEnum) => {
    const config: Record<InvoicePaymentStatusEnum, { className: string; label: string }> = {
      'UNPAID': { className: 'payments__payment-status--unpaid', label: 'Unpaid' },
      'PAID': { className: 'payments__payment-status--paid', label: 'Paid' },
      'PARTIAL': { className: 'payments__payment-status--partial', label: 'Partial' }
    };
    return config[status] || { className: '', label: status };
  };

  const getItemDescription = (detail: InvoiceDetail): string => {
    if (detail.servicePackageName) return detail.servicePackageName;
    if (detail.additionalServiceName) return detail.additionalServiceName;
    return `Detail #${detail.detailId}`;
  };

  return (
    <div className="payments">
      <div className="payments__header">
        <div>
          <h1 className="payments__title">Invoices & Payments</h1>
          <p className="payments__subtitle">Manage member invoices and payments</p>
        </div>
        <div className="payments__header-actions">
          <button 
            className="payments__refresh-btn" 
            onClick={() => selectedMemberId > 0 && fetchInvoices(selectedMemberId)}
            disabled={isLoading || selectedMemberId === 0}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Member Selection */}
      <div className="payments__member-select">
        <label className="payments__member-label">
          <User size={18} />
          Select member to view invoices:
        </label>
        <select
          className="payments__member-dropdown"
          value={selectedMemberId}
          onChange={(e) => setSelectedMemberId(Number(e.target.value))}
        >
          <option value={0}>-- Select a member --</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {member.user.fullname} (ID: {member.id})
            </option>
          ))}
        </select>
      </div>

      {selectedMemberId > 0 && (
        <>
          {/* Stats */}
          <div className="payments__stats">
            <div className="payments__stat">
              <span className="payments__stat-label">Total Invoices</span>
              <span className="payments__stat-value">{stats.totalInvoices}</span>
            </div>
            <div className="payments__stat">
              <span className="payments__stat-label">Unpaid</span>
              <span className="payments__stat-value payments__stat-value--yellow">{stats.pending}</span>
            </div>
            <div className="payments__stat">
              <span className="payments__stat-label">Paid</span>
              <span className="payments__stat-value payments__stat-value--green">{stats.paid}</span>
            </div>
            <div className="payments__stat">
              <span className="payments__stat-label">Partial</span>
              <span className="payments__stat-value payments__stat-value--orange">{stats.partial}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="payments__filters">
            <div className="payments__search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name or invoice ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="payments__filter-group">
              <select
                className="payments__filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InvoiceStatusEnum | 'all')}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                className="payments__filter-select"
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value as InvoicePaymentStatusEnum | 'all')}
              >
                {PAYMENT_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Invoices Grid */}
          {isLoading ? (
            <div className="payments__loading">
              <RefreshCw size={32} className="spinning" />
              <p>Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="payments__empty">
              <FileText size={48} />
              <h3>No invoices found</h3>
              <p>This member has no invoices matching your criteria.</p>
            </div>
          ) : (
            <div className="payments__grid">
              {filteredInvoices.map((invoice) => {
                const statusConfig = getStatusConfig(invoice.status);
                const paymentStatusConfig = getPaymentStatusConfig(invoice.paymentStatus);
                return (
                  <div key={invoice.invoiceId} className="payments__card">
                    <div className="payments__card-header">
                      <div className="payments__card-member">
                        <div className="payments__card-avatar">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="payments__card-name">Invoice #{invoice.invoiceId}</h3>
                          <p className="payments__card-id">{invoice.memberName}</p>
                        </div>
                      </div>
                      <div className="payments__card-actions">
                        <button 
                          className="payments__card-action" 
                          title="View Details"
                          onClick={() => handleView(invoice)}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="payments__card-action" 
                          title="Download"
                          onClick={() => handleDownload(invoice)}
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="payments__card-body">
                      <div className="payments__card-payment-info">
                        <span className={`payments__status ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                        <span className={`payments__payment-status ${paymentStatusConfig.className}`}>
                          {paymentStatusConfig.label}
                        </span>
                      </div>

                      <div className="payments__card-items">
                        {invoice.details.slice(0, 2).map((detail) => (
                          <div key={detail.detailId} className="payments__card-item">
                            <span className="payments__card-item-name">{getItemDescription(detail)}</span>
                            <span className="payments__card-item-qty">x{detail.quantity}</span>
                            <span className="payments__card-item-price">{formatCurrency(detail.totalAmount)}</span>
                          </div>
                        ))}
                        {invoice.details.length > 2 && (
                          <div className="payments__card-item payments__card-item--more">
                            +{invoice.details.length - 2} more items
                          </div>
                        )}
                      </div>

                      <div className="payments__card-total">
                        <div className="payments__card-total-row">
                          <span>Subtotal</span>
                          <strong>{formatCurrency(invoice.totalAmount)}</strong>
                        </div>
                        {invoice.discountAmount > 0 && (
                          <div className="payments__card-total-row">
                            <span>Discount</span>
                            <span className="payments__discount-amount">-{formatCurrency(invoice.discountAmount)}</span>
                          </div>
                        )}
                        <div className="payments__card-total-row payments__card-total-row--final">
                          <span>Total</span>
                          <strong className="payments__final-amount">{formatCurrency(invoice.finalAmount)}</strong>
                        </div>
                      </div>

                      <div className="payments__card-meta">
                        <span>Created: {formatDate(invoice.createdAt)}</span>
                        <span>Method: {invoice.paymentMethod || 'N/A'}</span>
                      </div>
                    </div>

                    {invoice.paymentStatus !== PaymentStatus.PAID && invoice.status !== InvoiceStatus.CANCELLED && (
                      <div className="payments__card-footer">
                        <button 
                          className="payments__action-btn payments__action-btn--confirm"
                          onClick={() => handlePayClick(invoice)}
                        >
                          <DollarSign size={16} />
                          Record Payment
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {!selectedMemberId && (
        <div className="payments__empty">
          <User size={48} />
          <h3>Select a member</h3>
          <p>Please select a member from the dropdown above to view their invoices.</p>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Invoice Details"
        size="md"
      >
        {selectedInvoice && (
          <div className="payments__detail">
            <div className="payments__detail-header">
              <div className="payments__detail-member">
                <FileText size={24} />
                <div>
                  <h3 className="payments__detail-name">Invoice #{selectedInvoice.invoiceId}</h3>
                  <p className="payments__detail-id">{selectedInvoice.memberName}</p>
                </div>
              </div>
              <div className="payments__detail-statuses">
                <span className={`payments__status ${getStatusConfig(selectedInvoice.status).className}`}>
                  {getStatusConfig(selectedInvoice.status).label}
                </span>
                <span className={`payments__payment-status ${getPaymentStatusConfig(selectedInvoice.paymentStatus).className}`}>
                  {getPaymentStatusConfig(selectedInvoice.paymentStatus).label}
                </span>
              </div>
            </div>

            <div className="payments__detail-info">
              <div className="payments__detail-row">
                <span className="payments__detail-label">Created Date</span>
                <span className="payments__detail-value">{formatDate(selectedInvoice.createdAt)}</span>
              </div>
              <div className="payments__detail-row">
                <span className="payments__detail-label">Payment Method</span>
                <span className="payments__detail-value">{selectedInvoice.paymentMethod || 'Not specified'}</span>
              </div>
              <div className="payments__detail-row">
                <span className="payments__detail-label">Created By</span>
                <span className="payments__detail-value">{selectedInvoice.createdBy}</span>
              </div>
              {selectedInvoice.updatedAt && (
                <div className="payments__detail-row">
                  <span className="payments__detail-label">Last Updated</span>
                  <span className="payments__detail-value">{formatDate(selectedInvoice.updatedAt)}</span>
                </div>
              )}
            </div>

            <div className="payments__detail-items">
              <h4>Service Details</h4>
              <table className="payments__detail-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.details.map((detail) => (
                    <tr key={detail.detailId}>
                      <td>{getItemDescription(detail)}</td>
                      <td>{detail.quantity}</td>
                      <td>{formatCurrency(detail.unitPrice)}</td>
                      <td>{formatCurrency(detail.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="payments__detail-summary">
              <div className="payments__detail-summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>
              {selectedInvoice.discountAmount > 0 && (
                <div className="payments__detail-summary-row">
                  <span>Discount</span>
                  <span className="payments__discount-amount">-{formatCurrency(selectedInvoice.discountAmount)}</span>
                </div>
              )}
              <div className="payments__detail-summary-row payments__detail-summary-row--total">
                <span>Total</span>
                <strong>{formatCurrency(selectedInvoice.finalAmount)}</strong>
              </div>
            </div>

            <div className="payments__detail-actions">
              <button 
                className="modal-form__btn modal-form__btn--secondary"
                onClick={() => handleDownload(selectedInvoice)}
              >
                <Download size={16} />
                Download
              </button>
              {selectedInvoice.paymentStatus !== PaymentStatus.PAID && selectedInvoice.status !== InvoiceStatus.CANCELLED && (
                <button 
                  className="modal-form__btn modal-form__btn--primary"
                  onClick={() => {
                    setShowDetailModal(false);
                    handlePayClick(selectedInvoice);
                  }}
                >
                  Record Payment
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}
        title="Record Payment"
        size="sm"
      >
        {selectedInvoice && (
          <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handlePayment(); }}>
            <div className="payments__payment-summary">
              <p>Invoice #{selectedInvoice.invoiceId}</p>
              <p>Total: <strong>{formatCurrency(selectedInvoice.finalAmount)}</strong></p>
            </div>

            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Amount</label>
              <input
                type="number"
                className="modal-form__input"
                value={paymentForm.amountPaid}
                onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: Number(e.target.value) })}
                min={0}
              />
            </div>

            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Payment Method</label>
              <select
                className="modal-form__select"
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
              >
                <option value="">Select Method</option>
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Payment Date</label>
              <input
                type="date"
                className="modal-form__input"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
              />
            </div>

            <div className="modal-form__group">
              <label className="modal-form__label">Notes</label>
              <textarea
                className="modal-form__textarea"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="modal-form__actions">
              <button 
                type="button" 
                className="modal-form__btn modal-form__btn--secondary"
                onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="modal-form__btn modal-form__btn--primary"
                disabled={isSubmitting || !paymentForm.paymentMethod || paymentForm.amountPaid <= 0}
              >
                {isSubmitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Payments;
