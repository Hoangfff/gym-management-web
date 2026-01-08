import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import type { Booking, BookingStatus, TimeSlot } from '../../../../types/index.ts';
import './Bookings.css';

interface BookingsProps {
  userRole: 'admin' | 'pt';
}

// Mock time slots
const timeSlots: TimeSlot[] = [
  { id: '1', name: 'Early Morning', startTime: '6:00 AM', endTime: '8:00 AM', duration: '2h' },
  { id: '2', name: 'Morning', startTime: '8:00 AM', endTime: '10:00 AM', duration: '2h' },
  { id: '3', name: 'Late Morning', startTime: '10:00 AM', endTime: '12:00 PM', duration: '2h' },
  { id: '4', name: 'Lunch Time', startTime: '12:00 PM', endTime: '2:00 PM', duration: '2h' },
  { id: '5', name: 'Afternoon', startTime: '2:00 PM', endTime: '4:00 PM', duration: '2h' },
  { id: '6', name: 'Late Afternoon', startTime: '4:00 PM', endTime: '6:00 PM', duration: '2h' },
  { id: '7', name: 'Evening', startTime: '6:00 PM', endTime: '8:00 PM', duration: '2h' },
  { id: '8', name: 'Night', startTime: '8:00 PM', endTime: '10:00 PM', duration: '2h' },
];

// Mock bookings
const mockBookings: Booking[] = [
  {
    id: 'BK001',
    memberId: 'M001',
    memberName: 'Juan Dela Cruz',
    packageName: 'Premium Pack',
    trainerId: 'PT001',
    trainerName: 'John Trainer',
    date: 'Dec 23',
    timeSlot: '08:00',
    duration: 60,
    sessionNumber: 5,
    totalSessions: 8,
    status: 'pending',
    note: 'I want to focus on upper body today'
  },
  {
    id: 'BK002',
    memberId: 'M001',
    memberName: 'Juan Dela Cruz',
    packageName: 'Premium Pack',
    trainerId: 'PT001',
    trainerName: 'John Trainer',
    date: 'Dec 23',
    timeSlot: '08:00',
    duration: 60,
    sessionNumber: 5,
    totalSessions: 8,
    status: 'confirmed',
    note: 'I want to focus on upper body today'
  },
  {
    id: 'BK003',
    memberId: 'M001',
    memberName: 'Juan Dela Cruz',
    packageName: 'Premium Pack',
    trainerId: 'PT001',
    trainerName: 'John Trainer',
    date: 'Dec 23',
    timeSlot: '08:00',
    duration: 60,
    sessionNumber: 5,
    totalSessions: 8,
    status: 'checked-in',
    note: 'I want to focus on upper body today'
  }
];

const initialFormData = {
  memberId: '',
  trainerId: '',
  date: '',
  timeSlotId: '',
  status: 'pending' as 'pending' | 'confirmed',
  notes: ''
};

