import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import { getRedirectUrl } from '../utils/environmentUtils';
const dashboardLoginImg = `${process.env.PUBLIC_URL}/dashboard-login-img.png?v=20260627`;

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    console.log('Initiating Google login flow');
    setIsLoading(true);
    setError(null);

    try {
      const redirectUrl = getRedirectUrl('/oauth/callback');
      console.log(`Redirect URL: ${redirectUrl}`);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          scopes: 'email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('OAuth error:', error);
        setError(`Google login failed: ${error.message}`);
      } else if (data?.url) {
        console.log('Redirecting to OAuth URL:', data.url);
        window.location.href = data.url;
      } else {
        console.error('No OAuth URL returned');
        setError('Failed to initiate Google login. Please try again.');
      }
    } catch (err: any) {
      console.error('Login preparation error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="font-tori-garamond min-h-screen overflow-x-hidden bg-black text-white [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1.1px)] [background-size:16px_16px] lg:overflow-hidden">
      <section className="grid min-h-screen w-full bg-black/95 lg:h-screen lg:w-screen lg:overflow-hidden lg:grid-cols-[38vw_1fr] 2xl:grid-cols-[36vw_1fr]">
        <aside className="relative flex min-h-screen flex-col overflow-hidden bg-black/88 px-6 py-8 sm:px-10 lg:border-r lg:border-white/[0.06] lg:px-0 lg:py-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(116,183,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,0.58)_0.9px,transparent_1px)] [background-size:15px_15px]" />

          <div className="relative z-10 mx-auto flex w-full max-w-[520px] flex-1 flex-col items-center justify-center py-12 sm:max-w-[560px] lg:ml-auto lg:mr-[3.4vw] lg:max-w-[min(500px,78%)] lg:-translate-y-[1.5vh] lg:py-0 2xl:mr-[4vw] 2xl:max-w-[560px]">
            <span className="font-tori-garamond relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-white/[0.075] px-3.5 py-1.5 text-[15px] font-light lowercase leading-none tracking-normal text-white/88 shadow-[0_14px_38px_rgba(56,137,196,0.18),inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl before:absolute before:inset-y-0 before:left-0 before:w-2/3 before:-translate-x-full before:skew-x-[-18deg] before:bg-gradient-to-r before:from-transparent before:via-white/22 before:to-transparent before:transition before:duration-700 hover:before:translate-x-[210%] sm:text-[16px]">
              <span className="relative z-10 h-1 w-1 rounded-full bg-[#b8dfff] shadow-[0_0_14px_rgba(184,223,255,0.75)]" />
              <span className="relative z-10">Tori Ate Dashboard</span>
            </span>

            <h1 className="mt-6 max-w-[540px] text-center text-[clamp(46px,10vw,72px)] font-light leading-[0.98] tracking-normal text-white sm:text-[clamp(56px,7.4vw,82px)] lg:text-[clamp(48px,4vw,78px)] 2xl:max-w-[600px] 2xl:text-[clamp(66px,4.2vw,96px)]">
              Run your WhatsApp bookings from one dashboard.
            </h1>
            <p className="mt-5 max-w-[480px] text-center text-[clamp(19px,4.6vw,23px)] font-light leading-[1.24] tracking-normal text-white/72 sm:text-[clamp(21px,3vw,25px)] lg:text-[clamp(18px,1.16vw,22px)] 2xl:max-w-[540px] 2xl:text-[clamp(23px,1.28vw,28px)]">
              Track paid bookings, staff availability, revenue, reminders, and follow-ups without digging through WhatsApp chats.
            </p>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="tori-google-button group relative mt-10 flex h-[62px] w-[min(330px,100%)] items-center overflow-hidden rounded-full border border-white/20 bg-[#dedee1] pl-3 pr-[6px] text-[#1d1b1a] shadow-[0_16px_42px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.68)] transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#eef6fb] hover:shadow-[0_20px_54px_rgba(122,176,211,0.22),inset_0_1px_0_rgba(255,255,255,0.9)] focus:outline-none focus:ring-4 focus:ring-[#8fd7ff]/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:w-[352px] 2xl:h-[66px] 2xl:w-[382px]"
            >
              <span className="tori-google-shine pointer-events-none absolute inset-y-0 left-8 w-1/3 bg-gradient-to-r from-transparent via-white/65 to-transparent" />
              <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_8px_20px_rgba(0,0,0,0.14)] transition duration-300 group-hover:rotate-6 group-hover:scale-105 2xl:h-10 2xl:w-10">
                <svg className="h-[23px] w-[23px] 2xl:h-6 2xl:w-6" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </span>
              <span className="font-tori-garamond relative z-10 flex-1 text-center text-[26px] font-light leading-none tracking-normal 2xl:text-[31px]">
                {isLoading ? 'Opening Google...' : 'Continue with Google'}
              </span>
              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1f1d1d] text-white shadow-[0_12px_28px_rgba(0,0,0,0.3)] transition duration-300 group-hover:translate-x-0.5 group-hover:bg-[#0d1d2c] 2xl:h-[52px] 2xl:w-[52px]">
                <svg
                  className="h-[24px] w-[24px] transition duration-300 group-hover:translate-x-0.5 2xl:h-[26px] 2xl:w-[26px]"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8h9m0 0L8.5 4.5M12 8l-3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <p className="font-resist-sans mt-6 max-w-[330px] text-center text-[10px] font-medium leading-5 tracking-normal text-[#7f8d96] opacity-60 sm:text-[11px]">
              Used to verify your account and sync calendar availability.
            </p>

            <div className="font-resist-sans mt-4 flex flex-wrap justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.025em] text-[#93a5b2] opacity-55 sm:text-[10px]">
              <span className="rounded-full border border-[#7f98aa]/20 bg-[#d8efff]/[0.018] px-2.5 py-1.5 backdrop-blur sm:px-3">Calendar sync</span>
              <span className="rounded-full border border-[#7f98aa]/20 bg-[#8bb7d6]/[0.02] px-2.5 py-1.5 backdrop-blur sm:px-3">Payment links</span>
              <span className="rounded-full border border-[#7f98aa]/20 bg-[#5d90b8]/[0.022] px-2.5 py-1.5 backdrop-blur sm:px-3">Booking reminders</span>
            </div>

            {error && (
              <div className="font-resist-sans mt-5 w-full rounded-xl border border-red-300/15 bg-red-500/10 px-3 py-3 text-center text-[12px] font-medium leading-5 text-red-100">
                {error}
              </div>
            )}
          </div>

          <footer className="font-resist-sans relative z-10 grid grid-cols-1 gap-3 px-6 pb-7 text-center text-[12px] font-semibold tracking-[0.006em] text-white/58 sm:grid-cols-2 sm:px-7 sm:text-left lg:text-[12px]">
            <Link to="/" className="text-white/70 transition hover:text-white sm:justify-self-start">Tori Ate</Link>
            <div className="flex justify-center gap-3 sm:justify-end">
              <Link to="/contact" className="transition hover:text-white">Contact support</Link>
            </div>
          </footer>
        </aside>

        <div className="relative hidden items-center justify-end overflow-hidden bg-black py-3 pr-3 [background-image:radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1.1px)] [background-size:16px_16px] lg:flex">
          <div className="relative h-[calc(100vh-24px)] w-[calc(100%-32px)] max-w-none overflow-hidden rounded-[28px] border-[6px] border-[#050706] bg-[#071421] shadow-[0_24px_70px_rgba(0,0,0,0.62)] 2xl:w-[calc(100%-44px)]">
            <img
              src={dashboardLoginImg}
              alt="Tori Ate dashboard login visual"
              className="h-full w-full object-fill"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
