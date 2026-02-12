import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';
//import { ThemeProvider } from '../../contexts/ThemeContext';
import { useTheme } from '../../contexts/ThemeContext';
//import DarkModeToggle from '../common/DarkModeToggle';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  disabled?: boolean;
}

const DashboardLayout: React.FC = () => {
  const { user, tenant, logout } = useAuth();
  const { darkMode } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Define navigation items based on user role
  let navItems: NavItem[] = [];
  
  if (user?.role === UserRole.SUPER_ADMIN) {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'Appointments', href: '/dashboard/appointments', icon: 'calendar' },
      { name: 'Schedule', href: '/dashboard/schedule', icon: 'clock' },
      { name: 'Tenants', href: '/dashboard/tenants', icon: 'building' },
      { name: 'Users', href: '/dashboard/users', icon: 'users' },
      { name: 'Analytics', href: '/dashboard/analytics', icon: 'chart-bar' },
      { name: 'Settings', href: '/dashboard/settings', icon: 'cog' },
      { name: 'Billing', href: '/dashboard/billing', icon: 'credit-card' }
    ];
  } else if (user?.role === UserRole.BUSINESS_OWNER) {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'Appointments', href: '/dashboard/appointments', icon: 'calendar' },
      { name: 'Schedule', href: '/dashboard/schedule', icon: 'clock' },
      // { name: 'Doctors', href: '/dashboard/doctors', icon: 'user-md' },
      { name: 'Employee Management', href: '/dashboard/employees', icon: 'users' },
      { name: 'Revenue', href: '/dashboard/revenue', icon: 'chart-bar' },
      { name: 'Settings', href: '/dashboard/settings', icon: 'cog' }
    ];
  } else if (user?.role === UserRole.DOCTOR) {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'Appointments', href: '/dashboard/appointments', icon: 'calendar' },
      { name: 'Schedule', href: '/dashboard/schedule', icon: 'clock' },
      { name: 'Patients', href: '/dashboard/patients', icon: 'user-md' },
      { name: 'Settings', href: '/dashboard/settings', icon: 'cog' }
    ];
  } else {
    navItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'home' },
      { name: 'Appointments', href: '/dashboard/appointments', icon: 'calendar' },
      { name: 'Schedule', href: '/dashboard/schedule', icon: 'clock' },
    ];
  }

  // Icon component with SVG icons
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'clock':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'chart-bar':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'cog':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'users':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'user-md':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'building':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case 'credit-card':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
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
      
      {/* Mobile menu */}
      <div className="lg:hidden relative z-20">
        <div className="fixed inset-0 flex z-40">
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
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
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <span className="text-xl font-bold text-blue-600">Doctor's Dashboard</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navItems.map((item) => (
                  item.disabled ? (
                    <div
                      key={item.name}
                      className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-400 cursor-not-allowed"
                    >
                      <div className="mr-4 text-gray-300">
                        {renderIcon(item.icon)}
                      </div>
                      {item.name}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={`mr-4 ${
                          isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
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
            
            {/* Mobile User Profile Section */}
            <div className="flex-shrink-0 flex border-t border-gray-700 p-3">
              <div className="flex items-center">
                {/* User Avatar Circle */}
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'D'}
                  </span>
                </div>
                
                {/* User Info */}
                <div className="ml-2 min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'Doctor'}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                    {user?.email || 'doctor@example.com'}
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

      {/* Floating Container */}
      <div className="relative z-10 w-[85%] h-[90vh] bg-gray-800 bg-opacity-40 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden flex">
        {/* Static sidebar for desktop - Now inside floating container */}
        <div className="hidden lg:flex lg:w-68 lg:flex-col lg:relative lg:h-full z-50 p-3">
          <div className="flex-1 flex flex-col min-h-0 bg-black bg-opacity-70 backdrop-blur-md rounded-3xl text-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-3">
                <span className="text-lg font-bold text-white">Doctor Dashboard</span>
              </div>
              <nav className="mt-4 flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  item.disabled ? (
                    <div
                      key={item.name}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed"
                    >
                      <div className="mr-3 text-gray-300">
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
                    {user?.name?.charAt(0).toUpperCase() || 'D'}
                  </span>
                </div>
                
                {/* User Info */}
                <div className="ml-2 min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate">
                    {user?.name || 'Doctor'}
                  </p>
                  <p className="text-xs text-gray-300 truncate">
                    {user?.email || 'doctor@example.com'}
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
        
        {/* Mobile menu button - Repositioned */}
        <div className="lg:hidden absolute top-0 left-0 z-20 pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-auto w-full h-full">
            <div className="h-full w-full p-0 pt-0 flex flex-col items-center justify-start overflow-auto">
              <div className="w-full max-w-5xl mx-auto flex justify-between items-center mb-2 px-0 pt-2">
                {/* <div className="flex flex-col items-start">
                  <div className="text-1xl text-gray-300 opacity-70 pl-0 text-left">Welcome back</div>
                  <div className="flex items-center">
                    <h1 className="text-6xl font-bold text-white">{user?.name || 'Doctor'}</h1>
                    <span className="text-5xl ml-2">👋🏻</span>
                  </div>
                </div> */}
                {/* <div className="flex items-center space-x-2">
                  <div className="bg-black bg-opacity-70 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm">
                    Home
                  </div>
                  <div className="bg-black bg-opacity-70 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm">
                    Page 1
                  </div>
                </div> */}
              </div>
              
              <div className="w-full max-w-6xl mx-auto rounded-2xl p-0 pt-3 overflow-auto">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;