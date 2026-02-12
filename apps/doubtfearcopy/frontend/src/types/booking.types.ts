export type ServiceType = 'doctor' | 'turf' | 'salon' | 'spa'; // extendable

export interface BaseBooking {
  id: string;
  booking_date: string;
  start_time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'no-show';
  booking_reference?: string;
  payment_id?: string;
  amount?: number;
  currency?: string;
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorBooking extends BaseBooking {
  customer_name: string;
  customer_email?: string;
  customer_contact?: string;
  doctor: string;
  prescription?: string;
}

export interface TurfBooking extends BaseBooking {
  customer_name: string;
  customer_email?: string;
  customer_contact?: string;
}

export type BookingData = DoctorBooking | TurfBooking;

export interface ColumnConfig {
  key: string;
  label: string;
  type: 'customer' | 'text' | 'datetime' | 'status' | 'payment' | 'file' | 'reference';
}