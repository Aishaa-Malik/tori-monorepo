import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseService';
import { SettingsPageProps, UsageData, IntegrationConfig } from '../../types/settingsManagement.types';
import { getSettingsConfig } from '../../config/settingsManagementConfig';

const UnifiedSettingsPage: React.FC<SettingsPageProps> = ({ serviceType }) => {
  const { user, tenant } = useAuth();
  const config = useMemo(() => getSettingsConfig(serviceType), [serviceType]);
  
  const [showUsageLimit, setShowUsageLimit] = useState(false);
  const [usageData, setUsageData] = useState<UsageData>({ used: 0, total: 0 });
  const [planName, setPlanName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(config.integrations);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);

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

  const toggleUsageLimit = () => {
    setShowUsageLimit(!showUsageLimit);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center p-6 text-blue-100/70">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 py-5 sm:px-6 lg:px-7">
      <div className="mx-auto max-w-6xl space-y-5 pb-10">
      <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_54px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9fc4de]/70">
          Dashboard Controls
        </p>
        <h1 className="font-tori-garamond mt-2 text-5xl font-light leading-[0.95] text-white sm:text-6xl xl:text-7xl">Settings</h1>
        <p className="font-tori-garamond mt-2 max-w-4xl text-2xl italic leading-tight text-blue-100/45 sm:text-3xl">
          Manage your plan, booking limits, and integrations from one place.
        </p>
      </div>
      
      {config.features.showSubscriptionDetails && (
        <section className="rounded-[1.4rem] border border-white/10 bg-[#030812]/78 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_54px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fc4de]/68">Subscription</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Current plan</h2>
              <p className="mt-1 text-sm text-blue-100/52">Track your active plan and monthly usage.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#edf6ff] px-3 py-1 text-sm font-semibold text-[#2d4c74]">
                  {planName}
                </span>
                <span className="text-xs font-semibold text-emerald-300">Active</span>
              </div>
            </div>
          </div>
          
          {config.features.showUsageLimit && (
            <div className="mt-5">
              <button
                onClick={toggleUsageLimit}
                className="inline-flex items-center rounded-full border border-[#b9ddff]/18 bg-white/[0.055] px-4 py-2 text-xs font-semibold uppercase tracking-[0.04em] text-blue-100/80 transition hover:bg-[#9ed3ff]/12 hover:text-white"
              >
                <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#f3efe8] text-[#111827]">→</span>
                Check {config.usageTerminology.plural} usage limit
              </button>
              
              {showUsageLimit && (
                <div className="mt-4 rounded-2xl border border-[#b9ddff]/16 bg-[#9ed3ff]/[0.065] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Monthly {config.usageTerminology.plural.charAt(0).toUpperCase() + config.usageTerminology.plural.slice(1)} Usage
                      </h3>
                      <p className="mt-1 text-sm text-blue-100/58">
                        {usageData.used} / {usageData.total} {config.usageTerminology.plural} used this month
                      </p>
                    </div>
                    <div className={`text-lg font-semibold ${(usageData.total - usageData.used) > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                      {usageData.total - usageData.used} remaining
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
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
            </div>
          )}
        </section>
      )}
      
      {config.features.showIntegrations && (
        <section className="rounded-[1.4rem] border border-white/10 bg-[#030812]/78 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_54px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9fc4de]/68">Integrations</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Connected tools</h2>
            <p className="mt-1 text-sm text-blue-100/52">Sync calendars and external tools used by your venue.</p>
          </div>
          
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <div key={integration.type} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#b9ddff]/18 hover:bg-white/[0.05]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      {integration.icon}
                      {integration.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-blue-100/58">
                      {integration.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-shrink-0 items-center gap-3">
                    {integration.isConnected ? (
                      <>
                        <span className="inline-flex items-center rounded-full border border-emerald-300/18 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200">
                          Connected
                        </span>
                        <button 
                          className="rounded-full border border-red-300/18 bg-red-400/10 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-400/16"
                          onClick={() => handleDisconnectIntegration(integration.type)}
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={integration.type === 'google_calendar' ? handleConnectGoogleCalendar : undefined}
                        disabled={isConnecting}
                        className="inline-flex items-center rounded-full border border-[#b9ddff]/18 bg-white/[0.055] px-4 py-2 text-xs font-semibold uppercase tracking-[0.04em] text-blue-100/80 transition hover:bg-[#9ed3ff]/12 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#f3efe8] text-[#111827]">→</span>
                            Connect with {integration.name}
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