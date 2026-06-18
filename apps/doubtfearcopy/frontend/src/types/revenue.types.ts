import { ServiceType } from './booking.types';

// Base transaction interface for revenue tracking
export interface Transaction {
  id: string;
  booking_date: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  booking_reference?: string;
  
  // Dynamic fields that vary by service type
  [key: string]: any;
  
  // Common fields that might have different column names
  customer_name?: string;
  customer_contact?: string;
  customer_email?: string;
}

// Revenue metrics interface
export interface RevenueMetrics {
  revenue: number;
  count: number;
  period: string;
  dateRange: string;
}

// Filter types for date ranges
export type FilterType = 'daily' | 'weekly' | 'monthly' | 'custom';

// Custom date range interface
export interface CustomDateRange {
  startDate: string;
  endDate: string;
}

// Date range result interface
export interface DateRangeResult {
  startDate: Date;
  endDate: Date;
  label: string;
  dateRange: string;
}

// Revenue service configuration interface
export interface RevenueServiceConfig {
  serviceType: ServiceType;
  tableName: string;
  displayName: string;
  entityName: string; // 'appointment' or 'booking'
  entityNamePlural: string; // 'appointments' or 'bookings'
  fields: {
    customerName: string;
    customerContact: string;
    customerEmail: string;
  };
  serviceLabel: string; // 'General Consultation' or 'Turf Booking'
}