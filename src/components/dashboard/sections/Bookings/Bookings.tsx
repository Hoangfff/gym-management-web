import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Calendar, Clock, User } from 'lucide-react';
import Modal from '../../Modal/index.ts';
import { useToast } from '../../../ui/index.ts';
import { bookingApi, memberApi, contractApi, availableSlotApi } from '../../../../services/index.ts';
import type { 
  ApiBooking,
  ApiMember,
  ApiContract,
  ApiPtAvailableSlot,
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

function Bookings({ userRole }: BookingsProps) {
  const { showToast } = useToast();
  
  // Data states
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
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
      
      setBookings(bookingsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tải dữ liệu'
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
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ thông tin'
      });
      return;
    }

    if (!selectedContract?.ptId) {
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Contract không có PT'
      });
      return;
    }

    // Get the selected available slot to extract slotId
    const selectedSlot = ptAvailableSlots.find(s => s.id === selectedAvailableSlotId);
    if (!selectedSlot) {
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: 'Không tìm thấy slot đã chọn'
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
        title: 'Thành công',
        message: 'Đã tạo booking mới'
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
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể tạo booking'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!confirm('Bạn có chắc muốn hủy booking này?')) return;
    
    try {
      await bookingApi.delete(id);
      showToast({
        type: 'success',
        title: 'Thành công',
        message: 'Đã hủy booking'
      });
      fetchData();
    } catch (error: unknown) {
      console.error('Failed to cancel booking:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      showToast({
        type: 'error',
        title: 'Lỗi',
        message: axiosError.response?.data?.message || 'Không thể hủy booking'
      });
    }
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
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatTime = (timeStr: string) => {
    // HH:mm:ss -> HH:mm
    return timeStr.substring(0, 5);
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
      ) : bookings.length === 0 ? (
        <div className="bookings__empty">
          <Calendar size={48} />
          <h3>No bookings found</h3>
          <p>Create a new booking to get started.</p>
        </div>
      ) : (
        <div className="bookings__list">
          {bookings.map(booking => (
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
                <span className="booking-card__id">#{booking.id}</span>
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
                <div className="booking-card__actions">
                  {userRole === 'admin' && (
                    <button 
                      className="booking-card__btn booking-card__btn--secondary"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
              <input
                type="date"
                className="modal-form__input"
                value={formData.bookingDate}
                onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
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
              disabled={isSubmitting || !formData.memberId || !selectedAvailableSlotId || !formData.bookingDate}
            >
              {isSubmitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Bookings;
