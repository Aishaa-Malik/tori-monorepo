import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TurfEmployeeDashboard from './TurfEmployeeDashboard';

const TurfEmployeeDashboardLayout: React.FC = () => {
  const { user, tenant, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine if we're on the dashboard home page
  const isHomePage = location.pathname === '/healthwellness-dashboard/employee';

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'dashboard':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        );
      case 'event':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        );
      case 'attach_money':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
          </svg>
        );
      case 'notifications':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5z"></path>
          </svg>
        );
      case 'help':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      case 'logout':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        );
      case 'chevron-left':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        );
      case 'chevron-right':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0" 
        style={{
          backgroundImage: 'url(/toriateBack.png)',
          opacity: 1, 
          pointerEvents: 'none' // Prevent blocking clicks
        }}
      ></div>
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-48' : 'w-16'
        } bg-white shadow-md transition-all duration-300 ease-in-out relative z-20`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-3 py-4 border-b">
            {isSidebarOpen ? (
              <h2 className="text-lg font-bold">Dashboard</h2>
            ) : (
              <h2 className="text-lg font-bold">TD</h2>
            )}
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700"
            >
              {isSidebarOpen ? renderIcon('chevron-left') : renderIcon('chevron-right')}
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 px-2 py-3">
            <Link
              to="/healthwellness-dashboard/employee"
              className={`flex items-center px-3 py-2 mb-2 rounded-md ${
                isHomePage
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className={`mr-2 ${isHomePage ? 'text-blue-600' : 'text-gray-400'}`}>
                {renderIcon('dashboard')}
              </div>
              {isSidebarOpen && <span className="text-sm">Dashboard</span>}
            </Link>
            <Link
              to="/healthwellness-dashboard/employee/bookings"
              className={`flex items-center px-3 py-2 mb-2 rounded-md ${
                location.pathname.includes('/employee/bookings')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className={`mr-2 ${location.pathname.includes('/employee/bookings') ? 'text-blue-600' : 'text-gray-400'}`}>
                {renderIcon('event')}
              </div>
              {isSidebarOpen && <span className="text-sm">Bookings</span>}
            </Link>
            <Link
              to="/healthwellness-dashboard/employee/schedule"
              className={`flex items-center px-3 py-2 mb-2 rounded-md ${
                location.pathname.includes('/employee/schedule')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className={`mr-2 ${location.pathname.includes('/employee/schedule') ? 'text-blue-600' : 'text-gray-400'}`}>
                {renderIcon('event')}
              </div>
              {isSidebarOpen && <span className="text-sm">Schedule</span>}
            </Link>
            {/* <Link
              to="/healthwellness-dashboard/employee/revenue"
              className={`flex items-center px-3 py-2 mb-2 rounded-md ${
                location.pathname.includes('/employee/revenue')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className={`mr-2 ${location.pathname.includes('/employee/revenue') ? 'text-blue-600' : 'text-gray-400'}`}>
                {renderIcon('attach_money')}
              </div>
              {isSidebarOpen && <span className="text-sm">Revenue</span>}
            </Link> */}
          </nav>

          {/* Sidebar Footer */}
          <div className="px-3 py-2 border-t">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {isSidebarOpen && (
                <div className="ml-2">
                  <p className="text-xs font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            >
              <div className="mr-2 text-gray-400">
                {renderIcon('logout')}
              </div>
              {isSidebarOpen && <span className="text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        {/* Top Header */}
        <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">
              {tenant?.name || 'Turf Management'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-gray-500">
              {renderIcon('notifications')}
            </div>
            <div className="text-gray-500">
              {renderIcon('help')}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {isHomePage ? <TurfEmployeeDashboard /> : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default TurfEmployeeDashboardLayout;
