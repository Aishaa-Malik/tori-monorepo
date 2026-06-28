import { UserRole } from '../contexts/AuthContext';
import { ServiceType } from '../types/booking.types';

export type DashboardServiceType = Extract<ServiceType, 'doctor' | 'turf'>;

export interface NavItem {
  name: string;
  segment: string;
  icon: string;
  disabled?: boolean;
}

export interface DashboardConfig {
  serviceType: DashboardServiceType;
  basePath: string;
  title: string;
  defaultUserLabel: string;
  employeeBasePath?: string;
}

export const BUSINESS_TYPE_DASHBOARD_MAP: Record<string, string> = {
  healthcare: '/dashboard',
  'healthcare & physiotherapy': '/dashboard',
  physiotherapy: '/dashboard',
  turf: '/fitness-sports-dashboard',
  'turf / cricket': '/fitness-sports-dashboard',
  'racket courts': '/fitness-sports-dashboard',
  'fitness & gym': '/fitness-sports-dashboard',
  fitness: '/fitness-sports-dashboard',
  events: '/fitness-sports-dashboard',
  sportsvenue: '/fitness-sports-dashboard',
  'sports venues': '/fitness-sports-dashboard',
  spasalon: '/fitness-sports-dashboard',
};

export const DASHBOARD_CONFIGS: Record<DashboardServiceType, DashboardConfig> = {
  doctor: {
    serviceType: 'doctor',
    basePath: '/dashboard',
    title: 'Venue Dashboard',
    defaultUserLabel: 'Venue Owner',
  },
  turf: {
    serviceType: 'turf',
    basePath: '/fitness-sports-dashboard',
    title: 'Dashboard',
    defaultUserLabel: 'Business Owner',
    employeeBasePath: '/fitness-sports-dashboard/employee',
  },
};

export const getDashboardConfig = (serviceType: DashboardServiceType): DashboardConfig =>
  DASHBOARD_CONFIGS[serviceType];

export const hrefForNavItem = (basePath: string, segment: string): string =>
  segment ? `${basePath}/${segment}` : basePath;

const doctorNavByRole: Partial<Record<UserRole, NavItem[]>> = {
  [UserRole.SUPER_ADMIN]: [
    { name: 'Dashboard', segment: '', icon: 'home' },
    { name: 'Appointments', segment: 'appointments', icon: 'calendar' },
    { name: 'Schedule', segment: 'schedule', icon: 'clock' },
    { name: 'Tenants', segment: 'tenants', icon: 'building' },
    { name: 'Users', segment: 'users', icon: 'users' },
    { name: 'Analytics', segment: 'analytics', icon: 'chart-bar' },
    { name: 'Settings', segment: 'settings', icon: 'cog' },
    { name: 'Billing', segment: 'billing', icon: 'credit-card' },
  ],
  [UserRole.BUSINESS_OWNER]: [
    { name: 'Dashboard', segment: '', icon: 'home' },
    { name: 'Bookings', segment: 'appointments', icon: 'calendar' },
    { name: 'Schedule', segment: 'schedule', icon: 'clock' },
    { name: 'Staff Management', segment: 'employees', icon: 'users' },
    { name: 'Revenue', segment: 'revenue', icon: 'chart-bar' },
    { name: 'Settings', segment: 'settings', icon: 'cog' },
  ],
  [UserRole.DOCTOR]: [
    { name: 'Dashboard', segment: '', icon: 'home' },
    { name: 'Bookings', segment: 'appointments', icon: 'calendar' },
    { name: 'Schedule', segment: 'schedule', icon: 'clock' },
    { name: 'Members', segment: 'patients', icon: 'user-md' },
    { name: 'Settings', segment: 'settings', icon: 'cog' },
  ],
};

const defaultDoctorNav: NavItem[] = [
  { name: 'Dashboard', segment: '', icon: 'home' },
  { name: 'Bookings', segment: 'appointments', icon: 'calendar' },
  { name: 'Schedule', segment: 'schedule', icon: 'clock' },
];

const turfNav: NavItem[] = [
  { name: 'Dashboard', segment: '', icon: 'home' },
  { name: 'Bookings', segment: 'bookings', icon: 'calendar' },
  { name: 'Schedule', segment: 'schedule', icon: 'clock' },
  { name: 'User Management', segment: 'users', icon: 'calendar' },
  { name: 'Revenue', segment: 'revenue', icon: 'chart-bar' },
  { name: 'Settings', segment: 'settings', icon: 'cog' },
];

export const getNavItems = (
  serviceType: DashboardServiceType,
  role: UserRole
): NavItem[] => {
  if (serviceType === 'turf') {
    return turfNav;
  }

  return doctorNavByRole[role] ?? defaultDoctorNav;
};

export const employeeNavItems: NavItem[] = [
  { name: 'Dashboard', segment: '', icon: 'dashboard' },
  { name: 'Bookings', segment: 'bookings', icon: 'event' },
  { name: 'Schedule', segment: 'schedule', icon: 'event' },
];

export const resolveDashboardPath = (
  businessType: string | undefined,
  email: string | undefined,
  role: UserRole
): string | undefined => {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const userType = (businessType || '').toLowerCase().trim();

  let targetPath =
    normalizedEmail === 'torieate@gmail.com'
      ? DASHBOARD_CONFIGS.turf.basePath
      : BUSINESS_TYPE_DASHBOARD_MAP[userType];

  if (!targetPath) {
    return undefined;
  }

  if (role === UserRole.EMPLOYEE && targetPath.includes('fitness-sports')) {
    return `${targetPath}/employee`;
  }

  return targetPath;
};

export const getServiceTypeFromPath = (pathname: string): DashboardServiceType | null => {
  if (pathname.startsWith(DASHBOARD_CONFIGS.turf.basePath)) {
    return 'turf';
  }
  if (pathname.startsWith(DASHBOARD_CONFIGS.doctor.basePath)) {
    return 'doctor';
  }
  return null;
};
