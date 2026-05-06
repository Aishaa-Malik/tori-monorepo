import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ToriEmployeeOnboarding = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [bookingType, setBookingType] = useState('single');
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [durationMins, setDurationMins] = useState('');
  
  // Minimal slot representation for this form (e.g. daily 9am to 5pm)
  const [operatingDays, setOperatingDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayToggle = (day: string) => {
    if (operatingDays.includes(day)) {
      setOperatingDays(operatingDays.filter(d => d !== day));
    } else {
      setOperatingDays([...operatingDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Prepare slots array
    const slots = operatingDays.map(day => ({
      day,
      times: [
        {
          start_time: startTime,
          end_time: endTime,
          price: Number(price),
          capacity: bookingType === 'multi' ? 20 : 1 // Example capacity logic
        }
      ]
    }));

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
          serviceName,
          price: Number(price),
          durationMins: Number(durationMins),
          slots
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
      setServiceName('');
      setPrice('');
      setDurationMins('');
      setOperatingDays([]);
      
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
                  required
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
                  required
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
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location (City)</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Google Maps Link</label>
                <input
                  type="url"
                  required
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
            <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">4. Default Service</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Name</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="General Access"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="e.g. 500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (Mins)</label>
                <input
                  type="number"
                  required
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="e.g. 60"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">5. Availability</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operating Days</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        operatingDays.includes(day)
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || operatingDays.length === 0}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading || operatingDays.length === 0 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Processing...' : 'Activate Business'}
            </button>
            {operatingDays.length === 0 && (
              <p className="text-xs text-red-500 text-center mt-2">Please select at least one operating day.</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToriEmployeeOnboarding;
