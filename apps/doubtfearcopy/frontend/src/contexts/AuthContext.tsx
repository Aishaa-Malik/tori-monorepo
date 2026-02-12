import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User role definitions
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',
  DOCTOR = 'DOCTOR',
  EMPLOYEE = 'EMPLOYEE'
}

// Tenant interface
export interface Tenant {
  id: string;
  name: string;
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string; // Optional for super admin who isn't tied to a specific tenant
  businessType?: 'doctor' | 'turf';
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  loginFromSession: (token: string, user: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
//const AuthContext = createContext(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// ==================== Invitation/Onboarding Logic ====================
const handleUserInvitationSetup = async (userId: string, userEmail: string) => {
  console.log('inside handleUserInvitationSetup- userId= ', userId, ' userEmail= ', userEmail);
  try {
    if (!userEmail) {
      console.log('No email provided, skipping invitation setup');
      return;
    }
console.log('Hiee');

    const { supabase, getCurrentSession } = await import('../services/supabaseService');
    const session = await getCurrentSession();

    console.log('userEmail inside handleUserInvitationSetup- ', userEmail);

    // const {data: approvedUser, error: approvalError } = await supabase
    //   .from('approved_users')
    //   .select('activated_at')
    //   .eq('email', userEmail)
    //   .is('activated_at', null)
    //   .maybeSingle();

    // Check if user is pre-approved and not yet activated
    const { data: approvedUser, error: approvalError } = await supabase
      .from('approved_users')
      .select('tenant_id, role, activated_at')
      .eq('email', userEmail)
      .is('activated_at', null)
      .maybeSingle();

  console.log("approvedUser activated_at------>>>>>>" , approvedUser?.activated_at);
      console.log("approvedUser------>>>>>>" , approvedUser);
    // Handle 406 Not Acceptable errors (they appear in the error.message)
    if (approvalError) {
       console.log("approvalError- ", approvalError);

      console.log('Approval check error:', approvalError.message);
      if (approvalError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
        // Don't throw the error, just log it and continue
        console.error('Error checking approved_users:', approvalError);
      }
      // Return early as there's no approved user to process
      return;
    }

    if (approvedUser) {
      // --- user_profiles ---
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();

        console.log("existingProfile - ", existingProfile);

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error('Error checking user profile:', profileCheckError);
        // Continue despite error
      }

      if (!existingProfile) {

        console.log("i m inserting into  user_profiles- ");

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            email: userEmail,
            full_name: session?.user?.user_metadata?.full_name || userEmail.split('@')[0]
          });
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Continue despite error
        }
      }

      // --- user_tenants ---
      const { data: existingTenant, error: tenantCheckError } = await supabase
        .from('user_tenants')
        .select('user_id')
        .eq('user_id', userId)
        .eq('tenant_id', approvedUser.tenant_id)
        .single();

      if (tenantCheckError && tenantCheckError.code !== 'PGRST116') {
        console.error('Error checking user tenant:', tenantCheckError);
        // Continue despite error
      }

      if (!existingTenant) {
        const { error: tenantError } = await supabase
          .from('user_tenants')
          .insert({
            user_id: userId,
            tenant_id: approvedUser.tenant_id
          });
        if (tenantError) {
          console.error('Error creating user-tenant relationship:', tenantError);
          // Continue despite error
        }
      }

      // --- user_roles ---
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

        console.log('existingRole= ', existingRole);

      if (roleCheckError && roleCheckError.code !== 'PGRST116') {
        console.error('Error checking user role:', roleCheckError);
        // Continue despite error
      }

