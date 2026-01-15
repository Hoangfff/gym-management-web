import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { TimeSlot } from '../../../../types/index.ts';
import './TimeSlots.css';

interface TimeSlotsProps {
  userRole: 'admin' | 'pt';
}

// Mock time slots
const mockTimeSlots: TimeSlot[] = [
  { id: '1', name: 'Early Morning', startTime: '6:00 AM', endTime: '8:00 AM', duration: '2h' },
  { id: '2', name: 'Morning', startTime: '8:00 AM', endTime: '10:00 AM', duration: '2h' },
  { id: '3', name: 'Late Morning', startTime: '10:00 AM', endTime: '12:00 PM', duration: '2h' },
  { id: '4', name: 'Lunch Time', startTime: '12:00 PM', endTime: '2:00 PM', duration: '2h' },
  { id: '5', name: 'Afternoon', startTime: '2:00 PM', endTime: '4:00 PM', duration: '2h' },
  { id: '6', name: 'Late Afternoon', startTime: '4:00 PM', endTime: '6:00 PM', duration: '2h' },
  { id: '7', name: 'Evening', startTime: '6:00 PM', endTime: '8:00 PM', duration: '2h' },
  { id: '8', name: 'Night', startTime: '8:00 PM', endTime: '10:00 PM', duration: '2h' },
];

const initialFormData = {
  name: '',
  startTime: '',
  endTime: ''
};

function TimeSlots({ userRole: _userRole }: TimeSlotsProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(mockTimeSlots);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  // Stats
  const totalSlots = timeSlots.length;
  const morningSlots = timeSlots.filter(s => {
    const hour = parseInt(s.startTime);
    return hour >= 6 && hour < 12;
  }).length;
  const eveningSlots = timeSlots.filter(s => {
    const hour = parseInt(s.startTime);
    return hour >= 18;
  }).length;

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const diff = endMinutes - startMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  };

  const formatTimeForDisplay = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleAddSlot = () => {
    const newSlot: TimeSlot = {
      id: String(timeSlots.length + 1),
      name: formData.name,
      startTime: formatTimeForDisplay(formData.startTime),
      endTime: formatTimeForDisplay(formData.endTime),
      duration: calculateDuration(formData.startTime, formData.endTime)
    };
    setTimeSlots([...timeSlots, newSlot]);
    setIsAddModalOpen(false);
    setFormData(initialFormData);
  };

  const handleEditSlot = () => {
    if (!editingSlot) return;
    setTimeSlots(timeSlots.map(slot =>
      slot.id === editingSlot.id
        ? {
            ...slot,
            name: formData.name,
            startTime: formatTimeForDisplay(formData.startTime),
            endTime: formatTimeForDisplay(formData.endTime),
            duration: calculateDuration(formData.startTime, formData.endTime)
          }
        : slot
    ));
    setIsEditModalOpen(false);
    setEditingSlot(null);
    setFormData(initialFormData);
  };

  const handleDeleteSlot = (slotId: string) => {
    if (confirm('Are you sure you want to delete this time slot?')) {
      setTimeSlots(timeSlots.filter(slot => slot.id !== slotId));
    }
  };

  const openEditModal = (slot: TimeSlot) => {
    setEditingSlot(slot);
    // Convert display time back to 24h format for input
    setFormData({
      name: slot.name,
      startTime: '06:00', // This should be parsed from slot.startTime
      endTime: '08:00' // This should be parsed from slot.endTime
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="time-slots">
      <div className="time-slots__header">
        <div>
          <h1 className="time-slots__title">Time Slots</h1>
          <p className="time-slots__subtitle">Manage available time slots for bookings</p>
        </div>
        <button className="time-slots__create-btn" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={20} />
          Add Time Slot
        </button>
      </div>

      <div className="time-slots__stats">
        <div className="stat-box">
          <span className="stat-box__label">Total Slots</span>
          <span className="stat-box__value">{totalSlots}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Morning Slots</span>
          <span className="stat-box__value">{morningSlots}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Evening Slots</span>
          <span className="stat-box__value">{eveningSlots}</span>
        </div>
      </div>

      <div className="time-slots__table-container">
        <table className="time-slots__table">
          <thead>
            <tr>
              <th>SLOT NAME</th>
              <th>START TIME</th>
              <th>END TIME</th>
              <th>DURATION</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <tr key={slot.id}>
                <td className="time-slots__name">{slot.name}</td>
                <td>{slot.startTime}</td>
                <td>{slot.endTime}</td>
                <td className="time-slots__duration">{slot.duration}</td>
                <td>
                  <div className="time-slots__actions">
                    <button 
                      className="time-slots__action-btn"
                      onClick={() => openEditModal(slot)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      className="time-slots__action-btn time-slots__action-btn--delete"
                      onClick={() => handleDeleteSlot(slot.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Time Slot Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Time Slot">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleAddSlot(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Slot Name</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="e.g., Morning, Afternoon"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <div className="modal-form__actions">
            <button type="button" className="modal-form__btn modal-form__btn--secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="modal-form__btn modal-form__btn--primary">
              Add Slot
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Time Slot Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Time Slot">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleEditSlot(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Slot Name</label>
            <input
              type="text"
              className="modal-form__input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              Duration: <strong>{calculateDuration(formData.startTime, formData.endTime)}</strong>
            </div>
          )}
          <div className="modal-form__actions">
            <button type="button" className="modal-form__btn modal-form__btn--secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="modal-form__btn modal-form__btn--primary">
              Update Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TimeSlots;
