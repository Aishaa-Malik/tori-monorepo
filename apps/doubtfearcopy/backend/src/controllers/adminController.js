const { supabase } = require('../config');
const crypto = require('crypto');

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_OPERATING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_BUSINESS_TYPE = 'Fitness & Gym';

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

function calculateSlotDuration(startTime, endTime) {
  if (!startTime || !endTime) return 60;

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let duration = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (duration <= 0) {
    duration += 24 * 60;
  }

  return duration;
}

function sanitizeTimeSlot(slot, fallbackPrice) {
  const startTime = normalizeString(slot?.start_time);
  const endTime = normalizeString(slot?.end_time);

  if (!startTime || !endTime) {
    return null;
  }

  return {
    label: normalizeString(slot?.label) || 'Session',
    start_time: startTime,
    end_time: endTime,
    price: toNumber(slot?.price, fallbackPrice),
  };
}

function buildLegacyTimeSlots(slots = [], fallbackPrice = 0) {
  return (Array.isArray(slots) ? slots : []).reduce((accumulator, slotGroup) => {
    const day = normalizeString(slotGroup?.day);
    if (!day) {
      return accumulator;
    }

    const sanitizedSlots = (Array.isArray(slotGroup?.times) ? slotGroup.times : [])
      .map((slot) => sanitizeTimeSlot(slot, fallbackPrice))
      .filter(Boolean);

    if (sanitizedSlots.length > 0) {
      accumulator[day] = sanitizedSlots;
    }

    return accumulator;
  }, {});
}

function buildServiceTimeSlots(service = {}, sharedSlots = [], fallbackPrice = 0) {
  if (service?.timeSlots && typeof service.timeSlots === 'object' && !Array.isArray(service.timeSlots)) {
    return Object.entries(service.timeSlots).reduce((accumulator, [day, slots]) => {
      const sanitizedDay = normalizeString(day);
      if (!sanitizedDay) {
        return accumulator;
      }

      const sanitizedSlots = (Array.isArray(slots) ? slots : [])
        .map((slot) => sanitizeTimeSlot(slot, fallbackPrice))
        .filter(Boolean);

      if (sanitizedSlots.length > 0) {
        accumulator[sanitizedDay] = sanitizedSlots;
      }

      return accumulator;
    }, {});
  }

  return buildLegacyTimeSlots(sharedSlots, fallbackPrice);
}

function determineServiceDuration(service, serviceTimeSlots) {
  const providedDuration = toNumber(service?.durationMins ?? service?.duration_mins, 0);
  if (providedDuration > 0) {
    return providedDuration;
  }

  for (const slots of Object.values(serviceTimeSlots)) {
    if (Array.isArray(slots) && slots.length > 0) {
      const firstSlot = slots[0];
      return calculateSlotDuration(firstSlot.start_time, firstSlot.end_time);
    }
  }

  return 60;
}

function resolveServiceCategory(serviceCategory, businessType, subcategoryTag) {
  const normalizedServiceCategory = normalizeString(serviceCategory);
  if (normalizedServiceCategory) {
    return normalizedServiceCategory;
  }

  if (subcategoryTag === 'physiotherapy') {
    return 'Physiotherapy';
  }

  if (subcategoryTag && subcategoryTag !== 'gym') {
    return businessType === 'Physiotherapy' ? 'Physiotherapy' : 'HealthCare';
  }

  return businessType;
}

function determineOperatingDays(service, serviceTimeSlots, fallbackOperatingDays = []) {
  if (Array.isArray(service?.operatingDays) && service.operatingDays.length > 0) {
    return service.operatingDays;
  }

  if (Array.isArray(service?.operating_days) && service.operating_days.length > 0) {
    return service.operating_days;
  }

  const derivedDays = Object.entries(serviceTimeSlots)
    .filter(([, slots]) => Array.isArray(slots) && slots.length > 0)
    .map(([day]) => day);

  if (derivedDays.length > 0) {
    return derivedDays;
  }

  if (Array.isArray(fallbackOperatingDays) && fallbackOperatingDays.length > 0) {
    return fallbackOperatingDays;
  }

  return DEFAULT_OPERATING_DAYS;
}

async function upsertBusinessTypeSummary({
  businessType,
  tenantId,
  businessName,
  location,
}) {
  const { data: summary, error: summaryError } = await supabase
    .from('business_type_summary')
    .select('*')
    .eq('business_type', businessType)
    .maybeSingle();

  if (summaryError && summaryError.code !== 'PGRST116') {
    throw new Error(`Discovery summary lookup failed: ${summaryError.message}`);
  }

  if (summary) {
    const tenantIds = Array.from(new Set([...(summary.tenant_ids || []), tenantId]));
    const businessNames = businessName
      ? Array.from(new Set([...(summary.business_names || []), businessName]))
      : summary.business_names || [];
    const locations = location
      ? Array.from(new Set([...(summary.locations || []), location]))
      : summary.locations || [];

    const { error: updateSummaryError } = await supabase
      .from('business_type_summary')
      .update({
        tenant_ids: tenantIds,
        business_names: businessNames,
        locations,
        total_count: tenantIds.length,
      })
      .eq('business_type', businessType);

    if (updateSummaryError) {
      throw new Error(`Discovery summary update failed: ${updateSummaryError.message}`);
    }

    return;
  }

  const { error: insertSummaryError } = await supabase
    .from('business_type_summary')
    .insert({
      business_type: businessType,
      tenant_ids: [tenantId],
      business_names: businessName ? [businessName] : [],
      locations: location ? [location] : [],
      total_count: 1,
    });

  if (insertSummaryError) {
    throw new Error(`Discovery summary insert failed: ${insertSummaryError.message}`);
  }
}

