import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';
import { SettingsPageProps, UsageData, IntegrationConfig } from '../../types/settingsManagement.types';
import { getSettingsConfig } from '../../config/settingsManagementConfig';

interface SettingsTimeSlot {
  start_time: string;
  end_time: string;
  price: number;
  label?: string;
}

interface EditableServiceSetting {
  id?: string;
  name: string;
  subcategory_tag?: string | null;
  duration_mins: number;
  availabilitySchedule: Record<string, SettingsTimeSlot[]>;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const createEmptySchedule = (): Record<string, SettingsTimeSlot[]> =>
  daysOfWeek.reduce((schedule, day) => ({ ...schedule, [day]: [] }), {} as Record<string, SettingsTimeSlot[]>);

const UnifiedSettingsPage: React.FC<SettingsPageProps> = ({ serviceType }) => {
  const { user, tenant } = useAuth();
  const config = useMemo(() => getSettingsConfig(serviceType), [serviceType]);
  
  const [usageData, setUsageData] = useState<UsageData>({ used: 0, total: 0 });
  const [planName, setPlanName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(config.integrations);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [serviceSettings, setServiceSettings] = useState<EditableServiceSetting[]>([]);
  const [isSavingServiceSettings, setIsSavingServiceSettings] = useState(false);
  const [serviceSettingsMessage, setServiceSettingsMessage] = useState<string | null>(null);
  const [serviceSettingsError, setServiceSettingsError] = useState<string | null>(null);
  const [deletedServiceIds, setDeletedServiceIds] = useState<string[]>([]);
  const googleCalendarLogo = `${process.env.PUBLIC_URL}/Google_Calendar_icon_(2020).svg`;
  const zoomLogo = `${process.env.PUBLIC_URL}/Zoom_Communications_Logo.svg`;

  useEffect(() => {
    const fetchUsageData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Check if tenant ID exists
        if (!tenant?.id) {
          console.log('No tenant ID available, using default values');
          setPlanName('Basic');
          setUsageData({
            used: 0,
            total: 25
          });
          setIsLoading(false);
          return;
        }
        
        // Fetch subscription data
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .select(`
            id,
            status,
            billing_cycle_start,
            billing_cycle_end,
            plans!inner (
              name,
              appointment_limit
            )
          `)
          .eq('tenant_id', tenant.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (subError) {
          console.error('Error fetching subscription:', subError);
        } else if (subscription) {
          // Handle plans data which could be in different formats
          let planName = 'Free Plan';
          let totalLimit = 25; // Default limit
          
          if (subscription.plans) {
            // Use type assertion to handle the plans object
            const plansObj = subscription.plans as any;
            totalLimit = plansObj.appointment_limit || 25;
            planName = plansObj.name || 'Free Plan';
          }
          
          setPlanName(planName);
          
          // Fetch usage data based on service type
          const { data: usageDataResult } = await supabase
            .from('appointments')
            .select('id')
            .gte('booking_date', subscription.billing_cycle_start)
            .lt('booking_date', subscription.billing_cycle_end)
            .eq('tenant_id', tenant?.id);
          
          const usedCount = usageDataResult?.length || 0;
          
          setUsageData({
            used: usedCount,
            total: totalLimit
          });
        } else {
          // Fallback to fetch from plans table directly
          const { data: plansData } = await supabase
            .from('plans')
            .select('name')
            .eq('id', 'efa453b6-ff8b-43cf-83b0-15ce8765dc03') // Basic plan ID
            .single();
            
          if (plansData) {
            setPlanName(plansData.name || 'Basic');
            // Set default usage values
            setUsageData({
              used: 0,
              total: 25 // Default for Basic plan
            });
          }
        }
        
        // Check integration statuses
        if (tenant?.id) {
          const updatedIntegrations = await Promise.all(
            config.integrations.map(async (integration) => {
              const { data: integrationData, error: integrationError } = await supabase
                .from('tenant_integrations')
                .select('tenant.id')
                .eq('is_connected', true)
                .eq('tenant_id', tenant.id)
                .eq('integration_type', integration.type)
                .maybeSingle();
              
              if (integrationError) {
                console.error(`Error fetching ${integration.type} integration status:`, integrationError);
              }
              
              return {
                ...integration,
                isConnected: !!integrationData
              };
            })
          );
          
          setIntegrations(updatedIntegrations);
        } else {
          console.log('No tenant ID available, cannot check integrations');
        }

        if (tenant?.id) {
          const { data: profileData, error: profileError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('tenant_id', tenant.id)
            .maybeSingle();

          if (profileError) {
            console.error('Error fetching business profile:', profileError);
            setServiceSettingsError('Could not load service schedule settings.');
          } else if (profileData?.id) {
            setProfileId(profileData.id);

            const { data: servicesData, error: servicesError } = await supabase
              .from('business_services')
              .select('id, name, subcategory_tag, duration_mins')
              .eq('profile_id', profileData.id)
              .order('created_at', { ascending: true });

            if (servicesError) {
              console.error('Error fetching services:', servicesError);
              setServiceSettingsError('Could not load services.');
            } else {
              const serviceIds = (servicesData || []).map((service) => service.id);
              const { data: slotsData, error: slotsError } = serviceIds.length > 0
                ? await supabase
                    .from('service_weekly_slots')
                    .select('service_id, day_of_week, time_slots')
                    .in('service_id', serviceIds)
                : { data: [], error: null };

              if (slotsError) {
                console.error('Error fetching weekly slots:', slotsError);
                setServiceSettingsError('Could not load weekly slots.');
              }

              const normalizedServices: EditableServiceSetting[] = (servicesData || []).map((service: any) => {
                const schedule = createEmptySchedule();
                (slotsData || [])
                  .filter((slot: any) => slot.service_id === service.id)
                  .forEach((slot: any) => {
                    schedule[slot.day_of_week] = Array.isArray(slot.time_slots) ? slot.time_slots : [];
                  });

                return {
                  id: service.id,
                  name: service.name || '',
                  subcategory_tag: service.subcategory_tag || '',
                  duration_mins: service.duration_mins || 60,
                  availabilitySchedule: schedule,
                };
              });

              setServiceSettings(normalizedServices);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetching settings data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageData();
  }, [user?.id, tenant?.id, serviceType]);

  // Check for OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const error = urlParams.get('error');

    if (connected === 'true') {
      // Update Google Calendar connection status
      setIntegrations(prev => prev.map(integration => 
        integration.type === 'google_calendar' 
          ? { ...integration, isConnected: true }
          : integration
      ));
      
      // Show success message
      setConnectSuccess('Google Calendar connected successfully!');

      // Clean URL based on service type
      const basePath = serviceType === 'turf' ? '/fitness-sports-dashboard/settings' : '/dashboard/settings';
      window.history.replaceState({}, '', basePath);
    }

    if (error) {
      const errorMessages = {
        'oauth_failed': 'Google OAuth authentication failed.',
        'token_exchange_failed': 'Failed to exchange token with Google.',
        'missing_params': 'Required parameters missing for Google Calendar connection.',
        'unknown': 'An unknown error occurred while connecting to Google Calendar.'
      };
      
      setConnectError(errorMessages[error as keyof typeof errorMessages] || 'Failed to connect Google Calendar. Please try again.');
      
      // Clean URL based on service type
      const basePath = serviceType === 'turf' ? '/fitness-sports-dashboard/settings' : '/dashboard/settings';
      window.history.replaceState({}, '', basePath);
    }
  }, [serviceType]);

  const handleConnectGoogleCalendar = async () => {
    try {
      setIsConnecting(true);
      setConnectError(null);
      
      // Construct Google OAuth URL
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.set('client_id', '942527714249-cdbhr135tk3icfqse2edotf1idttem55.apps.googleusercontent.com');
      googleAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/oauth/callback`);
      googleAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar');
      googleAuthUrl.searchParams.set('response_type', 'code');
      googleAuthUrl.searchParams.set('access_type', 'offline');
      googleAuthUrl.searchParams.set('prompt', 'consent');
      
      // Ensure user_id is included and tenant_id if available
      const stateObj = {
        user_id: user?.id || ''
      };
      
      // Only add tenant_id if it exists
      if (tenant?.id) {
        Object.assign(stateObj, { tenant_id: tenant.id });
      } else {
        console.log('No tenant ID available for Google Calendar integration');
      }
      
      console.log('OAuth state object:', stateObj);
      googleAuthUrl.searchParams.set('state', JSON.stringify(stateObj));
      
      // Redirect to Google OAuth
      window.location.href = googleAuthUrl.toString();
      
    } catch (error) {
      setConnectError('Failed to initiate Google OAuth');
      setIsConnecting(false);
    }
  };

  const handleDisconnectIntegration = async (integrationType: string) => {
    if (window.confirm(`Are you sure you want to disconnect ${integrationType}?`)) {
      try {
        const { error } = await supabase
          .from('tenant_integrations')
          .update({ is_connected: false })
          .eq('tenant_id', tenant?.id)
          .eq('integration_type', integrationType);
        
        if (error) {
          console.error(`Error disconnecting ${integrationType}:`, error);
          alert(`Failed to disconnect ${integrationType}. Please try again.`);
        } else {
          setIntegrations(prev => prev.map(integration => 
            integration.type === integrationType 
              ? { ...integration, isConnected: false }
              : integration
          ));
          alert(`${integrationType} disconnected successfully!`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while disconnecting ${integrationType}.`);
      }
    }
  };

  const updateServiceSetting = (serviceIndex: number, field: 'name' | 'subcategory_tag' | 'duration_mins', value: string | number) => {
    setServiceSettings((prev) => prev.map((service, index) => (
      index === serviceIndex ? { ...service, [field]: value } : service
    )));
  };

  const updateServiceSlot = (
    serviceIndex: number,
    day: string,
    slotIndex: number,
    field: keyof SettingsTimeSlot,
    value: string | number
  ) => {
    setServiceSettings((prev) => prev.map((service, index) => {
      if (index !== serviceIndex) return service;

      return {
        ...service,
        availabilitySchedule: {
          ...service.availabilitySchedule,
          [day]: service.availabilitySchedule[day].map((slot, currentSlotIndex) => (
            currentSlotIndex === slotIndex ? { ...slot, [field]: value } : slot
          )),
        },
      };
    }));
  };

  const addServiceSlot = (serviceIndex: number, day: string) => {
    setServiceSettings((prev) => prev.map((service, index) => {
      if (index !== serviceIndex) return service;

      return {
        ...service,
        availabilitySchedule: {
          ...service.availabilitySchedule,
          [day]: [
            ...service.availabilitySchedule[day],
            { start_time: '09:00', end_time: '10:00', price: 99, label: '' },
          ],
        },
      };
    }));
  };

  const removeServiceSlot = (serviceIndex: number, day: string, slotIndex: number) => {
    setServiceSettings((prev) => prev.map((service, index) => {
      if (index !== serviceIndex) return service;

      return {
        ...service,
        availabilitySchedule: {
          ...service.availabilitySchedule,
          [day]: service.availabilitySchedule[day].filter((_, currentSlotIndex) => currentSlotIndex !== slotIndex),
        },
      };
    }));
  };

  const addServiceSetting = () => {
    setServiceSettings((prev) => [
      ...prev,
      {
        name: 'New service',
        subcategory_tag: '',
        duration_mins: 60,
        availabilitySchedule: createEmptySchedule(),
      },
    ]);
  };

  const removeServiceSetting = (serviceIndex: number) => {
    setServiceSettings((prev) => {
      const serviceToRemove = prev[serviceIndex];
      if (serviceToRemove?.id) {
        setDeletedServiceIds((ids) => [...ids, serviceToRemove.id as string]);
      }
      return prev.filter((_, index) => index !== serviceIndex);
    });
  };

  const handleSaveServiceSettings = async () => {
    if (!profileId) {
      setServiceSettingsError('Could not find the business profile for this venue.');
      return;
    }

    try {
      setIsSavingServiceSettings(true);
      setServiceSettingsMessage(null);
      setServiceSettingsError(null);

      if (deletedServiceIds.length > 0) {
        const { error: deleteSlotsError } = await supabase
          .from('service_weekly_slots')
          .delete()
          .in('service_id', deletedServiceIds);

        if (deleteSlotsError) throw deleteSlotsError;

        const { error: deleteServicesError } = await supabase
          .from('business_services')
          .delete()
          .in('id', deletedServiceIds);

        if (deleteServicesError) throw deleteServicesError;
      }

      for (const service of serviceSettings) {
        const operatingDays = daysOfWeek.filter((day) => service.availabilitySchedule[day]?.length > 0);
        const allSlots = operatingDays.flatMap((day) => service.availabilitySchedule[day]);
        const minPrice = allSlots.reduce((lowest, slot) => Math.min(lowest, Number(slot.price) || 0), Infinity);
        const servicePayload = {
          profile_id: profileId,
          name: service.name.trim() || 'Venue service',
          subcategory_tag: service.subcategory_tag?.trim() || null,
          operating_days: operatingDays,
          duration_mins: Number(service.duration_mins) || 60,
          price: minPrice === Infinity ? 0 : minPrice,
        };

        let serviceId = service.id;

        if (serviceId) {
          const { error: serviceUpdateError } = await supabase
            .from('business_services')
            .update(servicePayload)
            .eq('id', serviceId);

          if (serviceUpdateError) throw serviceUpdateError;
        } else {
          const { data: insertedService, error: serviceInsertError } = await supabase
            .from('business_services')
            .insert(servicePayload)
            .select('id')
            .single();

          if (serviceInsertError) throw serviceInsertError;
          serviceId = insertedService.id;
        }

        const { error: deleteSlotsError } = await supabase
          .from('service_weekly_slots')
          .delete()
          .eq('service_id', serviceId);

        if (deleteSlotsError) throw deleteSlotsError;

        const slotsPayload = daysOfWeek.map((day) => ({
          service_id: serviceId,
          day_of_week: day,
          is_open: service.availabilitySchedule[day].length > 0,
          time_slots: service.availabilitySchedule[day],
          created_at: new Date().toISOString(),
        }));

        const { error: slotsInsertError } = await supabase
          .from('service_weekly_slots')
          .insert(slotsPayload);

        if (slotsInsertError) throw slotsInsertError;
      }

      setDeletedServiceIds([]);
      setServiceSettingsMessage('Service schedule updated.');
    } catch (error) {
      console.error('Error saving service schedule settings:', error);
      setServiceSettingsError('Could not save service schedule settings.');
    } finally {
      setIsSavingServiceSettings(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-6 text-blue-100/70">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-full px-0 py-4 font-tori-garamond sm:px-3 lg:px-5">
      <div className="w-full space-y-5 pb-10">
      <div className="text-left">
        <p className="inline-flex rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 font-tori-garamond text-base font-light normal-case text-[#c5e3f8]/70">
          Dashboard Controls
        </p>
        <h1 className="font-tori-garamond mt-2 text-4xl font-light leading-[0.95] text-white sm:text-5xl lg:text-6xl 2xl:text-7xl">Settings</h1>
        <p className="font-tori-garamond mt-2 max-w-4xl text-lg font-light leading-tight text-blue-100/34 sm:text-xl">
          Manage your plan, booking limits, and integrations from one place.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start 2xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
      <div className="space-y-5 lg:contents">
      
      {config.features.showSubscriptionDetails && (
        <section className="relative h-fit overflow-hidden rounded-[1.4rem] border border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(158,211,255,0.14),transparent_15rem),linear-gradient(145deg,rgba(3,8,18,0.86),rgba(4,16,29,0.76))] p-6 pt-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_54px_rgba(0,0,0,0.22)] backdrop-blur-xl lg:col-start-2 lg:row-start-1">
          <p className="absolute left-5 top-4 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 font-tori-garamond text-sm font-light normal-case text-[#c5e3f8]/70">Subscription</p>
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="mx-auto max-w-md">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <h2 className="font-tori-garamond text-3xl font-light text-white">Current plan</h2>
                <span className="rounded-full bg-[#edf6ff] px-3 py-1 font-tori-garamond text-base font-light text-[#2d4c74]">
                  {planName}
                </span>
                <span className="rounded-full border border-emerald-300/18 bg-emerald-400/10 px-3 py-1 font-tori-garamond text-sm font-light text-emerald-200">Active</span>
              </div>
              <p className="mt-1 font-tori-garamond text-base text-blue-100/46">Track your active plan and monthly usage.</p>
            </div>
          </div>
          
          {config.features.showUsageLimit && (
            <div className="mt-8 rounded-2xl border border-[#b9ddff]/16 bg-[#9ed3ff]/[0.065] p-6">
              <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                <div>
                  <h3 className="font-tori-garamond text-2xl font-light text-white">
                    Monthly {config.usageTerminology.plural.charAt(0).toUpperCase() + config.usageTerminology.plural.slice(1)} Usage
                  </h3>
                  <p className="mt-1 font-tori-garamond text-xl font-light text-blue-100/58">
                    {usageData.used} / {usageData.total} {config.usageTerminology.plural} used this month
                  </p>
                </div>
                <div className={`text-center font-tori-garamond text-4xl font-light sm:text-right ${(usageData.total - usageData.used) > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {usageData.total - usageData.used}
                  <span className="block text-2xl">remaining</span>
                </div>
              </div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#bfe4ff] to-[#5d90b8]"
                  style={{ width: `${Math.min((usageData.used / Math.max(usageData.total, 1)) * 100, 100)}%` }}
                />
              </div>
              {usageData.used >= usageData.total && (
                <p className="mt-3 rounded-xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-100">
                  <span className="font-semibold">Limit reached:</span> You've reached your monthly {config.usageTerminology.singular} limit. Please upgrade your plan to {config.usageTerminology.action} more {config.usageTerminology.plural}.
                </p>
              )}
            </div>
          )}
        </section>
      )}

      <section className="relative rounded-[1.4rem] border border-white/10 bg-[#030812]/78 p-6 pt-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_54px_rgba(0,0,0,0.22)] backdrop-blur-xl lg:col-span-2 lg:row-start-2 lg:w-[65%]">
        <p className="absolute left-5 top-4 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 font-tori-garamond text-sm font-light normal-case text-[#c5e3f8]/70">Service schedule</p>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="mx-auto max-w-md">
            <h2 className="mt-2 font-tori-garamond text-3xl font-light text-white">Edit slots and services</h2>
            <p className="mt-1 font-tori-garamond text-base text-blue-100/46">Update the same services, days, times, and slot prices you added during onboarding.</p>
          </div>
          <button
            type="button"
            onClick={addServiceSetting}
            className="tori-unstyled-button rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 font-tori-garamond text-lg font-light text-white transition hover:bg-white/[0.11]"
          >
            Add service
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {serviceSettings.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 font-tori-garamond text-lg font-light text-blue-100/55">
              No services found yet. Add one here to start accepting slots.
            </div>
          ) : (
            serviceSettings.map((service, serviceIndex) => (
              <div key={service.id || serviceIndex} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="grid gap-3 2xl:grid-cols-[1.2fr_0.9fr_0.55fr_auto] 2xl:items-end">
                  <label className="block">
                    <span className="font-tori-garamond text-sm font-light text-blue-100/50">Service</span>
                    <input
                      value={service.name}
                      onChange={(event) => updateServiceSetting(serviceIndex, 'name', event.target.value)}
                      className="mt-1 w-full rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 font-tori-garamond text-lg font-light text-white placeholder:text-blue-100/30 focus:border-[#9ed3ff]/45 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="font-tori-garamond text-sm font-light text-blue-100/50">Category tag</span>
                    <input
                      value={service.subcategory_tag || ''}
                      onChange={(event) => updateServiceSetting(serviceIndex, 'subcategory_tag', event.target.value)}
                      placeholder="gym, yoga, turf_cricket"
                      className="mt-1 w-full rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 font-tori-garamond text-lg font-light text-white placeholder:text-blue-100/30 focus:border-[#9ed3ff]/45 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="font-tori-garamond text-sm font-light text-blue-100/50">Mins</span>
                    <input
                      type="number"
                      min="1"
                      value={service.duration_mins}
                      onChange={(event) => updateServiceSetting(serviceIndex, 'duration_mins', Number(event.target.value))}
                      className="mt-1 w-full rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 font-tori-garamond text-lg font-light text-white placeholder:text-blue-100/30 focus:border-[#9ed3ff]/45 focus:outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeServiceSetting(serviceIndex)}
                    className="tori-unstyled-button rounded-full border border-red-300/18 bg-red-400/10 px-4 py-2 font-tori-garamond text-lg font-light text-red-100 transition hover:bg-red-400/16"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="rounded-2xl border border-white/8 bg-[#071421]/45 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-tori-garamond text-xl font-light text-white">{day}</p>
                        <button
                          type="button"
                          onClick={() => addServiceSlot(serviceIndex, day)}
                          className="tori-unstyled-button rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 font-tori-garamond text-base font-light text-blue-100/75 transition hover:bg-white/[0.1]"
                        >
                          Add slot
                        </button>
                      </div>

                      <div className="mt-3 space-y-2">
                        {service.availabilitySchedule[day].length === 0 ? (
                          <p className="font-tori-garamond text-base font-light text-blue-100/38">Closed</p>
                        ) : (
                          service.availabilitySchedule[day].map((slot, slotIndex) => (
                            <div key={`${day}-${slotIndex}`} className="grid gap-2 2xl:grid-cols-[1fr_0.75fr_0.75fr_0.65fr_auto] 2xl:items-center">
                              <input
                                value={slot.label || ''}
                                onChange={(event) => updateServiceSlot(serviceIndex, day, slotIndex, 'label', event.target.value)}
                                placeholder="Slot label"
                                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 font-tori-garamond text-base font-light text-white placeholder:text-blue-100/30 focus:border-[#9ed3ff]/45 focus:outline-none"
                              />
                              <input
                                type="time"
                                value={slot.start_time}
                                onChange={(event) => updateServiceSlot(serviceIndex, day, slotIndex, 'start_time', event.target.value)}
                                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 font-tori-garamond text-base font-light text-white focus:border-[#9ed3ff]/45 focus:outline-none"
                              />
                              <input
                                type="time"
                                value={slot.end_time}
                                onChange={(event) => updateServiceSlot(serviceIndex, day, slotIndex, 'end_time', event.target.value)}
                                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 font-tori-garamond text-base font-light text-white focus:border-[#9ed3ff]/45 focus:outline-none"
                              />
                              <input
                                type="number"
                                min="0"
                                value={slot.price || ''}
                                onChange={(event) => updateServiceSlot(serviceIndex, day, slotIndex, 'price', event.target.value ? Number(event.target.value) : 0)}
                                placeholder="Price"
                                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 font-tori-garamond text-base font-light text-white placeholder:text-blue-100/30 focus:border-[#9ed3ff]/45 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => removeServiceSlot(serviceIndex, day, slotIndex)}
                                className="tori-unstyled-button rounded-full border border-red-300/18 bg-red-400/10 px-3 py-2 font-tori-garamond text-base font-light text-red-100 transition hover:bg-red-400/16"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-tori-garamond text-base font-light">
            {serviceSettingsMessage && <span className="text-emerald-200">{serviceSettingsMessage}</span>}
            {serviceSettingsError && <span className="text-red-200">{serviceSettingsError}</span>}
          </div>
          <button
            type="button"
            onClick={handleSaveServiceSettings}
            disabled={isSavingServiceSettings}
            className="tori-unstyled-button rounded-full border border-[#b9ddff]/18 bg-[#f3efe8] px-6 py-2 font-tori-garamond text-xl font-light text-[#111827] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingServiceSettings ? 'Saving...' : 'Save schedule'}
          </button>
        </div>
      </section>
      </div>
      
      {config.features.showIntegrations && (
        <section className="relative rounded-[1.4rem] border border-white/10 bg-[#030812]/78 p-5 pt-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_54px_rgba(0,0,0,0.22)] backdrop-blur-xl lg:col-start-1 lg:row-start-1 lg:h-full">
          <p className="absolute left-5 top-4 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 font-tori-garamond text-sm font-light normal-case text-[#c5e3f8]/70">Integrations</p>
          <div className="mb-4 text-center">
            <h2 className="mt-2 font-tori-garamond text-3xl font-light text-white">Connected tools</h2>
            <p className="mt-1 font-tori-garamond text-base text-blue-100/46">Sync calendars and external tools used by your venue.</p>
          </div>
          
          <div className="grid gap-5 md:grid-cols-2">
            {integrations.map((integration) => (
              <div key={integration.type} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:border-[#b9ddff]/18 hover:bg-white/[0.05]">
                <div className="flex h-full flex-col items-center gap-6 text-center">
                  <div className="min-w-0">
                    {integration.type === 'google_calendar' ? (
                      <img src={googleCalendarLogo} alt="Google Calendar" className="mx-auto mb-7 h-16 w-16 object-contain" />
                    ) : integration.type === 'zoom' ? (
                      <img src={zoomLogo} alt="Zoom" className="mx-auto mb-7 h-14 w-28 object-contain" />
                    ) : (
                      <div className="mx-auto mb-7 text-5xl">{integration.icon}</div>
                    )}
                    <h3 className="font-tori-garamond text-2xl font-light text-white">
                      {integration.name}
                    </h3>
                    <p className="mt-2 font-tori-garamond text-base leading-5 text-blue-100/52">
                      {integration.description}
                    </p>
                  </div>
                  
                  <div className="mt-auto flex flex-shrink-0 items-center justify-center gap-3">
                    {integration.isConnected ? (
                      <>
                        <span className="inline-flex items-center rounded-full border border-emerald-300/18 bg-emerald-400/10 px-3 py-1.5 font-tori-garamond text-sm font-light text-emerald-200">
                          Connected
                        </span>
                        <button 
                          className="tori-unstyled-button rounded-full border border-red-300/18 bg-red-400/10 px-3 py-1.5 font-tori-garamond text-sm font-light text-red-100 transition hover:bg-red-400/16"
                          onClick={() => handleDisconnectIntegration(integration.type)}
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={integration.type === 'google_calendar' ? handleConnectGoogleCalendar : undefined}
                        disabled={isConnecting}
                        className="tori-unstyled-button group inline-flex min-w-[10.5rem] items-center rounded-full border border-[#b9ddff]/18 bg-white/[0.055] py-1.5 pl-1.5 pr-6 font-tori-garamond text-xl font-light normal-case text-white transition hover:bg-[#9ed3ff]/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isConnecting && integration.type === 'google_calendar' ? (
                          <>
                            <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-blue-100/80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <span className="mr-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#f3efe8] text-[#111827] transition duration-300 group-hover:translate-x-0.5">
                              <svg className="h-5 w-5" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                                <path d="M3.5 9h10M9.5 5l4 4-4 4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                            Connect
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {connectSuccess && integration.type === 'google_calendar' && (
                  <p className="mt-3 text-sm font-medium text-emerald-200">{connectSuccess}</p>
                )}
                {connectError && integration.type === 'google_calendar' && !integration.isConnected && (
                  <p className="mt-3 text-sm text-red-200">{connectError}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      </div>
      
      {config.features.customSections && (
        <div className="space-y-5">
          {config.features.customSections.map((section, index) => (
            <div key={index}>{section}</div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default UnifiedSettingsPage;