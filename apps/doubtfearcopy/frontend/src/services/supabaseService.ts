import { createClient } from '@supabase/supabase-js';
import { UserRole } from '../contexts/AuthContext';

// Initialize Supabase client
// In a real application, these would be environment variables
const supabaseUrl = 'https://znxzqsmyzzuwlzwgapdk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueHpxc215enp1d2x6d2dhcGRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjY4MzUyMSwiZXhwIjoyMDY4MjU5NTIxfQ.BdzzD-YNRDXmwppCvHlIOl4cKH0uoMcFG4e5wwcsY0I';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication functions
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// User management functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

export const getUserRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    console.log('Fetched role:', data);
    console.log('User ID:', userId);

    if (error) {
      console.error('Error fetching user role:', error.message);
      // Don't throw the error, return null instead
      return null;
    }
    
    return data?.role as UserRole;
  } catch (error) {
    console.error('Exception in getUserRole:', error);
    return null;
  }
};

export const getUserTenant = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_tenants')
      .select('tenant_id')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user tenant:', error.message);
      // Don't throw the error, return null instead
      return null;
    }
    
    return data?.tenant_id;
  } catch (error) {
    console.error('Exception in getUserTenant:', error);
    return null;
  }
};

// In getTenantDetails function around line 96-104
export const getTenantDetails = async (tenantId: string) => {
  try {
    console.log('Fetching tenant details for ID:', tenantId);

    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .maybeSingle(); // Changed from .single() to .maybeSingle()

      console.log('DATAAAAA', data);
    
    if (error) {
      console.error('Supabase error fetching tenant:', error);
      throw error;
    }
    
    // Handle case where tenant doesn't exist
    if (!data) {
      console.warn(`No tenant found with ID: ${tenantId}`);
      return null;
    }
    
    console.log('Tenant details fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception in getTenantDetails:', error);
    throw error;
  }
};

// Tenant management functions
export const createTenant = async (tenantData: any) => {
  const { data, error } = await supabase
    .from('tenants')
    .insert([tenantData])
    .select();  //NOTE- IDHAR BHI .SELECT() ATA- INSERT , UPDATE KRTE TIME
    
  if (error) throw error;
  return data;
};

export const updateTenant = async (tenantId: string, tenantData: any) => {
  const { data, error } = await supabase
    .from('tenants')
    .update(tenantData)
    .eq('id', tenantId)
    .select();     //NOTE- IDHAR BHI .SELECT() ATA- INSERT , UPDATE KRTE TIME
    
  if (error) throw error;
  return data;
};

export const deleteTenant = async (tenantId: string) => {
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId);
    
  if (error) throw error;
};

export const getAllTenants = async () => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*');
    
  if (error) throw error;
  return data;
};

// User invitation and management
export const inviteUser = async (email: string, role: UserRole, tenantId: string) => {
  // In a real application, this would send an invitation email with a sign-up link
  // For now, we'll just create a user record with a pending status
  const { data, error } = await supabase
    .from('user_invitations')
    .insert([{
      email,
      role,
      tenant_id: tenantId,
      status: 'pending',
      invited_at: new Date().toISOString()
    }])
    .select();
    
  if (error) throw error;
  return data;
};

export const getUsersByTenant = async (tenantId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      user_roles (role),
      user_tenants!inner (tenant_id)
    `)
    .eq('user_tenants.tenant_id', tenantId);
    
  if (error) throw error;
  return data;
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  const { data, error } = await supabase
    .from('user_roles')
    .update({ role })
    .eq('user_id', userId)
    .select();
    
  if (error) throw error;
  return data;
};

// Revenue and appointments data
export const getRevenueData = async (tenantId: string, startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('date', startDate)
    .lte('date', endDate);
    
  if (error) throw error;
  return data;
};

export const getUserBusinessType = async (userId: string) => {
  try {
    // First, get the tenant_id for the user
    const { data: userTenant, error: tenantError } = await supabase
      .from('user_tenants')
      .select('tenant_id')
      .eq('user_id', userId)
      .single();
      
    if (tenantError || !userTenant?.tenant_id) {
      console.error('Error getting user tenant:', tenantError);
      return null;
    }
    
    // Then get the business_type using the tenant_id
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select('business_type')
      .eq('tenant_id', userTenant.tenant_id)
      .single();
      
    if (profileError) {
      console.error('Error getting business type:', profileError);
      return null;
    }
    
    console.log('Business type found:', businessProfile?.business_type);
    return businessProfile?.business_type || null;
  } catch (error) {
    console.error('Error in getUserBusinessType:', error);
    return null;
  }
};

export const getAppointments = async (tenantId: string, filters: any = {}) => {
  let query = supabase
    .from('appointments')
    .select('*, patients(*), doctors(*)')
    .eq('tenant_id', tenantId);
    
  // Apply filters if provided
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.doctorId) {
    query = query.eq('doctor_id', filters.doctorId);
  }
  
  if (filters.startDate) {
    query = query.gte('booking_date', filters.startDate);
  }
  
  if (filters.endDate) {
    query = query.lte('booking_date', filters.endDate);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};