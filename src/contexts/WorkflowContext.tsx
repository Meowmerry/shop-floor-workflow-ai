import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { WorkItem, Order, WorkflowStep, HoldReason, AuditEntry } from '../types';
import { WORKFLOW_STEPS } from '../types';
import { mockOrders as initialMockOrders } from '../data/mockData';

// Deep clone orders to make them mutable
const cloneOrders = (orders: readonly Order[]): Order[] =>
  JSON.parse(JSON.stringify(orders), (key, value) => {
    if (key === 'timestamp' || key === 'createdAt' || key === 'updatedAt' || key === 'dueDate' || key === 'holdTimestamp') {
      return value ? new Date(value) : value;
    }
    return value;
  });

interface WorkflowContextType {
  orders: Order[];
  getAllItems: () => WorkItem[];
  getItemById: (id: string) => WorkItem | undefined;
  getOrderById: (id: string) => Order | undefined;

  // Workflow actions
  startStep: (itemId: string, operatorId: string, operatorName: string) => boolean;
  completeStep: (itemId: string, operatorId: string, operatorName: string) => boolean;
  canCompleteStep: (item: WorkItem) => boolean;
  getNextStep: (currentStep: WorkflowStep) => WorkflowStep | null;
  getPreviousStep: (currentStep: WorkflowStep) => WorkflowStep | null;

  // Hold management
  placeOnHold: (itemId: string, reason: HoldReason, operatorId: string, operatorName: string) => boolean;
  releaseHold: (itemId: string, operatorId: string, operatorName: string) => boolean;

  // Rework
  sendToRework: (itemId: string, operatorId: string, operatorName: string, notes?: string) => boolean;

  // Shipping
  shipItem: (itemId: string, operatorId: string, operatorName: string) => boolean;
  canShipItem: (item: WorkItem) => { canShip: boolean; reason?: string };

  // QC specific
  passQC: (itemId: string, operatorId: string, operatorName: string) => boolean;
  failQC: (itemId: string, reason: HoldReason, operatorId: string, operatorName: string) => boolean;
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

interface WorkflowProviderProps {
  readonly children: ReactNode;
}

// Helper to generate unique IDs
const generateId = (): string => Math.random().toString(36).substring(2, 11);

// Create audit entry helper
const createAuditEntry = (
  step: WorkflowStep,
  action: string,
  operatorId: string,
  operatorName: string,
  notes?: string
): AuditEntry => ({
  id: generateId(),
  timestamp: new Date(),
  step,
  action,
  operatorId,
  operatorName,
  notes,
});

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [orders, setOrders] = useState<Order[]>(() => cloneOrders(initialMockOrders));

  // Get all items flattened
  const getAllItems = useCallback((): WorkItem[] => {
    return orders.flatMap((order) => order.items);
  }, [orders]);

  // Find item by ID
  const getItemById = useCallback((id: string): WorkItem | undefined => {
    for (const order of orders) {
      const item = order.items.find((i) => i.id === id);
      if (item) return item;
    }
    return undefined;
  }, [orders]);

  // Find order by ID
  const getOrderById = useCallback((id: string): Order | undefined => {
    return orders.find((o) => o.id === id);
  }, [orders]);

  // Update item helper
  const updateItem = useCallback((itemId: string, updater: (item: WorkItem) => void) => {
    setOrders((prevOrders) => {
      const newOrders = prevOrders.map((order) => ({
        ...order,
        items: order.items.map((item) => {
          if (item.id === itemId) {
            const newItem = { ...item };
            updater(newItem);
            newItem.updatedAt = new Date();
            return newItem;
          }
          return item;
        }),
      }));
      return newOrders;
    });
  }, []);

  // Get next workflow step
  const getNextStep = useCallback((currentStep: WorkflowStep): WorkflowStep | null => {
    const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
    if (currentIndex < WORKFLOW_STEPS.length - 1) {
      return WORKFLOW_STEPS[currentIndex + 1];
    }
    return null;
  }, []);

