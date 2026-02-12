export type ServiceType = 'doctor' | 'turf' | 'spa' | 'health-fitness';

export interface UsageData {
  used: number;
  total: number;
}

export interface SubscriptionDetails {
  planName: string;
  status: 'active' | 'inactive' | 'expired';
  usageData: UsageData;
}

export interface IntegrationConfig {
  type: 'google_calendar' | 'stripe' | 'zoom' | 'whatsapp';
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  connectHandler?: () => Promise<void>;
  disconnectHandler?: () => Promise<void>;
}

export interface SettingsConfig {
  serviceType: ServiceType;
  serviceName: string;
  usageTerminology: {
    singular: string;
    plural: string;
    action: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
  };
  integrations: IntegrationConfig[];
  features: {
    showUsageLimit: boolean;
    showSubscriptionDetails: boolean;
    showIntegrations: boolean;
    customSections?: React.ReactNode[];
  };
}

export interface SettingsPageProps {
  serviceType: ServiceType;
}