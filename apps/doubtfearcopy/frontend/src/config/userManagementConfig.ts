import { UserRole } from '../contexts/AuthContext';
import { ServiceType, UserManagementConfig } from '../types/userManagement.types';

export const userManagementConfigs: Record<ServiceType, UserManagementConfig> = {
  doctor: {
    serviceType: 'doctor',
    title: 'Doctor User Management',
    availableRoles: [UserRole.DOCTOR, UserRole.EMPLOYEE],
    defaultRole: UserRole.EMPLOYEE,
    description: 'Manage user access for your medical practice'
  },
  turf: {
    serviceType: 'turf',
    title: 'User Management',
    availableRoles: [UserRole.BUSINESS_OWNER, UserRole.EMPLOYEE],
    defaultRole: UserRole.EMPLOYEE,
    description: 'Manage user access for your turf facility'
  },
  spa: {
    serviceType: 'spa',
    title: 'Spa User Management',
    availableRoles: [UserRole.BUSINESS_OWNER, UserRole.EMPLOYEE],
    defaultRole: UserRole.EMPLOYEE,
    description: 'Manage user access for your spa services'
  },
  health_fitness: {
    serviceType: 'health_fitness',
    title: 'Health & Fitness User Management',
    availableRoles: [UserRole.BUSINESS_OWNER, UserRole.EMPLOYEE],
    defaultRole: UserRole.EMPLOYEE,
    description: 'Manage user access for your health and fitness center'
  }
};

export const getServiceConfig = (serviceType: ServiceType): UserManagementConfig => {
  return userManagementConfigs[serviceType];
};

export const getAllServiceTypes = (): ServiceType[] => {
  return Object.keys(userManagementConfigs) as ServiceType[];
};