function Bookings({ userRole }: BookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [activeTab, setActiveTab] = useState<'pending' | 'today'>('pending');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Stats
  const todaySessions = bookings.filter(b => b.status !== 'cancelled').length;
  const completedWeek = bookings.filter(b => b.status === 'checked-in').length;
  const pendingApproval = bookings.filter(b => b.status === 'pending').length;
  const upcomingWeek = bookings.filter(b => b.status === 'confirmed').length;

  // Filter bookings based on tab
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'pending') {
      return booking.status === 'pending' || booking.status === 'confirmed';
    } else {
      return booking.status === 'confirmed' || booking.status === 'checked-in';
    }
  });

  const handleConfirmBooking = (bookingId: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'confirmed' as BookingStatus } : b
    ));
  };

  const handleCheckIn = (bookingId: string) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'checked-in' as BookingStatus } : b
    ));
  };

  const handleCreateBooking = () => {
    const slot = timeSlots.find(s => s.id === selectedTimeSlot);
    const newBooking: Booking = {
      id: `BK${String(bookings.length + 1).padStart(3, '0')}`,
      memberId: formData.memberId || 'M001',
      memberName: 'New Member',
      packageName: 'Premium Pack',
      trainerId: formData.trainerId,
      trainerName: 'Trainer Name',
      date: formData.date,
      timeSlot: slot?.startTime || '08:00',
      duration: 60,
      sessionNumber: 1,
      totalSessions: 8,
      status: formData.status,
      note: formData.notes
    };
    setBookings([...bookings, newBooking]);
    setIsCreateModalOpen(false);
    setFormData(initialFormData);
    setSelectedTimeSlot(null);
  };

  const getStatusBadgeClass = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'booking-card__status--pending';
      case 'confirmed': return 'booking-card__status--confirmed';
      case 'checked-in': return 'booking-card__status--checked-in';
      default: return '';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'checked-in': return 'Checked-in';
      default: return status;
    }
  };

  return (
    <div className="bookings">
      <div className="bookings__header">
        <div>
          <h1 className="bookings__title">Bookings</h1>
          <p className="bookings__subtitle">Manage client bookings, confirmations, and check-ins</p>
        </div>
        <button className="bookings__create-btn" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} />
          Create Booking
        </button>
      </div>

      <div className="bookings__stats">
        <div className="stat-box">
          <span className="stat-box__label">Today's sessions</span>
          <span className="stat-box__value">{todaySessions}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Completed (Week)</span>
          <span className="stat-box__value stat-box__value--green">{completedWeek}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Pending Approval</span>
          <span className="stat-box__value stat-box__value--yellow">{pendingApproval}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Upcoming (Week)</span>
          <span className="stat-box__value">{upcomingWeek}</span>
        </div>
      </div>

      <div className="bookings__tabs">
        <button 
          className={`bookings__tab ${activeTab === 'pending' ? 'bookings__tab--active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button 
          className={`bookings__tab ${activeTab === 'today' ? 'bookings__tab--active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          Today's sessions
        </button>
      </div>

      <div className="bookings__list">
        {filteredBookings.map(booking => (
          <div key={booking.id} className="booking-card">
            <div className="booking-card__header">
              <div className="booking-card__member">
                <div className="booking-card__avatar">
                  {booking.memberAvatar ? (
                    <img src={booking.memberAvatar} alt={booking.memberName} />
                  ) : (
                    <span>{booking.memberName.charAt(0)}</span>
                  )}
                </div>
                <div className="booking-card__member-info">
                  <h4 className="booking-card__member-name">{booking.memberName}</h4>
                  <span className="booking-card__package">{booking.packageName}</span>
                </div>
              </div>
              <span className={`booking-card__status ${getStatusBadgeClass(booking.status)}`}>
                <span className="booking-card__status-dot"></span>
                {getStatusLabel(booking.status)}
              </span>
            </div>

            <div className="booking-card__content">
              <div className="booking-card__time-box">
                <span className="booking-card__time">{booking.timeSlot}</span>
                <span className="booking-card__date">{booking.date}</span>
                <span className="booking-card__duration">{booking.duration} min</span>
              </div>
              <div className="booking-card__details">
                {booking.note && (
                  <div className="booking-card__note">
                    <strong>Note:</strong> {booking.note}
                  </div>
                )}
                <div className="booking-card__session">
                  Session <strong>{booking.sessionNumber}/{booking.totalSessions}</strong>
                </div>
              </div>
              <div className="booking-card__actions">
                {booking.status === 'pending' && userRole === 'admin' && (
                  <>
                    <button className="booking-card__btn booking-card__btn--secondary">
                      Update
                    </button>
                    <button 
                      className="booking-card__btn booking-card__btn--primary"
                      onClick={() => handleConfirmBooking(booking.id)}
                    >
                      Confirm booking
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <button 
                    className="booking-card__btn booking-card__btn--primary"
                    onClick={() => handleCheckIn(booking.id)}
                  >
                    Check-in
                  </button>
                )}
                {booking.status === 'pending' && userRole === 'pt' && (
                  <button 
                    className="booking-card__btn booking-card__btn--primary"
                    onClick={() => handleCheckIn(booking.id)}
                  >
                    Check in
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Booking Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Booking" size="lg">
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleCreateBooking(); }}>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Member</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="Search member..."
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Personal Trainer</label>
            <input
              type="text"
              className="modal-form__input"
              placeholder="Search trainer..."
              value={formData.trainerId}
              onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Date</label>
            <input
              type="date"
              className="modal-form__input"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Select Time Slots</label>
            <div className="time-slots-grid">
              {timeSlots.map(slot => (
                <button
                  key={slot.id}
                  type="button"
                  className={`time-slot-btn ${selectedTimeSlot === slot.id ? 'time-slot-btn--selected' : ''}`}
                  onClick={() => setSelectedTimeSlot(slot.id)}
                >
                  <span className="time-slot-btn__name">{slot.name}</span>
                  <span className="time-slot-btn__time">{slot.startTime} - {slot.endTime}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Initial Status</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={formData.status === 'pending'}
                  onChange={() => setFormData({ ...formData, status: 'pending' })}
                />
                <span>Pending (requires confirmation)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="status"
                  value="confirmed"
                  checked={formData.status === 'confirmed'}
                  onChange={() => setFormData({ ...formData, status: 'confirmed' })}
                />
                <span>Confirmed</span>
              </label>
            </div>
          </div>
          <div className="modal-form__group">
            <label className="modal-form__label">Notes (Optional)</label>
            <textarea
              className="modal-form__textarea"
              placeholder="e.g., Focus on upper body, prefer lighter weights..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="modal-form__actions">
            <button type="button" className="modal-form__btn modal-form__btn--secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="modal-form__btn modal-form__btn--primary">
              Create Booking
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Bookings;