exports.onboardBusiness = async (req, res) => {
  try {
    const {
      email,
      phoneNumber,
      businessName,
      location,
      googleMapsLink,
      bookingType, // 'single' or 'multi'
      services, // Array of { name, price, durationMins }
      slots, // Array of { day, times: [{ start_time, end_time, price }] }
      operatingDays, // Array of strings (e.g. ['Monday', 'Tuesday'])
      businessType,
      category,
      subcategoryTag,
    } = req.body;

    console.log('Received admin onboarding request for:', email);

    const normalizedBusinessName = normalizeString(businessName);
    const resolvedBusinessType = normalizeString(businessType) || DEFAULT_BUSINESS_TYPE;
    const resolvedCategory = normalizeString(category) || resolvedBusinessType;
    const resolvedSubcategoryTag = normalizeString(subcategoryTag) || null;
    const resolvedBookingType = bookingType === 'single' ? 'single' : 'multi';
    const normalizedLocation = normalizeString(location);
    const normalizedEmail = normalizeString(email);
    const normalizedPhoneNumber = normalizeString(phoneNumber);
    const normalizedGoogleMapsLink = normalizeString(googleMapsLink);
    const fallbackOperatingDays = Array.isArray(operatingDays) ? operatingDays : [];

    // Basic validation
    if (!normalizedBusinessName || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields: businessName or services' });
    }

    const activeServices = services.filter((service) => {
      if (service?.enabled === false) {
        return false;
      }

      return Boolean(normalizeString(service?.name));
    });

    if (activeServices.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one valid service is required' });
    }

    // 1. Check if business already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('business_profiles')
      .select('id, tenant_id, business_type')
      .ilike('business_name', normalizedBusinessName)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Business lookup failed: ${fetchError.message}`);
    }

    console.log('[admin onboarding] existing profile lookup:', {
      businessName: normalizedBusinessName,
      existingProfile,
      fetchError
    });

    let tenantId;
    let profileId;

    if (existingProfile) {
      console.log('Business exists. Updating services for Tenant:', existingProfile.tenant_id);
      tenantId = existingProfile.tenant_id;
      profileId = existingProfile.id;

      const { error: profileUpdateError } = await supabase
        .from('business_profiles')
        .update({
          phone_number: normalizedPhoneNumber,
          email: normalizedEmail,
          location: normalizedLocation,
          google_maps_profile: normalizedGoogleMapsLink,
          multiorsinglebooking: resolvedBookingType,
          business_type: resolvedBusinessType,
          onboarding_completed: true
        })
        .eq('id', profileId);

      if (profileUpdateError) {
        throw new Error(`Profile update failed: ${profileUpdateError.message}`);
      }

      console.log('[admin onboarding] business_profiles update result:', {
        profileId,
        bookingType: resolvedBookingType,
        profileUpdateError
      });
    } else {
      console.log('New business detected. Starting full onboarding...');
      tenantId = crypto.randomUUID();
      console.log('[admin onboarding] generated tenantId:', tenantId);

      // Create Tenant
      const { error: tenantInsertError } = await supabase
        .from('tenants')
        .insert({ id: tenantId, name: normalizedBusinessName });

      if (tenantInsertError) {
        throw new Error(`Tenant creation failed: ${tenantInsertError.message}`);
      }

      console.log('[admin onboarding] tenant insert result:', {
        tenantId,
        businessName: normalizedBusinessName,
        tenantInsertError
      });

      // Approve User (only if email is provided)
      if (normalizedEmail) {
        const { error: approvedUserError } = await supabase.from('approved_users').insert({
          email: normalizedEmail,
          role: 'BUSINESS_OWNER',
          tenant_id: tenantId
        });

        if (approvedUserError) {
          throw new Error(`Approved user insert failed: ${approvedUserError.message}`);
        }

        console.log('[admin onboarding] approved_users insert result:', {
          email: normalizedEmail,
          tenantId,
          approvedUserError
        });
      }

      // Create Business Owner Contact
      // if (phoneNumber) {
      //   const { error: contactError } = await supabase
      //     .from('user_profiles')
      //     .insert({
      //       tenant_id: tenantId,
      //       role: 'BUSINESS_OWNER',
      //       phone_number: phoneNumber
      //     });

      //   if (contactError) {
      //     console.error('Error inserting user_profiles:', contactError);
      //   }
      // }

      // Create Business Profile
      console.log('[admin onboarding] business_profiles insert payload:', {
        tenant_id: tenantId,
        business_type: resolvedBusinessType,
        business_name: normalizedBusinessName,
        phone_number: normalizedPhoneNumber,
        email: normalizedEmail,
        location: normalizedLocation,
        google_maps_profile: normalizedGoogleMapsLink,
        multiorsinglebooking: resolvedBookingType,
        onboarding_completed: true
      });

      const { data: newProfile, error: newProfileError } = await supabase
        .from('business_profiles')
        .insert({
          tenant_id: tenantId,
          business_type: resolvedBusinessType,
          business_name: normalizedBusinessName,
          phone_number: normalizedPhoneNumber,
          email: normalizedEmail,
          location: normalizedLocation,
          google_maps_profile: normalizedGoogleMapsLink,
          multiorsinglebooking: resolvedBookingType,
          onboarding_completed: true
        })
        .select()
        .single();

      if (newProfileError) {
        throw new Error(`Business profile insert failed: ${newProfileError.message}`);
      }

      console.log('[admin onboarding] business_profiles insert result:', {
        newProfile,
        newProfileError
      });

      if (!newProfile) {
        console.error('[admin onboarding] business_profiles insert returned null profile', {
          tenantId,
          businessName: normalizedBusinessName,
          email: normalizedEmail,
          phoneNumber: normalizedPhoneNumber,
          location: normalizedLocation,
          googleMapsLink: normalizedGoogleMapsLink,
          newProfileError
        });
      }

      profileId = newProfile.id;
      console.log('[admin onboarding] created profileId:', profileId);
    }

    // 2. Create Services and Weekly Slots
    for (const svc of activeServices) {
      const serviceName = normalizeString(svc.name);
      const servicePrice = toNumber(svc.price ?? svc.slotPrice, 0);
      const serviceTimeSlots = buildServiceTimeSlots(svc, slots, servicePrice);
      const serviceOperatingDays = determineOperatingDays(svc, serviceTimeSlots, fallbackOperatingDays);
      const serviceDuration = determineServiceDuration(svc, serviceTimeSlots);
      const serviceSubcategoryTag =
        normalizeString(svc.subcategoryTag ?? svc.subcategory_tag) || resolvedSubcategoryTag;
      const serviceCategory = resolveServiceCategory(svc.category, resolvedCategory, serviceSubcategoryTag);

      const { data: existingService, error: existingServiceError } = await supabase
        .from('business_services')
        .select('id')
        .eq('profile_id', profileId)
        .eq('name', serviceName)
        .eq('category', serviceCategory)
        .maybeSingle();

      if (existingServiceError && existingServiceError.code !== 'PGRST116') {
        throw new Error(`Existing service lookup failed: ${existingServiceError.message}`);
      }

      let service;

      if (existingService) {
        const { data: updatedService, error: updateServiceError } = await supabase
          .from('business_services')
          .update({
            price: servicePrice,
            duration_mins: serviceDuration,
            category: serviceCategory,
            subcategory_tag: serviceSubcategoryTag,
            operating_days: serviceOperatingDays,
          })
          .eq('id', existingService.id)
          .select()
          .single();

        if (updateServiceError) {
          throw new Error(`Service update failed: ${updateServiceError.message}`);
        }

        const { error: deleteSlotsError } = await supabase
          .from('service_weekly_slots')
          .delete()
          .eq('service_id', existingService.id);

        if (deleteSlotsError) {
          throw new Error(`Existing slot cleanup failed: ${deleteSlotsError.message}`);
        }

        service = updatedService;
      } else {
        const { data: insertedService, error: serviceError } = await supabase
          .from('business_services')
          .insert({
            profile_id: profileId,
            name: serviceName,
            price: servicePrice,
            duration_mins: serviceDuration,
            category: serviceCategory,
            subcategory_tag: serviceSubcategoryTag,
            operating_days: serviceOperatingDays,
          })
          .select()
          .single();

        if (serviceError) {
          throw new Error(`Service creation failed: ${serviceError.message}`);
        }

        service = insertedService;
      }

      if (serviceTimeSlots && typeof serviceTimeSlots === 'object') {
        const currentTimestamp = new Date().toISOString();
        const weeklySlotsData = DAYS_OF_WEEK
          .filter((day) => Array.isArray(serviceTimeSlots[day]))
          .map((day) => ({
            service_id: service.id,
            day_of_week: day,
            is_open: serviceTimeSlots[day].length > 0,
            created_at: currentTimestamp,
            time_slots: serviceTimeSlots[day],
          }));

        if (weeklySlotsData.length > 0) {
          const { error: slotsInsertError } = await supabase
            .from('service_weekly_slots')
            .insert(weeklySlotsData);

          if (slotsInsertError) {
            throw new Error(`Weekly slots insert failed: ${slotsInsertError.message}`);
          }
        }
      }
    }

    // 3. Update Discovery Summary (business_type_summary)
    await upsertBusinessTypeSummary({
      businessType: resolvedBusinessType,
      tenantId,
      businessName: normalizedBusinessName,
      location: normalizedLocation,
    });

    res.status(200).json({
      success: true,
      message: 'Business onboarded and activated successfully',
      tenantId: tenantId
    });

  } catch (error) {
    console.error('Error in admin onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to onboard business',
      error: error.message
    });
  }
};
