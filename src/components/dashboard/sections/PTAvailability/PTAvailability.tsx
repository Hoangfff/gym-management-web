import { useState, useEffect } from 'react';
import { Plus, Clock, X, RefreshCw, Calendar } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { useToast, ConfirmModal } from '../../../ui/index.ts';
import { availableSlotApi, slotApi, ptApi } from '../../../../services/index.ts';
import type { 
  ApiPtAvailableSlot,
  DayOfWeekEnum,
  ApiTimeSlot,
  ApiPersonalTrainer
} from '../../../../types/api.ts';
import './PTAvailability.css';

const DAY_ORDER: Record<DayOfWeekEnum, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7
};

function PTAvailabilitySection() {
  const { showToast } = useToast();
  
  // Data states
  const [availableSlots, setAvailableSlots] = useState<ApiPtAvailableSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<ApiTimeSlot[]>([]);
  const [pts, setPts] = useState<ApiPersonalTrainer[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        availableSlotApi.getMyAvailableSlots(),
        slotApi.getAll(),
        ptApi.getAll()
      ]);
      
      // Handle nested data structure from API
      const slotsData = slotsRes.data?.data || [];
      setAvailableSlots(slotsData);
      setTimeSlots(timeSlotsRes.data || []);
      setPts(ptsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stats - group by day of week
  const slotsByDay = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<DayOfWeekEnum, ApiPtAvailableSlot[]>);

  const stats = {
    total: availableSlots.length,
    days: Object.keys(slotsByDay).length,
    monday: slotsByDay.MONDAY?.length || 0,
    wednesday: slotsByDay.WEDNESDAY?.length || 0
  };

  // Sort days by day order
  const sortedDays = Object.keys(slotsByDay).sort((a, b) => 
    DAY_ORDER[a as DayOfWeekEnum] - DAY_ORDER[b as DayOfWeekEnum]
  ) as DayOfWeekEnum[];

  const handleCreateSlot = async () => {
    if (!formData.ptId || !formData.slotId || !formData.availableDate) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
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
        title: 'Success',
        message: 'Added available slot'
      });
      
      setIsAddModalOpen(false);
      setFormData({ ptId: 0, slotId: 0, availableDate: '' });
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to create slot:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to create slot'
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
        title: 'Success',
        message: 'Deleted slot'
      });
      setShowDeleteModal(false);
      setSelectedSlotId(null);
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to delete slot:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to delete slot'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayLabel = (day: DayOfWeekEnum): string => {
    const labels: Record<DayOfWeekEnum, string> = {
      MONDAY: 'Monday',
      TUESDAY: 'Tuesday',
      WEDNESDAY: 'Wednesday',
      THURSDAY: 'Thursday',
      FRIDAY: 'Friday',
      SATURDAY: 'Saturday',
      SUNDAY: 'Sunday'
    };
    return labels[day];
  };

  const formatTime = (timeStr: string) => {
    // HH:mm:ss -> HH:mm
    return timeStr.substring(0, 5);
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
          <span className="stat-box__label">Active Days</span>
          <span className="stat-box__value stat-box__value--green">{stats.days}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Monday Slots</span>
          <span className="stat-box__value stat-box__value--blue">{stats.monday}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Wednesday Slots</span>
          <span className="stat-box__value stat-box__value--purple">{stats.wednesday}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="pt-availability__loading">
          <RefreshCw size={32} className="spinning" />
          <p>Loading availability...</p>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="pt-availability__empty">
          <Calendar size={48} />
          <h3>No availability slots configured</h3>
          <p>Add your available time slots to let members book sessions with you.</p>
        </div>
      ) : (
        <div className="pt-availability__schedule">
          {sortedDays.map(day => (
            <div key={day} className="pt-availability__day">
              <div className="pt-availability__day-header">
                <span className="pt-availability__day-name">{getDayLabel(day)}</span>
                <span className="pt-availability__day-count">
                  {slotsByDay[day].length} slot{slotsByDay[day].length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="pt-availability__day-slots">
                {slotsByDay[day].map(slot => (
                  <div key={slot.id} className="pt-availability__slot-chip">
                    <Clock size={14} />
                    <span className="pt-availability__slot-name">{slot.slot.slotName}</span>
                    <span className="pt-availability__slot-time">
                      {formatTime(slot.slot.startTime)} - {formatTime(slot.slot.endTime)}
                    </span>
                    <span className={`pt-availability__status ${slot.isAvailable ? 'pt-availability__status--available' : 'pt-availability__status--unavailable'}`}>
                      {slot.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                    <button 
                      className="pt-availability__slot-remove"
                      onClick={() => handleDeleteClick(slot.id)}
                      title="Remove slot"
                    >
                      <X size={14} />
                    </button>
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
