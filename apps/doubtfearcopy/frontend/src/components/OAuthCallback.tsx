import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback: React.FC = () => {
  const hasRun = useRef(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginFromSession } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your request...');

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasRun.current) return;
    hasRun.current = true;
    
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        
        console.log('OAuth callback params:', { 
          code: code?.substring(0, 20) + '...', 
          state: state?.substring(0, 50) + '...', 
          error 
        });

        // Handle OAuth errors
        if (error) {
          console.error('OAuth error from Google:', error);
          setStatus('error');
          setMessage('Authentication failed.');
          setTimeout(() => {
            const basePath = window.location.href.includes('turf') ? '/healthwellness-dashboard' : '/dashboard';
            navigate(`${basePath}?error=oauth_failed`, { replace: true });
          }, 2000);
          return;
        }

        // Handle Supabase auth session (for login flow)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (session && !code) {
          console.log('Supabase auth session found, logging in user');
          localStorage.setItem('authToken', session.access_token);
          await loginFromSession(session.access_token, session.user);
          
          setStatus('success');
          setMessage('Login successful! Checking your account status...');
          
          // Check onboarding status before navigation
          try {
            console.log('Checking onboarding status for Google OAuth user...');
           // const REACT_APP_BACKEND_URL = 'http://localhost:5001'; // Hardcoded for testing

            // Fix the URL to match the backend route structure
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user/onboarding-status`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
                // Add cache control to prevent caching issues
                'Cache-Control': 'no-cache, no-store',
                'Pragma': 'no-cache'
              },
            });

            console.log('Onboarding response:', response);
            console.log('Onboarding status response status:', response.status);
            console.log('Onboarding status response headers:', response.headers);

            if (response.ok) {
              const responseText = await response.text();
              console.log('Response was:', responseText);
              
              // Try to parse as JSON, if it fails, handle the error gracefully
               let data;
               try {
                 data = JSON.parse(responseText);
               } catch (jsonError) {
                 console.error('Response is not valid JSON:', jsonError);
                 setStatus('error');
                 setMessage('Server returned invalid data. Please try again later.');
                 return;
               }
              
              console.log('Onboarding status response:', data);
              
              const needsOnboarding = data.needsOnboarding;
              console.log(`User needs onboarding: ${needsOnboarding}`, needsOnboarding);
              
              setTimeout(() => {
                if (needsOnboarding) {
                  console.log('Redirecting to onboarding page');
                  navigate('/onboarding', { replace: true });
                } else {
                  console.log('Redirecting to dashboard');
                  navigate('/dashboard', { replace: true });
                }
              }, 1000);
            } else {
              console.error('Failed to check onboarding status:', response.status);
              const errorText = await response.text();
              console.error('Error response:', errorText);
              // Default to onboarding if API call fails
              setTimeout(() => {
                console.log('Defaulting to onboarding due to API error');
                navigate('/onboarding', { replace: true });
              }, 1000);
            }
          } catch (error) {
            console.error('Error checking onboarding status:', error);
            // Default to onboarding if API call fails
            setTimeout(() => {
              console.log('Defaulting to onboarding due to network error');
              navigate('/onboarding', { replace: true });
            }, 1000);
          }
          return;
        }

        // Handle Google Calendar integration (when code is present)
        if (code && state) {
          try {
            console.log('Processing Google Calendar integration...');
            
            // Parse state data
            let stateData;
            try {
              stateData = JSON.parse(state);
              console.log('Parsed state data:', {
                user_id: stateData.user_id?.substring(0, 8) + '...',
                tenant_id: stateData.tenant_id?.substring(0, 8) + '...'
              });
            } catch (parseError) {
              console.error('Failed to parse state JSON:', parseError);
              throw new Error('Invalid state parameter from Google');
            }
            
            if (!stateData.user_id) {
              throw new Error('Missing user_id in OAuth state');
            }
            
            setMessage('Connecting your Google Calendar...');
            
            // Call edge function for token exchange (only once)
            console.log('Invoking handle-google-oauth edge function...');
            const { data, error: edgeError } = await supabase.functions.invoke('handle-google-oauth', {
              body: {
                code,
                tenant_id: stateData.tenant_id || null,
                user_id: stateData.user_id
              }
            });
            
            if (edgeError) {
              console.error('Edge function error:', {
                message: edgeError.message,
                details: edgeError.details || 'No additional details',
                status: edgeError.status || 'Unknown status'
              });
              throw new Error(edgeError.message || 'Failed to process calendar integration');
            }

            console.log('Calendar integration successful:', data);
            setStatus('success');
            setMessage('Google Calendar connected successfully! Redirecting...');
            
            // Redirect after success with delay
            setTimeout(() => {
              const basePath = window.location.href.includes('turf') ? '/healthwellness-dashboard' : '/dashboard';
              navigate(`${basePath}?connected=google_calendar`, { replace: true });
            }, 1500);
            
          } catch (integrationError: any) {
            console.error('Calendar integration error:', integrationError);
            setStatus('error');
            
            // Provide more specific error messages
            if (integrationError.message?.includes('invalid_grant')) {
              setMessage('Authorization expired. Please try connecting again.');
            } else if (integrationError.message?.includes('400')) {
              setMessage('Failed to connect Google Calendar. Authorization code may have expired.');
            } else {
              setMessage('Failed to connect Google Calendar. Please try again.');
            }
            
            setTimeout(() => {
              const redirectPath = window.location.href.includes('turf') ? '/healthwellness-dashboard' : '/dashboard';
              navigate(`${redirectPath}?error=calendar_integration_failed`, { replace: true });
            }, 3000);
          }
        } else if (!session) {
          // No code, no session - invalid callback
          console.error('Invalid OAuth callback - missing code and session');
          setStatus('error');
          setMessage('Invalid authentication callback.');
          
          setTimeout(() => {
            navigate('/login?error=invalid_callback', { replace: true });
          }, 2000);
        }
      } catch (error: any) {
        console.error('OAuth callback handler error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication.');
        
        setTimeout(() => {
          const redirectPath = window.location.href.includes('turf') ? '/healthwellness-dashboard' : '/login';
          navigate(`${redirectPath}?error=callback_handler_failed`, { replace: true });
        }, 2000);
      }
    };

    handleCallback();
  }, []); // Empty dependency array - only run once on mount

  // Show status UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        {status === 'processing' && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        )}
        {status === 'success' && (
          <div className="mb-4">
            <svg 
              className="h-12 w-12 text-green-500 mx-auto" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        )}
        {status === 'error' && (
          <div className="mb-4">
            <svg 
              className="h-12 w-12 text-red-500 mx-auto" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        )}
        <p className="text-gray-700 text-lg font-medium">{message}</p>
        {status === 'error' && (
          <p className="text-sm text-gray-500 mt-2">You will be redirected shortly...</p>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
