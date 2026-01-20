import { useState, useEffect } from 'react';
import { Plus, Clock, X, RefreshCw, Calendar, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { useToast, ConfirmModal } from '../../../ui/index.ts';
import { availableSlotApi, slotApi } from '../../../../services/index.ts';
import type { 
  ApiUserAvailableSlot,
  DayOfWeekEnum,
  ApiTimeSlot
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

const DAYS_OF_WEEK: { value: DayOfWeekEnum; label: string }[] = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' }
];

function PTAvailabilitySection() {
  const { showToast } = useToast();
  
  // Get user ID from localStorage or sessionStorage (from login)
  const getUserId = (): number | null => {
    const userIdStr = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    return userIdStr ? parseInt(userIdStr, 10) : null;
  };

  // Data states
  const [availableSlots, setAvailableSlots] = useState<ApiUserAvailableSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<ApiTimeSlot[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ApiUserAvailableSlot | null>(null);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  
  // Form state for create/edit
  const [formData, setFormData] = useState({
    slotId: 0,
    dayOfWeek: '' as DayOfWeekEnum | ''
  });

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const userId = getUserId();
      if (!userId) {
        showToast({
          type: 'error',
          title: 'Error',
          message: 'User ID not found. Please login again.'
        });
        setIsLoading(false);
        return;
      }

      const [slotsRes, timeSlotsRes] = await Promise.all([
        availableSlotApi.getAllSlotsByUserId(userId),
        slotApi.getAll()
      ]);
      
      setAvailableSlots(slotsRes.data || []);
      setTimeSlots(timeSlotsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load availability data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter slots based on toggle
  const filteredSlots = showOnlyAvailable 
    ? availableSlots.filter(slot => slot.isAvailable)
    : availableSlots;

  // Stats - group by day of week
  const slotsByDay = filteredSlots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<DayOfWeekEnum, ApiUserAvailableSlot[]>);

  const availableCount = availableSlots.filter(s => s.isAvailable).length;
  const unavailableCount = availableSlots.filter(s => !s.isAvailable).length;

  const stats = {
    total: filteredSlots.length,
    available: availableCount,
    unavailable: unavailableCount,
    days: Object.keys(slotsByDay).length
  };

  // Sort days by day order
  const sortedDays = Object.keys(slotsByDay).sort((a, b) => 
    DAY_ORDER[a as DayOfWeekEnum] - DAY_ORDER[b as DayOfWeekEnum]
  ) as DayOfWeekEnum[];

  // Reset form
  const resetForm = () => {
    setFormData({ slotId: 0, dayOfWeek: '' });
  };

  // Create new slot
  const handleCreateSlot = async () => {
    if (!formData.slotId || !formData.dayOfWeek) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please select time slot and day of week'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await availableSlotApi.createMySlot({
        slotId: formData.slotId,
        dayOfWeek: formData.dayOfWeek as DayOfWeekEnum
      });
      
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Added new availability slot'
      });
      
      setIsAddModalOpen(false);
      resetForm();
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

  // Open edit modal
  const openEditModal = (slot: ApiUserAvailableSlot) => {
    setSelectedSlot(slot);
    setFormData({
      slotId: slot.slot.slotId,
      dayOfWeek: slot.dayOfWeek
    });
    setIsEditModalOpen(true);
  };

  // Update slot
  const handleUpdateSlot = async () => {
    if (!selectedSlot || !formData.slotId || !formData.dayOfWeek) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await availableSlotApi.updateUserSlot(selectedSlot.id, {
        slotId: formData.slotId,
        dayOfWeek: formData.dayOfWeek as DayOfWeekEnum
      });
      
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Updated availability slot'
      });
      
      setIsEditModalOpen(false);
      setSelectedSlot(null);
      resetForm();
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to update slot:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to update slot'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle availability status
  const handleToggleAvailability = async (slot: ApiUserAvailableSlot) => {
    setIsSubmitting(true);
    try {
      if (slot.isAvailable) {
        await availableSlotApi.setUnavailable(slot.id);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Slot marked as unavailable'
        });
      } else {
        await availableSlotApi.setAvailable(slot.id);
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Slot marked as available'
        });
      }
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to toggle availability:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to update availability'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete click handler
  const handleDeleteClick = (slot: ApiUserAvailableSlot) => {
    setSelectedSlot(slot);
    setShowDeleteModal(true);
  };

  // Delete slot
  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;
    
    setIsSubmitting(true);
    try {
      await availableSlotApi.delete(selectedSlot.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Deleted availability slot'
      });
      setShowDeleteModal(false);
      setSelectedSlot(null);
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
          <h1 className="pt-availability__title">My Availability</h1>
          <p className="pt-availability__subtitle">Manage your available time slots for booking</p>
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
          <span className="stat-box__label">Unavailable</span>
          <span className="stat-box__value stat-box__value--red">{stats.unavailable}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Active Days</span>
          <span className="stat-box__value stat-box__value--blue">{stats.days}</span>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="pt-availability__filter">
        <label className="pt-availability__filter-label">
          <input
            type="checkbox"
            className="pt-availability__filter-checkbox"
            checked={showOnlyAvailable}
            onChange={(e) => setShowOnlyAvailable(e.target.checked)}
          />
          <span className="pt-availability__filter-text">Show only available slots</span>
        </label>
        <span className="pt-availability__filter-info">
          Showing {filteredSlots.length} of {availableSlots.length} slots
        </span>
      </div>

      {isLoading ? (
        <div className="pt-availability__loading">
          <RefreshCw size={32} className="spinning" />
          <p>Loading availability...</p>
        </div>
      ) : filteredSlots.length === 0 && !showOnlyAvailable ? (
        <div className="pt-availability__empty">
          <Calendar size={48} />
          <h3>No availability slots configured</h3>
          <p>Add your available time slots to let members book sessions with you.</p>
          <button className="pt-availability__create-btn" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} />
            Add Your First Slot
          </button>
        </div>
      ) : filteredSlots.length === 0 && showOnlyAvailable ? (
        <div className="pt-availability__empty">
          <Calendar size={48} />
          <h3>No available slots</h3>
          <p>All your slots are currently marked as unavailable. Toggle the filter to see all slots.</p>
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
                  <div key={slot.id} className={`pt-availability__slot-chip ${!slot.isAvailable ? 'pt-availability__slot-chip--unavailable' : ''}`}>
                    <Clock size={14} />
                    <span className="pt-availability__slot-name">{slot.slot.slotName}</span>
                    <span className="pt-availability__slot-time">
                      {formatTime(slot.slot.startTime)} - {formatTime(slot.slot.endTime)}
                    </span>
                    <button 
                      className={`pt-availability__toggle-btn ${slot.isAvailable ? 'pt-availability__toggle-btn--available' : 'pt-availability__toggle-btn--unavailable'}`}
                      onClick={() => handleToggleAvailability(slot)}
                      disabled={isSubmitting}
                      title={slot.isAvailable ? 'Click to set unavailable' : 'Click to set available'}
                    >
                      {slot.isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      <span>{slot.isAvailable ? 'Available' : 'Unavailable'}</span>
                    </button>
                    <button 
                      className="pt-availability__slot-edit"
                      onClick={() => openEditModal(slot)}
                      title="Edit slot"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      className="pt-availability__slot-remove"
                      onClick={() => handleDeleteClick(slot)}
                      title="Delete slot"
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
        onClose={() => { setIsAddModalOpen(false); resetForm(); }} 
        title="Add Availability" 
        size="md"
      >
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleCreateSlot(); }}>
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
                  {slot.slotName} ({formatTime(slot.startTime)} - {formatTime(slot.endTime)})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Day of Week</label>
            <select
              className="modal-form__select"
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeekEnum })}
            >
              <option value="">Select Day</option>
              {DAYS_OF_WEEK.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form__actions">
            <button 
              type="button" 
              className="modal-form__btn modal-form__btn--secondary" 
              onClick={() => { setIsAddModalOpen(false); resetForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting || !formData.slotId || !formData.dayOfWeek}
            >
              {isSubmitting ? 'Adding...' : 'Add Availability'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Availability Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setSelectedSlot(null); resetForm(); }} 
        title="Edit Availability" 
        size="md"
      >
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleUpdateSlot(); }}>
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
                  {slot.slotName} ({formatTime(slot.startTime)} - {formatTime(slot.endTime)})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Day of Week</label>
            <select
              className="modal-form__select"
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeekEnum })}
            >
              <option value="">Select Day</option>
              {DAYS_OF_WEEK.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form__actions">
            <button 
              type="button" 
              className="modal-form__btn modal-form__btn--secondary" 
              onClick={() => { setIsEditModalOpen(false); setSelectedSlot(null); resetForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting || !formData.slotId || !formData.dayOfWeek}
            >
              {isSubmitting ? 'Updating...' : 'Update Slot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedSlot(null); }}
        onConfirm={handleDeleteSlot}
        title="Delete Availability Slot"
        message={selectedSlot 
          ? `Are you sure you want to delete the slot "${selectedSlot.slot.slotName}" on ${getDayLabel(selectedSlot.dayOfWeek)}? This action cannot be undone.`
          : 'Are you sure you want to delete this slot?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default PTAvailabilitySection;
