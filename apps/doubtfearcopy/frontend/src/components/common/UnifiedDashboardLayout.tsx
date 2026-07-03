import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  DashboardServiceType,
  getDashboardConfig,
  getNavItems,
  hrefForNavItem,
} from '../../config/dashboardConfig';

interface UnifiedDashboardLayoutProps {
  serviceType: DashboardServiceType;
}

const renderIcon = (iconName: string) => {
  const className = 'w-5 h-5';

  switch (iconName) {
    case 'home':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case 'calendar':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'clock':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'chart-bar':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'cog':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'users':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'user-md':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'building':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'credit-card':
      return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    default:
      return null;
  }
};

const UnifiedDashboardLayout: React.FC<UnifiedDashboardLayoutProps> = ({ serviceType }) => {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const config = getDashboardConfig(serviceType);
  const navigation = getNavItems(serviceType, user?.role ?? UserRole.EMPLOYEE)
    .filter((item) => item.segment !== 'settings')
    .map((item) => ({
      ...item,
      href: hrefForNavItem(config.basePath, item.segment),
    }));
  const settingsNavItem = {
    name: 'Settings',
    href: hrefForNavItem(config.basePath, 'settings'),
    icon: 'cog',
  };
  const toriLogoSrc = `${process.env.PUBLIC_URL}/images/logo.png`;

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.avatarUrl]);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const renderNavLink = (item: { name: string; href: string; icon: string; disabled?: boolean }, mobile = false) => {
    const textSize = mobile ? 'text-[1.45rem]' : 'text-[1.32rem]';
    const iconMargin = mobile ? 'mr-3' : 'mr-3';

    if (item.disabled) {
      return (
        <div
          key={item.name}
          className={`group flex items-center px-3 py-3 ${textSize} font-light rounded-2xl text-gray-400 cursor-not-allowed`}
        >
          <div className={`${iconMargin} text-gray-500`}>{renderIcon(item.icon)}</div>
          {item.name}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className={`group flex items-center px-3 py-3 ${textSize} font-light rounded-2xl transition-all duration-200 ${
          isActive(item.href)
            ? 'bg-[#9ed3ff]/18 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_28px_rgba(46,112,168,0.16)]'
            : 'text-blue-100/72 hover:bg-white/9 hover:text-white'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`${iconMargin} ${
            isActive(item.href) ? 'text-white' : 'text-blue-100/54 group-hover:text-white'
          }`}
        >
          {renderIcon(item.icon)}
        </div>
        {item.name}
      </Link>
    );
  };

  const openSignOutConfirm = () => {
    setProfileMenuOpen(false);
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = () => {
    setShowSignOutConfirm(false);
    logout();
  };

  const userProfile = (
    <div
      className="relative w-full pr-2"
      onMouseEnter={() => setProfileMenuOpen(true)}
      onMouseLeave={() => setProfileMenuOpen(false)}
    >
      <button
        type="button"
        onClick={() => setProfileMenuOpen((open) => !open)}
        className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] p-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition duration-200 hover:border-[#b9ddff]/18 hover:bg-white/[0.075]"
      >
        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-white/12 ring-1 ring-white/10">
          {user?.avatarUrl && !avatarFailed ? (
            <img
              src={user.avatarUrl}
              alt={user.name || 'User'}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[1.28rem] font-light leading-tight text-white">
            {user?.name || config.defaultUserLabel}
          </p>
          <p className="mt-0.5 truncate text-[1rem] leading-tight text-blue-100/50">
            {user?.email || 'owner@business.com'}
          </p>
        </div>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-blue-100/65 transition duration-200 ${profileMenuOpen ? 'rotate-90 text-white' : ''}`}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {profileMenuOpen && (
        <div className="absolute bottom-0 left-[calc(100%-0.35rem)] z-20 w-40 pl-3">
          <div className="rounded-2xl border border-white/10 bg-[#071421]/95 p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
          <button
            type="button"
            onClick={openSignOutConfirm}
            className="flex w-full items-center justify-center rounded-xl px-4 py-3 font-tori-garamond text-xl font-light text-blue-100/75 transition hover:bg-white/[0.08] hover:text-white"
          >
            Sign out
          </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`tori-dashboard-font tori-dashboard-shell min-h-screen relative flex items-center justify-center ${darkMode ? 'dark' : ''}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.13)_1px,transparent_1.2px)] [background-size:18px_18px] opacity-45" />

      <div className="tori-dashboard-panel relative z-10 flex h-screen w-screen overflow-hidden">
        <div className="xl:hidden relative z-20">
          <div className="absolute inset-0 flex z-40">
            <div
              className={`absolute inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
                mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              className={`tori-dashboard-card relative flex-1 flex flex-col max-w-[min(21rem,calc(100vw-2rem))] w-full rounded-3xl p-3 m-3 transition ease-in-out duration-300 transform ${
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-8 w-8 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 h-0 pt-4 pb-3 overflow-y-auto">
                <div className="flex-shrink-0 px-3 text-center">
                  <img src={toriLogoSrc} alt="Tori Ate" className="mx-auto mb-3 h-11 w-auto object-contain opacity-95" />
                  <span className="font-tori-garamond text-3xl font-light text-white">
                    {serviceType === 'turf' ? 'Sports Venue' : config.title}
                  </span>
                </div>
                <nav className="mt-4 px-2 space-y-1">
                  {navigation.map((item) => renderNavLink(item, true))}
                </nav>
              </div>
              <div className="flex-shrink-0 space-y-2 p-3">
                {renderNavLink(settingsNavItem, true)}
                {userProfile}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex xl:w-[15.5rem] 2xl:w-[16.5rem] xl:flex-col xl:relative xl:h-full z-50 p-2.5">
          <div className="tori-dashboard-card flex-1 flex flex-col min-h-0 rounded-[1.45rem] text-white">
            <div className="flex-1 flex flex-col pt-4 pb-3 overflow-y-auto">
              <div className="flex-shrink-0 px-3 text-center">
                <img src={toriLogoSrc} alt="Tori Ate" className="mx-auto mb-3 h-11 w-auto object-contain opacity-95" />
                <span className="font-tori-garamond text-3xl font-light text-white">
                  {serviceType === 'turf' ? 'Sports Venue' : config.title}
                </span>
              </div>
              <nav className="mt-4 flex-1 px-2 space-y-1">
                {navigation.map((item) => renderNavLink(item))}
              </nav>
            </div>
            <div className="flex-shrink-0 space-y-2 p-3">
              {renderNavLink(settingsNavItem)}
              {userProfile}
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 relative z-10 overflow-hidden">
          <div className="flex items-center justify-between px-2 py-2 xl:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="min-w-0">
                <p className="font-tori-garamond text-2xl font-light leading-none text-white sm:text-3xl">
                  {serviceType === 'turf' ? 'Sports Venue' : config.title}
                </p>
                <p className="mt-0.5 truncate font-tori-garamond text-sm font-light text-blue-100/45">
                  Dashboard
                </p>
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto px-2 pb-3 pt-1 sm:px-4 sm:pb-4 xl:px-3 xl:py-2.5">
            <div className="mx-auto w-full max-w-[118rem]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-white/12 bg-[#071421]/95 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <h2 className="text-lg font-semibold">Sign out?</h2>
            <p className="mt-2 text-sm leading-6 text-blue-100/62">
              Are you sure you want to sign out of your dashboard?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-blue-100/80 transition hover:bg-white/[0.08] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSignOut}
                className="flex-1 rounded-full bg-[#f3efe8] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedDashboardLayout;
