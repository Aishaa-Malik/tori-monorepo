const { supabase } = require('../config');

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
    rating: typeof profile?.rating === 'number' ? profile.rating : null,
    reviewCount: typeof profile?.review_count === 'number' ? profile.review_count : null,
    email: profile?.email || null,
    providerName: service.provider_name || null,
    doctorQualifications: service.doctor_qualifications || null,
    tags: Array.isArray(service.tags) ? service.tags : [],
  };
}

async function fetchPublicListingsData({ subcategoryTag, serviceId }) {
  let servicesQuery = supabase
    .from('business_services')
    .select('id, profile_id, name, category, subcategory_tag, price, duration_mins, operating_days, provider_name, doctor_qualifications, tags');

  if (subcategoryTag) {
    servicesQuery = servicesQuery.eq('subcategory_tag', subcategoryTag);
  }

  if (serviceId) {
    servicesQuery = servicesQuery.eq('id', serviceId);
  }

  const { data: servicesData, error: servicesError } = serviceId
    ? await servicesQuery.maybeSingle()
    : await servicesQuery;

  if (servicesError) throw servicesError;

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

  const [
    { data: profilesData, error: profilesError },
    { data: slotsData, error: slotsError },
  ] = await Promise.all([
    supabase
      .from('business_profiles')
      .select('id, business_name, location, short_location, google_maps_profile, rating, review_count, email')
      .in('id', profileIds),
    supabase
      .from('service_weekly_slots')
      .select('service_id, day_of_week, is_open, time_slots')
      .in('service_id', serviceIds),
  ]);

  if (profilesError) throw profilesError;
  if (slotsError) throw slotsError;

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

exports.getPublicListings = async (req, res) => {
  const { subcategoryTag } = req.query;

  if (!subcategoryTag) {
    return res.status(400).json({ error: 'subcategoryTag is required' });
  }

  try {
    const listings = await fetchPublicListingsData({ subcategoryTag });

    return res.status(200).json({
      success: true,
      data: listings,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getPublicListingById = async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId) {
    return res.status(400).json({ error: 'serviceId is required' });
  }

  try {
    const listing = await fetchPublicListingsData({ serviceId });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    return res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
