import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { resolveDashboardPath } from '../config/dashboardConfig';

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

  useEffect(() => {
    if (user) {
      console.log('ProtectedRoute - User business type:', user.businessType);
      console.log('ProtectedRoute - Current path:', location.pathname);
    }
  }, [user, location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to={redirectPath} replace />;
  }

  if (!hasPermission(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  const isExcludedRoute =
    location.pathname.includes('/oauth/') || location.pathname.includes('/onboarding');

  if (user && !isExcludedRoute) {
    const targetPath = resolveDashboardPath(user.businessType, user.email, user.role);

    console.log(
      `ProtectedRoute routing: user.email='${user.email}', userType='${user.businessType}', role='${user.role}', targetPath='${targetPath}'`
    );

    if (targetPath) {
      const isDashboardPath =
        location.pathname.startsWith('/dashboard') ||
        location.pathname.startsWith('/fitness-sports-dashboard');

      if (isDashboardPath && !location.pathname.startsWith(targetPath)) {
        console.log(`Redirecting from ${location.pathname} to ${targetPath}`);
        return <Navigate to={targetPath} replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