  // Get previous workflow step
  const getPreviousStep = useCallback((currentStep: WorkflowStep): WorkflowStep | null => {
    const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      return WORKFLOW_STEPS[currentIndex - 1];
    }
    return null;
  }, []);

  // Check if step can be completed
  const canCompleteStep = useCallback((item: WorkItem): boolean => {
    // Cannot complete if on hold
    if (item.onHold) return false;

    // Must be in progress to complete
    if (item.status !== 'In Progress') return false;

    return true;
  }, []);

  // Start working on a step
  const startStep = useCallback((
    itemId: string,
    operatorId: string,
    operatorName: string
  ): boolean => {
    const item = getItemById(itemId);
    if (!item) return false;
    if (item.onHold) return false;
    if (item.status !== 'Pending') return false;

    updateItem(itemId, (i) => {
      i.status = 'In Progress';
      i.auditHistory = [
        ...i.auditHistory,
        createAuditEntry(i.currentStep, 'Started', operatorId, operatorName),
      ];
    });
    return true;
  }, [getItemById, updateItem]);

  // Complete current step and move to next
  const completeStep = useCallback((
    itemId: string,
    operatorId: string,
    operatorName: string
  ): boolean => {
    const item = getItemById(itemId);
    if (!item || !canCompleteStep(item)) return false;

    const nextStep = getNextStep(item.currentStep);

    updateItem(itemId, (i) => {
      i.auditHistory = [
        ...i.auditHistory,
        createAuditEntry(i.currentStep, 'Completed', operatorId, operatorName),
      ];

      if (nextStep) {
        i.currentStep = nextStep;
        i.status = 'Pending';
      } else {
        // Final step completed
        i.status = 'Completed';
      }
    });
    return true;
  }, [getItemById, canCompleteStep, getNextStep, updateItem]);

  // Place item on hold
  const placeOnHold = useCallback((
    itemId: string,
    reason: HoldReason,
    operatorId: string,
    operatorName: string
  ): boolean => {
    const item = getItemById(itemId);
    if (!item) return false;
    if (item.onHold) return false;

    updateItem(itemId, (i) => {
      i.onHold = true;
      i.holdReason = reason;
      i.holdTimestamp = new Date();
      i.auditHistory = [
        ...i.auditHistory,
        createAuditEntry(i.currentStep, 'Placed on Hold', operatorId, operatorName, `Reason: ${reason}`),
      ];
    });
    return true;
  }, [getItemById, updateItem]);

  // Release hold
  const releaseHold = useCallback((
    itemId: string,
    operatorId: string,
    operatorName: string
  ): boolean => {
    const item = getItemById(itemId);
    if (!item) return false;
    if (!item.onHold) return false;

    updateItem(itemId, (i) => {
      const previousReason = i.holdReason;
      i.onHold = false;
      i.holdReason = undefined;
      i.holdTimestamp = undefined;
      i.auditHistory = [
        ...i.auditHistory,
        createAuditEntry(
          i.currentStep,
          'Released from Hold',
          operatorId,
          operatorName,
          previousReason ? `Was held for: ${previousReason}` : undefined
        ),
      ];
    });
    return true;
  }, [getItemById, updateItem]);

  // Send to rework (back to Saw)
  const sendToRework = useCallback((
    itemId: string,
    operatorId: string,
    operatorName: string,
    notes?: string
  ): boolean => {
    const item = getItemById(itemId);
    if (!item) return false;

    updateItem(itemId, (i) => {
      const previousStep = i.currentStep;
      i.currentStep = 'Saw';
      i.status = 'Pending';
      i.onHold = false;
      i.holdReason = undefined;
      i.holdTimestamp = undefined;
      i.auditHistory = [
        ...i.auditHistory,
        createAuditEntry(
          previousStep,
          'Sent to Rework',
          operatorId,
          operatorName,
          notes || `Returned from ${previousStep} to Saw for rework`
        ),
      ];
    });
    return true;
  }, [getItemById, updateItem]);

  // Check if item can be shipped
  const canShipItem = useCallback((item: WorkItem): { canShip: boolean; reason?: string } => {
    if (item.currentStep !== 'Ship') {
      return { canShip: false, reason: `Item is at ${item.currentStep}, not ready for shipping` };
    }
    if (item.onHold) {
      return { canShip: false, reason: 'QC HOLD ACTIVE' };
    }
    if (item.status === 'Completed') {
      return { canShip: false, reason: 'Item already shipped' };
    }
    return { canShip: true };
  }, []);

  // Ship item
  const shipItem = useCallback((
    itemId: string,
    operatorId: string,
    operatorName: string
  ): boolean => {
    const item = getItemById(itemId);
    if (!item) return false;

    const { canShip } = canShipItem(item);
    if (!canShip) return false;

    updateItem(itemId, (i) => {
      i.status = 'Completed';
      i.auditHistory = [
        ...i.auditHistory,
        createAuditEntry(i.currentStep, 'Shipped', operatorId, operatorName),
      ];
    });
    return true;
  }, [getItemById, canShipItem, updateItem]);

  // Pass QC inspection
  const passQC = useCallback((
    itemId: string,
    operatorId: string,
    operatorName: string
  ): boolean => {
    const item = getItemById(itemId);
    if (!item) return false;
    if (item.currentStep !== 'QC') return false;
    if (item.onHold) return false;

    updateItem(itemId, (i) => {
      i.auditHistory = [
        ...i.auditHistory,
        createAuditEntry(i.currentStep, 'Passed QC', operatorId, operatorName),
      ];
      i.currentStep = 'Ship';
      i.status = 'Pending';
    });
    return true;
  }, [getItemById, updateItem]);

  // Fail QC (place on hold)
  const failQC = useCallback((
    itemId: string,
    reason: HoldReason,
    operatorId: string,
    operatorName: string
  ): boolean => {
    const item = getItemById(itemId);
    if (!item) return false;
    if (item.currentStep !== 'QC') return false;

    updateItem(itemId, (i) => {
      i.onHold = true;
      i.holdReason = reason;
      i.holdTimestamp = new Date();
      i.auditHistory = [
        ...i.auditHistory,
        createAuditEntry(i.currentStep, 'Failed QC', operatorId, operatorName, `Reason: ${reason}`),
      ];
    });
    return true;
  }, [getItemById, updateItem]);

  return (
    <WorkflowContext.Provider
      value={{
        orders,
        getAllItems,
        getItemById,
        getOrderById,
        startStep,
        completeStep,
        canCompleteStep,
        getNextStep,
        getPreviousStep,
        placeOnHold,
        releaseHold,
        sendToRework,
        shipItem,
        canShipItem,
        passQC,
        failQC,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow(): WorkflowContextType {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}
