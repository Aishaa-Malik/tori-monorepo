import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type TimeSlot = { start_time: string, end_time: string, price: number, label?: string };
type DaySlots = {
  morning: TimeSlot[];
  evening: TimeSlot[];
};

const ToriEmployeeOnboarding = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [bookingType, setBookingType] = useState('');
  
  // Multiple services state
  const [services, setServices] = useState([{ name: '', price: '', durationMins: '' }]);
  
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [weekdaySlots, setWeekdaySlots] = useState<DaySlots>({
    morning: [{ start_time: '06:00', end_time: '12:00', price: 0 }],
    evening: [{ start_time: '16:00', end_time: '22:00', price: 0 }]
  });
  const [sundaySlots, setSundaySlots] = useState<DaySlots>({
    morning: [{ start_time: '06:00', end_time: '12:00', price: 0 }],
    evening: [{ start_time: '16:00', end_time: '22:00', price: 0 }]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayToggle = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddSlot = (type: 'weekday' | 'sunday', period: 'morning' | 'evening') => {
    if (type === 'weekday') {
      setWeekdaySlots({
        ...weekdaySlots,
        [period]: [...weekdaySlots[period], { start_time: '', end_time: '', price: 0 }]
      });
    } else {
      setSundaySlots({
        ...sundaySlots,
        [period]: [...sundaySlots[period], { start_time: '', end_time: '', price: 0 }]
      });
    }
  };

  const handleRemoveSlot = (type: 'weekday' | 'sunday', period: 'morning' | 'evening', index: number) => {
    if (type === 'weekday') {
      const updatedPeriodSlots = weekdaySlots[period].filter((_, i) => i !== index);
      setWeekdaySlots({ 
        ...weekdaySlots, 
        [period]: updatedPeriodSlots
      });
    } else {
      const updatedPeriodSlots = sundaySlots[period].filter((_, i) => i !== index);
      setSundaySlots({ 
        ...sundaySlots, 
        [period]: updatedPeriodSlots
      });
    }
  };

  const handleSlotChange = (type: 'weekday' | 'sunday', period: 'morning' | 'evening', index: number, field: string, value: string) => {
    if (type === 'weekday') {
      const updatedPeriodSlots = [...weekdaySlots[period]];
      updatedPeriodSlots[index] = { ...updatedPeriodSlots[index], [field]: value } as any;
      setWeekdaySlots({ 
        ...weekdaySlots, 
        [period]: updatedPeriodSlots
      });
    } else {
      const updatedPeriodSlots = [...sundaySlots[period]];
      updatedPeriodSlots[index] = { ...updatedPeriodSlots[index], [field]: value } as any;
      setSundaySlots({ 
        ...sundaySlots, 
        [period]: updatedPeriodSlots
      });
    }
  };

  const handleAddService = () => {
    setServices([...services, { name: '', price: '', durationMins: '' }]);
  };

  const handleServiceChange = (index: number, field: string, value: string) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value } as any;
    setServices(newServices);
  };

  const handleRemoveService = (index: number) => {
    const newServices = [...services];
    newServices.splice(index, 1);
    setServices(newServices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Format slots to an array for backend
    const slotsArray = selectedDays.map(day => {
      if (day === 'Sunday') {
        return {
          day,
          times: [
            ...(sundaySlots.morning || []).map(s => ({ ...s, label: 'Morning Hourly Session' })),
            ...(sundaySlots.evening || []).map(s => ({ ...s, label: 'Evening Hourly Session' }))
          ]
        };
      } else {
        return {
          day,
          times: [
            ...(weekdaySlots.morning || []).map(s => ({ ...s, label: 'Morning Hourly Session' })),
            ...(weekdaySlots.evening || []).map(s => ({ ...s, label: 'Evening Hourly Session' }))
          ]
        };
      }
    });
    
    try {
      const { getApiUrl } = await import('../../utils/environmentUtils');
      const BACKEND_API_URL = getApiUrl();
      
      const response = await fetch(`${BACKEND_API_URL}/admin/onboard-business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phoneNumber,
          businessName,
          location,
          googleMapsLink,
          bookingType,
          services,
          slots: slotsArray,
          operatingDays: selectedDays
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to onboard business');
      }

      setSuccess(`Successfully onboarded business! Tenant ID: ${data.tenantId}`);
      // Clear form
      setEmail('');
      setPhoneNumber('');
      setBusinessName('');
      setLocation('');
      setGoogleMapsLink('');
      setServices([{ name: '', price: '', durationMins: '' }]);
      setSelectedDays([]);
      setWeekdaySlots({
        morning: [{ start_time: '06:00', end_time: '12:00', price: 0 }],
        evening: [{ start_time: '16:00', end_time: '22:00', price: 0 }]
      });
      setSundaySlots({
        morning: [{ start_time: '06:00', end_time: '12:00', price: 0 }],
        evening: [{ start_time: '16:00', end_time: '22:00', price: 0 }]
      });
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-blue-600">
          <h3 className="text-lg leading-6 font-medium text-white">Tori Employee - Admin Business Onboarding</h3>
          <p className="mt-1 max-w-2xl text-sm text-blue-100">
            Use this form to fully activate a business owner's profile so they can log in instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <div>
            <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">1. Owner Details</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Owner Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="owner@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">2. Business Details</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location (City)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Google Maps Link</label>
                <input
                  type="url"
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">3. Booking Setup</h4>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="single"
                  checked={bookingType === 'single'}
                  onChange={() => setBookingType('single')}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Single User (e.g. Turf)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="multi"
                  checked={bookingType === 'multi'}
                  onChange={() => setBookingType('multi')}
                  className="form-radio text-blue-600"
                />
                <span className="ml-2">Multi User (e.g. Gym)</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h4 className="text-md font-medium text-gray-900">4. Services</h4>
              <button
                type="button"
                onClick={handleAddService}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + Add Service
              </button>
            </div>
            
            <div className="space-y-6">
              {services.map((service, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveService(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Service Name</label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder="General Access"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder="e.g. 500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration (Mins)</label>
                      <input
                        type="number"
                        value={service.durationMins}
                        onChange={(e) => handleServiceChange(index, 'durationMins', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder="e.g. 60"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">5. Availability</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operating Days</label>
                <div className="flex flex-wrap gap-2 mb-6">
                  {daysOfWeek.map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        selectedDays.includes(day)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Monday - Saturday Section */}
              {selectedDays.some(day => day !== 'Sunday') && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-bold border-b border-gray-200 pb-2 mb-4">Monday - Saturday Timings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Morning Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">Morning Slots</h4>
                        <button 
                          type="button"
                          onClick={() => handleAddSlot('weekday', 'morning')} 
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          + Add
                        </button>
                      </div>
                      {weekdaySlots.morning.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input 
                            type="time" 
                            value={slot.start_time} 
                            onChange={(e) => handleSlotChange('weekday', 'morning', index, 'start_time', e.target.value)}
                            className="bg-white p-1 text-sm border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                          />
                          <span className="text-xs text-gray-500">to</span>
                          <input 
                            type="time" 
                            value={slot.end_time} 
                            onChange={(e) => handleSlotChange('weekday', 'morning', index, 'end_time', e.target.value)}
                            className="bg-white p-1 text-sm border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                          />
                          <button 
                            type="button"
                            onClick={() => handleRemoveSlot('weekday', 'morning', index)} 
                            className="text-red-500 hover:text-red-700 font-bold ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {weekdaySlots.morning.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No morning slots</p>
                      )}
                    </div>

                    {/* Evening Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">Evening Slots</h4>
                        <button 
                          type="button"
                          onClick={() => handleAddSlot('weekday', 'evening')} 
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          + Add
                        </button>
                      </div>
                      {weekdaySlots.evening.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input 
                            type="time" 
                            value={slot.start_time} 
                            onChange={(e) => handleSlotChange('weekday', 'evening', index, 'start_time', e.target.value)}
                            className="bg-white p-1 text-sm border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                          />
                          <span className="text-xs text-gray-500">to</span>
                          <input 
                            type="time" 
                            value={slot.end_time} 
                            onChange={(e) => handleSlotChange('weekday', 'evening', index, 'end_time', e.target.value)}
                            className="bg-white p-1 text-sm border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                          />
                          <button 
                            type="button"
                            onClick={() => handleRemoveSlot('weekday', 'evening', index)} 
                            className="text-red-500 hover:text-red-700 font-bold ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {weekdaySlots.evening.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No evening slots</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sunday Section */}
              {selectedDays.includes('Sunday') && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-bold border-b border-gray-200 pb-2 mb-4">Sunday Timings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Morning Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">Morning Slots</h4>
                        <button 
                          type="button"
                          onClick={() => handleAddSlot('sunday', 'morning')} 
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          + Add
                        </button>
                      </div>
                      {sundaySlots.morning.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input 
                            type="time" 
                            value={slot.start_time} 
                            onChange={(e) => handleSlotChange('sunday', 'morning', index, 'start_time', e.target.value)}
                            className="bg-white p-1 text-sm border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                          />
                          <span className="text-xs text-gray-500">to</span>
                          <input 
                            type="time" 
                            value={slot.end_time} 
                            onChange={(e) => handleSlotChange('sunday', 'morning', index, 'end_time', e.target.value)}
                            className="bg-white p-1 text-sm border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                          />
                          <button 
                            type="button"
                            onClick={() => handleRemoveSlot('sunday', 'morning', index)} 
                            className="text-red-500 hover:text-red-700 font-bold ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {sundaySlots.morning.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No morning slots</p>
                      )}
                    </div>

                    {/* Evening Section */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">Evening Slots</h4>
                        <button 
                          type="button"
                          onClick={() => handleAddSlot('sunday', 'evening')} 
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          + Add
                        </button>
                      </div>
                      {sundaySlots.evening.map((slot, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input 
                            type="time" 
                            value={slot.start_time} 
                            onChange={(e) => handleSlotChange('sunday', 'evening', index, 'start_time', e.target.value)}
                            className="bg-white p-1 text-sm border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                          />
                          <span className="text-xs text-gray-500">to</span>
                          <input 
                            type="time" 
                            value={slot.end_time} 
                            onChange={(e) => handleSlotChange('sunday', 'evening', index, 'end_time', e.target.value)}
                            className="bg-white p-1 text-sm border border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                          />
                          <button 
                            type="button"
                            onClick={() => handleRemoveSlot('sunday', 'evening', index)} 
                            className="text-red-500 hover:text-red-700 font-bold ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {sundaySlots.evening.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No evening slots</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || selectedDays.length === 0}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading || selectedDays.length === 0 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Processing...' : 'Activate Business'}
            </button>
            {selectedDays.length === 0 && (
              <p className="text-xs text-red-500 text-center mt-2">Please select at least one operating day.</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToriEmployeeOnboarding;
