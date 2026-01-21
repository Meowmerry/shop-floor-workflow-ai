import type { Order, WorkItem, AuditEntry, WorkflowStep } from '../types';
import { FACTORY_USERS } from '../types/auth';

// Helper to generate unique IDs
const generateId = (): string => Math.random().toString(36).substring(2, 11);

const getOperatorName = (operatorId: string): string => {
  const user = FACTORY_USERS.find((u) => u.id === operatorId);
  return user?.name ?? operatorId;
};

// Helper to create audit entries
const createAuditEntry = (
  step: WorkflowStep,
  action: string,
  operatorId: string,
  daysAgo: number,
  notes?: string
): AuditEntry => ({
  id: generateId(),
  timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
  step,
  action,
  operatorId,
  operatorName: getOperatorName(operatorId),
  notes,
});

// Create work items for each order
const createWorkItems = (orderId: string, items: Partial<WorkItem>[]): WorkItem[] =>
  items.map((item, index) => ({
    id: `${orderId}-ITEM-${(index + 1).toString().padStart(3, '0')}`,
    orderId,
    name: item.name ?? `Item ${index + 1}`,
    description: item.description,
    quantity: item.quantity ?? 1,
    currentStep: item.currentStep ?? 'Saw',
    status: item.status ?? 'Pending',
    onHold: item.onHold ?? false,
    holdReason: item.holdReason,
    priority: item.priority ?? 'Normal',
    auditHistory: item.auditHistory ?? [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  }));

// Order 1: In early stages
const order1Items = createWorkItems('ORD-2024-001', [
  {
    name: '6" Steel Pipe Section',
    description: 'Carbon steel, Schedule 40',
    quantity: 12,
    currentStep: 'Saw',
    status: 'In Progress',
    priority: 'High',
    auditHistory: [
      createAuditEntry('Saw', 'Started cutting', 'OP-101', 0, 'Batch 1 of 3'),
    ],
  },
  {
    name: '4" Steel Pipe Section',
    description: 'Carbon steel, Schedule 80',
    quantity: 8,
    currentStep: 'Saw',
    status: 'Pending',
    priority: 'Normal',
    auditHistory: [],
  },
  {
    name: '2" Threaded Coupling',
    description: 'Galvanized steel',
    quantity: 24,
    currentStep: 'Thread',
    status: 'In Progress',
    priority: 'Normal',
    auditHistory: [
      createAuditEntry('Saw', 'Completed cutting', 'OP-101', 1),
      createAuditEntry('Thread', 'Started threading', 'OP-102', 0),
    ],
  },
]);

// Order 2: Mixed progress with one on hold
const order2Items = createWorkItems('ORD-2024-002', [
  {
    name: 'Custom Flange Assembly',
    description: '150# RF Flange, 6" bore',
    quantity: 4,
    currentStep: 'CNC',
    status: 'In Progress',
    priority: 'Urgent',
    auditHistory: [
      createAuditEntry('Saw', 'Completed', 'OP-101', 3),
      createAuditEntry('Thread', 'Completed', 'OP-102', 2),
      createAuditEntry('CNC', 'Started machining', 'OP-103', 0, 'Complex tolerance requirements'),
    ],
  },
  {
    name: 'Reducer Bushing Set',
    description: '4" to 2" NPT',
    quantity: 16,
    currentStep: 'QC',
    status: 'Pending',
    onHold: true,
    holdReason: 'Documentation Missing',
    priority: 'High',
    auditHistory: [
      createAuditEntry('Saw', 'Completed', 'OP-101', 4),
      createAuditEntry('Thread', 'Completed', 'OP-102', 3),
      createAuditEntry('CNC', 'Completed', 'OP-103', 2),
      createAuditEntry('QC', 'Placed on hold', 'QC-201', 1, 'Awaiting material certs'),
    ],
  },
]);

// Order 3: Near completion
const order3Items = createWorkItems('ORD-2024-003', [
  {
    name: 'Pressure Vessel Cap',
    description: 'ASME rated, 300 PSI',
    quantity: 2,
    currentStep: 'Ship',
    status: 'Pending',
    priority: 'Normal',
    auditHistory: [
      createAuditEntry('Saw', 'Completed', 'OP-101', 5),
      createAuditEntry('Thread', 'Completed', 'OP-102', 4),
      createAuditEntry('CNC', 'Completed', 'OP-103', 3),
      createAuditEntry('QC', 'Passed inspection', 'QC-201', 2),
      createAuditEntry('Ship', 'Ready for packaging', 'SH-301', 1),
    ],
  },
  {
    name: 'Support Bracket Assembly',
    description: 'Heavy duty, zinc plated',
    quantity: 6,
    currentStep: 'QC',
    status: 'In Progress',
    priority: 'Normal',
    auditHistory: [
      createAuditEntry('Saw', 'Completed', 'OP-101', 4),
      createAuditEntry('Thread', 'Completed', 'OP-102', 3),
      createAuditEntry('CNC', 'Completed', 'OP-103', 2),
      createAuditEntry('QC', 'Inspection started', 'QC-201', 0),
    ],
  },
  {
    name: 'Mounting Plate',
    description: '12" x 12" x 0.5" steel',
    quantity: 6,
    currentStep: 'Ship',
    status: 'Completed',
    priority: 'Low',
    auditHistory: [
      createAuditEntry('Saw', 'Completed', 'OP-101', 6),
      createAuditEntry('Thread', 'N/A - Skip', 'OP-102', 5),
      createAuditEntry('CNC', 'Completed', 'OP-103', 4),
      createAuditEntry('QC', 'Passed', 'QC-201', 3),
      createAuditEntry('Ship', 'Packaged and labeled', 'SH-301', 2),
    ],
  },
]);

// Order 4: Just started with hold issue
const order4Items = createWorkItems('ORD-2024-004', [
  {
    name: 'Hydraulic Manifold Block',
    description: 'Aluminum 6061-T6',
    quantity: 3,
    currentStep: 'Saw',
    status: 'Pending',
    onHold: true,
    holdReason: 'Customer Request',
    priority: 'Urgent',
    auditHistory: [
      createAuditEntry('Saw', 'On hold - drawings', 'OP-101', 0, 'Customer requested changes'),
    ],
  },
  {
    name: 'End Cap - Type A',
    description: 'Stainless 316',
    quantity: 10,
    currentStep: 'Thread',
    status: 'Pending',
    priority: 'High',
    auditHistory: [
      createAuditEntry('Saw', 'Completed', 'OP-101', 1),
    ],
  },
  {
    name: 'End Cap - Type B',
    description: 'Stainless 316',
    quantity: 10,
    currentStep: 'Saw',
    status: 'In Progress',
    priority: 'High',
    auditHistory: [
      createAuditEntry('Saw', 'Started', 'OP-101', 0),
    ],
  },
]);

// Order 5: Ready to ship
const order5Items = createWorkItems('ORD-2024-005', [
  {
    name: 'Pipe Nipple Assembly',
    description: '3" NPT x 6" long',
    quantity: 20,
    currentStep: 'Ship',
    status: 'In Progress',
    priority: 'Normal',
    auditHistory: [
      createAuditEntry('Saw', 'Completed', 'OP-101', 7),
      createAuditEntry('Thread', 'Completed', 'OP-102', 6),
      createAuditEntry('CNC', 'N/A - Skip', 'OP-103', 5),
      createAuditEntry('QC', 'Passed', 'QC-201', 4),
      createAuditEntry('Ship', 'Packaging in progress', 'SH-301', 0),
    ],
  },
  {
    name: 'Union Connector',
    description: '3" NPT, brass',
    quantity: 20,
    currentStep: 'Ship',
    status: 'Completed',
    priority: 'Normal',
    auditHistory: [
      createAuditEntry('Saw', 'Completed', 'OP-101', 8),
      createAuditEntry('Thread', 'Completed', 'OP-102', 7),
      createAuditEntry('CNC', 'Completed', 'OP-103', 6),
      createAuditEntry('QC', 'Passed', 'QC-201', 5),
      createAuditEntry('Ship', 'Shipped', 'SH-301', 1, 'Tracking: 1Z999AA10123456784'),
    ],
  },
]);

// Complete mock orders
export const mockOrders: readonly Order[] = [
  {
    id: 'ORD-2024-001',
    customerName: 'Acme Industries',
    orderNumber: 'PO-78234',
    items: order1Items,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ORD-2024-002',
    customerName: 'GlobalTech Solutions',
    orderNumber: 'PO-45123',
    items: order2Items,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ORD-2024-003',
    customerName: 'Pacific Manufacturing',
    orderNumber: 'PO-99887',
    items: order3Items,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ORD-2024-004',
    customerName: 'Metro Hydraulics',
    orderNumber: 'PO-33221',
    items: order4Items,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'ORD-2024-005',
    customerName: 'Industrial Supply Co',
    orderNumber: 'PO-11234',
    items: order5Items,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
  },
] as const;

// Flatten all work items for easy access
export const getAllWorkItems = (): readonly WorkItem[] =>
  mockOrders.flatMap((order) => order.items);

// Find item by ID (barcode)
export const findItemById = (id: string): WorkItem | undefined =>
  getAllWorkItems().find((item) => item.id === id);

// Find order by ID
export const findOrderById = (id: string): Order | undefined =>
  mockOrders.find((order) => order.id === id);

// Search items by barcode or name
export const searchItems = (query: string): readonly WorkItem[] => {
  const lowerQuery = query.toLowerCase();
  return getAllWorkItems().filter(
    (item) =>
      item.id.toLowerCase().includes(lowerQuery) ||
      item.name.toLowerCase().includes(lowerQuery) ||
      item.orderId.toLowerCase().includes(lowerQuery)
  );
};
