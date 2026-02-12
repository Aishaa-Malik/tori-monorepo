import { ServiceType, ColumnConfig } from '../types/booking.types';

export interface ServiceConfig {
  serviceType: ServiceType;
  tableName: string;
  channelName: string;
  displayName: string;
  fields: {
    customerName: string;
    customerEmail: string;
    customerContact: string;
    additionalFields?: string[]; // doctor, prescription, etc.
  };
  columns: ColumnConfig[];
  hasFileUpload?: boolean;
}

export const SERVICE_CONFIGS: Record<ServiceType, ServiceConfig> = {
  
  //WAY TO REMEMBER THS SYNX-
  //ServiceType, ServiceConfig
  //ServiceType-doctor, ServiceConfig
  //ServiceConfig kya h yhi to h = 
  //{
//   serviceType: ServiceType;
//   tableName: string;
//   channelName: string;
//   displayName: string;
//   fields: {
//     customerName: string;
//     customerEmail: string;
//     customerContact: string;
//     additionalFields?: string[]; // doctor, prescription, etc.
//   };
//   columns: ColumnConfig[];
//   hasFileUpload?: boolean;
// }

  doctor: {
    serviceType: 'doctor',
    tableName: 'appointments',
    channelName: 'doctor-appointments-changes',
    displayName: 'Appointments',
    fields: {
      customerName: 'patient_name',
      customerEmail: 'patient_email',
      customerContact: 'patient_contact',
      additionalFields: ['doctor', 'prescription']
    },
    columns: [
      { key: 'patient', label: 'Patient', type: 'customer' },
      { key: 'doctor', label: 'Doctor', type: 'text' },
      { key: 'datetime', label: 'Date & Time', type: 'datetime' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'payment', label: 'Payment', type: 'payment' },
      { key: 'prescription', label: 'Prescription', type: 'file' },
      { key: 'reference', label: 'Reference', type: 'reference' }
    ],
    //columns = [ColumnConfig, ColumnConfig, ColumnConfig...]
    //columns = [{
              //   key: string;
              //   label: string;
              //   type: 'customer' | 'text' | 'datetime' | 'status' | 'payment' | 'file' | 'reference';
              // }, 
              // {key: string; label: string; type: 'customer' | 'text' | 'datetime' | 'status' | 'payment' | 'file' | 'reference'; },....]
    hasFileUpload: true
  },
  turf: {
    serviceType: 'turf',
    tableName: 'appointments',
    channelName: 'turf-appointments-changes',
    displayName: 'Bookings',
    fields: {
      customerName: 'customer_name',
      customerEmail: 'customer_email',
      customerContact: 'customer_contact'
    },
    columns: [
      { key: 'customer', label: 'Customer', type: 'customer' },
      { key: 'datetime', label: 'Date & Time', type: 'datetime' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'payment', label: 'Payment', type: 'payment' },
      { key: 'reference', label: 'Reference', type: 'reference' }
    ],
    hasFileUpload: false
  },
  salon: {
    serviceType: 'salon',
    tableName: 'salon_appointments',
    channelName: 'salon-appointments-changes',
    displayName: 'Salon Bookings',
    fields: {
      customerName: 'customer_name',
      customerEmail: 'customer_email',
      customerContact: 'customer_contact',
      additionalFields: ['service_type', 'stylist']
    },
    columns: [
      { key: 'customer', label: 'Customer', type: 'customer' },
      { key: 'service', label: 'Service', type: 'text' },
      { key: 'stylist', label: 'Stylist', type: 'text' },
      { key: 'datetime', label: 'Date & Time', type: 'datetime' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'payment', label: 'Payment', type: 'payment' },
      { key: 'reference', label: 'Reference', type: 'reference' }
    ],
    hasFileUpload: false
  },
  spa: {
    serviceType: 'spa',
    tableName: 'spa_appointments',
    channelName: 'spa-appointments-changes',
    displayName: 'Spa Bookings',
    fields: {
      customerName: 'customer_name',
      customerEmail: 'customer_email',
      customerContact: 'customer_contact',
      additionalFields: ['treatment_type', 'therapist']
    },
    columns: [
      { key: 'customer', label: 'Customer', type: 'customer' },
      { key: 'treatment', label: 'Treatment', type: 'text' },
      { key: 'therapist', label: 'Therapist', type: 'text' },
      { key: 'datetime', label: 'Date & Time', type: 'datetime' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'payment', label: 'Payment', type: 'payment' },
      { key: 'reference', label: 'Reference', type: 'reference' }
    ],
    hasFileUpload: false
  }
};