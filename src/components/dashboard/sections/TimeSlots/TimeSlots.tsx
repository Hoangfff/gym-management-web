import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Power, Eye } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { ConfirmModal, useToast } from '../../../ui/index.ts';
import { slotApi } from '../../../../services/index.ts';
import type { ApiTimeSlot, ReqCreateSlotDTO, ReqUpdateSlotDTO } from '../../../../types/api.ts';
import './TimeSlots.css';

interface TimeSlotsProps {
  userRole: 'admin' | 'pt';
}

// Helper to format time from HH:mm:ss to HH:mm AM/PM
const formatTimeDisplay = (time: string): string => {
  if (!time) return '-';
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Helper to calculate duration
const calculateDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return '-';
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const diff = endMinutes - startMinutes;
  if (diff <= 0) return '-';
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
};

// Helper to convert HH:mm to HH:mm:ss for API
const formatTimeForApi = (time: string): string => {
  if (!time) return '';
  if (time.includes(':') && time.split(':').length === 2) {
    return `${time}:00`;
  }
  return time;
};

function TimeSlots({ userRole }: TimeSlotsProps) {
  void userRole; // Reserved for future role-based features
  const { showToast } = useToast();

  // Data state
  const [timeSlots, setTimeSlots] = useState<ApiTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ApiTimeSlot | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ApiTimeSlot | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    slotName: '',
    startTime: '',
    endTime: ''
  });

  // Fetch time slots on mount
  useEffect(() => {
    fetchTimeSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTimeSlots = async () => {
    setIsLoading(true);
    try {
      const response = await slotApi.getAll();
      setTimeSlots(response.data);
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load time slots list'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stats
  const totalSlots = timeSlots.length;
  const activeSlots = timeSlots.filter(s => s.isActive).length;
  const inactiveSlots = timeSlots.filter(s => !s.isActive).length;

  const handleAddSlot = async () => {
    if (!formData.slotName || !formData.startTime || !formData.endTime) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData: ReqCreateSlotDTO = {
        slotName: formData.slotName,
        startTime: formatTimeForApi(formData.startTime),
        endTime: formatTimeForApi(formData.endTime)
      };

      await slotApi.create(requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Added new time slot'
      });

      setIsAddModalOpen(false);
      resetForm();
      fetchTimeSlots();
    } catch (error: unknown) {
      console.error('Failed to create slot:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to add time slot'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSlot = async () => {
    if (!editingSlot) return;

    setIsSubmitting(true);
    try {
      const requestData: ReqUpdateSlotDTO = {
        slotName: formData.slotName,
        startTime: formatTimeForApi(formData.startTime),
        endTime: formatTimeForApi(formData.endTime)
      };

      await slotApi.update(editingSlot.id, requestData);

      showToast({
        type: 'success',
        title: 'Success',
        message: 'Updated time slot'
      });

      setIsEditModalOpen(false);
      setEditingSlot(null);
      resetForm();
      fetchTimeSlots();
    } catch (error: unknown) {
      console.error('Failed to update slot:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to update time slot'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    try {
      await slotApi.delete(selectedSlot.id);

      showToast({
        type: 'success',
        title: 'Success',
        message: `Deleted time slot ${selectedSlot.slotName}`
      });

      setIsDeleteModalOpen(false);
      setSelectedSlot(null);
      fetchTimeSlots();
    } catch (error: unknown) {
      console.error('Failed to delete slot:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to delete time slot'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateSlot = async (slot: ApiTimeSlot) => {
    try {
      await slotApi.activate(slot.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: `Activated time slot ${slot.slotName}`
      });
      fetchTimeSlots();
    } catch (error: unknown) {
      console.error('Failed to activate slot:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to activate time slot'
      });
    }
  };

  const handleViewSlot = async (slot: ApiTimeSlot) => {
    try {
      const response = await slotApi.getById(slot.id);
      setSelectedSlot(response.data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch slot details:', error);
      setSelectedSlot(slot);
      setIsViewModalOpen(true);
    }
  };

  const openEditModal = (slot: ApiTimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      slotName: slot.slotName,
      startTime: slot.startTime.substring(0, 5), // Convert HH:mm:ss to HH:mm
      endTime: slot.endTime.substring(0, 5)
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (slot: ApiTimeSlot) => {
    setSelectedSlot(slot);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      slotName: '',
      startTime: '',
      endTime: ''
    });
  };

  return (
    <div className="time-slots">
      <div className="time-slots__header">
        <div>
          <h1 className="time-slots__title">Time Slots</h1>
          <p className="time-slots__subtitle">Manage available time slots for bookings</p>
        </div>
        <div className="time-slots__header-actions">
          <button
            className="time-slots__refresh-btn"
            onClick={fetchTimeSlots}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          <button className="time-slots__create-btn" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} />
            Add Time Slot
          </button>
        </div>
      </div>

      <div className="time-slots__stats">
        <div className="stat-box">
          <span className="stat-box__label">Total Slots</span>
          <span className="stat-box__value">{totalSlots}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Active Slots</span>
          <span className="stat-box__value">{activeSlots}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Inactive Slots</span>
          <span className="stat-box__value">{inactiveSlots}</span>
        </div>
      </div>

      <div className="time-slots__table-container">
        {isLoading ? (
          <div className="time-slots__loading">
            <RefreshCw size={32} className="spinning" />
            <p>Loading time slots...</p>
          </div>
        ) : (
          <table className="time-slots__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SLOT NAME</th>
                <th>START TIME</th>
                <th>END TIME</th>
                <th>DURATION</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="time-slots__empty">
                    No time slots found
                  </td>
                </tr>
              ) : (
                timeSlots.map(slot => (
                  <tr key={slot.id} className={!slot.isActive ? 'time-slots__row--inactive' : ''}>
                    <td>#{slot.id}</td>
                    <td className="time-slots__name">{slot.slotName}</td>
                    <td>{formatTimeDisplay(slot.startTime)}</td>
                    <td>{formatTimeDisplay(slot.endTime)}</td>
                    <td className="time-slots__duration">
                      {calculateDuration(slot.startTime, slot.endTime)}
                    </td>
                    <td>
                      <span className={`time-slots__status time-slots__status--${slot.isActive ? 'active' : 'inactive'}`}>
                        {slot.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="time-slots__actions">
                        <button
                          className="time-slots__action-btn"
                          onClick={() => handleViewSlot(slot)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="time-slots__action-btn"
                          onClick={() => openEditModal(slot)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        {!slot.isActive && (
                          <button
                            className="time-slots__action-btn time-slots__action-btn--activate"
                            onClick={() => handleActivateSlot(slot)}
                            title="Activate"
                          >
                            <Power size={16} />
                          </button>
                        )}
                        <button
                          className="time-slots__action-btn time-slots__action-btn--delete"
                          onClick={() => openDeleteModal(slot)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Time Slot Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); resetForm(); }} title="Add New Time Slot">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleAddSlot(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Slot Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g., Morning, Afternoon"
              value={formData.slotName}
              onChange={(e) => setFormData({ ...formData, slotName: e.target.value })}
              required
            />
          </div>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Start Time</label>
              <input
                type="time"
                className="modal-form__input"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">End Time</label>
              <input
                type="time"
                className="modal-form__input"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          {formData.startTime && formData.endTime && (
            <div className="time-slots__duration-preview">
              Duration: <strong>{calculateDuration(formData.startTime + ':00', formData.endTime + ':00')}</strong>
            </div>
          )}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Slot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Time Slot Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingSlot(null); resetForm(); }} title="Edit Time Slot">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleEditSlot(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Slot Name</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.slotName}
              onChange={(e) => setFormData({ ...formData, slotName: e.target.value })}
              required
            />
          </div>
          <div className="modal-form__row">
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Start Time</label>
              <input
                type="time"
                className="modal-form__input"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">End Time</label>
              <input
                type="time"
                className="modal-form__input"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          {formData.startTime && formData.endTime && (
            <div className="time-slots__duration-preview">
              Duration: <strong>{calculateDuration(formData.startTime + ':00', formData.endTime + ':00')}</strong>
            </div>
          )}
          <div className="modal-form__actions">
            <button
              type="button"
              className="modal-form__btn modal-form__btn--secondary"
              onClick={() => { setIsEditModalOpen(false); setEditingSlot(null); resetForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-form__btn modal-form__btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Slot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Time Slot Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedSlot(null); }} title="Time Slot Details">
        {selectedSlot && (
          <div className="time-slots__view-modal">
            <div className="time-slots__view-grid">
              <div className="time-slots__view-item">
                <span className="time-slots__view-label">ID</span>
                <span className="time-slots__view-value">#{selectedSlot.id}</span>
              </div>
              <div className="time-slots__view-item">
                <span className="time-slots__view-label">Slot Name</span>
                <span className="time-slots__view-value">{selectedSlot.slotName}</span>
              </div>
              <div className="time-slots__view-item">
                <span className="time-slots__view-label">Start Time</span>
                <span className="time-slots__view-value">{formatTimeDisplay(selectedSlot.startTime)}</span>
              </div>
              <div className="time-slots__view-item">
                <span className="time-slots__view-label">End Time</span>
                <span className="time-slots__view-value">{formatTimeDisplay(selectedSlot.endTime)}</span>
              </div>
              <div className="time-slots__view-item">
                <span className="time-slots__view-label">Duration</span>
                <span className="time-slots__view-value">{calculateDuration(selectedSlot.startTime, selectedSlot.endTime)}</span>
              </div>
              <div className="time-slots__view-item">
                <span className="time-slots__view-label">Status</span>
                <span className={`time-slots__status time-slots__status--${selectedSlot.isActive ? 'active' : 'inactive'}`}>
                  {selectedSlot.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="time-slots__view-item">
                <span className="time-slots__view-label">Created By</span>
                <span className="time-slots__view-value">{selectedSlot.createdBy || '-'}</span>
              </div>
              <div className="time-slots__view-item">
                <span className="time-slots__view-label">Created At</span>
                <span className="time-slots__view-value">{new Date(selectedSlot.createdAt).toLocaleString('vi-VN')}</span>
              </div>
              {selectedSlot.updatedAt && (
                <div className="time-slots__view-item">
                  <span className="time-slots__view-label">Updated At</span>
                  <span className="time-slots__view-value">{new Date(selectedSlot.updatedAt).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedSlot(null); }}
        onConfirm={handleDeleteSlot}
        title="Delete Time Slot"
        message={`Are you sure you want to delete "${selectedSlot?.slotName}"? This will set the slot to inactive.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default TimeSlots;
