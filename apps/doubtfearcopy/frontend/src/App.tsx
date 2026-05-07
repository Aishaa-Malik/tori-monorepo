import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserRole } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

// Components
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import RevenuePage from './components/dashboard/RevenuePage';
import TenantsManagement from './components/dashboard/TenantsManagement';
import UserManagement from './components/dashboard/UserManagement';
import SettingsPage from './components/dashboard/SettingsPage';
import AppointmentsPage from './components/dashboard/AppointmentsPage';
import UnifiedSchedulePage from './components/common/UnifiedSchedulePage';
import OAuthCallback from './components/OAuthCallback';
import PaymentCallback from './components/PaymentCallback';
import ProtectedRoute from './components/ProtectedRoute';
import UnauthorizedPage from './components/UnauthorizedPage';
import UpdatePassword from './components/UpdatePassword';
import OnboardingForm from './components/OnboardingForm';
import LandingPage3 from './components/LandingPage3';
import AboutPage from './components/AboutPage';
import ContactUs from './components/ContactUs';
import ServicesDirectoryPage from './components/services/ServicesDirectoryPage';
import CategoryListingsPage from './components/services/CategoryListingsPage';
import SubcategoryListingsPage from './components/services/SubcategoryListingsPage';
import ListingProfilePage from './components/services/ListingProfilePage';
import CreateEventPage from './components/events/CreateEventPage';
import PaymentPage from './components/PaymentPage';
import ToriEmployeeOnboarding from './components/admin/ToriEmployeeOnboarding';

// Turf owner components
import TurfDashboardLayout from './components/turf/TurfDashboardLayout';
import TurfDashboardHome from './components/turf/TurfDashboardHome';
import TurfRevenuePage from './components/turf/TurfRevenuePage';
import TurfUserManagement from './components/turf/TurfUserManagement';
import TurfAppointmentsPage from './components/turf/TurfAppointmentsPage';
import TurfEmployeeDashboard from './components/turf/TurfEmployeeDashboard';
import TurfEmployeeDashboardLayout from './components/turf/TurfEmployeeDashboardLayout';
import TurfSettingsPage from './components/turf/TurfSettingsPage';

import PrivacyPolicy from './components/PrivacyPolicy';
import DeleteAccount from './components/DeleteAccount';
import RefundPolicy from './components/RefundPolicy';


