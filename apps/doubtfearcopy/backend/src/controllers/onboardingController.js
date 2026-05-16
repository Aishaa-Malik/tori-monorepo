const { supabase } = require('../config');

// Check if a user needs onboarding
exports.checkOnboardingStatus = async (req, res) => {
  console.log("INSIDE checkOnboardingStatus CONTROLLER");
  const { userId } = req.query;
  const { email } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    console.log("INSIDE ONBOARDING TRY");
    console.log("userId", userId);
    console.log("email", email);
    console.log("Supabase client:", typeof supabase, Object.keys(supabase));

    // Check if user has completed onboarding
    const { data, error } = await supabase
      .from('business_profiles')
      .select('onboarding_completed')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    console.log("checkOnboardingStatus onboarding_completed data", data);
    
    // If no profile exists or onboarding not completed, user needs onboarding
    const needsOnboarding = !data || !data.onboarding_completed;
    
    return res.status(200).json({ 
      data: { needsOnboarding },
      success: true 
    });
    
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return res.status(500).json({ 
      error: 'Failed to check onboarding status',
      details: error.message
    });
  }
};

/**
 * Helper to calculate duration in minutes between two time strings (HH:MM)
 * @param {string} startTime - "HH:MM"
 * @param {string} endTime - "HH:MM"
 * @returns {number} Duration in minutes
 */
function calculateSlotDuration(startTime, endTime) {
  if (!startTime || !endTime) return 60;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let duration = (endH * 60 + endM) - (startH * 60 + startM);
  if (duration < 0) duration += 24 * 60; // Handle overnight crossing midnight
  return duration;
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
    rating: typeof profile?.rating === 'number' ? profile.rating : null,
    reviewCount: typeof profile?.review_count === 'number' ? profile.review_count : null,
    email: profile?.email || null,
  };
}

async function fetchPublicListingsData({ subcategoryTag, serviceId }) {
  let servicesQuery = supabase
    .from('business_services')
    .select('id, profile_id, name, category, subcategory_tag, price, duration_mins, operating_days');

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

  const profileIds = [...new Set(services.map(service => service.profile_id).filter(Boolean))];
  const serviceIds = services.map(service => service.id);

  const [
    { data: profilesData, error: profilesError },
    { data: slotsData, error: slotsError }
  ] = await Promise.all([
    supabase
      .from('business_profiles')
      .select('id, business_name, location, google_maps_profile, rating, review_count, email')
      .in('id', profileIds),
    supabase
      .from('service_weekly_slots')
      .select('service_id, day_of_week, is_open, time_slots')
      .in('service_id', serviceIds)
  ]);

  if (profilesError) throw profilesError;
  if (slotsError) throw slotsError;

  const profilesById = new Map((profilesData || []).map(profile => [profile.id, profile]));
  const slotsByServiceId = (slotsData || []).reduce((acc, slot) => {
    if (!acc[slot.service_id]) {
      acc[slot.service_id] = [];
    }
    acc[slot.service_id].push(slot);
    return acc;
  }, {});

  const normalizedListings = services
    .map(service => normalizePublicListing(
      service,
      profilesById.get(service.profile_id),
      slotsByServiceId[service.id] || []
    ))
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

exports.getPublicServiceListings = async (req, res) => {
  const { subcategoryTag } = req.query;

  if (!subcategoryTag) {
    return res.status(400).json({ error: 'subcategoryTag is required' });
  }

  try {
    const listings = await fetchPublicListingsData({ subcategoryTag });

    return res.status(200).json({
      data: listings,
      success: true
    });
  } catch (error) {
    console.error('Error fetching public service listings:', error);
    return res.status(500).json({
      error: 'Failed to fetch public service listings',
      details: error.message
    });
  }
};

exports.getPublicServiceListingById = async (req, res) => {
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
      data: listing,
      success: true
    });
  } catch (error) {
    console.error('Error fetching public service listing:', error);
    return res.status(500).json({
      error: 'Failed to fetch public service listing',
      details: error.message
    });
  }
};

/**
 * Save onboarding data including business profile and services.
 * Handles bulk insertion of services and weekly slots.
 */
