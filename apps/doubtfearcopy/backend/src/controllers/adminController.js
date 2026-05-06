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
      serviceName,
      price,
      durationMins,
      slots // Array of { day: string, times: [{ start_time, end_time, price, capacity }] }
    } = req.body;

    console.log('Received admin onboarding request for:', email);

    // Basic validation
    if (!email || !businessName || !serviceName) {
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

    // 2.5 Create/Upsert User Profile to save phone_number
    if (phoneNumber) {
      const { error: profileUserError } = await supabase
        .from('user_profiles')
        .upsert({
          email: email,
          full_name: email.split('@')[0],
          phone_number: phoneNumber,
          created_at: new Date().toISOString()
        }, { onConflict: 'email' });
      
      if (profileUserError) {
        console.error('Failed to upsert user_profiles with phone_number:', profileUserError);
        // We log but do not strictly throw here, to avoid blocking the main business creation 
        // if user_profiles strict constraint (like id) prevents upsert without Auth UUID.
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

    // 4. Create Service
    const { data: service, error: serviceError } = await supabase
      .from('business_services')
      .insert({
        profile_id: profile.id,
        name: serviceName,
        price: price,
        duration_mins: durationMins,
        category: 'Fitness & Gym'
      })
      .select()
      .single();

    if (serviceError) throw new Error(`Service creation failed: ${serviceError.message}`);

    // 5. Add Weekly Slots
    if (slots && slots.length > 0) {
      const slotInserts = [];
      
      slots.forEach(slotDay => {
        // Prepare time_slots JSON array
        const timeSlotsJson = slotDay.times.map(t => ({
          start_time: t.start_time,
          end_time: t.end_time,
          price: t.price || price,
          capacity: t.capacity || 10
        }));

        slotInserts.push({
          service_id: service.id,
          day_of_week: slotDay.day,
          time_slots: timeSlotsJson
        });
      });

      const { error: slotsError } = await supabase
        .from('service_weekly_slots')
        .insert(slotInserts);

      if (slotsError) throw new Error(`Slots creation failed: ${slotsError.message}`);
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
