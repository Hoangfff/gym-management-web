import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Calendar, Clock, User, CheckCircle, LogOut, XCircle, Eye, Search, ChevronDown } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { ConfirmModal, useToast } from '../../../ui/index.ts';
import { bookingApi, memberApi, contractApi, availableSlotApi, checkInApi } from '../../../../services/index.ts';
import type { 
  ApiBooking,
  ApiMember,
  ApiContract,
  ApiPtAvailableSlot,
  ApiCheckIn,
  CheckInStatusEnum,
  DayOfWeekEnum
} from '../../../../types/api.ts';
import './Bookings.css';

interface BookingsProps {
  userRole: 'admin' | 'pt';
}

const DAY_ORDER: Record<DayOfWeekEnum, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7
};

const initialFormData = {
  memberId: 0,
  contractId: 0,
  slotId: 0,
  bookingDate: ''
};

// Interface for bookings with check-in info
interface BookingWithCheckIn extends ApiBooking {
  checkIns: ApiCheckIn[];
  activeCheckIn: ApiCheckIn | null; // Current CHECKED_IN record
}

function Bookings({ userRole }: BookingsProps) {
  const { showToast } = useToast();
  
  // Data states
  const [bookings, setBookings] = useState<BookingWithCheckIn[]>([]);
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [memberContracts, setMemberContracts] = useState<ApiContract[]>([]);
  const [ptAvailableSlots, setPtAvailableSlots] = useState<ApiPtAvailableSlot[]>([]);
  
  // Selected contract details
  const [selectedContract, setSelectedContract] = useState<ApiContract | null>(null);
  const [selectedAvailableSlotId, setSelectedAvailableSlotId] = useState<number | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  
  // Check-in states
  const [checkInProcessing, setCheckInProcessing] = useState<number | null>(null);
  const [showCheckInHistoryModal, setShowCheckInHistoryModal] = useState(false);
  const [selectedBookingForHistory, setSelectedBookingForHistory] = useState<BookingWithCheckIn | null>(null);

  // Filter/sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  // Cancel booking modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<BookingWithCheckIn | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch bookings and members on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch contracts when member selected
  useEffect(() => {
    if (formData.memberId > 0) {
      fetchMemberContracts(formData.memberId);
    } else {
      setMemberContracts([]);
      setSelectedContract(null);
      setPtAvailableSlots([]);
      setSelectedAvailableSlotId(null);
    }
  }, [formData.memberId]);

  // Fetch available slots when contract selected
  useEffect(() => {
    if (formData.contractId > 0) {
      const contract = memberContracts.find(c => c.id === formData.contractId);
      setSelectedContract(contract || null);
      if (contract?.ptId) {
        fetchPtAvailableSlots(contract.ptId);
      }
    } else {
      setSelectedContract(null);
      setPtAvailableSlots([]);
      setSelectedAvailableSlotId(null);
    }
  }, [formData.contractId, memberContracts]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, membersRes] = await Promise.all([
        bookingApi.getAll(),
        memberApi.getAll()
      ]);
      
      // Handle both array and pagination response
      const bookingsData = Array.isArray(bookingsRes.data) 
        ? bookingsRes.data 
        : (bookingsRes.data as unknown as { result?: ApiBooking[] })?.result || [];
      
      const membersData = Array.isArray(membersRes.data)
        ? membersRes.data
        : (membersRes.data as unknown as { result?: ApiMember[] })?.result || [];
      
      // Fetch check-in status for each booking
      const bookingsWithCheckIn: BookingWithCheckIn[] = await Promise.all(
        bookingsData.map(async (booking) => {
          try {
            const checkInRes = await checkInApi.getByBookingId(booking.id);
            const checkIns = Array.isArray(checkInRes.data) ? checkInRes.data : [];
            // Find active check-in (status = CHECKED_IN)
            const activeCheckIn = checkIns.find(c => c.status === 'CHECKED_IN') || null;
            return { ...booking, checkIns, activeCheckIn };
          } catch {
            // No check-in found for this booking
            return { ...booking, checkIns: [], activeCheckIn: null };
          }
        })
      );
      
      setBookings(bookingsWithCheckIn);
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load data'
      });
      setBookings([]);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMemberContracts = async (memberId: number) => {
    setIsLoadingContracts(true);
    try {
      const response = await contractApi.getByMemberId(memberId);
      const contractsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data as unknown as { result?: ApiContract[] })?.result || [];
      // Only show active contracts with PT
      const activeContracts = contractsData.filter(c => c.status === 'ACTIVE' && c.ptId);
      setMemberContracts(activeContracts);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      setMemberContracts([]);
    } finally {
      setIsLoadingContracts(false);
    }
  };

  const fetchPtAvailableSlots = async (ptId: number) => {
    setIsLoadingSlots(true);
    try {
      const response = await availableSlotApi.getAvailableByPtId(ptId);
      const slotsData = Array.isArray(response.data) 
        ? response.data 
        : [];
      // Sort by day of week
      slotsData.sort((a, b) => DAY_ORDER[a.dayOfWeek] - DAY_ORDER[b.dayOfWeek]);
      setPtAvailableSlots(slotsData);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      setPtAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Filter and sort bookings
  const getFilteredBookings = () => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b => 
        b.memberName.toLowerCase().includes(term) ||
        b.ptName.toLowerCase().includes(term) ||
        b.id.toString().includes(searchTerm) ||
        b.memberId.toString().includes(searchTerm)
      );
    }

    // Sort by booking date
    filtered.sort((a, b) => {
      const dateA = new Date(a.bookingDate).getTime();
      const dateB = new Date(b.bookingDate).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredBookings = getFilteredBookings();

  // Stats
  const stats = {
    total: bookings.length,
    today: bookings.filter(b => {
      const today = new Date().toISOString().split('T')[0];
      return b.bookingDate === today;
    }).length,
    upcoming: bookings.filter(b => {
      const today = new Date().toISOString().split('T')[0];
      return b.bookingDate > today;
    }).length
  };

  const handleCreateBooking = async () => {
    if (!formData.memberId || !selectedAvailableSlotId || !formData.bookingDate) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    if (!isValidDateForSlot(formData.bookingDate)) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Selected date does not match the slot\'s day of week'
      });
      return;
    }

    if (!selectedContract?.ptId) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Contract does not have PT assigned'
      });
      return;
    }

    // Get the selected available slot to extract slotId
    const selectedSlot = ptAvailableSlots.find(s => s.id === selectedAvailableSlotId);
    if (!selectedSlot) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Selected slot not found'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await bookingApi.create({
        memberId: formData.memberId,
        ptId: selectedContract.ptId,
        slotId: selectedSlot.slot.slotId,
        bookingDate: formData.bookingDate
      });
      
      showToast({
        type: 'success',
        title: 'Success',
        message: 'New booking created successfully'
      });
      
      setIsCreateModalOpen(false);
      setFormData(initialFormData);
      setMemberContracts([]);
      setSelectedContract(null);
      setPtAvailableSlots([]);
      setSelectedAvailableSlotId(null);
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to create booking:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to create booking'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBookingClick = (booking: BookingWithCheckIn) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    setIsCancelling(true);
    try {
      await bookingApi.delete(bookingToCancel.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Booking cancelled'
      });
      setShowCancelModal(false);
      setBookingToCancel(null);
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to cancel booking:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to cancel booking'
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Check-in handlers
  const handleCheckIn = async (booking: BookingWithCheckIn) => {
    setCheckInProcessing(booking.id);
    try {
      await checkInApi.checkIn({
        bookingId: booking.id
      });
      showToast({
        type: 'success',
        title: 'Success',
        message: `Checked in ${booking.memberName}`
      });
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to check in:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to check in'
      });
    } finally {
      setCheckInProcessing(null);
    }
  };

  const handleCheckOut = async (booking: BookingWithCheckIn) => {
    setCheckInProcessing(booking.id);
    try {
      await checkInApi.checkOut(booking.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: `Checked out ${booking.memberName}`
      });
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to check out:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to check out'
      });
    } finally {
      setCheckInProcessing(null);
    }
  };

  const handleCancelCheckIn = async (booking: BookingWithCheckIn) => {
    setCheckInProcessing(booking.id);
    try {
      await checkInApi.cancel(booking.id);
      showToast({
        type: 'success',
        title: 'Success',
        message: 'Check-in cancelled'
      });
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to cancel check-in:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Error',
        message: axiosError.response?.data?.message || 'Failed to cancel check-in'
      });
    } finally {
      setCheckInProcessing(null);
    }
  };

  const handleViewCheckInHistory = (booking: BookingWithCheckIn) => {
    setSelectedBookingForHistory(booking);
    setShowCheckInHistoryModal(true);
  };

  // Helper functions for check-in status
  const getCheckInStatusConfig = (status: CheckInStatusEnum) => {
    const config: Record<CheckInStatusEnum, { className: string; label: string }> = {
      'CHECKED_IN': { className: 'checkin-status--checked-in', label: 'Checked In' },
      'CHECKED_OUT': { className: 'checkin-status--checked-out', label: 'Checked Out' },
      'CANCELLED': { className: 'checkin-status--cancelled', label: 'Cancelled' },
      'NO_SHOW': { className: 'checkin-status--no-show', label: 'No Show' }
    };
    return config[status] || { className: '', label: status };
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setFormData(initialFormData);
    setMemberContracts([]);
    setSelectedContract(null);
    setPtAvailableSlots([]);
    setSelectedAvailableSlotId(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US');
  };

  const formatTime = (timeStr: string) => {
    // HH:mm:ss -> HH:mm
    return timeStr.substring(0, 5);
  };

  // Get day of week from date string (YYYY-MM-DD)
  const getDayOfWeek = (dateStr: string): DayOfWeekEnum => {
    const days: DayOfWeekEnum[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  // Check if date matches the selected slot's day of week
  const isValidDateForSlot = (dateStr: string): boolean => {
    if (!selectedAvailableSlotId || !dateStr) return false;
    const selectedSlot = ptAvailableSlots.find(s => s.id === selectedAvailableSlotId);
    if (!selectedSlot) return false;
    return getDayOfWeek(dateStr) === selectedSlot.dayOfWeek;
  };

  // Get minimum date for booking (contract start date or today, whichever is later)
  const getMinBookingDate = (): string => {
    const today = new Date().toISOString().split('T')[0];
    if (!selectedContract?.startDate) return today;
    return selectedContract.startDate > today ? selectedContract.startDate : today;
  };

  // Get maximum date for booking (contract end date)
  const getMaxBookingDate = (): string | undefined => {
    return selectedContract?.endDate;
  };

  // Group available slots by day
  const slotsByDay = ptAvailableSlots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<DayOfWeekEnum, ApiPtAvailableSlot[]>);

  return (
    <div className="bookings">
      <div className="bookings__header">
        <div>
          <h1 className="bookings__title">Bookings</h1>
          <p className="bookings__subtitle">Manage client bookings and sessions</p>
        </div>
        <div className="bookings__header-actions">
          <button 
            className="bookings__refresh-btn" 
            onClick={fetchData}
            disabled={isLoading}
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
          <button className="bookings__create-btn" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} />
            Create Booking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bookings__filters">
        <div className="bookings__search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by member, PT, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bookings__filter-group">
          <div className="bookings__select-wrapper">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <div className="bookings__stats">
        <div className="stat-box">
          <span className="stat-box__label">Total Bookings</span>
          <span className="stat-box__value">{stats.total}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Today</span>
          <span className="stat-box__value stat-box__value--blue">{stats.today}</span>
        </div>
        <div className="stat-box">
          <span className="stat-box__label">Upcoming</span>
          <span className="stat-box__value stat-box__value--green">{stats.upcoming}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="bookings__loading">
          <RefreshCw size={32} className="spinning" />
          <p>Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bookings__empty">
          <Calendar size={48} />
          <h3>No bookings found</h3>
          <p>{searchTerm ? 'Try adjusting your search.' : 'Create a new booking to get started.'}</p>
        </div>
      ) : (
        <div className="bookings__list">
          {filteredBookings.map(booking => {
            const isProcessing = checkInProcessing === booking.id;
            const hasActiveCheckIn = !!booking.activeCheckIn;
            const today = new Date().toISOString().split('T')[0];
            const isToday = booking.bookingDate === today;
            const hasCheckedOut = booking.checkIns.some(c => c.status === 'CHECKED_OUT');
            const canShowCheckIn = isToday && !hasCheckedOut;
            
            return (
            <div key={booking.id} className="booking-card">
              <div className="booking-card__header">
                <div className="booking-card__member">
                  <div className="booking-card__avatar">
                    <User size={20} />
                  </div>
                  <div className="booking-card__member-info">
                    <h4 className="booking-card__member-name">{booking.memberName}</h4>
                    <span className="booking-card__package">Member #{booking.memberId}</span>
                  </div>
                </div>
                <div className="booking-card__header-right">
                  {hasActiveCheckIn && (
                    <span className="booking-card__checkin-status checkin-status--checked-in">
                      Checked In
                    </span>
                  )}
                  <span className="booking-card__id">#{booking.id}</span>
                </div>
              </div>

              <div className="booking-card__content">
                <div className="booking-card__time-box">
                  <div className="booking-card__info-row">
                    <Calendar size={14} />
                    <span>{formatDate(booking.bookingDate)}</span>
                  </div>
                  <div className="booking-card__info-row">
                    <Clock size={14} />
                    <span>{formatTime(booking.slotStartTime)} - {formatTime(booking.slotEndTime)}</span>
                  </div>
                  {booking.activeCheckIn && (
                    <div className="booking-card__info-row booking-card__info-row--checkin">
                      <CheckCircle size={14} />
                      <span>Check-in: {formatTime(booking.activeCheckIn.checkinTime)}</span>
                    </div>
                  )}
                </div>
                <div className="booking-card__details">
                  <div className="booking-card__pt">
                    <User size={14} />
                    <span>PT: {booking.ptName}</span>
                  </div>
                  <div className="booking-card__meta">
                    <span>Created by: {booking.createdBy}</span>
                  </div>
                </div>
                
                {/* Check-in Actions - Simple Logic */}
                <div className="booking-card__checkin-actions">
                  {!hasActiveCheckIn && canShowCheckIn ? (
                    // No active check-in: Show Check In button only on booking date and no checked-out records
                    <button 
                      className="booking-card__btn booking-card__btn--checkin"
                      onClick={() => handleCheckIn(booking)}
                      disabled={isProcessing}
                    >
                      <CheckCircle size={14} />
                      {isProcessing ? 'Processing...' : 'Check In'}
                    </button>
                  ) : hasActiveCheckIn ? (
                    // Has active check-in: Show Check Out and Cancel buttons
                    <>
                      <button 
                        className="booking-card__btn booking-card__btn--checkout"
                        onClick={() => handleCheckOut(booking)}
                        disabled={isProcessing}
                      >
                        <LogOut size={14} />
                        {isProcessing ? 'Processing...' : 'Check Out'}
                      </button>
                      <button 
                        className="booking-card__btn booking-card__btn--cancel-checkin"
                        onClick={() => handleCancelCheckIn(booking)}
                        disabled={isProcessing}
                      >
                        <XCircle size={14} />
                        Cancel Check-in
                      </button>
                    </>
                  ) : null}
                  
                  {/* View History button if there are any check-ins */}
                  {booking.checkIns.length > 0 && (
                    <button 
                      className="booking-card__btn booking-card__btn--view-history"
                      onClick={() => handleViewCheckInHistory(booking)}
                    >
                      <Eye size={14} />
                      History ({booking.checkIns.length})
                    </button>
                  )}
                </div>
                
                <div className="booking-card__actions">
                  {(userRole === 'admin' || userRole === 'pt') && booking.checkIns.length === 0 && (
                    <button 
                      className="booking-card__btn booking-card__btn--secondary"
                      onClick={() => handleCancelBookingClick(booking)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Create Booking Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={handleCloseModal} 
        title="Create New Booking" 
        size="lg"
      >
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); handleCreateBooking(); }}>
          {/* Step 1: Select Member */}
          <div className="modal-form__group">
            <label className="modal-form__label modal-form__label--required">Member</label>
            <select
              className="modal-form__select"
              value={formData.memberId}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  memberId: Number(e.target.value),
                  contractId: 0
                });
                setSelectedAvailableSlotId(null);
              }}
            >
              <option value={0}>Select Member</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.user.fullname} (ID: {m.id})
                </option>
              ))}
            </select>
          </div>
          
          {/* Step 2: Select Contract */}
          {formData.memberId > 0 && (
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Contract (with PT)</label>
              {isLoadingContracts ? (
                <div className="modal-form__loading">Loading contracts...</div>
              ) : memberContracts.length === 0 ? (
                <div className="modal-form__empty">No active contracts with PT found for this member</div>
              ) : (
                <select
                  className="modal-form__select"
                  value={formData.contractId}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      contractId: Number(e.target.value)
                    });
                    setSelectedAvailableSlotId(null);
                  }}
                >
                  <option value={0}>Select Contract</option>
                  {memberContracts.map(c => (
                    <option key={c.id} value={c.id}>
                      #{c.id} - {c.packageName} (PT: {c.ptName})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          
          {/* Step 3: Select Available Slot */}
          {selectedContract && (
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Available Time Slot</label>
              <p className="modal-form__hint">PT: {selectedContract.ptName}</p>
              {isLoadingSlots ? (
                <div className="modal-form__loading">Loading available slots...</div>
              ) : ptAvailableSlots.length === 0 ? (
                <div className="modal-form__empty">No available slots for this PT</div>
              ) : (
                <div className="booking-slots-grid">
                  {Object.entries(slotsByDay).map(([day, slots]) => (
                    <div key={day} className="booking-slots-day">
                      <h4 className="booking-slots-day__title">{day}</h4>
                      <div className="booking-slots-day__slots">
                        {slots.map(slot => (
                          <button
                            key={slot.id}
                            type="button"
                            className={`booking-slot-btn ${selectedAvailableSlotId === slot.id ? 'booking-slot-btn--selected' : ''}`}
                            onClick={() => setSelectedAvailableSlotId(slot.id)}
                          >
                            <span className="booking-slot-btn__name">{slot.slot.slotName}</span>
                            <span className="booking-slot-btn__time">
                              {formatTime(slot.slot.startTime)} - {formatTime(slot.slot.endTime)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Step 4: Select Date */}
          {selectedAvailableSlotId && (
            <div className="modal-form__group">
              <label className="modal-form__label modal-form__label--required">Booking Date</label>
              {selectedContract && (
                <p className="modal-form__hint">
                  Contract: {selectedContract.startDate} to {selectedContract.endDate}
                  {' | '}Day: {ptAvailableSlots.find(s => s.id === selectedAvailableSlotId)?.dayOfWeek}
                </p>
              )}
              <input
                type="date"
                className="modal-form__input"
                value={formData.bookingDate}
                onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                min={getMinBookingDate()}
                max={getMaxBookingDate()}
              />
              {formData.bookingDate && !isValidDateForSlot(formData.bookingDate) && (
                <p className="modal-form__error" style={{ color: 'var(--color-dashboard-red)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
                  Selected date does not match the slot's day of week ({ptAvailableSlots.find(s => s.id === selectedAvailableSlotId)?.dayOfWeek})
                </p>
              )}
            </div>
          )}
          
          <div className="modal-form__actions">
            <button 
              type="button" 
              className="modal-form__btn modal-form__btn--secondary" 
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-form__btn modal-form__btn--primary"
              disabled={
                isSubmitting || 
                !formData.memberId || 
                !selectedAvailableSlotId || 
                !formData.bookingDate || 
                !isValidDateForSlot(formData.bookingDate)
              }
            >
              {isSubmitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Check-in History Modal */}
      <Modal
        isOpen={showCheckInHistoryModal}
        onClose={() => {
          setShowCheckInHistoryModal(false);
          setSelectedBookingForHistory(null);
        }}
        title="Check-in History"
        size="md"
      >
        {selectedBookingForHistory && (
          <div className="modal-form">
            <div className="modal-form__info">
              <p><strong>Booking ID:</strong> #{selectedBookingForHistory.id}</p>
              <p><strong>Member:</strong> {selectedBookingForHistory.memberName}</p>
              <p><strong>PT:</strong> {selectedBookingForHistory.ptName}</p>
              <p><strong>Date:</strong> {formatDate(selectedBookingForHistory.bookingDate)}</p>
            </div>
            
            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <h4 style={{ margin: '0 0 var(--spacing-md) 0', fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                Check-in Records ({selectedBookingForHistory.checkIns.length})
              </h4>
              
              {selectedBookingForHistory.checkIns.length === 0 ? (
                <p style={{ color: 'var(--color-gray-500)' }}>No check-in records found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  {selectedBookingForHistory.checkIns.map((checkIn) => {
                    const statusConfig = getCheckInStatusConfig(checkIn.status);
                    return (
                      <div 
                        key={checkIn.checkinId} 
                        style={{ 
                          padding: 'var(--spacing-md)', 
                          backgroundColor: 'var(--color-gray-50)', 
                          borderRadius: 'var(--radius-md)',
                          border: checkIn.status === 'CHECKED_IN' ? '2px solid var(--color-dashboard-green)' : '1px solid var(--color-gray-200)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                          <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>#{checkIn.checkinId}</span>
                          <span className={`booking-card__checkin-status ${statusConfig.className}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)' }}>
                          <p style={{ margin: '0 0 var(--spacing-2xs) 0' }}>
                            <strong>Check-in:</strong> {formatTime(checkIn.checkinTime)}
                          </p>
                          {checkIn.checkoutTime && (
                            <p style={{ margin: '0 0 var(--spacing-2xs) 0' }}>
                              <strong>Check-out:</strong> {formatTime(checkIn.checkoutTime)}
                            </p>
                          )}
                          <p style={{ margin: 0 }}>
                            <strong>Created by:</strong> {checkIn.createdBy}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="modal-form__actions" style={{ marginTop: 'var(--spacing-lg)' }}>
              <button 
                type="button" 
                className="modal-form__btn modal-form__btn--secondary"
                onClick={() => {
                  setShowCheckInHistoryModal(false);
                  setSelectedBookingForHistory(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Booking Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setBookingToCancel(null);
        }}
        onConfirm={handleConfirmCancelBooking}
        title="Cancel Booking"
        message={bookingToCancel 
          ? `Are you sure you want to cancel the booking #${bookingToCancel.id} for ${bookingToCancel.memberName} on ${formatDate(bookingToCancel.bookingDate)}?`
          : 'Are you sure you want to cancel this booking?'
        }
        confirmText="Cancel Booking"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
}

export default Bookings;