import { getApiUrl } from '../utils/environmentUtils';

const debugPublicListings = (hypothesisId: string, message: string, data: Record<string, unknown>) => {
  // #region agent log
  fetch('http://127.0.0.1:7936/ingest/92ede0b0-b5da-4b2a-b38e-ceee586e37ba',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'00f974'},body:JSON.stringify({sessionId:'00f974',runId:'public-listings-initial',hypothesisId,location:'src/services/publicListings.ts',message,data,timestamp:Date.now()})}).catch(()=>{});
  // #endregion
};

type RawTimeSlot = {
  start_time?: string;
  end_time?: string;
  price?: number;
  label?: string;
};

export type WeeklySlot = {
  service_id: string;
  day_of_week: string;
  is_open: boolean;
  time_slots: RawTimeSlot[];
};

export type PublicListingRecord = {
  id: string;
  profileId: string;
  serviceName: string;
  category: string;
  subcategoryTag: string | null;
  price: number | null;
  durationMins: number | null;
  operatingDays: string[];
  weeklySlots: WeeklySlot[];
  businessName: string;
  location: string;
  googleMapsLink: string | null;
  rating: number | null;
  reviewCount: number | null;
  email: string | null;
};

const DEFAULT_IMAGES: Record<string, string> = {
  gym: '/images/Euro Fitness Center.jpg',
  zumba: '/images/zumba.jpg',
  yoga: '/images/parkyoga.png',
  nature_workout: '/images/nature workout.png',
  meditation: '/images/meditation.png',
  dance_party: '/images/dancecp.png',
};

const ensureSuccess = async (response: Response) => {
  // #region agent log
  debugPublicListings('H2_H3', 'public listings response received', {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    contentType: response.headers.get('content-type'),
  });
  // #endregion

  if (response.ok) {
    return response.json();
  }

  let message = 'Failed to fetch listings';

  try {
    const errorData = await response.json();
    message = errorData.error || message;
  } catch {
    // Keep the fallback message when the response body is not JSON.
  }

  throw new Error(message);
};

export const fetchPublicListings = async (subcategoryTag: string): Promise<PublicListingRecord[]> => {
  const apiUrl = getApiUrl();
  const requestUrl = `${apiUrl}/public-service-listings?subcategoryTag=${encodeURIComponent(subcategoryTag)}`;

  // #region agent log
  debugPublicListings('H1_H4', 'public listings request starting', {
    apiUrl,
    requestUrl,
    subcategoryTag,
    pageOrigin: window.location.origin,
    pagePath: window.location.pathname,
    nodeEnv: process.env.NODE_ENV,
    envBackendSet: Boolean(process.env.REACT_APP_BACKEND_URL),
  });
  // #endregion

  try {
    const response = await fetch(requestUrl);
    const result = await ensureSuccess(response);
    const listings = Array.isArray(result.data) ? result.data : [];

    // #region agent log
    debugPublicListings('H3', 'public listings parsed successfully', {
      count: listings.length,
      hasDataArray: Array.isArray(result.data),
    });
    // #endregion

    return listings;
  } catch (error) {
    // #region agent log
    debugPublicListings('H1_H2_H3', 'public listings fetch threw', {
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      requestUrl,
      pageOrigin: window.location.origin,
    });
    // #endregion

    throw error;
  }
};

export const fetchPublicListingById = async (serviceId: string): Promise<PublicListingRecord> => {
  const response = await fetch(`${getApiUrl()}/public-service-listings/${encodeURIComponent(serviceId)}`);
  const result = await ensureSuccess(response);
  return result.data;
};

export const humanizeSlug = (value?: string | null): string => {
  if (!value) return '';

  return value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getListingImage = (subcategoryTag?: string | null): string => {
  if (!subcategoryTag) {
    return '/images/fitness.png';
  }

  return DEFAULT_IMAGES[subcategoryTag] || '/images/fitness.png';
};

export const formatPricing = (price?: number | null, durationMins?: number | null): string => {
  if (typeof price !== 'number') {
    return 'Pricing available on request';
  }

  if (typeof durationMins === 'number' && durationMins > 0) {
    return `Rs ${price} per ${durationMins} mins`;
  }

  return `Rs ${price}`;
};

export const formatOperatingHours = (weeklySlots: WeeklySlot[] = [], operatingDays: string[] = []): string => {
  const openSlots = weeklySlots.filter(
    (slot) => slot.is_open && Array.isArray(slot.time_slots) && slot.time_slots.length > 0
  );

  if (openSlots.length === 0) {
    if (operatingDays.length > 0) {
      return operatingDays.join(', ');
    }

    return 'Hours available on request';
  }

  return openSlots
    .map((slot) => {
      const firstSlot = slot.time_slots[0];
      const lastSlot = slot.time_slots[slot.time_slots.length - 1];
      const startTime = firstSlot?.start_time || '';
      const endTime = lastSlot?.end_time || '';

      return startTime && endTime
        ? `${slot.day_of_week}: ${startTime} - ${endTime}`
        : slot.day_of_week;
    })
    .join(' | ');
};

export const buildListingDescription = (record: PublicListingRecord): string => {
  const serviceLabel = record.serviceName || humanizeSlug(record.subcategoryTag) || 'service';
  return `${record.businessName} offers ${serviceLabel}.`;
};

export const buildListingFacilities = (record: PublicListingRecord): string[] => {
  const facilities = new Set<string>();

  if (record.subcategoryTag) {
    facilities.add(humanizeSlug(record.subcategoryTag));
  }

  if (typeof record.durationMins === 'number' && record.durationMins > 0) {
    facilities.add(`${record.durationMins} min sessions`);
  }

  if (record.operatingDays.length > 0) {
    facilities.add(`${record.operatingDays.length} operating days`);
  }

  return Array.from(facilities);
};
