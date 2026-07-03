const supabaseUrl = process.env.SUPABASE_URL || 'https://znxzqsmyzzuwlzwgapdk.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueHpxc215enp1d2x6d2dhcGRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY4MzUyMSwiZXhwIjoyMDY4MjU5NTIxfQ.BdzzD-YNRDXmwppCvHlIOl4cKH0uoMcFG4e5wwcsY0I';

async function supabaseSelect(table, { select, filters = [], single = false } = {}) {
  const params = new URLSearchParams();
  params.set('select', select);

  filters.forEach(({ column, operator, value }) => {
    params.set(column, `${operator}.${value}`);
  });

  const headers = {
    apikey: supabaseServiceKey,
    Authorization: `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json',
  };

  if (single) {
    headers.Prefer = 'return=representation';
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${params.toString()}`, {
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed for ${table}`);
  }

  const data = await response.json();
  return single ? data?.[0] ?? null : data;
}

function normalizePublicListing(service, profile, weeklySlots = []) {
  return {
    id: service.id,
    profileId: service.profile_id,
    serviceName: service.name,
    category: service.category,
    subcategoryTag: service.subcategory_tag,
    price: service.price,
    durationMins: service.duration_mins,
    operatingDays: Array.isArray(service.operating_days) ? service.operating_days : [],
    weeklySlots: Array.isArray(weeklySlots) ? weeklySlots : [],
    businessName: profile?.business_name || service.name,
    location: profile?.location || '',
    googleMapsLink: profile?.google_maps_profile || null,
    rating: null,
    reviewCount: null,
    email: profile?.email || null,
    providerName: service.provider_name || null,
    doctorQualifications: service.doctor_qualifications || null,
    tags: Array.isArray(service.tags) ? service.tags : [],
  };
}

export async function fetchPublicListingsData({ subcategoryTag, serviceId }) {
  const serviceSelect =
    'id, profile_id, name, category, subcategory_tag, price, duration_mins, operating_days, provider_name, doctor_qualifications, tags';

  const serviceFilters = [];
  if (subcategoryTag) {
    serviceFilters.push({ column: 'subcategory_tag', operator: 'eq', value: subcategoryTag });
  }
  if (serviceId) {
    serviceFilters.push({ column: 'id', operator: 'eq', value: serviceId });
  }

  const servicesData = await supabaseSelect('business_services', {
    select: serviceSelect,
    filters: serviceFilters,
    single: Boolean(serviceId),
  });

  const services = Array.isArray(servicesData)
    ? servicesData
    : servicesData
      ? [servicesData]
      : [];

  if (services.length === 0) {
    return serviceId ? null : [];
  }

  const profileIds = [...new Set(services.map((service) => service.profile_id).filter(Boolean))];
  const serviceIds = services.map((service) => service.id);

  const [profilesData, slotsData] = await Promise.all([
    supabaseSelect('business_profiles', {
      select: 'id, business_name, location, short_location, google_maps_profile, email',
      filters: [{ column: 'id', operator: 'in', value: `(${profileIds.join(',')})` }],
    }),
    supabaseSelect('service_weekly_slots', {
      select: 'service_id, day_of_week, is_open, time_slots',
      filters: [{ column: 'service_id', operator: 'in', value: `(${serviceIds.join(',')})` }],
    }),
  ]);

  const profilesById = new Map((profilesData || []).map((profile) => [profile.id, profile]));
  const slotsByServiceId = (slotsData || []).reduce((accumulator, slot) => {
    if (!accumulator[slot.service_id]) {
      accumulator[slot.service_id] = [];
    }

    accumulator[slot.service_id].push(slot);
    return accumulator;
  }, {});

  const normalizedListings = services
    .map((service) =>
      normalizePublicListing(
        service,
        profilesById.get(service.profile_id),
        slotsByServiceId[service.id] || []
      )
    )
    .sort((a, b) => {
      const ratingA = typeof a.rating === 'number' ? a.rating : -1;
      const ratingB = typeof b.rating === 'number' ? b.rating : -1;

      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }

      return a.businessName.localeCompare(b.businessName);
    });

  return serviceId ? normalizedListings[0] || null : normalizedListings;
}
