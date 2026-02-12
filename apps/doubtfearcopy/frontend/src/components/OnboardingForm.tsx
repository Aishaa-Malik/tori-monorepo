import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';
import { getApiUrl } from '../utils/environmentUtils';

interface TimeSlot {
  start_time: string;
  end_time: string;
  price: number;
}

interface Service {
  name: string;
  availabilitySchedule: {
    [key: string]: Array<TimeSlot>;
  };
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultAvailability = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: []
};

const OnboardingForm: React.FC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'Healthcare' | 'SportsVenue' | 'Fitness' | 'SpaSalon' | null>(null);
  const [bookingSystemType, setBookingSystemType] = useState<'1' | '2' | null>(null);
  const [turfName, setTurfName] = useState('');
  const [location, setLocation] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  
  // Services Management
  const [services, setServices] = useState<Service[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  
  // Modal State (Temporary Service being edited)
  const [tempServiceName, setTempServiceName] = useState('');
  const [tempAvailability, setTempAvailability] = useState<{
    [key: string]: Array<TimeSlot>;
  }>(JSON.parse(JSON.stringify(defaultAvailability)));
  const [tempSelectedDay, setTempSelectedDay] = useState<string>('Monday');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleUserTypeSelect = (type: 'Healthcare' | 'SportsVenue' | 'Fitness' | 'SpaSalon') => {
    setUserType(type);
  };

  // --- Modal Functions ---

  const openAddServiceModal = () => {
    setTempServiceName('');
    setTempAvailability(JSON.parse(JSON.stringify(defaultAvailability)));
    setTempSelectedDay('Monday');
    setModalError(null);
    setEditingServiceIndex(null);
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (index: number) => {
    const service = services[index];
    setTempServiceName(service.name);
    // Deep copy availability to avoid direct mutation
    setTempAvailability(JSON.parse(JSON.stringify(service.availabilitySchedule)));
    setTempSelectedDay('Monday');
    setModalError(null);
    setEditingServiceIndex(index);
    setIsServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsServiceModalOpen(false);
    setEditingServiceIndex(null);
  };

  const addTimeSlot = (day: string) => {
    setTempAvailability(prev => ({
      ...prev,
      [day]: [...prev[day], { start_time: '', end_time: '', price: 0 }]
    }));
  };

  const updateTimeSlot = (
    day: string, 
    index: number, 
    field: 'start_time' | 'end_time' | 'price', 
    value: string | number
  ) => {
    setTempAvailability(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setTempAvailability(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  };

  const isDayActive = (day: string) => {
    return tempAvailability[day]?.length > 0;
  };

  const saveService = () => {
    if (!tempServiceName.trim()) {
      setModalError('Please enter a service name');
      return;
    }

    // Check if at least one day has time slots
    const hasAnySlots = Object.values(tempAvailability).some(slots => slots.length > 0);
    if (!hasAnySlots) {
      setModalError('Please add at least one time slot for any day');
      return;
    }

    // Check if all time slots are properly filled
    const hasIncompleteSlots = Object.values(tempAvailability).some(slots => 
      slots.some(slot => !slot.start_time || !slot.end_time)
    );
    if (hasIncompleteSlots) {
      setModalError('Please fill in all time slots or remove empty ones');
      return;
    }

    // Add or Update services list
    if (editingServiceIndex !== null) {
      // Update existing service
      const updatedServices = [...services];
      updatedServices[editingServiceIndex] = {
        name: tempServiceName,
        availabilitySchedule: tempAvailability
      };
      setServices(updatedServices);
    } else {
      // Add new service
      setServices([...services, {
        name: tempServiceName,
        availabilitySchedule: tempAvailability
      }]);
    }

    closeServiceModal();
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // --- Navigation Functions ---

  const handleNext = () => {
    if (step === 1 && !userType) {
      setError('Please select your business type');
      return;
    }
    
    if (step === 2 && !bookingSystemType) {
      setError('Please select how your booking system should handle time slots');
      return;
    }
    
    if (step === 3 && userType === 'SportsVenue' && !turfName.trim()) {
      setError('Please enter your SportsVenue name');
      return;
    }
    
    // Step 4 is Service List. 
    if (step === 4) {
      if (services.length === 0) {
        setError('Please add at least one service');
        return;
      }
    }
    
    // Step 5 is Location
    if (step === 5) {
      if (!location.trim()) {
        setError('Please enter your location');
        return;
      }
      if (!googleMapsLink.trim()) {
        setError('Please enter your Google Maps profile link');
        return;
      }
    }

    setError(null);
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    // Final validation
    if (!location.trim()) {
      setError('Please enter your location');
      return;
    }
    if (!googleMapsLink.trim()) {
      setError('Please enter your Google Maps profile link');
      return;
    }

    if (services.length === 0) {
      setError('Please add at least one service before completing setup.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Transform services to backend format
      const formattedServices = services.map(service => {
        const timeSlotsObject: { [key: string]: TimeSlot[] } = {};
        const operatingDays: string[] = [];
        
        Object.entries(service.availabilitySchedule).forEach(([day, slots]) => {
          if (slots.length > 0) {
            operatingDays.push(day);
            timeSlotsObject[day] = slots;
          }
        });

        // Calculate representative price (first slot price)
        let firstPrice = 0;
        for (const day in timeSlotsObject) {
          if (timeSlotsObject[day].length > 0) {
            firstPrice = timeSlotsObject[day][0].price;
            break;
          }
        }

        return {
          name: service.name,
          operatingDays,
          timeSlots: timeSlotsObject,
          slotPrice: firstPrice
        };
      });

      const response = await fetch(`${getApiUrl()}/save-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          email: user.email,
          tenantId: user.tenantId,
          businessType: userType,
          businessName: userType === 'SportsVenue' ? turfName : null,
          services: formattedServices,
          bookingSystemType: bookingSystemType,
          location: location,
          googleMapsLink: googleMapsLink
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save onboarding data');
      }
      
      // window.location.href = userType === 'Healthcare' 
      //   ? '/dashboard' 
      //   : '/SportsVenue-dashboard';
      window.location.href = '/healthwellness-dashboard' ;
        
    } catch (err: any) {
      console.error('Error saving onboarding data:', err);
      setError('Failed to save your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">What type of business do you own?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                className={`p-6 border rounded-lg text-left ${
                  userType === 'Healthcare' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleUserTypeSelect('Healthcare')}
              >
                <div className="font-medium text-lg">Healthcare (Doctor, Physio, Vet)</div>
                <p className="text-gray-600 mt-2">Manage patient appointments and medical records</p>
              </button>
              
              <button
                className={`p-6 border rounded-lg text-left ${
                  userType === 'SportsVenue' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleUserTypeSelect('SportsVenue')}
              >
                <div className="font-medium text-lg">Sports Venues(Turf, Cricket)</div>
                <p className="text-gray-600 mt-2">Manage sports bookings & schedules</p>
              </button>

              <button
                className={`p-6 border rounded-lg text-left ${
                  userType === 'Fitness' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleUserTypeSelect('Fitness')}
              >
                <div className="font-medium text-lg">Fitness Workout</div>
                <p className="text-gray-600 mt-2">Manage Fitness classes and Sessions schedules</p>
              </button>

              <button
                className={`p-6 border rounded-lg text-left ${
                  userType === 'SpaSalon' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleUserTypeSelect('SpaSalon')}
              >
                <div className="font-medium text-lg">Spa & Salon</div>
                <p className="text-gray-600 mt-2">Manage Salon & Spa treatments and wellness Appointments</p>
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">How should your booking system handle time slot availability?</h2>
            <div className="grid grid-cols-1 gap-4">
              <button
                className={`p-6 border rounded-lg text-left ${
                  bookingSystemType === '1' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setBookingSystemType('1')}
              >
                <div className="font-medium text-lg">1. Single Booking (Exclusive Time Slots)</div>
                <p className="text-gray-600 mt-2">Only ONE person/customer can book each time slot</p>
              </button>
              
              <button
                className={`p-6 border rounded-lg text-left ${
                  bookingSystemType === '2' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setBookingSystemType('2')}
              >
                <div className="font-medium text-lg">2. Multiple Bookings (Shared Time Slots)</div>
                <p className="text-gray-600 mt-2">MULTIPLE people/customers can book the SAME time slot</p>
              </button>
            </div>
          </div>
        );
        
      case 3:
        return userType === 'SportsVenue' ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">What's your SportsVenue's name?</h2>
            <div>
              <input
                type="text"
                value={turfName}
                onChange={(e) => setTurfName(e.target.value)}
                placeholder="Enter your SportsVenue name"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        ) : (
          <>{setStep(4)}</>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Services</h3>
              <button
                onClick={openAddServiceModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <span className="text-xl">+</span> Add Service
              </button>
            </div>
            
            {services.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-2">No services added yet.</p>
                <p className="text-sm text-gray-400">Click "Add Service" to configure availability for your services.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {services.map((service, index) => (
                  <div 
                    key={index} 
                    className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-start cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => openEditServiceModal(index)}
                  >
                    <div>
                      <h4 className="font-bold text-lg text-gray-800">{service.name}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {Object.entries(service.availabilitySchedule)
                          .filter(([_, slots]) => slots.length > 0)
                          .map(([day, slots]) => (
                            <span key={day} className="mr-3 inline-block">
                              <span className="font-medium">{day.substring(0, 3)}:</span> {slots.length} slots
                            </span>
                          ))}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeService(index);
                      }}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Remove Service"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Where is your business located?</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (City/Area)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Bandra West"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Maps Profile Link
              </label>
              <input
                type="url"
                value={googleMapsLink}
                onChange={(e) => setGoogleMapsLink(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste the full URL to your business profile on Google Maps
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h1 className="text-center text-3xl font-extrabold text-gray-900">
          Welcome to Your Business Setup
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's get your account set up in just a few steps
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stepNumber === step
                      ? 'bg-blue-600 text-white'
                      : stepNumber < step
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
              ))}
            </div>
            <div className="overflow-hidden h-2 rounded-full bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {renderStep()}

          {/* Bottom Navigation */}
          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="text-gray-700 hover:text-gray-900"
              >
                Back
              </button>
            )}
            
            {step < 5 ? (
               <button
               type="button"
               onClick={handleNext}
               className="ml-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
             >
               Next
             </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`ml-auto bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start w-full">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Add Service
                    </h3>
                    
                    {modalError && (
                      <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                        {modalError}
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Title</label>
                      <input
                        type="text"
                        value={tempServiceName}
                        onChange={(e) => setTempServiceName(e.target.value)}
                        placeholder="e.g. Zumba, Fitness Training"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">Select Days & Slots</h4>
                      
                      {/* Day selection */}
                      <div className="grid grid-cols-7 gap-1">
                        {daysOfWeek.map(day => (
                          <button
                            key={day}
                            onClick={() => setTempSelectedDay(day)}
                            className={`p-2 rounded border text-xs transition-all ${
                              tempSelectedDay === day
                                ? 'border-blue-500 bg-blue-50'
                                : isDayActive(day)
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="font-semibold">{day.substring(0, 3)}</div>
                          </button>
                        ))}
                      </div>

                      {/* Time slots for selected day */}
                      <div className="border rounded-lg p-3 bg-gray-50 max-h-60 overflow-y-auto">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm font-medium">{tempSelectedDay} Slots</span>
                          <button
                            onClick={() => addTimeSlot(tempSelectedDay)}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            + Add Slot
                          </button>
                        </div>

                        {tempAvailability[tempSelectedDay].length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-4">
                            No slots. Click "+ Add Slot".
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {tempAvailability[tempSelectedDay].map((slot, index) => (
                              <div key={index} className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <input
                                    type="time"
                                    value={slot.start_time}
                                    onChange={(e) => updateTimeSlot(tempSelectedDay, index, 'start_time', e.target.value)}
                                    className="w-full px-2 py-1 text-xs border rounded"
                                  />
                                </div>
                                <div className="flex-1">
                                  <input
                                    type="time"
                                    value={slot.end_time}
                                    onChange={(e) => updateTimeSlot(tempSelectedDay, index, 'end_time', e.target.value)}
                                    className="w-full px-2 py-1 text-xs border rounded"
                                  />
                                </div>
                                <div className="w-20">
                                  <input
                                    type="number"
                                    placeholder="Price"
                                    value={slot.price}
                                    onChange={(e) => updateTimeSlot(tempSelectedDay, index, 'price', Number(e.target.value))}
                                    className="w-full px-2 py-1 text-xs border rounded"
                                  />
                                </div>
                                <button
                                  onClick={() => removeTimeSlot(tempSelectedDay, index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={saveService}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Service
                </button>
                <button
                  type="button"
                  onClick={closeServiceModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingForm;