import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';
import { SERVICE_CONFIGS, ServiceConfig } from '../../config/serviceConfig';
import { BookingData, ServiceType, DoctorBooking, TurfBooking } from '../../types/booking.types';
import NewAppointmentForm from '../NewAppointmentForm';

// Modal component for reuse
const Modal : React.FC<{
  isOpen : boolean;
  onClose : () => void;
  children : React.ReactNode;
}> = ({isOpen, onClose, children}) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-10 text-center">
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md transition-opacity" aria-hidden="true" onClick={onClose} />
        <div className="relative inline-block max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.5rem] border border-white/12 bg-[#071421]/88 text-left shadow-[0_28px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl sm:rounded-[2rem]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Booking Detail Modal Component
const BookingDetailModal: React.FC<{
  booking: BookingData | null;
  isOpen: boolean;
  onClose: () => void;
  config: ServiceConfig;
}> = ({ booking, isOpen, onClose, config }) => {
  if (!booking) return null;

  // Helper to get field value dynamically
  const getFieldValue = (booking: BookingData, fieldType: 'name' | 'email' | 'contact') => {
    const fieldMap = {
      name: config.fields.customerName,
      email: config.fields.customerEmail,
      contact: config.fields.customerContact
    };
    return (booking as any)[fieldMap[fieldType]] || '';
    //return booking[fieldMap[fieldType]]; yhi lika h upper
  };

  // Format date function for IST
  const formatDate = (dateStr: string, timeStr: string = '00:00:00') => {
    try {
      const time = timeStr?.length === 5 ? `${timeStr}:00` : timeStr || '00:00:00';
      const utcDateTime = new Date(`${dateStr}T${time}Z`);
      
      return utcDateTime.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Format time function for IST
  const formatTime = (timeString: string, dateString: string) => {
    try {
      if (!timeString || typeof timeString !== 'string') {
        return 'N/A';
      }
      
      const time = timeString.length === 5 ? `${timeString}:00` : timeString;
      const [hours, minutes] = time.split(':').map(Number);
      const dateObj = new Date(`${dateString}T00:00:00Z`);
      dateObj.setUTCHours(hours, minutes);
      
      return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      }) + ' IST';
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return 'N/A';
    }
  };

  // Format timestamp function
  const formatTimestamp = (timestampStr: string) => {
    try {
      if (!timestampStr) return 'N/A';
      
      const utcDateTime = new Date(timestampStr);
      
      return utcDateTime.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }) + ' IST';
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return new Date(timestampStr).toLocaleString();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}> 
    {/* BookingDetailModal k andar Modal component call ho ra h and */}
    {/* // isme(Modal me) children pass ho ra h neeche wala html content */}
      <div className="font-tori-garamond p-4 text-white sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-3xl font-light sm:text-4xl">Booking Details</h3>
          <button
            type="button"
            className="tori-unstyled-button flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.055] text-blue-100/72 transition hover:bg-white/[0.1] hover:text-white"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-2 overflow-x-auto rounded-[1.25rem] border border-white/10 bg-white/[0.035]">
          <table className="min-w-[42rem] table-fixed divide-y divide-white/10 sm:min-w-full">
            <tbody className="divide-y divide-white/10">
              <tr>
                <td className="w-[34%] bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                  Booking Reference
                </td>
                <td className="px-6 py-4 text-2xl font-light text-white">
                  {booking.booking_reference || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                  Customer Name
                </td>
                <td className="px-6 py-4 text-2xl font-light text-white">
                  {getFieldValue(booking, 'name')}
                </td>
              </tr>
              {config.fields.additionalFields?.includes('doctor') && (
                <tr>
                  <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                    Doctor
                  </td>
                  <td className="px-6 py-4 text-2xl font-light text-white">
                    {(booking as DoctorBooking).doctor}
                  </td>
                </tr>
              )}
              <tr>
                <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                  Contact
                </td>
                <td className="px-6 py-4 text-2xl font-light text-white">
                  {getFieldValue(booking, 'contact') || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                  Email
                </td>
                <td className="px-6 py-4 text-2xl font-light text-white">
                  {getFieldValue(booking, 'email') || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                  Date & Time
                </td>
                <td className="px-6 py-4 text-2xl font-light text-white">
                  {formatDate(booking.booking_date)} at {formatTime(booking.start_time, booking.booking_date)}
                </td>
              </tr>
              <tr>
                <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                  Status
                </td>
                <td className="px-6 py-4 text-2xl font-light text-white">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    booking.status === 'no-show' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                  Payment amount
                </td>
                <td className="px-6 py-4 text-2xl font-light text-white">
                  {booking.amount ? `${booking.currency || 'INR'} ${booking.amount}` : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                  Payment Method
                </td>
                <td className="px-6 py-4 text-2xl font-light text-white">
                  {booking.payment_method ? booking.payment_method.toUpperCase() : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                  Payment ID
                </td>
                <td className="px-6 py-4 text-2xl font-light text-white">
                  {booking.payment_id || 'N/A'}
                </td>
              </tr>
              {config.hasFileUpload && config.fields.additionalFields?.includes('prescription') && (
                <tr>
                  <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                    Prescription
                  </td>
                  <td className="px-6 py-4 text-2xl font-light text-white">
                    {(booking as DoctorBooking).prescription ? (
                      <a 
                        href={(booking as DoctorBooking).prescription} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        View
                      </a>
                    ) : 'Not uploaded'}
                  </td>
                </tr>
              )}
              <tr>
                <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                  Created At
                </td>
                <td className="px-6 py-4 text-2xl font-light text-white">
                  {formatTimestamp(booking.created_at || '')}
                </td>
              </tr>
              <tr>
                <td className="bg-white/[0.035] px-6 py-4 text-2xl font-light text-blue-100/75">
                  Last Updated
                </td>
                <td className="px-6 py-4 text-2xl font-light text-white">
                  {formatTimestamp(booking.updated_at || '')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};

interface UnifiedBookingPageProps {
  serviceType: ServiceType;
}

const UnifiedBookingPage: React.FC<UnifiedBookingPageProps> = ({ serviceType }) => {
  const config = SERVICE_CONFIGS[serviceType];
  const { tenant, user } = useAuth();
  
  const [filter, setFilter] = useState('all');
  const statusOptions = ['all', 'Scheduled', 'Completed', 'Cancelled', 'No-show'];
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Add states for booking detail modal
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const visibleColumns = config.columns.filter((column) => column.key !== 'reference');
  const selectedStatusLabel = filter === 'all' ? 'All Status' : filter;

  // Helper to get field value dynamically
  const getFieldValue = (booking: BookingData, fieldType: 'name' | 'email' | 'contact') => {
    const fieldMap = {
      name: config.fields.customerName,//patient_name for doc & 
      email: config.fields.customerEmail,
      contact: config.fields.customerContact
    };
    return (booking as any)[fieldMap[fieldType]] || ''; 
   // YE HAI SIMPLIFIED:
    //return booking[fieldMap[fieldType]] || '';
  };

  // Function to handle viewing booking details
  const handleViewBooking = (booking: BookingData) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Function to trigger refresh
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  // WRONG- setRefreshTrigger(prev => {prev+ 1})

  // Fetch bookings
  const fetchBookings = async () => {
    if (!user?.tenantId) {
      console.error('No tenant ID available for fetching bookings');
      setError('No tenant ID available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Fetching ${config.displayName.toLowerCase()} for tenant:`, user.tenantId);
      
      const { data, error } = await supabase
        .from(config.tableName)
        .select('*')
        .eq('tenant_id', user.tenantId)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      console.log(`${config.displayName} data:`, data);
      setBookings(data || []);
      setError(null);
    } catch (err: any) {
      console.error(`Error fetching ${config.displayName.toLowerCase()}:`, err);
      setError(`Failed to load ${config.displayName.toLowerCase()}`);
    } finally {
      setIsLoading(false);
    }
  };

  // File upload function (only for services that support it)
  const handleFileUpload = async (bookingId: string, file: File) => {
    if (!file || !config.hasFileUpload) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only .jpg, .jpeg, .png, and .pdf files are allowed');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setUploadingIds(prev => new Set(prev).add(bookingId));

      const fileExt = file.name.split('.').pop();
      const fileName = `prescription_${bookingId}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from(config.tableName)
        .update({ 
          prescription: publicUrl,
          updated_at: new Date().toISOString() 
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, prescription: publicUrl } as BookingData
            : booking
        )
      );

      setError(null);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError('Failed to upload prescription file');
    } finally {
      setUploadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  // Cancel booking function
  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingIds(prev => new Set(prev).add(bookingId));

      const { error } = await supabase
        .from(config.tableName)
        .update({ 
          status: 'Cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'Cancelled' as const }
            : booking
        )
      );

      setError(null);
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking');
    } finally {
      setCancellingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  // Format functions
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateStr;
    }
  };

  const formatTime = (timeString: string, dateString: string) => {
    try {
      if (!timeString || typeof timeString !== 'string') {
        return 'N/A';
      }
      
      const time = timeString.length === 5 ? `${timeString}:00` : timeString;
      const [hours, minutes] = time.split(':').map(Number);
      const dateObj = new Date(`${dateString}T00:00:00Z`);
      dateObj.setUTCHours(hours, minutes);
      
      return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return 'N/A';
    }
  };

  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesFilter = filter === 'all' || booking.status === filter;
      const customerName = getFieldValue(booking, 'name').toLowerCase();
      const matchesSearch = searchQuery === '' || 
        customerName.includes(searchQuery.toLowerCase()) ||
        booking.booking_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (config.fields.additionalFields?.includes('doctor') && 
         (booking as DoctorBooking).doctor?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesFilter && matchesSearch;
    });
  }, [bookings, filter, searchQuery, config]);

const filteredBookings2 = useMemo( () => {
  return bookings.filter( i => {
    
  })

}, []

)


  useEffect(() => {
    fetchBookings();
  }, [user?.tenantId, refreshTrigger]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.tenantId) return;

    const channel = supabase
      .channel(config.channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.tableName,
          filter: `tenant_id=eq.${user.tenantId}`
        },
        (payload) => {
          console.log(`${config.displayName} change received:`, payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.tenantId, config]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="font-tori-garamond px-0 py-4 sm:px-2 lg:px-3">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-tori-garamond text-4xl font-light leading-[0.95] text-white sm:text-5xl lg:text-6xl 2xl:text-7xl">{config.displayName}</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 font-tori-garamond md:flex-row md:items-center">
        <input
          type="text"
          placeholder={`Search ${config.displayName.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-full border border-white/10 bg-white/[0.065] px-5 py-3 font-tori-garamond text-lg font-light text-white placeholder:text-blue-100/34 focus:border-[#9ed3ff]/45 focus:outline-none focus:ring-2 focus:ring-[#9ed3ff]/18 sm:text-xl md:w-[40%]"
        />
        <div className="relative z-50 md:ml-auto">
          <button
            type="button"
            onClick={() => setStatusMenuOpen((open) => !open)}
            className="tori-unstyled-button flex h-11 w-full min-w-[8.5rem] items-center justify-between rounded-full border border-white/10 bg-white/[0.075] py-2 pl-4 pr-3 font-tori-garamond text-lg font-light text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:bg-white/[0.1] md:w-auto"
          >
            <span>{selectedStatusLabel}</span>
            <svg className={`ml-4 h-4 w-4 text-blue-100/75 transition ${statusMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 6 8 10l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {statusMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[90] w-44 overflow-hidden rounded-[1.1rem] border border-white/12 bg-[#071421]/95 p-1.5 font-tori-garamond shadow-[0_22px_58px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setFilter(status);
                    setStatusMenuOpen(false);
                  }}
                  className={`tori-unstyled-button flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-left font-tori-garamond text-lg font-light transition ${
                    filter === status ? 'bg-[#9ed3ff]/16 text-white' : 'text-blue-100/68 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  {status === 'all' ? 'All Status' : status}
                  {filter === status && <span className="h-1.5 w-1.5 rounded-full bg-[#bfe4ff]" />}
                </button>
              ))}
            </div>
          )}
        </div>
        {config.serviceType === 'doctor' && (
          <button
            onClick={() => setShowNewAppointmentForm(true)}
            className="tori-unstyled-button group inline-flex items-center rounded-full border border-white/10 bg-white/[0.075] py-2 pl-2 pr-4 font-tori-garamond text-lg font-light text-white transition hover:bg-white/[0.11]"
          >
            <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#f3efe8] text-[#111827]">
              <svg className="h-4 w-4 transition duration-700 group-hover:rotate-[360deg]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </span>
            New Appointment
          </button>
        )}
      </div>

      {/* Bookings Table */}
      <div className="overflow-hidden rounded-[1.3rem] border border-white/10 bg-[#030812]/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_54px_rgba(0,0,0,0.2)] backdrop-blur-xl">
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
          <table className="min-w-[58rem] table-fixed divide-y divide-white/8 xl:min-w-full">
            <thead className="sticky top-0 bg-[#071421]/95 backdrop-blur-xl">
              <tr>
                {visibleColumns.map(column => (
                  <th key={column.key} className="px-6 py-4 text-center font-tori-garamond text-lg font-light normal-case text-blue-100/48 first:text-left">
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-4 text-center font-tori-garamond text-lg font-light normal-case text-blue-100/48">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="transition hover:bg-white/[0.025]">
                  {visibleColumns.map(column => (
                    <td key={column.key} className="px-6 py-5 text-center font-tori-garamond text-xl font-light text-white first:text-left">
                      {column.type === 'customer' && (
                        <div>
                          <div>{getFieldValue(booking, 'name')}</div>
                          <div className="text-lg text-blue-100/38">{getFieldValue(booking, 'contact')}</div>
                        </div>
                      )}
                      {column.type === 'text' && column.key === 'doctor' && (
                        <span>{(booking as DoctorBooking).doctor}</span>
                      )}
                      {column.type === 'datetime' && (
                        <div>
                          <div>{formatDate(booking.booking_date)}</div>
                          <div className="text-lg text-blue-100/38">{formatTime(booking.start_time, booking.booking_date)}</div>
                        </div>
                      )}
                      {column.type === 'status' && (
                        <span className={`inline-flex rounded-full border px-3 py-1 font-tori-garamond text-sm font-light leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] ${
                          booking.status === 'Scheduled' ? 'border-[#bfe4ff]/30 bg-[#bfe4ff]/18 text-[#dcefff]' :
                          booking.status === 'Completed' ? 'border-emerald-200/24 bg-emerald-300/14 text-emerald-100' :
                          booking.status === 'Cancelled' ? 'border-red-200/24 bg-red-400/12 text-red-100' :
                          booking.status === 'no-show' ? 'border-amber-200/24 bg-amber-300/12 text-amber-100' :
                          'border-white/14 bg-white/10 text-blue-100'
                        }`}>
                          {booking.status}
                        </span>
                      )}
                      {column.type === 'payment' && (
                        <div>
                          <div>{booking.amount ? `${booking.currency || 'INR'} ${booking.amount}` : 'N/A'}</div>
                          <div className="text-lg text-blue-100/38">{booking.payment_method?.toUpperCase() || 'N/A'}</div>
                        </div>
                      )}
                      {column.type === 'file' && config.hasFileUpload && (
                        <div>
                          {(booking as DoctorBooking).prescription ? (
                            <a 
                              href={(booking as DoctorBooking).prescription} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-900"
                            >
                              View
                            </a>
                          ) : (
                            <label className="cursor-pointer text-blue-600 hover:text-blue-900">
                              {uploadingIds.has(booking.id) ? 'Uploading...' : 'Upload'}
                              <input
                                type="file"
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(booking.id, file);
                                }}
                                disabled={uploadingIds.has(booking.id)}
                              />
                            </label>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleViewBooking(booking)}
                        className="tori-unstyled-button inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#b9ddff]/18 bg-[#b9ddff]/10 text-blue-100 transition hover:bg-[#b9ddff]/18 hover:text-white"
                        aria-label="View booking"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                      </button>
                      {booking.status === 'Scheduled' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingIds.has(booking.id)}
                          className="tori-unstyled-button inline-flex h-11 w-11 items-center justify-center rounded-full border border-red-200/18 bg-red-400/10 text-red-100 transition hover:bg-red-400/16 hover:text-white disabled:opacity-50"
                          aria-label="Cancel booking"
                        >
                          {cancellingIds.has(booking.id) ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No {config.displayName.toLowerCase()} found.
        </div>
      )}

      {/* Modals */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        config={config}
      />

      {config.serviceType === 'doctor' && showNewAppointmentForm && (
        <NewAppointmentForm
          onClose={() => setShowNewAppointmentForm(false)}
          onSuccess={triggerRefresh}
        />
      )}
    </div>
  );
};

export default UnifiedBookingPage;