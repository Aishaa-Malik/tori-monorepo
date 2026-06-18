import { supabase } from './supabaseService';
import { UserRole } from '../contexts/AuthContext';

// Define payment types
export interface Payment {
  id?: string;
  payment_id: string;
  order_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_date: string;
}

// Function to create a new payment record
export const createPaymentRecord = async (paymentData: Omit<Payment, 'id'>) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw error;
  }
};

// Function to get payment history for a user
export const getUserPayments = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('payment_date', { ascending: false });
      
    if (error) throw error;
    return data as Payment[];
  } catch (error) {
    console.error('Error fetching user payments:', error);
    throw error;
  }
};

// Function to update a user's role after successful payment
export const updateUserToBusinessAdmin = async (email: string, userId?: string) => {
  try {
    // If userId is not provided, find user by email
    if (!userId) {
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();
        
      if (userError) throw userError;
      userId = userData?.id;
    }
    
    if (!userId) {
      throw new Error('User not found');
    }
    
    // Update user role to business_admin
    const { data, error } = await supabase
      .from('user_roles')
      .upsert([
        {
          user_id: userId,
          role: 'business_admin' as UserRole,
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'user_id' })
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user to business admin:', error);
    throw error;
  }
};

// Function to check if a payment has been made for an email
export const checkPaymentStatus = async (email: string) => {
  try {
    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();
      
    if (userError) {
      // If user not found, no payment has been made
      if (userError.code === 'PGRST116') {
        return { hasPaid: false };
      }
      throw userError;
    }
    
    // Check for completed payments
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userData.id)
      .eq('status', 'completed')
      .single();
      
    if (paymentError) {
      // If no payment found, return false
      if (paymentError.code === 'PGRST116') {
        return { hasPaid: false };
      }
      throw paymentError;
    }
    
    return { 
      hasPaid: true,
      paymentDetails: paymentData
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};