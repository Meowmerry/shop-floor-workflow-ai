import { createContext, useState, useCallback, type ReactNode } from 'react';
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

export interface WorkflowContextType {
  orders: Order[];
  getAllItems: () => WorkItem[];
  getItemById: (id: string) => WorkItem | undefined;
  getOrderById: (id: string) => Order | undefined;

  // Workflow actions - operatorStation required for state machine validation
  startStep: (itemId: string, operatorId: string, operatorName: string, operatorStation: WorkflowStep) => boolean;
  completeStep: (itemId: string, operatorId: string, operatorName: string, operatorStation: WorkflowStep) => boolean;
  canCompleteStep: (item: WorkItem) => boolean;
  getNextStep: (currentStep: WorkflowStep) => WorkflowStep | null;
  getPreviousStep: (currentStep: WorkflowStep) => WorkflowStep | null;

  // Hold management
  placeOnHold: (itemId: string, reason: HoldReason, operatorId: string, operatorName: string) => boolean;
  releaseHold: (itemId: string, operatorId: string, operatorName: string) => boolean;

  // Rework
  sendToRework: (itemId: string, operatorId: string, operatorName: string, notes?: string) => boolean;

  // Shipping - operatorStation required for state machine validation
  shipItem: (itemId: string, operatorId: string, operatorName: string, operatorStation: WorkflowStep) => boolean;
  canShipItem: (item: WorkItem) => { canShip: boolean; reason?: string };

  // QC specific
  passQC: (itemId: string, operatorId: string, operatorName: string) => boolean;
  failQC: (itemId: string, reason: HoldReason, operatorId: string, operatorName: string) => boolean;

  // Intake - add new item to workflow with optional order association
  addNewItem: (itemId: string, operatorId: string, operatorName: string, orderId?: string) => WorkItem | null;
}

// eslint-disable-next-line react-refresh/only-export-components
export const WorkflowContext = createContext<WorkflowContextType | null>(null);

export interface WorkflowProviderProps {
  readonly children: ReactNode;
}

// Helper to generate unique IDs
const generateId = (): string => Math.random().toString(36).substring(2, 11);

