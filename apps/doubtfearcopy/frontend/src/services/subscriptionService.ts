import { supabase } from './supabaseService';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  appointments_used: number;
  billing_cycle_start: string;
  billing_cycle_end: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithPlan extends Subscription {
  plans: {
    id: string;
    name: string;
    price: number;
    features: string[];
    appointment_limit?: number;
  };
}

export interface SubscriptionUsage {
  currentUsage: number;
  limit: number;
  isUnlimited: boolean;
  remainingAppointments: number;
  canBook: boolean;
}

/**
 * Get active subscription for a tenant
 */
export const getActiveSubscription = async (tenantId: string): Promise<SubscriptionWithPlan | null> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (*)
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching active subscription:', error);
    throw error;
  }
};

/**
 * Get all subscriptions for a tenant
 */
export const getAllSubscriptions = async (tenantId: string): Promise<SubscriptionWithPlan[]> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plans (*)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

/**
 * Check appointment usage against subscription limits
 */
export const checkSubscriptionUsage = async (tenantId: string): Promise<SubscriptionUsage> => {
  try {
    // Get active subscription
    const subscription = await getActiveSubscription(tenantId);
    
    if (!subscription) {
      return {
        currentUsage: 0,
        limit: 0,
        isUnlimited: false,
        remainingAppointments: 0,
        canBook: false
      };
    }

    // Get plan details from the plans table
    const plan = subscription.plans;
    if (!plan) {
      return {
        currentUsage: subscription.appointments_used || 0,
        limit: 0,
        isUnlimited: false,
        remainingAppointments: 0,
        canBook: false
      };
    }

    // For now, we'll use a simple limit based on plan name
    // You can modify this based on your actual plan structure
    let appointmentLimit = 100; // Default basic limit
    
    if (plan.name?.toLowerCase().includes('enterprise')) {
      appointmentLimit = -1; // Unlimited
    } else if (plan.name?.toLowerCase().includes('professional') || plan.name?.toLowerCase().includes('pro')) {
      appointmentLimit = 500;
    }
    
    const isUnlimited = appointmentLimit === -1;
    
    if (isUnlimited) {
      return {
        currentUsage: subscription.appointments_used || 0,
        limit: -1,
        isUnlimited: true,
        remainingAppointments: -1,
        canBook: true
      };
    }

    const currentUsage = subscription.appointments_used || 0;
    const remainingAppointments = Math.max(0, appointmentLimit - currentUsage);
    const canBook = remainingAppointments > 0;

    return {
      currentUsage,
      limit: appointmentLimit,
      isUnlimited: false,
      remainingAppointments,
      canBook
    };
  } catch (error) {
    console.error('Error checking subscription usage:', error);
    throw error;
  }
};

/**
 * Create a new subscription
 */
export const createSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Promise<Subscription> => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

/**
 * Update subscription status
 */
export const updateSubscriptionStatus = async (subscriptionId: string, status: Subscription['status']): Promise<void> => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};

/**
 * Update appointments used count
 */
export const updateAppointmentsUsed = async (subscriptionId: string, appointmentsUsed: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        appointments_used: appointmentsUsed,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating appointments used:', error);
    throw error;
  }
};

/**
 * Get subscription plans from the plans table
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

/**
 * Check if tenant can book appointments
 */
export const canBookAppointment = async (tenantId: string): Promise<boolean> => {
  try {
    const usage = await checkSubscriptionUsage(tenantId);
    return usage.canBook;
  } catch (error) {
    console.error('Error checking if tenant can book appointment:', error);
    return false;
  }
};

/**
 * Get subscription analytics for a tenant
 */
export const getSubscriptionAnalytics = async (tenantId: string) => {
  try {
    const subscription = await getActiveSubscription(tenantId);
    const usage = await checkSubscriptionUsage(tenantId);
    
    if (!subscription) {
      return {
        hasActiveSubscription: false,
        message: 'No active subscription found'
      };
    }

    return {
      hasActiveSubscription: true,
      subscription,
      usage,
      daysUntilRenewal: Math.ceil((new Date(subscription.billing_cycle_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    };
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    throw error;
  }
};
