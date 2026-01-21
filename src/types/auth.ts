// User roles that map to specific views
export const USER_ROLES = ['Operator', 'QC', 'Shipping', 'Supervisor'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Mock users for factory quick-select
export interface FactoryUser {
  readonly id: string;
  readonly badgeId: string;
  readonly name: string;
  readonly role: UserRole;
  readonly department: string;
  readonly avatar?: string;
}

// Authentication state
export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly currentUser: FactoryUser | null;
}

// Predefined factory users for quick-select
export const FACTORY_USERS: readonly FactoryUser[] = [
  {
    id: 'OP-101',
    badgeId: '101',
    name: 'Mike Johnson',
    role: 'Operator',
    department: 'Saw Station',
  },
  {
    id: 'OP-102',
    badgeId: '102',
    name: 'Sarah Chen',
    role: 'Operator',
    department: 'Thread Station',
  },
  {
    id: 'OP-103',
    badgeId: '103',
    name: 'Carlos Rivera',
    role: 'Operator',
    department: 'CNC Station',
  },
  {
    id: 'QC-201',
    badgeId: '201',
    name: 'Emily Watson',
    role: 'QC',
    department: 'Quality Control',
  },
  {
    id: 'QC-202',
    badgeId: '202',
    name: 'James Park',
    role: 'QC',
    department: 'Quality Control',
  },
  {
    id: 'SH-301',
    badgeId: '301',
    name: 'David Miller',
    role: 'Shipping',
    department: 'Warehouse',
  },
  {
    id: 'SH-302',
    badgeId: '302',
    name: 'Lisa Thompson',
    role: 'Shipping',
    department: 'Warehouse',
  },
  {
    id: 'SUP-401',
    badgeId: '401',
    name: 'Robert Kim',
    role: 'Supervisor',
    department: 'Floor Manager',
  },
  {
    id: 'SUP-402',
    badgeId: '402',
    name: 'Angela Martinez',
    role: 'Supervisor',
    department: 'Operations Manager',
  },
] as const;
