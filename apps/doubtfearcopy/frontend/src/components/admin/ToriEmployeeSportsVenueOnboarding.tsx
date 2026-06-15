import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

type VenueInventoryItem = {
  id: string;
  name: string;
  subcategoryTag: string;
  price: string;
  durationMins: string;
};

type TimingBlock = {
  openingTime: string;
  closingTime: string;
};

type SettlementAccount = {
  legalBusinessName: string;
  settlementEmail: string;
  bankAccountNumber: string;
  confirmBankAccountNumber: string;
  ifscCode: string;
};

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CITY_OPTIONS = ['Bangalore', 'Hyderabad', 'Jaipur', 'Delhi'] as const;
const STANDARD_VENUE_SERVICES = [
  'Football Turf',
  'Box Cricket',
  'Badminton Court',
  'Pickleball Court',
  'Padel Court'
  // 'Cricket Nets',
  // 'Badminton Court',
  // 'Pickleball Court',
  // 'Padel Court',
] as const;
const DURATION_OPTIONS = [30, 60, 90, 120] as const;
const DEFAULT_PRICE_PER_HOUR = 1000;
const DEFAULT_DURATION_MINS = 60;

const createInventoryItem = (name = 'Football Turf'): VenueInventoryItem => ({
  id: crypto.randomUUID(),
  name,
  subcategoryTag: getSubcategoryTagForService(name),
  price: String(DEFAULT_PRICE_PER_HOUR),
  durationMins: String(DEFAULT_DURATION_MINS),
});

function getSubcategoryTagForService(serviceName: string) {
  const normalizedName = serviceName.toLowerCase();

  if (
    normalizedName.includes('badminton') ||
    normalizedName.includes('pickleball') ||
    normalizedName.includes('padel')
  ) {
    return 'racket_courts';
  }

  return 'turf_cricket';
}

function createTimeSlots(days: DayOfWeek[], weekdayTiming: TimingBlock, sundayTiming: TimingBlock, price: number, label: string) {
  return days.reduce<Record<string, Array<{ start_time: string; end_time: string; price: number; label: string }>>>(
    (accumulator, day) => {
      const timing = day === 'Sunday' ? sundayTiming : weekdayTiming;

      accumulator[day] = [
        {
          start_time: timing.openingTime,
          end_time: timing.closingTime,
          price,
          label,
        },
      ];

      return accumulator;
    },
    {}
  );
}