// Create audit entry helper - includes operatorStation for audit integrity
const createAuditEntry = (
  step: WorkflowStep,
  action: string,
  operatorId: string,
  operatorName: string,
  operatorStation?: WorkflowStep,
  notes?: string
): AuditEntry => ({
  id: generateId(),
  timestamp: new Date(),
  step,
  action,
  operatorId,
  operatorName,
  operatorStation,
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

  // Start working on a step - HARDENED: validates operatorStation matches item's currentStep
  const startStep = useCallback((
    itemId: string,
    operatorId: string,
    operatorName: string,
    operatorStation: WorkflowStep
  ): boolean => {
    const item = getItemById(itemId);
    if (!item) return false;

    // HARDENED LOGIC: Check station permissions at the context level
    if (operatorStation !== item.currentStep) {
      console.warn(`Process Violation: Station ${operatorStation} cannot start work for ${item.currentStep}`);
      return false;
    }

    if (item.onHold) return false;
    if (item.status !== 'Pending') return false;

    updateItem(itemId, (i) => {
      i.status = 'In Progress';
      i.auditHistory = [
        ...i.auditHistory,
        createAuditEntry(i.currentStep, 'Started', operatorId, operatorName, operatorStation),
      ];
    });
    return true;
  }, [getItemById, updateItem]);

  // Complete current step and move to next - HARDENED: validates operatorStation matches item's currentStep
  const completeStep = useCallback((
    itemId: string,
    operatorId: string,
    operatorName: string,
    operatorStation: WorkflowStep
  ): boolean => {
    const item = getItemById(itemId);
    if (!item) return false;

    // HARDENED LOGIC: Check station permissions at the context level
    if (operatorStation !== item.currentStep) {
      console.warn(`Process Violation: Station ${operatorStation} cannot complete work for ${item.currentStep}`);
      return false;
    }

    if (!canCompleteStep(item)) return false;

    const nextStep = getNextStep(item.currentStep);

    updateItem(itemId, (i) => {
      // Record the operatorStation in audit history for audit integrity
      i.auditHistory = [
        ...i.auditHistory,
        createAuditEntry(i.currentStep, 'Completed', operatorId, operatorName, operatorStation),
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
        createAuditEntry(i.currentStep, 'Placed on Hold', operatorId, operatorName, undefined, `Reason: ${reason}`),
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
          undefined,
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
          undefined,
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

  // Ship item - HARDENED: validates operatorStation matches 'Ship'
  const shipItem = useCallback((
    itemId: string,
    operatorId: string,
    operatorName: string,
    operatorStation: WorkflowStep
  ): boolean => {
    const item = getItemById(itemId);
    if (!item) return false;

    // HARDENED LOGIC: Check station permissions at the context level
    if (operatorStation !== 'Ship') {
      console.warn(`Process Violation: Station ${operatorStation} cannot ship items`);
      return false;
    }

    const { canShip } = canShipItem(item);
    if (!canShip) return false;

    updateItem(itemId, (i) => {
      i.status = 'Completed';
      i.auditHistory = [
        ...i.auditHistory,
        createAuditEntry(i.currentStep, 'Shipped', operatorId, operatorName, operatorStation),
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
        createAuditEntry(i.currentStep, 'Passed QC', operatorId, operatorName, 'QC'),
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
        createAuditEntry(i.currentStep, 'Failed QC', operatorId, operatorName, 'QC', `Reason: ${reason}`),
      ];
    });
    return true;
  }, [getItemById, updateItem]);

  // General Stock order ID for items without specific customer orders
  const GENERAL_STOCK_ORDER_ID = 'GENERAL-STOCK';

  // Add new item to workflow (intake at Saw station)
  // If orderId is provided and valid, link to that order; otherwise use General Stock
  const addNewItem = useCallback((
    itemId: string,
    operatorId: string,
    operatorName: string,
    orderId?: string
  ): WorkItem | null => {
    // Check if item already exists
    const existingItem = getItemById(itemId);
    if (existingItem) return null;

    const now = new Date();

    // Determine which order to associate with
    let targetOrderId = GENERAL_STOCK_ORDER_ID;
    let orderNote = 'Item added to General Stock via scanner intake';

    if (orderId && orderId.trim()) {
      // Check if the provided order ID exists
      const existingOrder = orders.find((o) => o.id === orderId.trim());
      if (existingOrder) {
        targetOrderId = orderId.trim();
        orderNote = `Item added to order ${existingOrder.orderNumber} via scanner intake`;
      } else {
        // Order ID provided but not found - still use it but note it's unverified
        targetOrderId = orderId.trim();
        orderNote = `Item added to order ${orderId} (unverified) via scanner intake`;
      }
    }

    const newItem: WorkItem = {
      id: itemId,
      orderId: targetOrderId,
      name: `Intake Item ${itemId}`,
      description: 'Item added via barcode intake',
      quantity: 1,
      currentStep: 'Saw',
      status: 'Pending',
      onHold: false,
      priority: 'Normal',
      auditHistory: [
        createAuditEntry('Saw', 'Created', operatorId, operatorName, 'Saw', orderNote),
      ],
      createdAt: now,
      updatedAt: now,
    };

    setOrders((prevOrders) => {
      // If linking to an existing order, add item to that order
      const existingOrder = prevOrders.find((o) => o.id === targetOrderId);
      if (existingOrder) {
        return prevOrders.map((order) =>
          order.id === targetOrderId
            ? { ...order, items: [...order.items, newItem] }
            : order
        );
      }

      // If it's General Stock or a new order ID, create/find General Stock order
      if (targetOrderId === GENERAL_STOCK_ORDER_ID) {
        const generalStockOrder = prevOrders.find((o) => o.id === GENERAL_STOCK_ORDER_ID);
        if (generalStockOrder) {
          return prevOrders.map((order) =>
            order.id === GENERAL_STOCK_ORDER_ID
              ? { ...order, items: [...order.items, newItem] }
              : order
          );
        } else {
          // Create new General Stock order
          const newOrder: Order = {
            id: GENERAL_STOCK_ORDER_ID,
            customerName: 'General Stock',
            orderNumber: 'STOCK-001',
            items: [newItem],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            createdAt: now,
          };
          return [...prevOrders, newOrder];
        }
      }

      // For unverified order IDs, create a placeholder order
      const newOrder: Order = {
        id: targetOrderId,
        customerName: `Order ${targetOrderId}`,
        orderNumber: targetOrderId,
        items: [newItem],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        createdAt: now,
      };
      return [...prevOrders, newOrder];
    });

    return newItem;
  }, [getItemById, orders]);

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
        addNewItem,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

