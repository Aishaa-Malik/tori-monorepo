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
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Booking Details</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-2">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  Booking Reference
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {booking.booking_reference || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  Customer Name
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {getFieldValue(booking, 'name')}
                </td>
              </tr>
              {config.fields.additionalFields?.includes('doctor') && (
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                    Doctor
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {(booking as DoctorBooking).doctor}
                  </td>
                </tr>
              )}
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  Contact
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {getFieldValue(booking, 'contact') || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  Email
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {getFieldValue(booking, 'email') || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  Date & Time
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatDate(booking.booking_date)} at {formatTime(booking.start_time, booking.booking_date)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  Status
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
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
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  Payment Amount
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {booking.amount ? `${booking.currency || 'INR'} ${booking.amount}` : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  Payment Method
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {booking.payment_method ? booking.payment_method.toUpperCase() : 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  Payment ID
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {booking.payment_id || 'N/A'}
                </td>
              </tr>
              {config.hasFileUpload && config.fields.additionalFields?.includes('prescription') && (
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                    Prescription
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
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
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  Created At
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatTimestamp(booking.created_at || '')}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                  Last Updated
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatTimestamp(booking.updated_at || '')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onClose}
          >
            Close
          </button>
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">{config.displayName}</h1>
        {config.serviceType === 'doctor' && (
          <button
            onClick={() => setShowNewAppointmentForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            New Appointment
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder={`Search ${config.displayName.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {config.columns.map(column => (
                  <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  {config.columns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.type === 'customer' && (
                        <div>
                          <div className="font-medium">{getFieldValue(booking, 'name')}</div>
                          <div className="text-gray-500">{getFieldValue(booking, 'contact')}</div>
                        </div>
                      )}
                      {column.type === 'text' && column.key === 'doctor' && (
                        <span>{(booking as DoctorBooking).doctor}</span>
                      )}
                      {column.type === 'datetime' && (
                        <div>
                          <div>{formatDate(booking.booking_date)}</div>
                          <div className="text-gray-500">{formatTime(booking.start_time, booking.booking_date)}</div>
                        </div>
                      )}
                      {column.type === 'status' && (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          booking.status === 'no-show' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      )}
                      {column.type === 'payment' && (
                        <div>
                          <div>{booking.amount ? `${booking.currency || 'INR'} ${booking.amount}` : 'N/A'}</div>
                          <div className="text-gray-500">{booking.payment_method?.toUpperCase() || 'N/A'}</div>
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
                      {column.type === 'reference' && (
                        <span className="text-gray-500">{booking.booking_reference || 'N/A'}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewBooking(booking)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {booking.status === 'Scheduled' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingIds.has(booking.id)}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {cancellingIds.has(booking.id) ? 'Cancelling...' : 'Cancel'}
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