import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
//import DarkModeToggle from '../DarkModeToggle';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  disabled?: boolean;
}

const TurfDashboardLayout: React.FC = () => {
  const { tenant, user, logout } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add this to debug
  useEffect(() => {
    console.log('Current location:', location.pathname);
  }, [location.pathname]);

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/healthwellness-dashboard', icon: 'home' },
    { name: 'Bookings', href: '/healthwellness-dashboard/bookings', icon: 'calendar' },
    { name: 'Schedule', href: '/healthwellness-dashboard/schedule', icon: 'clock' },
    { name: 'User Management', href: '/healthwellness-dashboard/users', icon: 'calendar' },
    { name: 'Revenue', href: '/healthwellness-dashboard/revenue', icon: 'chart-bar' },
    { name: 'Settings', href: '/healthwellness-dashboard/settings', icon: 'cog' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'chart-bar':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        );
      case 'cog':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen relative flex items-center justify-center ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{
          backgroundImage: 'url(/toriateBack.png)',
          opacity: 1, 
          pointerEvents: 'none' // Prevent blocking clicks
        }}
      ></div>
      {/* Floating Container */}
      <div className="relative z-10 w-[85%] h-[90vh] bg-gray-800 bg-opacity-40 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden flex">
        {/* Container Content */}
      {/* Mobile menu */}
      <div className="lg:hidden relative z-20">
        <div className="absolute inset-0 flex z-40">
          <div
            className={`absolute inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          <div
            className={`relative flex-1 flex flex-col max-w-xs w-full bg-black bg-opacity-70 backdrop-blur-md rounded-3xl border border-gray-700 p-3 m-3 transition ease-in-out duration-300 transform ${
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
              <div className="flex-shrink-0 flex items-center px-3">
                <span className="text-lg font-bold text-white">Dashboard</span>
              </div>
              <nav className="mt-4 px-2 space-y-1">
                {navigation.map((item) => (
                  
                  item.disabled ? (
                    <div
                      key={item.name}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed"
                    >
                      <div className="mr-3 text-gray-500">
                        {renderIcon(item.icon)}
                      </div>
                      {item.name}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive(item.href)
                          ? 'bg-white bg-opacity-20 text-white'
                          : 'text-gray-300 hover:bg-white hover:bg-opacity-10 hover:text-white'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={`mr-3 ${
                          isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                        }`}
                      >
                        {renderIcon(item.icon)}
                      </div>
                      {item.name}
                    </Link>
                  )
                ))}
              </nav>
            </div>
            
            {/* Mobile User Profile Section - Updated */}
            <div className="flex-shrink-0 flex border-t border-gray-700 p-3">
              <div className="flex items-center">
                {/* User Avatar Circle */}
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                
                {/* User Info */}
                <div className="ml-2 min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'Turf Owner'}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                    {user?.email || 'owner@business.com'}
                  </p>
                  <button
                    onClick={() => logout()}
                    className="text-xs font-medium text-gray-400 hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-68 lg:flex-col lg:relative lg:h-full z-50 p-3">
        <div className="flex-1 flex flex-col min-h-0 border border-gray-700 bg-black bg-opacity-70 backdrop-blur-md rounded-3xl text-white">
          <div className="flex-1 flex flex-col pt-4 pb-3 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-3">
              <span className="text-lg font-bold text-white">Dashboard</span>
            </div>
            <nav className="mt-4 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                item.disabled ? (
                  <div
                    key={item.name}
                    className="group flex items-center px-2 py-2 text-xs font-medium rounded-md text-gray-400 cursor-not-allowed"
                  >
                    <div className="mr-2 text-gray-500">
                      {renderIcon(item.icon)}
                    </div>
                    {item.name}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-xs font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-gray-300 hover:bg-white hover:bg-opacity-10 hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={`mr-2 ${
                        isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`}
                    >
                      {renderIcon(item.icon)}
                    </div>
                    {item.name}
                  </Link>
                )
              ))}
            </nav>
          </div>
          
          {/* Desktop User Profile Section - Updated */}
          <div className="flex-shrink-0 flex border-t border-gray-700 p-3">
            <div className="flex items-center w-full">
              {/* User Avatar Circle */}
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              
              {/* User Info */}
              <div className="ml-2 min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">
                  {user?.name || 'Turf Owner'}
                </p>
                <p className="text-xs text-gray-300 truncate">
                  {user?.email || 'owner@business.com'}
                </p>
                <button
                  onClick={() => logout()}
                  className="text-xs font-medium text-gray-400 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 relative z-10 overflow-hidden">
        <div className="flex justify-between items-center p-0">
          <div className="lg:hidden">
            <button
              type="button"
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Date selector */}
          {/* <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
            <span>Select date</span>
          </div> */}
        </div>
        
        <main className="flex-1 px-3 py-5 overflow-hidden">
          <Outlet />
        </main>
      </div>
      </div>
    </div>
  );
};

export default TurfDashboardLayout;
