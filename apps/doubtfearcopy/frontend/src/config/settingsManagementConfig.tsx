import React from 'react';
import { SettingsConfig, ServiceType } from '../types/settingsManagement.types';

const GoogleCalendarIcon = () => (
  <svg className="w-5 h-5 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

export const getSettingsConfig = (serviceType: ServiceType): SettingsConfig => {
  const baseConfig = {
    integrations: [
      {
        type: 'google_calendar' as const,
        name: 'Google Calendar',
        description: 'Connect your Google Calendar to automatically sync your appointments with your calendar.',
        icon: <GoogleCalendarIcon />,
        isConnected: false,
      }
    ],
    features: {
      showUsageLimit: true,
      showSubscriptionDetails: true,
      showIntegrations: true,
    }
  };

  switch (serviceType) {
    case 'doctor':
      return {
        ...baseConfig,
        serviceType: 'doctor',
        serviceName: 'Doctor',
        usageTerminology: {
          singular: 'appointment',
          plural: 'appointments',
          action: 'book'
        },
        theme: {
          primaryColor: 'blue',
          accentColor: 'blue-600',
          backgroundColor: 'blue-50'
        },
        integrations: [
          ...baseConfig.integrations,
          {
            type: 'zoom' as const,
            name: 'Zoom',
            description: 'Connect Zoom for virtual consultations and telemedicine appointments.',
            icon: <div className="w-5 h-5 mr-2 bg-blue-500 rounded"></div>,
            isConnected: false,
          }
        ]
      };

    case 'turf':
      return {
        ...baseConfig,
        serviceType: 'turf',
        serviceName: 'Turf',
        usageTerminology: {
          singular: 'booking',
          plural: 'bookings',
          action: 'book'
        },
        theme: {
          primaryColor: 'green',
          accentColor: 'green-600',
          backgroundColor: 'green-50'
        },
        // integrations: [
        //   ...baseConfig.integrations,
        //   {
        //     type: 'whatsapp' as const,
        //     name: 'WhatsApp Business',
        //     description: 'Connect WhatsApp Business for customer notifications and booking confirmations.',
        //     icon: <div className="w-5 h-5 mr-2 bg-green-500 rounded"></div>,
        //     isConnected: false,
        //   }
       // ]
      };

    case 'spa':
      return {
        ...baseConfig,
        serviceType: 'spa',
        serviceName: 'Spa',
        usageTerminology: {
          singular: 'appointment',
          plural: 'appointments',
          action: 'schedule'
        },
        theme: {
          primaryColor: 'purple',
          accentColor: 'purple-600',
          backgroundColor: 'purple-50'
        },
        integrations: [
          ...baseConfig.integrations,
          {
            type: 'stripe' as const,
            name: 'Stripe Payments',
            description: 'Connect Stripe for secure payment processing and booking deposits.',
            icon: <div className="w-5 h-5 mr-2 bg-purple-500 rounded"></div>,
            isConnected: false,
          }
        ]
      };

    case 'health-fitness':
      return {
        ...baseConfig,
        serviceType: 'health-fitness',
        serviceName: 'Health & Fitness',
        usageTerminology: {
          singular: 'session',
          plural: 'sessions',
          action: 'schedule'
        },
        theme: {
          primaryColor: 'orange',
          accentColor: 'orange-600',
          backgroundColor: 'orange-50'
        },
        integrations: [
          ...baseConfig.integrations,
          {
            type: 'zoom' as const,
            name: 'Zoom',
            description: 'Connect Zoom for virtual fitness sessions and health consultations.',
            icon: <div className="w-5 h-5 mr-2 bg-orange-500 rounded"></div>,
            isConnected: false,
          },
          {
            type: 'stripe' as const,
            name: 'Stripe Payments',
            description: 'Connect Stripe for membership payments and session bookings.',
            icon: <div className="w-5 h-5 mr-2 bg-orange-600 rounded"></div>,
            isConnected: false,
          }
        ]
      };

    default:
      return {
        ...baseConfig,
        serviceType: 'doctor',
        serviceName: 'Service',
        usageTerminology: {
          singular: 'appointment',
          plural: 'appointments',
          action: 'book'
        },
        theme: {
          primaryColor: 'gray',
          accentColor: 'gray-600',
          backgroundColor: 'gray-50'
        }
      };
  }
};