      if (!existingRole) {
        console.log('inside if--insertinf into user_rol table, approvedUser.role =   ', approvedUser.role);

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: approvedUser.role
          });
        if (roleError) {
          console.error('Error assigning user role:', roleError);
          // Continue despite error
        }
      }

      // --- Mark invitation as activated ---
      try {
        console.log('marking user activated_at in app user:');

        const { error: activationError } = await supabase
          .from('approved_users')
          .update({ activated_at: new Date().toISOString() })
          .eq('email', userEmail)
          .is('activated_at', null);

        if (activationError) {
          console.error('Error marking invitation as activated:', activationError);
          // Continue despite error
        } else {
          console.log('Invitation marked as activated');
        }
      } catch (activationError) {
        console.error('Exception marking invitation as activated:', activationError);
        // Continue despite error
      }
    }
  } catch (error) {
    // DO NOT FAIL the login flow if onboarding fails; log for debugging.
    console.error('Error handling user invitation setup:', error);
  }
};
// ======================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- Login by email/password ---
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { signIn, getCurrentSession, getUserRole, getUserTenant } = await import('../services/supabaseService');
      const { session } = await signIn(email, password);
      if (!session) throw new Error('Invalid email or password');

      const userId = session.user.id;
      // Invitation/Onboarding for newly-invited users
      await handleUserInvitationSetup(userId, session.user.email || '');

      const role = await getUserRole(userId);
      const tenantId = await getUserTenant(userId);

      const { getUserBusinessType } = await import('../services/supabaseService');
      const businessType = await getUserBusinessType(userId);

      const userData: User = {
        id: userId,
        email: session.user.email ?? email,
        name: session.user.user_metadata?.full_name ?? email.split('@')[0],
        role: role ?? UserRole.EMPLOYEE,
        tenantId: tenantId ?? undefined,
        businessType: businessType as 'doctor' | 'turf'
      };

      if (tenantId) {
        try {
          const { getTenantDetails } = await import('../services/supabaseService');
          const tenantData = await getTenantDetails(tenantId);
          setTenant(tenantData);
        } catch (tenantError) {
          // Tenant fetch failure is not fatal
          console.error('Error fetching tenant details:', tenantError);
        }
      }

      localStorage.setItem('authToken', session.access_token);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('authToken');
      setUser(null);
      setTenant(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- Login from session (OAuth/cookies) ---
  const loginFromSession = async (token: string, userObj: any) => {

    console.log('inside loginFromSession- userObj=  ', userObj);

    setIsLoading(true);
    try {
      const { getUserTenant, getUserBusinessType, getUserRole } = await import('../services/supabaseService');
      const userId = userObj.id;
      await handleUserInvitationSetup(userId, userObj.email || '');

      const tenantId = await getUserTenant(userId);
      const role = await getUserRole(userId);
      const businessType = await getUserBusinessType(userId);

      const userData: User = {
        id: userId,
        email: userObj.email ?? '',
        name: userObj.user_metadata?.full_name ?? userObj.email?.split('@')[0] ?? 'User',
        role: role ?? UserRole.EMPLOYEE,
        tenantId: tenantId ?? undefined,
        businessType: businessType as 'doctor' | 'turf'
      };

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // --- Logout ---
  const logout = async () => {
    try {
      const { signOut } = await import('../services/supabaseService');
      await signOut();
      localStorage.removeItem('authToken');
      setUser(null);
      setTenant(null);
      setIsAuthenticated(false);
    } catch (error) {
      // Clear state even if network logout fails
      localStorage.removeItem('authToken');
      setUser(null);
      setTenant(null);
      setIsAuthenticated(false);
    }
  };

  // --- Role check helper ---
  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  // --- On page load, check session and do onboarding if needed ---
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const { getCurrentSession, getUserRole, getUserTenant } = await import('../services/supabaseService');
          const session = await getCurrentSession();
          if (session?.user) {
            const userId = session.user.id;
            await handleUserInvitationSetup(userId, session.user.email || '');

            const role = await getUserRole(userId);
            const tenantId = await getUserTenant(userId);

            const { getUserBusinessType } = await import('../services/supabaseService');
            const businessType = await getUserBusinessType(userId);

            const userData: User = {
              id: userId,
              email: session.user.email ?? '',
              name: session.user.user_metadata?.full_name ?? session.user.email?.split('@')[0] ?? 'User',
              role: role ?? UserRole.EMPLOYEE,
              tenantId: tenantId ?? undefined,
              businessType: businessType as 'doctor' | 'turf'
            };

            if (tenantId) {
              try {
                const { getTenantDetails } = await import('../services/supabaseService');
                const tenantData = await getTenantDetails(tenantId);
                setTenant(tenantData);
              } catch (tenantError) {
                // Continue even if tenant details fail
                console.error('Error fetching tenant details:', tenantError);
              }
            }

            setUser(userData);
            setIsAuthenticated(true);
          } else {
            throw new Error('Invalid session - no user found');
          }
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        setUser(null);
        setTenant(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
    // Empty dependency: runs once on mount
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasPermission,
        loginFromSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};