exports.saveOnboardingData = async (req, res) => {

  console.log("INSIDE saveOnboardingData CONTROLLER");
  
  const { 
    email, 
    tenantId, 
    businessType, 
    businessName, 
    services, // Array of { name, subcategoryTag, operatingDays, timeSlots, slotPrice }
    bookingSystemType,
    location,
    googleMapsLink,
    rating,
    review_count
  } = req.body;
  
  if (!email || !tenantId || !businessType) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }
  
  try {
    // 1. Save business profile
    const { data: profileData, error: profileError } = await supabase
      .from('business_profiles')
      .upsert({
        email: email,
        tenant_id: tenantId,
        business_type: businessType,
        business_name: businessName,
        multiorsinglebooking: bookingSystemType === '1' ? 'single' : 'multi',
        onboarding_completed: true,
        location: location,
        google_maps_profile: googleMapsLink,
        rating: rating,
        review_count: review_count
      }, { 
        onConflict: 'email'
      })
      .select()
      .single();
    
    if (profileError) throw profileError;
    console.log("Business Profile saved:", profileData);

    const profileId = profileData.id;

    // 2. Handle Services (Delete existing for this profile to ensure clean state, then insert new)
    // First, delete existing services (cascade should handle slots, but let's be safe)
    // Note: In a real app, we might want to be smarter about updates to preserve IDs, 
    // but for onboarding, full replacement is safer and easier.
    
    // Get existing service IDs to delete their slots first if no cascade
    const { data: existingServices } = await supabase
      .from('business_services')
      .select('id')
      .eq('profile_id', profileId);

    if (existingServices && existingServices.length > 0) {
      const serviceIds = existingServices.map(s => s.id);
      
      // Delete slots
      await supabase
        .from('service_weekly_slots')
        .delete()
        .in('service_id', serviceIds);

      // Delete services
      await supabase
        .from('business_services')
        .delete()
        .eq('profile_id', profileId);
    }

    // 3. Insert new services and their slots
    let firstServicePrice = 0; // For summary

    if (services && services.length > 0) {
      for (const service of services) {
        const selectedSubcategoryTag = service.subcategoryTag ?? service.subcategory_tag ?? null;
        
        // Calculate min price and duration from slots
        let minPrice = Infinity;
        let durationForMinPrice = 60; // Default
        
        if (service.timeSlots) {
          Object.values(service.timeSlots).forEach(slots => {
            if (Array.isArray(slots)) {
              slots.forEach(slot => {
                const price = Number(slot.price);
                if (!isNaN(price) && price < minPrice) {
                  minPrice = price;
                  // Calculate duration
                  durationForMinPrice = calculateSlotDuration(slot.start_time, slot.end_time);
                }
              });
            }
          });
        }
        
        if (minPrice === Infinity) minPrice = service.slotPrice || 0;

        // Prepare service payload
        const servicePayload = {
          profile_id: profileId,
          name: service.name || `${businessType} Service`,
          category: businessType,
          subcategory_tag: selectedSubcategoryTag,
          price: minPrice,
          operating_days: service.operatingDays,
          duration_mins: durationForMinPrice,
        };

        const { data: newService, error: serviceInsertError } = await supabase
          .from('business_services')
          .insert(servicePayload)
          .select()
          .single();
        
        if (serviceInsertError) throw serviceInsertError;
        
        const serviceId = newService.id;
        if (firstServicePrice === 0) firstServicePrice = minPrice;

        // Prepare slots data
        const weeklySlotsData = Object.entries(service.timeSlots).map(([day, slots]) => ({
          service_id: serviceId,
          day_of_week: day,
          is_open: Array.isArray(slots) && slots.length > 0,
          time_slots: slots // JSONB array
        }));

        if (weeklySlotsData.length > 0) {
          const { error: slotsInsertError } = await supabase
            .from('service_weekly_slots')
            .insert(weeklySlotsData);
          
          if (slotsInsertError) throw slotsInsertError;
        }
      }
    }
    console.log("Services and Slots saved");

    // business_type_summary upsert
      try {
        const { data: existingSummary, error: summarySelectError } = await supabase
          .from('business_type_summary')
          .select('id, tenant_ids, business_names, slot_price')
          .eq('business_type', businessType)
          .single();

        if (summarySelectError && summarySelectError.code !== 'PGRST116') {
          console.log('business_type_summary select error:', summarySelectError);
        }

        if (!existingSummary) {
          const insertPayload = {
            business_type: businessType,
            tenant_ids: [tenantId],
            slot_price: [firstServicePrice]
          };
          if (businessName) insertPayload.business_names = [businessName];

          await supabase.from('business_type_summary').insert(insertPayload);
        } else {
          // Row exists → append tenantId if not already present
          const existingTenantIds = Array.isArray(existingSummary.tenant_ids) ? existingSummary.tenant_ids : [];
          const existingBusinessNames = Array.isArray(existingSummary.business_names) ? existingSummary.business_names : [];
          const existingSlotPrices = Array.isArray(existingSummary.slot_price)
            ? existingSummary.slot_price
            : [];

          const needsTenantAppend = !existingTenantIds.includes(tenantId);
          const needsNameAppend = Boolean(businessName) && !existingBusinessNames.includes(businessName);
          
          const updatePayload = {};
          if (needsTenantAppend) {
            updatePayload.tenant_ids = [...existingTenantIds, tenantId];
            updatePayload.slot_price = [...existingSlotPrices, firstServicePrice];
          } else {
            // If tenant already exists, update the slot_price at the same index
            const tenantIndex = existingTenantIds.indexOf(tenantId);
            if (tenantIndex !== -1) {
              const updatedSlotPrices = [...existingSlotPrices];
              updatedSlotPrices[tenantIndex] = firstServicePrice;
              updatePayload.slot_price = updatedSlotPrices;
            }
          }
          
          if (needsNameAppend) updatePayload.business_names = [...existingBusinessNames, businessName];

          if (Object.keys(updatePayload).length > 0) {
            const { data: updatedSummary, error: updateSummaryError } = await supabase
              .from('business_type_summary')
              .update(updatePayload)
              .eq('business_type', businessType)
              .select();

            if (updateSummaryError) {
              console.log('business_type_summary update error:', updateSummaryError);
            } else {
              console.log('business_type_summary updated successfully:', updatedSummary);
            }
          } else {
            console.log('business_type_summary: no changes needed');
          }
        }
      } catch (e) {
        console.log('business_type_summary upsert failed:', e);
      }
    
    return res.status(200).json({
      data: profileData,
      success: true,
      message: 'Onboarding data saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return res.status(500).json({ 
      error: 'Failed to save onboarding data',
      details: error.message
    });
  }
};

// Get onboarding data
exports.getOnboardingData = async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    // Get business profile
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      throw error;
    }
    
    return res.status(200).json({
      data: data || null,
      success: true
    });
    
  } catch (error) {
    console.error('Error getting onboarding data:', error);
    return res.status(500).json({ 
      error: 'Failed to get onboarding data',
      details: error.message
    });
  }
};
