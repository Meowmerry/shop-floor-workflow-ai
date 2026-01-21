import { useMemo, useState, useEffect } from 'react';
import { Play, Pause, CheckCircle, AlertTriangle, RotateCcw, History } from 'lucide-react';
import type { WorkItem, WorkflowStep, HoldReason } from '../../types';
import { WORKFLOW_STEPS, HOLD_REASONS } from '../../types';
import { WorkItemCard } from '../WorkItemCard';
import { HistoryTimeline } from '../HistoryTimeline';
import { ConfirmDialog } from '../ConfirmDialog';
import { useWorkflow } from '../../contexts/WorkflowContext';
import  {useAuth} from '../../contexts';

interface OperatorViewProps {
  readonly scannedItem?: WorkItem | null;
  readonly onClearScan?: () => void;
}

export function OperatorView({ scannedItem, onClearScan }: OperatorViewProps) {
  const { currentUser } = useAuth();
  const {
    getAllItems,
    getItemById,
    startStep,
    completeStep,
    canCompleteStep,
    placeOnHold,
    releaseHold,
    sendToRework,
  } = useWorkflow();

  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [activeStep, setActiveStep] = useState<WorkflowStep>('Saw');
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState<HoldReason | ''>('');
  const [showHistory, setShowHistory] = useState(false);
  const [showReworkConfirm, setShowReworkConfirm] = useState(false);

  // Handle scanned item from parent
  useEffect(() => {
    if (scannedItem) {
      const freshItem = getItemById(scannedItem.id);
      if (freshItem) {
        setSelectedItem(freshItem);
        if (['Saw', 'Thread', 'CNC'].includes(freshItem.currentStep)) {
          setActiveStep(freshItem.currentStep);
        }
      }
    }
  }, [scannedItem, getItemById]);

  // Get items for the active step
  const allItems = getAllItems();
  const stepItems = allItems.filter(
    (item) => item.currentStep === activeStep && !item.onHold
  );
  const holdItems = allItems.filter(
    (item) => item.currentStep === activeStep && item.onHold
  );

  const handleItemClick = (item: WorkItem) => {
    const freshItem = getItemById(item.id);
    setSelectedItem(freshItem || item);
    onClearScan?.();
  };

  const handleStartStep = () => {
    if (!selectedItem || !currentUser) return;
    if (startStep(selectedItem.id, currentUser.id, currentUser.name)) {
      setSelectedItem(getItemById(selectedItem.id) || null);
    }
  };

  const handleCompleteStep = () => {
    if (!selectedItem || !currentUser) return;
    if (completeStep(selectedItem.id, currentUser.id, currentUser.name)) {
      setSelectedItem(null);
    }
  };

  const handlePlaceOnHold = () => {
    if (!selectedItem || !currentUser || !holdReason) return;
    if (placeOnHold(selectedItem.id, holdReason, currentUser.id, currentUser.name)) {
      setSelectedItem(getItemById(selectedItem.id) || null);
    }
    setShowHoldModal(false);
    setHoldReason('');
  };

  const handleReleaseHold = () => {
    if (!selectedItem || !currentUser) return;
    if (releaseHold(selectedItem.id, currentUser.id, currentUser.name)) {
      setSelectedItem(getItemById(selectedItem.id) || null);
    }
  };

  const handleSendToRework = () => {
    if (!selectedItem || !currentUser) return;
    setShowReworkConfirm(true);
  };

  // Get fresh item data
  const currentItem = selectedItem ? getItemById(selectedItem.id) : null;

  const recentActivity = useMemo(() => {
    if (!currentUser) return [];
    const entries = getAllItems()
      .flatMap((i) =>
        i.auditHistory.map((h) => ({
          ...h,
          itemId: i.id,
          itemName: i.name,
        }))
      )
      .filter((h) => h.operatorId === currentUser.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return entries.slice(0, 5);
  }, [currentUser, getAllItems]);

  return (
    <div className="space-y-6">
      {/* Workflow Step Tabs */}
      <section>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {WORKFLOW_STEPS.slice(0, 3).map((step) => {
            const count = allItems.filter(
              (item) => item.currentStep === step && !item.onHold
            ).length;
            const holdCount = allItems.filter(
              (item) => item.currentStep === step && item.onHold
            ).length;

            return (
              <button
                key={step}
                onClick={() => setActiveStep(step)}
                className={`
                  flex items-center gap-3 px-6 py-4 rounded-lg font-medium
                  transition-all duration-150 min-h-[56px] min-w-[140px]
                  ${activeStep === step
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-lg">{step}</span>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-sm ${activeStep === step ? 'bg-blue-500' : 'bg-gray-700'}`}>
                    {count}
                  </span>
                  {holdCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-sm bg-red-600">{holdCount}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Queue */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-400" />
            Active Queue - {activeStep}
            <span className="ml-auto text-sm font-normal text-gray-400">{stepItems.length} items</span>
          </h3>

          {stepItems.length > 0 ? (
            <div className="space-y-3">
              {stepItems.map((item) => (
                <WorkItemCard key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-400">No items in queue for {activeStep}</p>
            </div>
          )}

          {/* Hold Items */}
          {holdItems.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                On Hold
                <span className="ml-auto text-sm font-normal text-gray-400">{holdItems.length} items</span>
              </h3>
              <div className="space-y-3">
                {holdItems.map((item) => (
                  <WorkItemCard key={item.id} item={item} onClick={handleItemClick} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Item Detail */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Item Details</h3>

          {currentItem ? (
            <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
              <div className="space-y-4">
                {/* Item Header */}
                <div>
                  <p className="font-mono text-blue-400 text-sm">{currentItem.id}</p>
                  <h4 className="text-xl font-semibold text-white mt-1">{currentItem.name}</h4>
                  {currentItem.description && (
                    <p className="text-gray-400 text-sm mt-1">{currentItem.description}</p>
                  )}
                </div>

                {/* Status Banner */}
                {currentItem.onHold && (
                  <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400 font-medium">
                      <AlertTriangle className="w-5 h-5" />
                      ON HOLD
                    </div>
                    {currentItem.holdReason && (
                      <p className="text-red-300 text-sm mt-1">Reason: {currentItem.holdReason}</p>
                    )}
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
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
                    <p className="text-xs text-gray-500 uppercase">Quantity</p>
                    <p className="text-lg font-bold text-white">{currentItem.quantity}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  {currentItem.status === 'Pending' && !currentItem.onHold && (
                    <button
                      onClick={handleStartStep}
                      className="w-full flex items-center justify-center gap-2 px-4 py-4
                                 bg-blue-600 hover:bg-blue-500 text-white font-medium
                                 rounded-lg transition-colors min-h-[56px]"
                    >
                      <Play className="w-5 h-5" />
                      Start {currentItem.currentStep}
                    </button>
                  )}

                  {currentItem.status === 'In Progress' && !currentItem.onHold && (
                    <button
                      onClick={handleCompleteStep}
                      disabled={!canCompleteStep(currentItem)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-4
                        font-medium rounded-lg transition-colors min-h-[56px]
                        ${canCompleteStep(currentItem)
                          ? 'bg-green-600 hover:bg-green-500 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                    >
                      <CheckCircle className="w-5 h-5" />
                      Complete {currentItem.currentStep}
                    </button>
                  )}

                  {currentItem.onHold ? (
                    <button
                      onClick={handleReleaseHold}
                      className="w-full flex items-center justify-center gap-2 px-4 py-4
                                 bg-yellow-600 hover:bg-yellow-500 text-white font-medium
                                 rounded-lg transition-colors min-h-[56px]"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Release Hold
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowHoldModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-4
                                 bg-yellow-600 hover:bg-yellow-500 text-white font-medium
                                 rounded-lg transition-colors min-h-[56px]"
                    >
                      <Pause className="w-5 h-5" />
                      Place on Hold
                    </button>
                  )}

                  <button
                    onClick={handleSendToRework}
                    className="w-full flex items-center justify-center gap-2 px-4 py-4
                               bg-orange-600 hover:bg-orange-500 text-white font-medium
                               rounded-lg transition-colors min-h-[56px]"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Send to Rework
                  </button>

                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3
                               bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium
                               rounded-lg transition-colors min-h-[48px]"
                  >
                    <History className="w-5 h-5" />
                    {showHistory ? 'Hide' : 'Show'} History ({currentItem.auditHistory.length})
                  </button>
                </div>

                {showHistory && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h5 className="text-sm font-medium text-gray-400 mb-3">Audit History</h5>
                    <HistoryTimeline history={currentItem.auditHistory} maxItems={5} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <p className="text-gray-400">Scan or select an item to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {currentUser && (
        <section className="bg-gray-900 rounded-xl p-5 border border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <History className="w-5 h-5 text-blue-400" />
            Recent Activity (Last 5)
            <span className="ml-auto text-sm font-normal text-gray-400">{currentUser.name}</span>
          </h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 bg-gray-800 rounded-lg p-3 border border-gray-700"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-white truncate">
                        <span className="font-mono text-blue-400">{a.itemId}</span> — {a.action}
                      </p>
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {a.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {a.step} • {a.itemName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No recent actions yet.</p>
          )}
        </section>
      )}

      {/* Hold Reason Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              Place on Hold
            </h3>
            <p className="text-gray-400 mb-4">Select a reason for placing this item on hold:</p>
            <select
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value as HoldReason)}
              className="w-full p-4 bg-gray-900 border border-gray-600 rounded-lg text-white text-lg min-h-[56px] mb-4"
            >
              <option value="">Select reason...</option>
              {HOLD_REASONS.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowHoldModal(false); setHoldReason(''); }}
                className="flex-1 px-4 py-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors min-h-[56px]"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOnHold}
                disabled={!holdReason}
                className={`flex-1 px-4 py-4 font-medium rounded-lg transition-colors min-h-[56px]
                  ${holdReason ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
              >
                Confirm Hold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Rework */}
      <ConfirmDialog
        open={showReworkConfirm}
        title="Confirm Action?"
        message={
          currentItem ? (
            <>
              Send <span className="font-mono text-blue-300">{currentItem.id}</span> back to <strong>Saw</strong> for rework?
            </>
          ) : (
            'Send this item back to Saw for rework?'
          )
        }
        confirmText="Send to Rework"
        cancelText="Cancel"
        variant="warning"
        onCancel={() => setShowReworkConfirm(false)}
        onConfirm={() => {
          if (!selectedItem || !currentUser) return;
          sendToRework(selectedItem.id, currentUser.id, currentUser.name);
          setSelectedItem(null);
          setActiveStep('Saw');
          setShowReworkConfirm(false);
        }}
      />
    </div>
  );
}
