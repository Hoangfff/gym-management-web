import { useState, useEffect } from 'react';
import { Plus, Clock, X, RefreshCw, Calendar } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { useToast, ConfirmModal } from '../../../ui/index.ts';
import { availableSlotApi, slotApi, ptApi } from '../../../../services/index.ts';
import type { 
  ApiAvailableSlot, 
  AvailableSlotStatusEnum,
  ApiTimeSlot,
  ApiPersonalTrainer
} from '../../../../types/api.ts';
import './PTAvailability.css';

const AvailableSlotStatus = {
  AVAILABLE: 'AVAILABLE' as AvailableSlotStatusEnum,
  BOOKED: 'BOOKED' as AvailableSlotStatusEnum,
  CANCELLED: 'CANCELLED' as AvailableSlotStatusEnum
};

const STATUS_OPTIONS: { value: AvailableSlotStatusEnum | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

function PTAvailabilitySection() {
  const { showToast } = useToast();
  
  // Data states
  const [availableSlots, setAvailableSlots] = useState<ApiAvailableSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<ApiTimeSlot[]>([]);
  const [pts, setPts] = useState<ApiPersonalTrainer[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AvailableSlotStatusEnum | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    ptId: 0,
    slotId: 0,
    availableDate: ''
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [slotsRes, timeSlotsRes, ptsRes] = await Promise.all([
        availableSlotApi.getAll(),
        slotApi.getAll(),
        ptApi.getAll()
      ]);
      
      setAvailableSlots(slotsRes.data?.result || []);
      setTimeSlots(timeSlotsRes.data || []);
      setPts(ptsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải dữ liệu'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stats
  const stats = {
    total: availableSlots.length,
    available: availableSlots.filter(s => s.status === AvailableSlotStatus.AVAILABLE).length,
    booked: availableSlots.filter(s => s.status === AvailableSlotStatus.BOOKED).length,
    cancelled: availableSlots.filter(s => s.status === AvailableSlotStatus.CANCELLED).length
  };

  // Filter slots
  const filteredSlots = availableSlots.filter(slot => {
    if (statusFilter === 'all') return true;
    return slot.status === statusFilter;
  });

  // Group by date
  const slotsByDate = filteredSlots.reduce((acc, slot) => {
    const date = slot.availableDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, ApiAvailableSlot[]>);

  const sortedDates = Object.keys(slotsByDate).sort();

  const handleCreateSlot = async () => {
    if (!formData.ptId || !formData.slotId || !formData.availableDate) {
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ thông tin'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await availableSlotApi.create({
        ptId: formData.ptId,
        slotId: formData.slotId,
        availableDate: formData.availableDate
      });
      
      showToast({
        type: 'success',
        title: 'Thành công',
        message: 'Đã thêm slot khả dụng'
      });
      
      setIsAddModalOpen(false);
      setFormData({ ptId: 0, slotId: 0, availableDate: '' });
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to create slot:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể tạo slot'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedSlotId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlotId) return;
    
    setIsSubmitting(true);
    try {
      await availableSlotApi.delete(selectedSlotId);
      showToast({
        type: 'success',
        title: 'Thành công',
        message: 'Đã xóa slot'
      });
      setShowDeleteModal(false);
      setSelectedSlotId(null);
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to delete slot:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể xóa slot'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: AvailableSlotStatusEnum) => {
    switch (status) {
      case 'AVAILABLE': return 'pt-availability__status--available';
      case 'BOOKED': return 'pt-availability__status--booked';
      case 'CANCELLED': return 'pt-availability__status--cancelled';
      default: return '';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="pt-availability">
      <div className="pt-availability__header">
        <div>
          <h1 className="pt-availability__title">PT Availability</h1>
          <p className="pt-availability__subtitle">Manage personal trainer available time slots</p>
        </div>
        <div className="pt-availability__header-actions">
          <button 
            className="pt-availability__refresh-btn" 
            onClick={fetchData}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          <button className="pt-availability__create-btn" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} />
            Add Availability
          </button>
        </div>
      </div>

      <div className="pt-availability__stats">
        <div className="stat-box">
          <span className="stat-box__label">Total Slots</span>
          <span className="stat-box__value">{stats.total}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Available</span>
          <span className="stat-box__value stat-box__value--green">{stats.available}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Booked</span>
          <span className="stat-box__value stat-box__value--blue">{stats.booked}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Cancelled</span>
          <span className="stat-box__value stat-box__value--red">{stats.cancelled}</span>
        </div>
      </div>

      <div className="pt-availability__filters">
        <select 
          className="pt-availability__filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AvailableSlotStatusEnum | 'all')}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="pt-availability__loading">
          <RefreshCw size={32} className="spinning" />
          <p>Loading availability...</p>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="pt-availability__empty">
          <Calendar size={48} />
          <h3>No availability slots found</h3>
          <p>Add new availability slots to get started.</p>
        </div>
      ) : (
        <div className="pt-availability__schedule">
          {sortedDates.map(date => (
            <div key={date} className="pt-availability__day">
              <div className="pt-availability__day-header">
                <span className="pt-availability__day-name">{formatDate(date)}</span>
                <span className="pt-availability__day-count">
                  {slotsByDate[date].length} slot{slotsByDate[date].length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="pt-availability__day-slots">
                {slotsByDate[date].map(slot => (
                  <div key={slot.id} className="pt-availability__slot-chip">
                    <Clock size={14} />
                    <span className="pt-availability__slot-name">{slot.slotCode}</span>
                    <span className="pt-availability__slot-time">{slot.slotDescription}</span>
                    <span className="pt-availability__slot-pt">PT: {slot.ptName}</span>
                    <span className={`pt-availability__status ${getStatusBadgeClass(slot.status)}`}>
                      {slot.status}
                    </span>
                    {slot.status === 'AVAILABLE' && (
                      <button 
                        className="pt-availability__slot-remove"
                        onClick={() => handleDeleteClick(slot.id)}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Availability Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => { setIsAddModalOpen(false); setFormData({ ptId: 0, slotId: 0, availableDate: '' }); }} 
        title="Add Availability" 
        size="md"
      >
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleCreateSlot(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Personal Trainer</label>
            <select
              className="modal-form__select"
              value={formData.ptId}
              onChange={(e) => setFormData({ ...formData, ptId: Number(e.target.value) })}
            >
              <option value={0}>Select PT</option>
              {pts.map(pt => (
                <option key={pt.id} value={pt.id}>
                  {pt.user.fullname}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Time Slot</label>
            <select
              className="modal-form__select"
              value={formData.slotId}
              onChange={(e) => setFormData({ ...formData, slotId: Number(e.target.value) })}
            >
              <option value={0}>Select Time Slot</option>
              {timeSlots.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.slotName} ({slot.startTime} - {slot.endTime})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Available Date</label>
            <input
              type="date"
              className="modal-form__input"
              value={formData.availableDate}
              onChange={(e) => setFormData({ ...formData, availableDate: e.target.value })}
            />
          </div>

          <div className="modal-form__actions">
            <button 
              type="button" 
              className="modal-form__btn modal-form__btn--secondary" 
              onClick={() => { setIsAddModalOpen(false); setFormData({ ptId: 0, slotId: 0, availableDate: '' }); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting || !formData.ptId || !formData.slotId || !formData.availableDate}
            >
              {isSubmitting ? 'Adding...' : 'Add Availability'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedSlotId(null); }}
        onConfirm={handleDeleteSlot}
        title="Delete Availability Slot"
        message="Are you sure you want to delete this availability slot? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default PTAvailabilitySection;
