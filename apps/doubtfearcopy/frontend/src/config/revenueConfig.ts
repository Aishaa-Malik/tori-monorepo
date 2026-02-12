import { ServiceType } from '../types/booking.types';
import { RevenueServiceConfig } from '../types/revenue.types';

export const REVENUE_CONFIGS: Record<ServiceType, RevenueServiceConfig> = {
  doctor: {
    serviceType: 'doctor',
    tableName: 'appointments',
    displayName: 'Revenue Dashboard',
    entityName: 'appointment',
    entityNamePlural: 'appointments',
    fields: {
      customerName: 'customer_name',
      customerContact: 'customer_contact',
      customerEmail: 'customer_email'
    },
    serviceLabel: 'General Consultation'
  },
  turf: {
    serviceType: 'turf',
    tableName: 'appointments',
    displayName: 'Revenue Dashboard',
    entityName: 'booking',
    entityNamePlural: 'bookings',
    fields: {
      customerName: 'customer_name',
      customerContact: 'customer_contact',
      customerEmail: 'customer_email'
    },
    serviceLabel: 'Turf Booking'
  },
  salon: {
    serviceType: 'salon',
    tableName: 'SalonAppointments',
    displayName: 'Revenue Dashboard',
    entityName: 'appointment',
    entityNamePlural: 'appointments',
    fields: {
      customerName: 'customer_name',
      customerContact: 'customer_contact',
      customerEmail: 'customer_email'
    },
    serviceLabel: 'Salon Service'
  },
  spa: {
    serviceType: 'spa',
    tableName: 'SpaAppointments',
    displayName: 'Revenue Dashboard',
    entityName: 'appointment',
    entityNamePlural: 'appointments',
    fields: {
      customerName: 'customer_name',
      customerContact: 'customer_contact',
      customerEmail: 'customer_email'
    },
    serviceLabel: 'Spa Service'
  }
};