// Check if user needs onboarding
const OnboardingCheck = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id || !user?.email) {
        console.log("User ID or email not available, skipping onboarding check");
        setIsLoading(false);
        return;
      }
      
      // Use environment utility to get the appropriate API URL
      const { getApiUrl } = await import('./utils/environmentUtils');
      const BACKEND_API_URL = getApiUrl();
      
      try {
        console.log("========= ONBOARDING CHECK STARTED =========");
        console.log("Fetching onboarding status for user:", user.id, "email:", user.email);
        
        const response = await fetch(`${BACKEND_API_URL}/check-onboarding?email=${user.email}&userId=${user.id}`);

        console.log("Onboarding check response status:", response.status);
        console.log("Onboarding check  response response response response:", response);
        const responseData = await response.json();
        console.log("Onboarding check response data:", responseData);
        
        if (responseData.error) {
          throw new Error(responseData.error);
        }
        
        const needsOnboardingValue = responseData.data?.needsOnboarding;
        console.log("needsOnboarding value from backend:", needsOnboardingValue);
        
        // Force convert to boolean to ensure consistent behavior
        setNeedsOnboarding(needsOnboardingValue === true);
        
        // Log the decision
        if (needsOnboardingValue) {
          console.log("✅ User needs onboarding - will redirect to /onboarding");
        } else {
          console.log("✅ User has completed onboarding - will show dashboard");
        }
        
      } catch (err) {
        console.error('❌ Error checking onboarding status:', err);
        // Default to not needing onboarding if there's an error
        setNeedsOnboarding(false);
        console.log("⚠️ Defaulting to no onboarding needed due to error");
      } finally {
        setIsLoading(false);
        console.log("========= ONBOARDING CHECK COMPLETED =========");
      }
    };
    
    checkOnboardingStatus();
  }, [user?.id, user?.email]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your account status...</p>
        </div>
      </div>
    );
  }
  
  if (needsOnboarding === true) {
    console.log("🔄 Redirecting to onboarding page");
    return <Navigate to="/onboarding" replace />;
  }
  
  console.log("🔄 Showing dashboard content");
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage3 />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth/callback" element={<OAuthCallback/>} />
            <Route path="/payment-callback" element={<PaymentCallback />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="/payment" element={<PaymentPage />} />
            
            {/* Admin Routes */}
            <Route path="/tori-employee" element={<ToriEmployeeOnboarding />} />

            
            {/* Public Services Directory */}
            <Route path="/services" element={<ServicesDirectoryPage />} />
            <Route path="/services/:category" element={<CategoryListingsPage />} />
            <Route path="/services/:category/:subcategory" element={<SubcategoryListingsPage />} />
            <Route path="/services/:category/:id" element={<ListingProfilePage />} />
            <Route path="/services/:category/:subcategory/:id" element={<ListingProfilePage />} />

            {/* Event Creation Route */}
            <Route 
              path="/events/create" 
              element={
                // <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER]}>
                  <CreateEventPage />
                // </ProtectedRoute>
              } 
            />

            {/* Onboarding Route */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER]}>
                  <OnboardingForm />
                </ProtectedRoute>
              } 
            />
{/* <Route path="/dashboard" element={ <ProtectedRoute requiredRoles={[]}> <OnboardingCheck><DashboardLayout/> </OnboardingCheck> </ProtectedRoute>}/> */}
            {/* Doctor Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER, UserRole.DOCTOR, UserRole.EMPLOYEE]}>
                  <OnboardingCheck>
                    <DashboardLayout />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="schedule" element={<UnifiedSchedulePage serviceType="doctor" />} />
              <Route path="revenue" element={<RevenuePage />} />
              <Route path="tenants" element={<TenantsManagement />} />
              <Route path="employees" element={<UserManagement />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Direct routes for Revenue and User Management */}
            <Route path="/revenue" element={
              <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER, UserRole.DOCTOR]}>
                <OnboardingCheck>
                  <DashboardLayout />
                </OnboardingCheck>
              </ProtectedRoute>
            }>
              <Route index element={<RevenuePage />} />
            </Route>
            
            <Route path="/employees" element={
              <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER, UserRole.DOCTOR]}>
                <OnboardingCheck>
                  <DashboardLayout />
                </OnboardingCheck>
              </ProtectedRoute>
            }>
              <Route index element={<UserManagement />} />
            </Route>
            
            {/* Additional route for /users */}
            <Route path="/employees" element={
              <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER, UserRole.DOCTOR]}>
                <OnboardingCheck>
                  <DashboardLayout />
                </OnboardingCheck>
              </ProtectedRoute>
            }>
              <Route index element={<UserManagement />} />
            </Route>

            <Route path="/refund-policy" element={<RefundPolicy />} />

            {/* Turf Owner Dashboard Routes */}
            <Route
              path="/healthwellness-dashboard"
              element={
                <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER]}>
                  <OnboardingCheck>
                    <TurfDashboardLayout />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            >
              <Route index element={<TurfDashboardHome />} />
              <Route path="revenue" element={<TurfRevenuePage/>} />
              <Route path="bookings" element={<TurfAppointmentsPage/>} />
              <Route path="schedule" element={<UnifiedSchedulePage serviceType="turf" />} />
              <Route path="users" element={<TurfUserManagement />} />
              <Route path="settings" element={<TurfSettingsPage />} />
            </Route>
            
            {/* Turf Employee Dashboard Routes */}
            <Route
              path="/healthwellness-dashboard/employee"
              element={
                <ProtectedRoute requiredRoles={[UserRole.BUSINESS_OWNER, UserRole.EMPLOYEE]}>
                  <OnboardingCheck>
                    <TurfEmployeeDashboardLayout />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            >
              <Route index element={<TurfEmployeeDashboard />} />
              <Route path="bookings" element={<TurfAppointmentsPage/>} />
              <Route path="schedule" element={<UnifiedSchedulePage serviceType="turf" />} />
              {/* <Route path="revenue" element={<TurfRevenuePage/>} /> */}
              <Route path="users" element={<TurfUserManagement />} />
            </Route>
          </Routes>
        </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;