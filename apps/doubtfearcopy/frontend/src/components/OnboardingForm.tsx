import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../utils/environmentUtils';

interface TimeSlot {
  start_time: string;
  end_time: string;
  price: number;
  label?: string;
}

interface Service {
  name: string;
  subcategoryTag?: string;
  availabilitySchedule: {
    [key: string]: Array<TimeSlot>;
  };
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_SLOT_PRICE = 99;
const DEFAULT_SLOT_DURATION_MINS = 60;

const FITNESS_CATEGORIES = [
  { label: 'Gym', value: 'gym' },
  { label: 'Zumba', value: 'zumba' },
  { label: 'Yoga', value: 'yoga' },
  { label: 'Nature Workout', value: 'nature_workout' },
  { label: 'Meditation', value: 'meditation' },
  { label: 'Fitness Dance Party', value: 'dance_party' },
] as const;

const FITNESS_SERVICE_NAME_OPTIONS = [
  'Abs Exercise',
  'Cardio',
  'Crossfit',
  'Eco Fitness Dance',
  'Floor Exercise',
  'Gym Workout',
  'Half Yearly Gym Membership',
  'HIIT',
  'Monthly Gym + PT Membership',
  'Monthly Gym Membership',
  'Nature Fun Workout',
  'Quarterly Gym Membership',
  'Relaxing Meditation in Nature',
  'Strength',
  'Tabata',
  'Weight Loss',
  'Yoga',
  'Yog_Medit_Therapy Combo',
  'Zumba',
] as const;

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
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  
  // Services Management
  const [services, setServices] = useState<Service[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  
  // Modal State (Temporary Service being edited)
  const [tempServiceName, setTempServiceName] = useState('');
  const [tempSubcategoryTag, setTempSubcategoryTag] = useState('');
  const [tempAvailability, setTempAvailability] = useState<{
    [key: string]: Array<TimeSlot>;
  }>(JSON.parse(JSON.stringify(defaultAvailability)));
  const [tempSelectedDay, setTempSelectedDay] = useState<string>('Monday');
  
  // Copy to Other Days Modal State
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [selectedDaysToCopy, setSelectedDaysToCopy] = useState<string[]>([]);
  
  // Series Generator State
  const [genFirstStart, setGenFirstStart] = useState('');
  const [genLastStart, setGenLastStart] = useState('');
  const [genDuration, setGenDuration] = useState<number | ''>(DEFAULT_SLOT_DURATION_MINS);
  const [genPrice, setGenPrice] = useState<number | ''>(DEFAULT_SLOT_PRICE);
  const [genLabel, setGenLabel] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleUserTypeSelect = (type: 'Healthcare' | 'SportsVenue' | 'Fitness' | 'SpaSalon') => {
    setUserType(type);
  };

  // --- Modal Functions ---

  const openAddServiceModal = () => {
    setTempServiceName('');
    setTempSubcategoryTag('');
    setTempAvailability(JSON.parse(JSON.stringify(defaultAvailability)));
    setTempSelectedDay('Monday');
    setGenFirstStart('');
    setGenLastStart('');
    setGenDuration(DEFAULT_SLOT_DURATION_MINS);
    setGenPrice(DEFAULT_SLOT_PRICE);
    setGenLabel('');
    setModalError(null);
    setEditingServiceIndex(null);
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (index: number) => {
    const service = services[index];
    setTempServiceName(service.name);
    setTempSubcategoryTag(service.subcategoryTag || '');
    // Deep copy availability to avoid direct mutation
    setTempAvailability(JSON.parse(JSON.stringify(service.availabilitySchedule)));
    setTempSelectedDay('Monday');
    setGenFirstStart('');
    setGenLastStart('');
    setGenDuration(DEFAULT_SLOT_DURATION_MINS);
    setGenPrice(DEFAULT_SLOT_PRICE);
    setGenLabel(service.name);
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
      [day]: [...prev[day], { start_time: '', end_time: '', price: DEFAULT_SLOT_PRICE, label: '' }]
    }));
  };

  const clearAllSlots = (day: string) => {
    setTempAvailability(prev => ({
      ...prev,
      [day]: []
    }));
  };

  const timeToMs = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60 + minutes) * 60 * 1000;
  };

  const msToTime = (ms: number) => {
    const totalMinutes = Math.floor(ms / (60 * 1000));
    let hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const generateSeries = () => {
    if (!genFirstStart || !genLastStart || !genDuration || genPrice === '' || !genLabel.trim()) {
      setModalError('Please fill all generator fields');
      return;
    }
    
    const duration = Number(genDuration);
    if (isNaN(duration) || duration <= 0) {
      setModalError('Invalid duration');
      return;
    }

    const price = Number(genPrice);
    if (isNaN(price) || price < 0) {
      setModalError('Invalid price');
      return;
    }

    const startMs = timeToMs(genFirstStart);
    const endMs = timeToMs(genLastStart);

    if (startMs > endMs) {
      setModalError('First start time cannot be after last start time');
      return;
    }

    const generatedSlots: TimeSlot[] = [];
    let currentStartMs = startMs;

    while (currentStartMs <= endMs) {
      const currentEndMs = currentStartMs + duration * 60 * 1000;
      
      generatedSlots.push({
        start_time: msToTime(currentStartMs),
        end_time: msToTime(currentEndMs),
        price: price,
        label: genLabel
      });

      currentStartMs = currentEndMs;
    }

    setTempAvailability(prev => ({
      ...prev,
      [tempSelectedDay]: [...prev[tempSelectedDay], ...generatedSlots]
    }));
    
    setModalError(null);
  };

  const updateTimeSlot = (
    day: string, 
    index: number, 
    field: 'start_time' | 'end_time' | 'price' | 'label', 
    value: string | number
  ) => {
    setTempAvailability(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => {
        if (i !== index) {
          return slot;
        }

        if (field === 'start_time' && typeof value === 'string' && value && !slot.end_time) {
          const defaultEndTime = msToTime(timeToMs(value) + DEFAULT_SLOT_DURATION_MINS * 60 * 1000);
          return { ...slot, start_time: value, end_time: defaultEndTime };
        }

        return { ...slot, [field]: value };
      })
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

  // --- Copy to Other Days Logic ---
  
  const openCopyModal = () => {
    // Select all days by default except the current one
    const initialSelection = daysOfWeek.filter(d => d !== tempSelectedDay);
    setSelectedDaysToCopy(initialSelection);
    setIsCopyModalOpen(true);
  };

  const closeCopyModal = () => {
    setIsCopyModalOpen(false);
  };

  const handleToggleDaySelection = (day: string) => {
    setSelectedDaysToCopy(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSelectAllDays = () => {
    const allOtherDays = daysOfWeek.filter(d => d !== tempSelectedDay);
    if (selectedDaysToCopy.length === allOtherDays.length) {
      // If all are selected, deselect all
      setSelectedDaysToCopy([]);
    } else {
      // Otherwise, select all
      setSelectedDaysToCopy(allOtherDays);
    }
  };

  const applyCopySlots = () => {
    const sourceSlots = [...tempAvailability[tempSelectedDay]];
    
    // Deep copy to prevent reference issues
    const slotsToCopy = JSON.parse(JSON.stringify(sourceSlots));
    
    setTempAvailability(prev => {
      const updatedAvailability = { ...prev };
      
      selectedDaysToCopy.forEach(day => {
        updatedAvailability[day] = JSON.parse(JSON.stringify(slotsToCopy));
      });
      
      return updatedAvailability;
    });
    
    closeCopyModal();
  };

  const saveService = () => {
    if (!tempServiceName.trim()) {
      setModalError('Please enter a service name');
      return;
    }

    if (userType === 'Fitness' && !tempSubcategoryTag) {
      setModalError('Please select a fitness category tag');
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
        subcategoryTag: tempSubcategoryTag || undefined,
        availabilitySchedule: tempAvailability
      };
      setServices(updatedServices);
    } else {
      // Add new service
      setServices([...services, {
        name: tempServiceName,
        subcategoryTag: tempSubcategoryTag || undefined,
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
    
    if (step === 2) {
      if (!businessName.trim()) {
        setError('Please enter your business name');
        return;
      }
      if (!bookingSystemType) {
        setError('Please select how your booking system should handle time slots');
        return;
      }
    }
    
    // Step 3 is Service List. 
    if (step === 3) {
      if (services.length === 0) {
        setError('Please add at least one service');
        return;
      }
    }
    
    // Step 4 is Location
    if (step === 4) {
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

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
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
          subcategoryTag: service.subcategoryTag || null,
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
          businessType: userType === 'Fitness' ? 'Fitness & Gym' : userType,
          businessName: businessName,
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
            <h2 className="text-xl font-semibold text-gray-800">What's your business name?</h2>
            <div>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-6">How should your booking system handle time slot availability?</h2>
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
                      {service.subcategoryTag && (
                        <div className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {service.subcategoryTag}
                        </div>
                      )}
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

      case 4:
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
              {[1, 2, 3, 4].map((stepNumber) => (
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
                style={{ width: `${((step - 1) / 3) * 100}%` }}
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
                onClick={handleBack}
                className="text-gray-700 hover:text-gray-900"
              >
                Back
              </button>
            )}
            
            {step < 4 ? (
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

                    <div className={`mb-4 grid gap-4 ${userType === 'Fitness' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                        <input
                          type="text"
                          list={userType === 'Fitness' ? 'fitness-service-name-options' : undefined}
                          value={tempServiceName}
                          onChange={(e) => setTempServiceName(e.target.value)}
                          placeholder="Select or type a service name"
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        {userType === 'Fitness' && (
                          <>
                            <datalist id="fitness-service-name-options">
                              {FITNESS_SERVICE_NAME_OPTIONS.map((serviceName) => (
                                <option key={serviceName} value={serviceName} />
                              ))}
                            </datalist>
                            <p className="mt-1 text-xs text-gray-500">
                              Choose from the list or type a new service name.
                            </p>
                          </>
                        )}
                      </div>

                      {userType === 'Fitness' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Tag</label>
                          <select
                            value={tempSubcategoryTag}
                            onChange={(e) => setTempSubcategoryTag(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white"
                          >
                            <option value="">Select a category</option>
                            {FITNESS_CATEGORIES.map((category) => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
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
                      
                      {/* Generator UI */}
                      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-bold text-gray-800 mb-3">Series-Based Slot Generator</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">First Start Time</label>
                            <input 
                              type="time" 
                              value={genFirstStart}
                              onChange={(e) => setGenFirstStart(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Last Start Time</label>
                            <input 
                              type="time" 
                              value={genLastStart}
                              onChange={(e) => setGenLastStart(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Duration (mins)</label>
                            <input 
                              type="number" 
                              value={genDuration}
                              onChange={(e) => setGenDuration(e.target.value ? Number(e.target.value) : '')}
                              placeholder="60"
                              className="w-full p-2 border border-gray-300 rounded text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Default Price</label>
                            <input 
                              type="number" 
                              value={genPrice}
                              onChange={(e) => setGenPrice(e.target.value ? Number(e.target.value) : '')}
                              placeholder="99"
                              className="w-full p-2 border border-gray-300 rounded text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Default Label</label>
                            <input 
                              type="text" 
                              value={genLabel}
                              onChange={(e) => setGenLabel(e.target.value)}
                              placeholder="Premium Session"
                              className="w-full p-2 border border-gray-300 rounded text-sm" 
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center">
                          <p className="text-xs text-gray-500 italic">
                            {genLastStart && genDuration ? 
                              `The last slot will end at ${msToTime(timeToMs(genLastStart) + Number(genDuration) * 60 * 1000)}` 
                              : "Enter times and duration to generate."}
                          </p>
                          <button
                            onClick={generateSeries}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors"
                          >
                            Generate Series
                          </button>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-3 bg-white max-h-80 overflow-y-auto shadow-sm">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b">
                          <span className="text-sm font-bold text-gray-800">{tempSelectedDay} Editable Slots List</span>
                          <div className="flex gap-2">
                            {tempAvailability[tempSelectedDay]?.length > 0 && (
                              <>
                                <button
                                  onClick={() => clearAllSlots(tempSelectedDay)}
                                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                                >
                                  Clear All
                                </button>
                                <button
                                  onClick={openCopyModal}
                                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Copy to...
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => addTimeSlot(tempSelectedDay)}
                              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              + Add Slot
                            </button>
                          </div>
                        </div>

                        {tempAvailability[tempSelectedDay]?.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            No slots for {tempSelectedDay}. Generate a series or add one manually.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {tempAvailability[tempSelectedDay]?.map((slot, index) => (
                              <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                                <div className="w-full sm:w-1/3">
                                  <label className="sr-only">Label</label>
                                  <input
                                    type="text"
                                    value={slot.label || ''}
                                    onChange={(e) => updateTimeSlot(tempSelectedDay, index, 'label', e.target.value)}
                                    placeholder="Slot Label"
                                    className="w-full p-1.5 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div className="w-1/3 sm:w-1/5">
                                  <label className="sr-only">Start</label>
                                  <input
                                    type="time"
                                    value={slot.start_time}
                                    onChange={(e) => updateTimeSlot(tempSelectedDay, index, 'start_time', e.target.value)}
                                    className="w-full p-1.5 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div className="hidden sm:block text-gray-400">-</div>
                                <div className="w-1/3 sm:w-1/5">
                                  <label className="sr-only">End</label>
                                  <input
                                    type="time"
                                    value={slot.end_time}
                                    onChange={(e) => updateTimeSlot(tempSelectedDay, index, 'end_time', e.target.value)}
                                    className="w-full p-1.5 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <div className="w-1/4 sm:w-1/6">
                                  <label className="sr-only">Price</label>
                                  <input
                                    type="number"
                                    value={slot.price || ''}
                                    onChange={(e) => updateTimeSlot(tempSelectedDay, index, 'price', e.target.value ? Number(e.target.value) : DEFAULT_SLOT_PRICE)}
                                    placeholder="Price"
                                    className="w-full p-1.5 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                                <button
                                  onClick={() => removeTimeSlot(tempSelectedDay, index)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                  title="Delete Slot"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
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

      {/* Copy to Other Days Modal */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={closeCopyModal}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start w-full">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                      Copy {tempSelectedDay} Slots
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Select the days you want to copy these {tempAvailability[tempSelectedDay]?.length} slots to. This will overwrite any existing slots on those days.
                    </p>

                    <div className="mb-4">
                      <button
                        onClick={handleSelectAllDays}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mb-2"
                      >
                        {selectedDaysToCopy.length === daysOfWeek.length - 1 ? 'Deselect All' : 'Select All Weekdays'}
                      </button>
                      
                      <div className="space-y-2 border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto bg-gray-50">
                        {daysOfWeek
                          .filter(day => day !== tempSelectedDay)
                          .map(day => (
                          <label key={day} className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                            <input
                              type="checkbox"
                              checked={selectedDaysToCopy.includes(day)}
                              onChange={() => handleToggleDaySelection(day)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700 flex-1">
                              {day}
                            </span>
                            {tempAvailability[day]?.length > 0 && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                Overwrite ({tempAvailability[day].length} existing)
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t">
                <button
                  type="button"
                  onClick={applyCopySlots}
                  disabled={selectedDaysToCopy.length === 0}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                    selectedDaysToCopy.length === 0
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  Apply to {selectedDaysToCopy.length} Day{selectedDaysToCopy.length !== 1 ? 's' : ''}
                </button>
                <button
                  type="button"
                  onClick={closeCopyModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
