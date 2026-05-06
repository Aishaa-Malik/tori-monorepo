import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles: UserRole[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  redirectPath = '/login',
}) => {
  const { isAuthenticated, isLoading, hasPermission, user } = useAuth();
  const location = useLocation();

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('ProtectedRoute - User business type:', user.businessType);
      console.log('ProtectedRoute - Current path:', location.pathname);
    }
  }, [user, location.pathname]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user has required role
  if (!hasPermission(requiredRoles)) {
    // Redirect to unauthorized page or dashboard based on user role
    return <Navigate to="/unauthorized" replace />;
  }
  
  // 1. Define the "Map" of where business types belong 
  const DASHBOARD_MAP: Record<string, string> = { 
    'healthcare': '/dashboard', 
    'turf': '/healthwellness-dashboard', 
    'fitness & gym': '/healthwellness-dashboard', 
    'fitness': '/healthwellness-dashboard', 
    'events': '/healthwellness-dashboard',
    'sportsvenue': '/healthwellness-dashboard',
    'sports venues': '/healthwellness-dashboard',
    'spasalon': '/healthwellness-dashboard'
  }; 
  
  // Exclude auth/onboarding routes from dashboard redirection
  const isExcludedRoute = location.pathname.includes('/oauth/') || location.pathname.includes('/onboarding');

  if (user && !isExcludedRoute) {
    // 2. Inside your ProtectedRoute logic: 
    const userType = (user.businessType || '').toLowerCase().trim(); 
    let targetPath = DASHBOARD_MAP[userType]; 
    
    // Debug logging for routing
    console.log(`ProtectedRoute routing: user.email='${user.email}', userType='${userType}', role='${user.role}', targetPath='${targetPath}'`);

    if (targetPath) {
      // 3. Handle the Employee exception 
      if (user.role === UserRole.EMPLOYEE && targetPath.includes('healthwellness')) { 
        targetPath = `${targetPath}/employee`; 
      } 
      
      // 4. Redirect if they are in the wrong spot
      // Only redirect if they are trying to access a dashboard path but not the correct one
      const isDashboardPath = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/healthwellness-dashboard');
      
      if (isDashboardPath && !location.pathname.startsWith(targetPath)) { 
        console.log(`Redirecting from ${location.pathname} to ${targetPath}`);
        return <Navigate to={targetPath} replace />; 
      }
    } 
    // else if (isDashboardPath) {
    //   // If we don't know the user's business type, but they are trying to access a dashboard,
    //   // we might want to default to healthwellness-dashboard or keep them where they are if they are already on a dashboard.
    //   // If they are on /dashboard (Doctor) but not a doctor, it's safer to redirect to healthwellness.
    //   console.log(`Unknown business type: '${userType}', defaulting to healthwellness-dashboard`);
      
    //   let defaultTarget = '/healthwellness-dashboard';
    //   if (user.role === UserRole.EMPLOYEE) {
    //     defaultTarget = '/healthwellness-dashboard/employee';
    //   }
      
    //   if (!location.pathname.startsWith(defaultTarget)) {
    //     return <Navigate to={defaultTarget} replace />;
    //   }
    // }
  }

  // User is authenticated and has the required role, render the children
  return <>{children}</>;
};

export default ProtectedRoute;