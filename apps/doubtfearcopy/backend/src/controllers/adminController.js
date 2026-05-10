const { supabase } = require('../config');
const crypto = require('crypto');

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
      slots // Array of { day: string, times: [{ start_time, end_time, capacity }] }
    } = req.body;

    console.log('Received admin onboarding request for:', email);

    // Basic validation
    if (!email || !businessName || !services || services.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newtenantId = crypto.randomUUID();

    // 1. Create Tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({ id: newtenantId, name: businessName })
      .select()
      .single();

    if (tenantError) throw new Error(`Tenant creation failed: ${tenantError.message}`);

    // 2. Approve User
    const { error: approveError } = await supabase
      .from('approved_users')
      .insert({
        email: email,
        role: 'BUSINESS_OWNER',
        tenant_id: newtenantId
      })
      .select()
      .single();

    if (approveError) {
      // If email already approved, we might want to update or handle it, but for now just log it
      if (approveError.code !== '23505') { // Ignore unique violation for email if they are already approved
        throw new Error(`User approval failed: ${approveError.message}`);
      } else {
         console.log('User already in approved_users, continuing...');
      }
    }

    // 2.5 Create Business Owner Contact
    if (phoneNumber) {
      const { error: contactError } = await supabase
        .from('business_owner_contacts')
        .insert({
          tenant_id: newtenantId,
          role: 'BUSINESS_OWNER',
          phone_number: phoneNumber
        });

      if (contactError) {
        console.error('Error inserting business_owner_contacts:', contactError);
        // We don't fail the whole onboarding if this fails, just log it
      }
    }

    // 3. Create Business Profile
    const { data: profile, error: profileError } = await supabase
      .from('business_profiles')
      .insert({
        tenant_id: newtenantId,
        business_type: 'Fitness & Gym',
        business_name: businessName,
        email: email,
        location: location,
        google_maps_profile: googleMapsLink,
        // time_slots: bookingType,
        onboarding_completed: true
      })
      .select()
      .single();

    if (profileError) throw new Error(`Business profile creation failed: ${profileError.message}`);

    // 4. Create Services and Weekly Slots
    for (const svc of services) {
      const { data: service, error: serviceError } = await supabase
        .from('business_services')
        .insert({
          profile_id: profile.id,
          name: svc.name,
          price: svc.price || 0,
          duration_mins: svc.durationMins || 60,
          category: 'Fitness & Gym'
        })
        .select()
        .single();

      if (serviceError) throw new Error(`Service creation failed: ${serviceError.message}`);

      // 5. Add Weekly Slots
      if (slots && Array.isArray(slots) && slots.length > 0) {
        const weeklySlotsData = slots.map(slot => {
          // Expecting slot.times to be an array with at least one item
          const timeInfo = slot.times && slot.times.length > 0 ? slot.times[0] : {};
          return {
            service_id: service.id,
            day_of_week: slot.day,
            start_time: timeInfo.start_time || '09:00',
            end_time: timeInfo.end_time || '17:00',
            capacity: timeInfo.capacity || (bookingType === 'multi' ? 20 : 1),
            price: timeInfo.price || svc.price || 0
          };
        });

        const { error: slotsError } = await supabase
          .from('service_weekly_slots')
          .insert(weeklySlotsData);

        if (slotsError) throw new Error(`Failed to create weekly slots: ${slotsError.message}`);
      }
    }

    // 6. Update Discovery Summary (business_type_summary)
    // This part is a bit complex as we need to append to arrays.
    // We will try to fetch first, then upsert.
    const { data: summaryData, error: summaryFetchError } = await supabase
      .from('business_type_summary')
      .select('*')
      .eq('business_type', 'Fitness & Gym')
      .single();

    if (!summaryFetchError && summaryData) {
      // Update existing
      const updatedTenantIds = [...(summaryData.tenant_ids || []), newtenantId];
      const updatedBusinessNames = [...(summaryData.business_names || []), businessName];
      const updatedLocations = [...(summaryData.locations || []), location];

      await supabase
        .from('business_type_summary')
        .update({
          tenant_ids: updatedTenantIds,
          business_names: updatedBusinessNames,
          locations: updatedLocations,
          total_count: updatedTenantIds.length
        })
        .eq('business_type', 'Fitness & Gym');
    } else {
      // Insert new
      await supabase
        .from('business_type_summary')
        .insert({
          business_type: 'Fitness & Gym',
          tenant_ids: [newtenantId],
          business_names: [businessName],
          locations: [location],
          total_count: 1
        });
    }

    res.status(200).json({
      success: true,
      message: 'Business onboarded and activated successfully',
      tenantId: newtenantId
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
