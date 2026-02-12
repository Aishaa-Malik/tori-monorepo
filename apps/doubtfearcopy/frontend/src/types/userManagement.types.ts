import { UserRole } from '../contexts/AuthContext';

export interface UserData {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
  invitation_date?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  user_roles: {
    role: UserRole;
  } | null;
}

export interface ApprovedUser {
  email: string;
  role: UserRole;
  created_at: string;
  activated_at: string | null;
}

export type ServiceType = 'doctor' | 'turf' | 'spa' | 'health_fitness';

export interface UserManagementConfig {
  serviceType: ServiceType;
  title: string;
  availableRoles: UserRole[];
  defaultRole: UserRole;
  description?: string;
}

export interface UserManagementProps {
  serviceType: ServiceType;
  config?: Partial<UserManagementConfig>;
}