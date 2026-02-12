import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseService';
import { getRedirectUrl } from '../utils/environmentUtils';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [configInfo, setConfigInfo] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Function to test Supabase configuration
  const testSupabaseConfig = async () => {
    setIsLoading(true);
    setConfigInfo(null);
    setError(null);
    
    try {
      // Test 1: Check if Supabase client is initialized
      const info = [];
      info.push(`Auth Client Available: ${!!supabase.auth}`);
      
      // Test 2: Check if we can access the auth session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Auth API unreachable: ${sessionError.message}`);
      }
      
      info.push(`Auth API: ${sessionError ? 'Unreachable' : 'Available'}`);
      info.push(`Session exists: ${!!sessionData?.session}`);
      if (sessionData?.session) {
        info.push(`User ID: ${sessionData.session.user.id}`);
        info.push(`User email: ${sessionData.session.user.email}`);
        info.push(`Session expires: ${new Date(sessionData.session.expires_at! * 1000).toLocaleString()}`);
      }
      
      // Check localStorage token
      const localToken = localStorage.getItem('authToken');
      info.push(`Local token exists: ${!!localToken}`);
      if (localToken) {
        info.push(`Local token (first 10 chars): ${localToken.substring(0, 10)}...`);
      }
      
      // Test 3: Check if we can access the database
      try {
        const { count, error: dbError } = await supabase
          .from('approved_users')
          .select('*', { count: 'exact', head: true });
        
        if (dbError) {
          info.push(`DB Error: ${dbError.message}`);
        } else {
          info.push(`approved_users count: ${count || 0}`);
        }
        
        // Check turf_approved_users too
        const { count: turfCount, error: turfDbError } = await supabase
          .from('turf_approved_users')
          .select('*', { count: 'exact', head: true });
          
        if (turfDbError) {
          info.push(`Turf DB Error: ${turfDbError.message}`);
        } else {
          info.push(`turf_approved_users count: ${turfCount || 0}`);
        }
        
      } catch (dbErr) {
        info.push(`DB Access Error: ${(dbErr as Error).message}`);
      }
      
      // Set success message with the configuration info
      setConfigInfo(info.join('\n'));
      
      // Attempt to start an anonymous OAuth session to test redirect flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
          redirectTo: `${window.location.origin}/oauth/callback`
        }
      });
      
      if (error) {
        info.push(`OAuth URL Error: ${error.message}`);
      } else if (data?.url) {
        info.push(`Generated OAuth URL: ${data.url.substring(0, 50)}...`);
      }
      
      setConfigInfo(info.join('\n'));
    } catch (err: any) {
      setError(`Configuration test failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to clear local authentication state - useful for debugging
  const clearAuthState = () => {
    localStorage.removeItem('authToken');
    setConfigInfo('Local auth token cleared');
  };

  const handleGoogleLogin = async () => {
    console.log("Initiating Google login flow");
    
    try {
    //   // First check if user email is in approved_users (optional)
    //   const userEmail = prompt("Enter your email to verify access (or cancel to skip):");
    //   if (userEmail) {
    //     const { data, error } = await supabase
    //       .from('approved_users')
    //       .select('email')
    //       .eq('email', userEmail)
    //       .maybeSingle();
        
    //     if (error) {
    //       throw new Error(`Error checking approved users: ${error.message}`);
    //     }
        
    //     if (!data) {
    //       setError("Email not found in approved users list. Please contact your administrator.");
    //       return;
    //     }
        
    //     console.log("User is in approved list, continuing with Google login");
    //   }
    
      // Use utility function to get the appropriate redirect URL
      const redirectUrl = getRedirectUrl('/oauth/callback');
      console.log(`Redirect URL: ${redirectUrl}`);
      
      // Continue with OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          // Add scopes for additional profile information
          scopes: 'email profile',
          // Pass query params for better tracking
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error("OAuth error:", error);
        setError(`Google login failed: ${error.message}`);
      } else if (data && data.url) {
        // Redirect the user to the OAuth URL
        console.log("Redirecting to OAuth URL:", data.url);
        // Use direct window.location.href to ensure proper redirect
        window.location.href = data.url;
      } else {
        console.error("No OAuth URL returned");
        setError("Failed to initiate Google login. Please try again.");
      }
    } catch (err: any) {
      console.error("Login preparation error:", err);
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      
      // Check if user just completed payment and should go to onboarding
      const paymentCompleted = localStorage.getItem('paymentCompleted');
      if (paymentCompleted === 'true') {
        localStorage.removeItem('paymentCompleted');
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      
      setSuccessMessage('Password reset link sent to your email!');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
              return to home page
            </Link>
          </p>
        </div>

        {/* ADD GOOGLE SIGN-IN BUTTON HERE */}
        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </span>
            Sign in with Google
          </button>
        </div>

        {/* OR DIVIDER */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                onClick={handleForgotPassword}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
      <div className="mt-4 text-center">
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={testSupabaseConfig}
            className="text-sm text-gray-500 underline"
            disabled={isLoading}
          >
            {isLoading ? 'Testing...' : 'Test Supabase Config'}
          </button>
          
          <button
            type="button"
            onClick={clearAuthState}
            className="text-sm text-red-500 underline"
            disabled={isLoading}
          >
            Clear Auth State
          </button>
        </div>
        
        {configInfo && (
          <div className="mt-4 p-4 bg-gray-100 text-left rounded text-xs font-mono whitespace-pre-wrap max-h-64 overflow-auto">
            {configInfo}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
