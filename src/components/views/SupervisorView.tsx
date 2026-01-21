import { useState, useEffect } from 'react';
import {
  BarChart3,
  AlertTriangle,
  Clock,
  CheckCircle,
  Package,
  TrendingUp,
  Timer,
  History,
  AlertOctagon,
} from 'lucide-react';
import type { WorkItem, WorkflowStep } from '../../types';
import { WORKFLOW_STEPS } from '../../types';
import { WorkItemCard } from '../WorkItemCard';
import { HistoryTimeline } from '../HistoryTimeline';
import { useWorkflow } from '../../contexts/WorkflowContext';

interface SupervisorViewProps {
  readonly scannedItem?: WorkItem | null;
  readonly onClearScan?: () => void;
}

// Helper to calculate hours since a date
function getHoursSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
}

// Helper to format duration
function formatDuration(hours: number): string {
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}

export function SupervisorView({ scannedItem, onClearScan }: SupervisorViewProps) {
  const { orders, getAllItems, getItemById, getOrderById } = useWorkflow();

  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Handle scanned item from parent
  useEffect(() => {
    if (scannedItem) {
      const freshItem = getItemById(scannedItem.id);
      if (freshItem) {
        setSelectedItem(freshItem);
      }
    }
  }, [scannedItem, getItemById]);

  const allItems = getAllItems();
  console.log('All Items:', allItems);

  // Calculate statistics
  const stats = {
    total: allItems.length,
    completed: allItems.filter((i) => i.status === 'Completed').length,
    inProgress: allItems.filter((i) => i.status === 'In Progress').length,
    pending: allItems.filter((i) => i.status === 'Pending').length,
    onHold: allItems.filter((i) => i.onHold).length,
    byStep: WORKFLOW_STEPS.reduce(
      (acc, step) => {
        acc[step] = allItems.filter((i) => i.currentStep === step && !i.onHold).length;
        return acc;
      },
      {} as Record<WorkflowStep, number>
    ),
  };

  // Items on hold (priority for supervisor)
  const holdItems = allItems.filter((i) => i.onHold);

  // Aging holds - items on hold for more than 24 hours
  const agingHolds = holdItems.filter((item) => {
    if (!item.holdTimestamp) return false;
    const hoursSinceHold = getHoursSince(item.holdTimestamp);
    return hoursSinceHold >= 24;
  }).sort((a, b) => {
    // Sort by oldest first
    const aTime = a.holdTimestamp?.getTime() || 0;
    const bTime = b.holdTimestamp?.getTime() || 0;
    return aTime - bTime;
  });

  // Recent holds (less than 24 hours)
  const recentHolds = holdItems.filter((item) => {
    if (!item.holdTimestamp) return true; // Include items without timestamp
    const hoursSinceHold = getHoursSince(item.holdTimestamp);
    return hoursSinceHold < 24;
  });

  // Urgent items
  const urgentItems = allItems.filter(
    (i) => i.priority === 'Urgent' && i.status !== 'Completed'
  );

  // Overdue orders
  const overdueOrders = orders.filter((o) => o.dueDate < new Date());

  const handleItemClick = (item: WorkItem) => {
    const freshItem = getItemById(item.id);
    setSelectedItem(freshItem || item);
    onClearScan?.();
  };

  // Get fresh item data
  const currentItem = selectedItem ? getItemById(selectedItem.id) : null;
  const currentOrder = currentItem ? getOrderById(currentItem.orderId) : null;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Package className="w-4 h-4" />
            <span className="text-sm">Total Items</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">In Progress</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">{stats.inProgress}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Completed</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">On Hold</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{stats.onHold}</p>
        </div>
      </div>

      {/* Aging Holds Alert Banner */}
      {agingHolds.length > 0 && (
        <div className="bg-red-900/40 border-2 border-red-600 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-red-400" />
            <div>
              <h3 className="text-lg font-bold text-red-400">
                CRITICAL: {agingHolds.length} Item{agingHolds.length > 1 ? 's' : ''} On Hold &gt; 24 Hours
              </h3>
              <p className="text-red-300 text-sm">Immediate supervisor attention required</p>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Distribution */}
      <section className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          WIP by Department
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {WORKFLOW_STEPS.map((step) => {
            const count = stats.byStep[step];
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            const holdCount = allItems.filter(
              (i) => i.currentStep === step && i.onHold
            ).length;

            return (
              <div key={step} className="text-center">
                <div className="bg-gray-800 rounded-lg p-4 mb-2">
                  <p className="text-2xl font-bold text-white">{count}</p>
                  {holdCount > 0 && (
                    <p className="text-sm text-red-400">({holdCount} hold)</p>
                  )}
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-300">{step}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Aging Holds - Critical Items */}
          {agingHolds.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Timer className="w-5 h-5 text-red-500 animate-pulse" />
                Aging Holds (&gt; 24 Hours)
                <span className="ml-auto text-sm font-normal text-red-400">{agingHolds.length} items</span>
              </h3>
              <div className="space-y-3">
                {agingHolds.map((item) => {
                  const hoursSinceHold = item.holdTimestamp ? getHoursSince(item.holdTimestamp) : 0;
                  return (
                    <div key={item.id} className="relative">
                      {/* Time Badge */}
                      <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 px-2 py-1 bg-red-600 rounded-full text-xs font-bold text-white">
                        <Timer className="w-3 h-3" />
                        {formatDuration(hoursSinceHold)}
                      </div>
                      <div className="border-2 border-red-600 rounded-lg">
                        <WorkItemCard item={item} onClick={handleItemClick} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Recent Holds */}
          <section>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Recent Holds (&lt; 24 Hours)
              <span className="ml-auto text-sm font-normal text-gray-400">{recentHolds.length} items</span>
            </h3>
            {recentHolds.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentHolds.map((item) => {
                  const hoursSinceHold = item.holdTimestamp ? getHoursSince(item.holdTimestamp) : 0;
                  return (
                    <div key={item.id} className="relative">
                      {item.holdTimestamp && (
                        <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 px-2 py-1 bg-yellow-600 rounded-full text-xs font-bold text-white">
                          <Clock className="w-3 h-3" />
                          {formatDuration(hoursSinceHold)}
                        </div>
                      )}
                      <WorkItemCard item={item} onClick={handleItemClick} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-gray-400">No items on hold</p>
              </div>
            )}
          </section>

          {/* Urgent Items */}
          {urgentItems.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-400" />
                Urgent Items
                <span className="ml-auto text-sm font-normal text-gray-400">{urgentItems.length} items</span>
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {urgentItems.map((item) => (
                  <WorkItemCard key={item.id} item={item} onClick={handleItemClick} />
                ))}
              </div>
            </section>
          )}

          {/* Overdue Orders */}
          {overdueOrders.length > 0 && (
            <section className="bg-red-900/20 border border-red-700 rounded-lg p-4">
              <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Overdue Orders ({overdueOrders.length})
              </h4>
              {overdueOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-red-800 last:border-b-0"
                >
                  <div>
                    <p className="font-mono text-sm text-red-300">{order.id}</p>
                    <p className="text-white">{order.customerName}</p>
                  </div>
                  <p className="text-red-400 text-sm">
                    Due: {order.dueDate.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Item Detail Panel */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Item Details</h3>

          {currentItem ? (
            <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 space-y-4">
              {/* Item Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-blue-400 text-sm">{currentItem.id}</p>
                  <h4 className="text-xl font-semibold text-white mt-1">{currentItem.name}</h4>
                  <p className="text-gray-400 text-sm mt-1">Order: {currentItem.orderId}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white p-2 min-h-[44px] min-w-[44px] text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Hold Banner with Duration */}
              {currentItem.onHold && (
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-400 font-medium">
                      <AlertTriangle className="w-5 h-5" />
                      ON HOLD
                    </div>
                    {currentItem.holdTimestamp && (
                      <div className="flex items-center gap-1 text-red-300 text-sm">
                        <Timer className="w-4 h-4" />
                        {formatDuration(getHoursSince(currentItem.holdTimestamp))}
                      </div>
                    )}
                  </div>
                  {currentItem.holdReason && (
                    <p className="text-red-300 text-sm mt-2">Reason: {currentItem.holdReason}</p>
                  )}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Current Step</p>
                  <p className="text-lg font-bold text-white">{currentItem.currentStep}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className={`text-lg font-bold ${
                    currentItem.status === 'Completed' ? 'text-green-400' :
                    currentItem.status === 'In Progress' ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {currentItem.status}
                  </p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Priority</p>
                  <p className={`text-lg font-bold ${
                    currentItem.priority === 'Urgent' ? 'text-red-400' :
                    currentItem.priority === 'High' ? 'text-yellow-400' : 'text-white'
                  }`}>
                    {currentItem.priority}
                  </p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Quantity</p>
                  <p className="text-lg font-bold text-white">{currentItem.quantity}</p>
                </div>
              </div>

              {/* Customer Info */}
              {currentOrder && (
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Customer</p>
                  <p className="text-white font-medium">{currentOrder.customerName}</p>
                  <p className="text-gray-400 text-sm">
                    Due: {currentOrder.dueDate.toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* History Toggle */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3
                           bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium
                           rounded-lg transition-colors min-h-[48px]"
              >
                <History className="w-5 h-5" />
                {showHistory ? 'Hide' : 'Show'} History ({currentItem.auditHistory.length})
              </button>

              {showHistory && (
                <div className="pt-4 border-t border-gray-700">
                  <h5 className="text-sm font-medium text-gray-400 mb-3">Audit History</h5>
                  <HistoryTimeline history={currentItem.auditHistory} maxItems={10} />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Scan or select an item to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
