import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseService';
import { useNavigate, useLocation } from 'react-router-dom';

const UpdatePassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const establishSession = async () => {
      try {
        // Parse hash fragment (recovery)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        let type = hashParams.get('type');

        // Parse query params (signup / magic link)
        const otpToken = searchParams.get('token');
        const otpType = searchParams.get('type');
        const email = searchParams.get('email');
        if (otpType) type = otpType;

        if (accessToken) {
          // Recovery flow – tokens present, just set session
          const { error: sessErr } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          if (sessErr) throw sessErr;
        } else if (otpToken && email) {
          // Signup / magic-link flow – verify OTP token, returns session
          const { error: verifyErr } = await supabase.auth.verifyOtp({
            email,
            token: otpToken,
            type: (otpType as any) || 'signup'
          });
          if (verifyErr) throw verifyErr;
        } else {
          setError('No authentication token found. Please request a new link.');
          return;
        }

        // Double-check we now have a session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Failed to establish an authenticated session.');
      } catch (err: any) {
        console.error('Session error:', err);
        setError(err.message || 'Failed to establish session');
      }
    };

    establishSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session. Please request a new link.');
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Sign out to clear the session
      await supabase.auth.signOut();

      alert('Password set successfully! You can now log in with your email and password.');
      navigate('/login');
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to set password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please set a password for your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !!error}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (isLoading || !!error) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Setting password...' : 'Set Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword; 