// Workflow steps in order
export const WORKFLOW_STEPS = ['Saw', 'Thread', 'CNC', 'QC', 'Ship'] as const;
export type WorkflowStep = (typeof WORKFLOW_STEPS)[number];

// Item status types
export type ItemStatus = 'Pending' | 'In Progress' | 'Completed';

// Hold reasons for QC
export const HOLD_REASONS = [
  'Material Defect',
  'Dimension Error',
  'Machine Issue',
  'Surface Finish',
  'Documentation Missing',
  'Customer Request',
] as const;
export type HoldReason = (typeof HOLD_REASONS)[number];

// Audit action types
export const AUDIT_ACTIONS = [
  'Started',
  'Completed',
  'Placed on Hold',
  'Released from Hold',
  'Sent to Rework',
  'Passed QC',
  'Failed QC',
  'Shipped',
  'Skipped',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

// Audit history entry for tracking item changes
export interface AuditEntry {
  readonly id: string;
  readonly timestamp: Date;
  readonly step: WorkflowStep;
  readonly action: AuditAction | string;
  readonly operatorId: string;
  readonly operatorName: string;
  readonly notes?: string;
}

// Individual line item within an order (mutable version for state)
export interface WorkItem {
  id: string;
  orderId: string;
  name: string;
  description?: string;
  quantity: number;
  currentStep: WorkflowStep;
  status: ItemStatus;
  onHold: boolean;
  holdReason?: HoldReason;
  holdTimestamp?: Date;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  auditHistory: AuditEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// Order containing multiple work items
export interface Order {
  readonly id: string;
  readonly customerName: string;
  readonly orderNumber: string;
  items: WorkItem[];
  readonly dueDate: Date;
  readonly createdAt: Date;
}

// Navigation tab types
export const NAV_TABS = ['Operator', 'QC', 'Shipping', 'Supervisor'] as const;
export type NavTab = (typeof NAV_TABS)[number];

// Barcode scan result
export interface ScanResult {
  readonly barcode: string;
  readonly timestamp: Date;
  matchedItem?: WorkItem;
  readonly matchedOrder?: Order;
}

// Filter options for work items
export interface WorkItemFilters {
  readonly status?: ItemStatus;
  readonly step?: WorkflowStep;
  readonly onHold?: boolean;
  readonly searchQuery?: string;
}

// Dashboard statistics
export interface DashboardStats {
  readonly totalItems: number;
  readonly byStatus: Record<ItemStatus, number>;
  readonly byStep: Record<WorkflowStep, number>;
  readonly onHoldCount: number;
}

// Re-export auth types
export * from './auth';