const ToriEmployeeSportsVenueOnboarding: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryCity = searchParams.get('city') || '';
  const initialCity = CITY_OPTIONS.includes(queryCity as typeof CITY_OPTIONS[number]) ? queryCity : 'Bangalore';

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phone') || '');
  const [city, setCity] = useState(initialCity);
  const [businessName, setBusinessName] = useState(searchParams.get('venueName') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '4.8');
  const [location, setLocation] = useState(searchParams.get('address') || '');
  const [shortLocation, setShortLocation] = useState(
    searchParams.get('shortLocation') || searchParams.get('short_location') || ''
  );
  const [googleMapsLink, setGoogleMapsLink] = useState(searchParams.get('mapsUrl') || '');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([...DAYS_OF_WEEK]);
  const [weekdayTiming, setWeekdayTiming] = useState<TimingBlock>({ openingTime: '06:00', closingTime: '23:00' });
  const [sundayTiming, setSundayTiming] = useState<TimingBlock>({ openingTime: '06:00', closingTime: '23:00' });
  const [inventoryItems, setInventoryItems] = useState<VenueInventoryItem[]>([createInventoryItem()]);
  const [settlementAccount, setSettlementAccount] = useState<SettlementAccount>({
    legalBusinessName: searchParams.get('venueName') || '',
    settlementEmail: searchParams.get('email') || '',
    bankAccountNumber: '',
    confirmBankAccountNumber: '',
    ifscCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!CITY_OPTIONS.includes(city as typeof CITY_OPTIONS[number])) {
      setCity('Bangalore');
    }
  }, [city]);

  const handleBusinessNameChange = (value: string) => {
    setSettlementAccount((currentAccount) => ({
      ...currentAccount,
      legalBusinessName:
        !currentAccount.legalBusinessName || currentAccount.legalBusinessName === businessName
          ? value
          : currentAccount.legalBusinessName,
    }));
    setBusinessName(value);
  };

  const handleEmailChange = (value: string) => {
    setSettlementAccount((currentAccount) => ({
      ...currentAccount,
      settlementEmail:
        !currentAccount.settlementEmail || currentAccount.settlementEmail === email
          ? value
          : currentAccount.settlementEmail,
    }));
    setEmail(value);
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((currentDays) =>
      currentDays.includes(day) ? currentDays.filter((selectedDay) => selectedDay !== day) : [...currentDays, day]
    );
  };

  const updateInventoryItem = (itemId: string, field: keyof VenueInventoryItem, value: string) => {
    setInventoryItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        if (field === 'name') {
          return {
            ...item,
            name: value,
            subcategoryTag: getSubcategoryTagForService(value),
          };
        }

        return { ...item, [field]: value };
      })
    );
  };

  const addInventoryItem = () => {
    setInventoryItems((currentItems) => [...currentItems, createInventoryItem('')]);
  };

  const removeInventoryItem = (itemId: string) => {
    setInventoryItems((currentItems) =>
      currentItems.length === 1 ? currentItems : currentItems.filter((item) => item.id !== itemId)
    );
  };

  const handleSettlementChange = (field: keyof SettlementAccount, value: string) => {
    setSettlementAccount((currentAccount) => ({ ...currentAccount, [field]: value }));
  };

  const handleReset = () => {
    setEmail('');
    setPhoneNumber('');
    setCity('Bangalore');
    setBusinessName('');
    setRating('4.8');
    setLocation('');
    setShortLocation('');
    setGoogleMapsLink('');
    setSelectedDays([...DAYS_OF_WEEK]);
    setWeekdayTiming({ openingTime: '06:00', closingTime: '23:00' });
    setSundayTiming({ openingTime: '06:00', closingTime: '23:00' });
    setInventoryItems([createInventoryItem()]);
    setSettlementAccount({
      legalBusinessName: '',
      settlementEmail: '',
      bankAccountNumber: '',
      confirmBankAccountNumber: '',
      ifscCode: '',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (selectedDays.length === 0) {
        throw new Error('Select at least one operational day.');
      }

      if (settlementAccount.bankAccountNumber !== settlementAccount.confirmBankAccountNumber) {
        throw new Error('Bank account number and confirm account number must match.');
      }

      const services = inventoryItems
        .filter((item) => item.name.trim())
        .map((item) => {
          const price = Number(item.price) || DEFAULT_PRICE_PER_HOUR;
          const durationMins = Number(item.durationMins) || DEFAULT_DURATION_MINS;

          return {
            name: item.name.trim(),
            subcategoryTag: item.subcategoryTag,
            category: 'Sports Venues',
            price,
            durationMins,
            operatingDays: selectedDays,
            timeSlots: createTimeSlots(selectedDays, weekdayTiming, sundayTiming, price, `${item.name.trim()} Hourly Slot`),
          };
        });

      if (services.length === 0) {
        throw new Error('Add at least one court or pitch before submitting.');
      }

      const { getApiUrl } = await import('../../utils/environmentUtils');
      const response = await fetch(`${getApiUrl()}/admin/onboard-business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phoneNumber,
          businessName,
          rating: Number(rating),
          city,
          location,
          shortLocation,
          googleMapsLink,
          bookingType: 'single',
          businessType: 'Turf',
          category: 'Sports Venues',
          subcategoryTag: services[0]?.subcategoryTag || 'turf_cricket',
          services,
          operatingDays: selectedDays,
          settlementAccount: {
            legalBusinessName: settlementAccount.legalBusinessName.trim(),
            settlementEmail: settlementAccount.settlementEmail.trim(),
            bankAccountNumber: settlementAccount.bankAccountNumber.trim(),
            ifscCode: settlementAccount.ifscCode.trim().toUpperCase(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to onboard sports venue');
      }

      setSuccess(`${businessName || 'Sports venue'} onboarded successfully. Tenant ID: ${data.tenantId}`);
      handleReset();
    } catch (submissionError: any) {
      setError(submissionError.message || 'An error occurred during sports venue onboarding.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-blue-600">
          <h3 className="text-lg leading-6 font-medium text-white">Tori Employee - Sports Venue Onboarding</h3>
          <p className="mt-1 max-w-3xl text-sm text-blue-100">
            Register turfs, cricket pitches, and racket courts with pre-filled schedules and Razorpay Route settlement details.
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

          <section>
            <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">1. Owner Details</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Owner Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="owner@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  required
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">2. Venue Profile</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <select
                  required
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                >
                  {CITY_OPTIONS.map((cityOption) => (
                    <option key={cityOption} value={cityOption}>
                      {cityOption}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                <input
                  required
                  type="text"
                  value={businessName}
                  onChange={(event) => handleBusinessNameChange(event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Arena Sports Turf"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Full Operational Address</label>
                <input
                  required
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Full venue address with landmark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="4.8"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Short Location</label>
                <input
                  required
                  type="text"
                  value={shortLocation}
                  onChange={(event) => setShortLocation(event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="e.g. Mahadevapura, Bengaluru"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Google Maps Location URL</label>
                <input
                  required
                  type="url"
                  value={googleMapsLink}
                  onChange={(event) => setGoogleMapsLink(event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">3. Operating Schedule</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operational Days</label>
                <div className="flex flex-wrap gap-2 mb-6">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(day)}
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-bold border-b border-gray-200 pb-2 mb-4">Mon-Sat Timings</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Opening Time</label>
                      <input
                        type="time"
                        value={weekdayTiming.openingTime}
                        onChange={(event) => setWeekdayTiming((current) => ({ ...current, openingTime: event.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Closing Time</label>
                      <input
                        type="time"
                        value={weekdayTiming.closingTime}
                        onChange={(event) => setWeekdayTiming((current) => ({ ...current, closingTime: event.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="font-bold border-b border-gray-200 pb-2 mb-4">Sunday Timings</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Opening Time</label>
                      <input
                        type="time"
                        value={sundayTiming.openingTime}
                        onChange={(event) => setSundayTiming((current) => ({ ...current, openingTime: event.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Closing Time</label>
                      <input
                        type="time"
                        value={sundayTiming.closingTime}
                        onChange={(event) => setSundayTiming((current) => ({ ...current, closingTime: event.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h4 className="text-md font-medium text-gray-900">4. Court / Pitch Inventory</h4>
              <button
                type="button"
                onClick={addInventoryItem}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                + Add Another Court/Pitch
              </button>
            </div>

            <div className="space-y-4">
              {inventoryItems.map((item, index) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                  {inventoryItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInventoryItem(item.id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Service Name</label>
                      <input
                        required
                        type="text"
                        list="sports-venue-service-options"
                        value={item.name}
                        onChange={(event) => updateInventoryItem(item.id, 'name', event.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder="Select or type custom"
                      />
                      {index === 0 && (
                        <datalist id="sports-venue-service-options">
                          {STANDARD_VENUE_SERVICES.map((serviceName) => (
                            <option key={serviceName} value={serviceName} />
                          ))}
                        </datalist>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Choose from the list or type a custom court/pitch.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subcategory Tag</label>
                      <select
                        value={item.subcategoryTag}
                        onChange={(event) => updateInventoryItem(item.id, 'subcategoryTag', event.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                      >
                        <option value="turf_cricket">Turf / Cricket 🏟️</option>
                        <option value="racket_courts">Racket Courts</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price per Hour</label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(event) => updateInventoryItem(item.id, 'price', event.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Slot Duration Block</label>
                      <select
                        value={item.durationMins}
                        onChange={(event) => updateInventoryItem(item.id, 'durationMins', event.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white"
                      >
                        {DURATION_OPTIONS.map((duration) => (
                          <option key={duration} value={duration}>
                            {duration} Mins
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-md font-medium text-gray-900 border-b pb-2 mb-4">5. Razorpay Route Settlement Profile</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Legal Business Name</label>
                <input
                  required
                  type="text"
                  value={settlementAccount.legalBusinessName}
                  onChange={(event) => handleSettlementChange('legalBusinessName', event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Registered Settlement Email</label>
                <input
                  required
                  type="email"
                  value={settlementAccount.settlementEmail}
                  onChange={(event) => handleSettlementChange('settlementEmail', event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  value={settlementAccount.bankAccountNumber}
                  onChange={(event) => handleSettlementChange('bankAccountNumber', event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Account Number</label>
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  value={settlementAccount.confirmBankAccountNumber}
                  onChange={(event) => handleSettlementChange('confirmBankAccountNumber', event.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                <input
                  required
                  type="text"
                  value={settlementAccount.ifscCode}
                  onChange={(event) => handleSettlementChange('ifscCode', event.target.value.toUpperCase())}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border uppercase"
                  placeholder="HDFC0001234"
                />
              </div>
            </div>
          </section>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || selectedDays.length === 0}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isLoading || selectedDays.length === 0 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Processing...' : 'Activate Sports Venue'}
            </button>
            {selectedDays.length === 0 && (
              <p className="text-xs text-red-500 text-center mt-2">Please select at least one operational day.</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToriEmployeeSportsVenueOnboarding;
