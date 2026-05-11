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
      slots, // Array of { day, times: [{ start_time, end_time, price }] }
      operatingDays // Array of strings (e.g. ['Monday', 'Tuesday'])
    } = req.body;

    console.log('Received admin onboarding request for:', email);

    // Basic validation
    if (!businessName || !services || services.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields: businessName or services' });
    }

    // 1. Check if business already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('business_profiles')
      .select('id, tenant_id')
      .eq('business_name', businessName)
      .maybeSingle();

    let tenantId;
    let profileId;

    if (existingProfile) {
      console.log('Business exists. Updating services for Tenant:', existingProfile.tenant_id);
      tenantId = existingProfile.tenant_id;
      profileId = existingProfile.id;
    } else {
      console.log('New business detected. Starting full onboarding...');
      tenantId = crypto.randomUUID();

      // Create Tenant
      await supabase.from('tenants').insert({ id: tenantId, name: businessName });

      // Approve User (only if email is provided)
      if (email) {
        await supabase.from('approved_users').insert({
          email: email,
          role: 'BUSINESS_OWNER',
          tenant_id: tenantId
        });
      }

      // Create Business Owner Contact
      if (phoneNumber) {
        const { error: contactError } = await supabase
          .from('business_owner_contacts')
          .insert({
            tenant_id: tenantId,
            role: 'BUSINESS_OWNER',
            phone_number: phoneNumber
          });

        if (contactError) {
          console.error('Error inserting business_owner_contacts:', contactError);
        }
      }

      // Create Business Profile
      const { data: newProfile } = await supabase
        .from('business_profiles')
        .insert({
          tenant_id: tenantId,
          business_type: 'Fitness & Gym',
          business_name: businessName,
          email: email,
          location: location,
          google_maps_profile: googleMapsLink,
          onboarding_completed: true
        })
        .select()
        .single();
      
      profileId = newProfile.id;
    }

    // 2. Create Services and Weekly Slots
    for (const svc of services) {
      const { data: service, error: serviceError } = await supabase
        .from('business_services')
        .insert({
          profile_id: profileId,
          name: svc.name,
          price: svc.price || 0,
          duration_mins: svc.durationMins || 60,
          category: 'Fitness & Gym',
          operating_days: operatingDays || []
        })
        .select()
        .single();

      if (serviceError) throw new Error(`Service creation failed: ${serviceError.message}`);

      // Insert Slots as JSONB per day
      if (slots && Array.isArray(slots)) {
        const currentTimestamp = new Date().toISOString();
        const weeklySlotsData = slots.map(slot => ({
          service_id: service.id,
          day_of_week: slot.day,
          is_open: true,
          created_at: currentTimestamp,
          time_slots: slot.times.map(t => ({
            label: t.label, // Use exact label passed from frontend
            start_time: t.start_time,
            end_time: t.end_time,
            price: Number(svc.price) || 0
          })) // Map to inject service price and label
        }));

        if (weeklySlotsData.length > 0) {
          await supabase.from('service_weekly_slots').insert(weeklySlotsData);
        }
      }
    }

    // 3. Update Discovery Summary (business_type_summary)
    const { data: summary } = await supabase
      .from('business_type_summary')
      .select('*')
      .eq('business_type', 'Fitness & Gym')
      .single();

    if (summary) {
      const tenantIds = new Set(summary.tenant_ids || []);
      tenantIds.add(tenantId);

      await supabase.from('business_type_summary').update({
        tenant_ids: Array.from(tenantIds),
        business_names: Array.from(new Set([...(summary.business_names || []), businessName])),
        total_count: tenantIds.size
      }).eq('business_type', 'Fitness & Gym');
    } else {
      await supabase.from('business_type_summary').insert({
        business_type: 'Fitness & Gym',
        tenant_ids: [tenantId],
        business_names: [businessName],
        locations: [location],
        total_count: 1
      });
    }

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
