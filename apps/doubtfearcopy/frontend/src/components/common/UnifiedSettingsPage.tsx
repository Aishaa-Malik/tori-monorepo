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
      const basePath = serviceType === 'turf' ? '/healthwellness-dashboard/settings' : '/dashboard/settings';
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
      const basePath = serviceType === 'turf' ? '/healthwellness-dashboard/settings' : '/dashboard/settings';
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
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white text-left">Settings</h1>
      
      {config.features.showSubscriptionDetails && (
        <div className="bg-black bg-opacity-80 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Subscription Details</h2>
          <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 mb-1">Current Plan</p>
            <p className="text-2xl font-medium dark:text-white flex items-center">
              <span className={`bg-${config.theme.primaryColor}-100 dark:bg-${config.theme.primaryColor}-900 text-${config.theme.primaryColor}-800 dark:text-${config.theme.primaryColor}-200 px-3 py-1 rounded-full mr-2`}>
                {planName}
              </span>
              <span className="text-green-600 dark:text-green-400 text-sm">Active</span>
            </p>
          </div>
          
          {config.features.showUsageLimit && (
            <>
              <button 
                onClick={toggleUsageLimit}
                className={`bg-${config.theme.primaryColor}-500 hover:bg-${config.theme.primaryColor}-600 text-white py-2 px-4 rounded transition-colors duration-300 flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Check {config.usageTerminology.plural} Usage Limit
              </button>
              
              {showUsageLimit && (
                <div className={`bg-${config.theme.primaryColor}-50 dark:bg-${config.theme.primaryColor}-900/30 border border-${config.theme.primaryColor}-200 dark:border-${config.theme.primaryColor}-800 rounded-md p-4 mt-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-sm font-medium text-${config.theme.primaryColor}-800 dark:text-${config.theme.primaryColor}-200`}>
                        Monthly {config.usageTerminology.plural.charAt(0).toUpperCase() + config.usageTerminology.plural.slice(1)} Usage
                      </h3>
                      <p className={`text-sm text-${config.theme.primaryColor}-600 dark:text-${config.theme.primaryColor}-300`}>
                        {usageData.used} / {usageData.total} {config.usageTerminology.plural} used this month
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${(usageData.total - usageData.used) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {usageData.total - usageData.used} remaining
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`bg-${config.theme.primaryColor}-600 dark:bg-${config.theme.primaryColor}-500 h-2 rounded-full`}
                      style={{ width: `${Math.min((usageData.used / Math.max(usageData.total, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {usageData.used >= usageData.total && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded">
                      <span className="font-medium">Limit reached:</span> You've reached your monthly {config.usageTerminology.singular} limit. Please upgrade your plan to {config.usageTerminology.action} more {config.usageTerminology.plural}.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {config.features.showIntegrations && (
        <div className="bg-black bg-opacity-80 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Integrations</h2>
          
          {integrations.map((integration) => (
            <div key={integration.type} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-medium mb-2 dark:text-white flex items-center">
                {integration.icon}
                {integration.name}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {integration.description}
              </p>
              
              {integration.isConnected ? (
                <div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Connected
                    </span>
                    <button 
                      className="ml-4 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200"
                      onClick={() => handleDisconnectIntegration(integration.type)}
                    >
                      Disconnect
                    </button>
                  </div>
                  {connectSuccess && integration.type === 'google_calendar' && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">{connectSuccess}</p>
                  )}
                </div>
              ) : (
                <div>
                  <button 
                    onClick={integration.type === 'google_calendar' ? handleConnectGoogleCalendar : undefined}
                    disabled={isConnecting}
                    className="inline-flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isConnecting && integration.type === 'google_calendar' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        {integration.icon}
                        Connect with {integration.name}
                      </>
                    )}
                  </button>
                  {connectError && integration.type === 'google_calendar' && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">{connectError}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {config.features.customSections && (
        <div className="mt-6">
          {config.features.customSections.map((section, index) => (
            <div key={index}>{section}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnifiedSettingsPage;