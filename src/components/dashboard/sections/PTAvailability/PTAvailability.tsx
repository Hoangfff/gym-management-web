import { useState } from 'react';
import { Plus, Clock, X } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { TimeSlot, DayOfWeek, PTAvailability } from '../../../../types/index.ts';
import './PTAvailability.css';

// Mock time slots
const availableTimeSlots: TimeSlot[] = [
  { id: '1', name: 'Early Morning', startTime: '6:00 AM', endTime: '8:00 AM', duration: '2h' },
  { id: '2', name: 'Morning', startTime: '8:00 AM', endTime: '10:00 AM', duration: '2h' },
  { id: '3', name: 'Late Morning', startTime: '10:00 AM', endTime: '12:00 PM', duration: '2h' },
  { id: '4', name: 'Lunch Time', startTime: '12:00 PM', endTime: '2:00 PM', duration: '2h' },
  { id: '5', name: 'Afternoon', startTime: '2:00 PM', endTime: '4:00 PM', duration: '2h' },
  { id: '6', name: 'Late Afternoon', startTime: '4:00 PM', endTime: '6:00 PM', duration: '2h' },
  { id: '7', name: 'Evening', startTime: '6:00 PM', endTime: '8:00 PM', duration: '2h' },
  { id: '8', name: 'Night', startTime: '8:00 PM', endTime: '10:00 PM', duration: '2h' },
];

// Mock PT availability
const mockAvailability: PTAvailability[] = [
  { id: '1', ptId: 'PT001', slotId: '2', slotName: 'Morning', slotTime: '8:00 AM - 10:00 AM', day: 'monday', fromDate: '2024-01-01' },
  { id: '2', ptId: 'PT001', slotId: '7', slotName: 'Evening', slotTime: '6:00 PM - 8:00 PM', day: 'tuesday', fromDate: '2024-01-01' },
  { id: '3', ptId: 'PT001', slotId: '7', slotName: 'Evening', slotTime: '6:00 PM - 8:00 PM', day: 'thursday', fromDate: '2024-01-01' },
];

const daysOfWeek: { key: DayOfWeek; label: string; shortLabel: string }[] = [
  { key: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { key: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { key: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { key: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { key: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
];

function PTAvailabilitySection() {
  const [availability, setAvailability] = useState<PTAvailability[]>(mockAvailability);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Stats
  const totalSlots = availability.length;
  const activeDays = new Set(availability.map(a => a.day)).size;
  const hoursPerWeek = totalSlots * 2; // Assuming each slot is 2 hours

  // Group availability by day
  const availabilityByDay = daysOfWeek.map(day => ({
    ...day,
    slots: availability.filter(a => a.day === day.key)
  }));

  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlots(prev =>
      prev.includes(slotId)
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const toggleDaySelection = (day: DayOfWeek) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleAddAvailability = () => {
    const newAvailabilities: PTAvailability[] = [];
    
    selectedDays.forEach(day => {
      selectedSlots.forEach(slotId => {
        const slot = availableTimeSlots.find(s => s.id === slotId);
        if (slot) {
          newAvailabilities.push({
            id: `${Date.now()}-${day}-${slotId}`,
            ptId: 'PT001',
            slotId: slotId,
            slotName: slot.name,
            slotTime: `${slot.startTime} - ${slot.endTime}`,
            day: day,
            fromDate: fromDate,
            toDate: toDate || undefined
          });
        }
      });
    });

    setAvailability([...availability, ...newAvailabilities]);
    setIsAddModalOpen(false);
    setSelectedSlots([]);
    setSelectedDays([]);
    setFromDate('');
    setToDate('');
  };

  const removeAvailability = (availabilityId: string) => {
    setAvailability(availability.filter(a => a.id !== availabilityId));
  };

  return (
    <div className="pt-availability">
      <div className="pt-availability__header">
        <div>
          <h1 className="pt-availability__title">Availability</h1>
          <p className="pt-availability__subtitle">Manage available time slots for bookings</p>
        </div>
        <button className="pt-availability__create-btn" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={20} />
          Add Availability
        </button>
      </div>

      <div className="pt-availability__stats">
        <div className="stat-box">
          <span className="stat-box__label">Total Available Slots</span>
          <span className="stat-box__value">{totalSlots}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Active Days</span>
          <span className="stat-box__value">{activeDays}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Hours Per Week</span>
          <span className="stat-box__value">{hoursPerWeek.toFixed(1)}</span>
        </div>
      </div>

      <div className="pt-availability__schedule">
        <h2 className="pt-availability__schedule-title">Weekly Schedule</h2>
        
        {availabilityByDay.map(day => (
          <div key={day.key} className="pt-availability__day">
            <div className="pt-availability__day-header">
              <span className="pt-availability__day-name">{day.label}</span>
              <span className="pt-availability__day-count">
                {day.slots.length} slot{day.slots.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="pt-availability__day-slots">
              {day.slots.length > 0 ? (
                day.slots.map(slot => (
                  <div key={slot.id} className="pt-availability__slot-chip">
                    <Clock size={14} />
                    <span className="pt-availability__slot-name">{slot.slotName}</span>
                    <span className="pt-availability__slot-time">{slot.slotTime}</span>
                    <button 
                      className="pt-availability__slot-remove"
                      onClick={() => removeAvailability(slot.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <span className="pt-availability__no-slot">No slot set</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Availability Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Availability" size="lg">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleAddAvailability(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Select Time Slots</label>
            <div className="time-slots-grid">
              {availableTimeSlots.map(slot => (
                <button
                  key={slot.id}
                  type="button"
                  className={`time-slot-btn ${selectedSlots.includes(slot.id) ? 'time-slot-btn--selected' : ''}`}
                  onClick={() => toggleSlotSelection(slot.id)}
                >
                  <span className="time-slot-btn__name">{slot.name}</span>
                  <span className="time-slot-btn__time">{slot.startTime} - {slot.endTime}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Select Days</label>
            <div className="days-grid">
              {daysOfWeek.map(day => (
                <button
                  key={day.key}
                  type="button"
                  className={`day-btn ${selectedDays.includes(day.key) ? 'day-btn--selected' : ''}`}
                  onClick={() => toggleDaySelection(day.key)}
                >
                  {day.shortLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Date Range</label>
            <div className="modal-form__row">
              <div className="modal-form__group">
                <label className="modal-form__label">From</label>
                <input
                  type="date"
                  className="modal-form__input"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </div>
              <div className="modal-form__group">
                <label className="modal-form__label">To (Optional)</label>
                <input
                  type="date"
                  className="modal-form__input"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
                <span className="modal-form__hint">Leave empty for ongoing availability</span>
              </div>
            </div>
          </div>

          <div className="modal-form__actions">
            <button type="button" className="modal-form__btn modal-form__btn--secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-form__btn modal-form__btn--primary"
              disabled={selectedSlots.length === 0 || selectedDays.length === 0 || !fromDate}
            >
              Add Availability
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default PTAvailabilitySection;
