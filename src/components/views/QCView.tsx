import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, ClipboardList, RotateCcw, History, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import type { WorkItem, HoldReason } from '../../types';
import { HOLD_REASONS } from '../../types';
import { WorkItemCard } from '../WorkItemCard';
import { HistoryTimeline } from '../HistoryTimeline';
import { ConfirmDialog } from '../ConfirmDialog';
import { useAuth, useWorkflow } from '../../hooks';


interface QCViewProps {
  readonly scannedItem?: WorkItem | null;
  readonly onClearScan?: () => void;
}

export function QCView({ scannedItem, onClearScan }: QCViewProps) {
  const { currentUser } = useAuth();
  const {
    getAllItems,
    getItemById,
    startStep,
    passQC,
    failQC,
    releaseHold,
    sendToRework,
  } = useWorkflow();

  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [showFailModal, setShowFailModal] = useState(false);
  const [failReason, setFailReason] = useState<HoldReason | ''>('');
  const [showHistory, setShowHistory] = useState(false);
  const [showReworkConfirm, setShowReworkConfirm] = useState(false);
  const [expandedPending, setExpandedPending] = useState(true);
  const [expandedInProgress, setExpandedInProgress] = useState(true);
  const [expandedHold, setExpandedHold] = useState(true);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    'Dimensional Check': false,
    'Surface Finish': false,
    'Thread Quality': false,
    'Documentation': false,
  });
  
  // Check if current user is Supervisor
  const isSupervisor = currentUser?.role === 'Supervisor';
  
    const resetChecklist = () => {
    setChecklist({
      'Dimensional Check': false,
      'Surface Finish': false,
      'Thread Quality': false,
      'Documentation': false,
    });
  };


  // Handle scanned item from parent - update selection when scannedItem changes
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  if (scannedItem && scannedItem.id !== lastScannedId) {
    const freshItem = getItemById(scannedItem.id);
    if (freshItem) {
      setSelectedItem(freshItem);
      resetChecklist();
      setLastScannedId(scannedItem.id);
    }
  }


  // Get items at QC step
  const allItems = getAllItems();
  const qcItems = allItems.filter((item) => item.currentStep === 'QC');
  const pendingItems = qcItems.filter((item) => item.status === 'Pending' && !item.onHold);
  const inProgressItems = qcItems.filter((item) => item.status === 'In Progress' && !item.onHold);
  const holdItems = qcItems.filter((item) => item.onHold);

  const allChecked = Object.values(checklist).every(Boolean);

  const handleItemClick = (item: WorkItem) => {
    const freshItem = getItemById(item.id);
    setSelectedItem(freshItem || item);
    resetChecklist();
    onClearScan?.();
  };

  const handleStartInspection = () => {
    if (!selectedItem || !currentUser) return;
    // Pass 'QC' as operatorStation for state machine validation
    if (startStep(selectedItem.id, currentUser.id, currentUser.name, 'QC')) {
      setSelectedItem(getItemById(selectedItem.id) || null);
    }
  };

  const handlePassQC = () => {
    if (!selectedItem || !currentUser) return;
    if (!allChecked) {
      alert('Please complete all checklist items before passing inspection.');
      return;
    }
    if (passQC(selectedItem.id, currentUser.id, currentUser.name)) {
      setSelectedItem(null);
      resetChecklist();
    }
  };

  const handleFailQC = () => {
    if (!selectedItem || !currentUser || !failReason) return;
    if (failQC(selectedItem.id, failReason, currentUser.id, currentUser.name)) {
      setSelectedItem(getItemById(selectedItem.id) || null);
    }
    setShowFailModal(false);
    setFailReason('');
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

  const toggleChecklistItem = (item: string) => {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  // Get fresh item data
  const currentItem = selectedItem ? getItemById(selectedItem.id) : null;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-400">Pending Inspection</p>
          <p className="text-3xl font-bold text-white mt-1">{pendingItems.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-yellow-500">
          <p className="text-sm text-gray-400">In Progress</p>
          <p className="text-3xl font-bold text-white mt-1">{inProgressItems.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-400">On Hold</p>
          <p className="text-3xl font-bold text-white mt-1">{holdItems.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-400">Total at QC</p>
          <p className="text-3xl font-bold text-white mt-1">{qcItems.length}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QC Queue */}
        <div className="lg:col-span-2 space-y-6">    
          {/* Pending Inspection */}
          <section>
            <button
              onClick={() => setExpandedPending(!expandedPending)}
              className="w-full text-lg font-semibold text-white flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity group"
            >
              {expandedPending ? (
                <ChevronUp className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              ) : (
                <ChevronDown className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              )}
              <ClipboardList className="w-5 h-5 text-blue-400" />
              Pending Inspection
              <span className="ml-auto text-sm font-normal text-gray-400">{pendingItems.length} items</span>
            </button>
            {expandedPending && (
              <>
                {pendingItems.length > 0 ? (
                  <div className="space-y-3">
                    {pendingItems.map((item) => (
                      <WorkItemCard key={item.id} item={item} onClick={handleItemClick} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <p className="text-gray-400">No items pending inspection</p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* In Progress Inspection */}
          {inProgressItems.length > 0 && (
            <section>
              <button
                onClick={() => setExpandedInProgress(!expandedInProgress)}
                className="w-full text-lg font-semibold text-white flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity group"
              >
                {expandedInProgress ? (
                  <ChevronUp className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                )}
                <ClipboardList className="w-5 h-5 text-yellow-400" />
                In Progress
                <span className="ml-auto text-sm font-normal text-gray-400">{inProgressItems.length} items</span>
              </button>
              {expandedInProgress && (
                <div className="space-y-3">
                  {inProgressItems.map((item) => (
                    <WorkItemCard key={item.id} item={item} onClick={handleItemClick} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* On Hold */}
          {holdItems.length > 0 && (
            <section>
              <button
                onClick={() => setExpandedHold(!expandedHold)}
                className="w-full text-lg font-semibold text-white flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity group"
              >
                {expandedHold ? (
                  <ChevronUp className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                )}
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Items on Hold
                <span className="ml-auto text-sm font-normal text-gray-400">{holdItems.length} items</span>
              </button>
              {expandedHold && (
                <div className="space-y-3">
                  {holdItems.map((item) => (
                    <WorkItemCard key={item.id} item={item} onClick={handleItemClick} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Inspection Panel */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Inspection Panel</h3>

          {currentItem ? (
            <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 space-y-4">
              {/* Item Info */}
              <div>
                <p className="font-mono text-blue-400 text-sm">{currentItem.id}</p>
                <h4 className="text-xl font-semibold text-white mt-1">{currentItem.name}</h4>
                <p className="text-gray-400 text-sm mt-1">Order: {currentItem.orderId}</p>
              </div>

              {/* Hold Banner */}
              {currentItem.onHold && (
                <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 font-medium">
                    <AlertTriangle className="w-5 h-5" />
                    QC HOLD ACTIVE
                  </div>
                  {currentItem.holdReason && (
                    <p className="text-red-300 text-sm mt-1">Reason: {currentItem.holdReason}</p>
                  )}
                </div>
              )}

              {/* Checklist */}
              {!currentItem.onHold && currentItem.status === 'In Progress' && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-300 mb-3">
                    QC Checklist
                    {isSupervisor && <span className="text-gray-500 text-xs ml-2">(View Only)</span>}
                  </h5>
                  <div className="space-y-2">
                    {Object.keys(checklist).map((check) => (
                      <label
                        key={check}
                        className={`flex items-center gap-3 p-2 rounded min-h-[44px] ${
                          isSupervisor
                            ? 'cursor-not-allowed opacity-60'
                            : 'hover:bg-gray-800 cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checklist[check]}
                          onChange={() => !isSupervisor && toggleChecklistItem(check)}
                          disabled={isSupervisor}
                          className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500 disabled:cursor-not-allowed"
                        />
                        <span className={checklist[check] ? 'text-green-400' : 'text-gray-300'}>{check}</span>
                      </label>
                    ))}
                  </div>
                  {!isSupervisor && !allChecked && (
                    <p className="text-yellow-400 text-xs mt-3">Complete all checks to pass inspection</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2">
                {/* Read-Only Badge for Supervisor */}
                {isSupervisor && (
                  <div className="bg-gray-700 rounded-lg p-3 border border-gray-600 flex items-center gap-2 text-gray-300">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Read-Only Mode</span>
                  </div>
                )}

                {!isSupervisor && (
                  <>
                    {/* Start Inspection */}
                    {currentItem.status === 'Pending' && !currentItem.onHold && (
                      <button
                        onClick={handleStartInspection}
                        className="w-full flex items-center justify-center gap-2 px-4 py-4
                                   bg-blue-600 hover:bg-blue-500 text-white font-medium
                                   rounded-lg transition-colors min-h-[56px]"
                      >
                        <ClipboardList className="w-5 h-5" />
                        Start Inspection
                      </button>
                    )}

                    {/* Pass/Fail buttons for In Progress */}
                    {currentItem.status === 'In Progress' && !currentItem.onHold && (
                      <>
                        <button
                          onClick={handlePassQC}
                          disabled={!allChecked}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-4
                            font-medium rounded-lg transition-colors min-h-[56px]
                            ${allChecked
                              ? 'bg-green-600 hover:bg-green-500 text-white'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                        >
                          <CheckCircle className="w-5 h-5" />
                          Pass Inspection
                        </button>
                        <button
                          onClick={() => setShowFailModal(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-4
                                     bg-red-600 hover:bg-red-500 text-white font-medium
                                     rounded-lg transition-colors min-h-[56px]"
                        >
                          <XCircle className="w-5 h-5" />
                          Fail / Place on Hold
                        </button>
                      </>
                    )}

                    {/* Release Hold */}
                    {currentItem.onHold && (
                      <button
                        onClick={handleReleaseHold}
                        className="w-full flex items-center justify-center gap-2 px-4 py-4
                                   bg-yellow-600 hover:bg-yellow-500 text-white font-medium
                                   rounded-lg transition-colors min-h-[56px]"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Release Hold
                      </button>
                    )}

                    {/* Rework */}
                    <button
                      onClick={handleSendToRework}
                      className="w-full flex items-center justify-center gap-2 px-4 py-4
                                 bg-orange-600 hover:bg-orange-500 text-white font-medium
                                 rounded-lg transition-colors min-h-[56px]"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Send to Rework
                    </button>
                  </>
                )}

                {/* History Toggle - Always Available */}
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  title={isSupervisor ? "View audit history (Supervisor read-only)" : "View audit history"}
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
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Scan or select an item to inspect</p>
            </div>
          )}
        </div>
      </div>

      {/* Fail Reason Modal */}
      {showFailModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-400" />
              Fail Inspection
            </h3>
            <p className="text-gray-400 mb-4">Select the reason for failing this inspection:</p>
            <select
              value={failReason}
              onChange={(e) => setFailReason(e.target.value as HoldReason)}
              className="w-full p-4 bg-gray-900 border border-gray-600 rounded-lg text-white text-lg min-h-[56px] mb-4"
            >
              <option value="">Select reason...</option>
              {HOLD_REASONS.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowFailModal(false); setFailReason(''); }}
                className="flex-1 px-4 py-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors min-h-[56px]"
              >
                Cancel
              </button>
              <button
                onClick={handleFailQC}
                disabled={!failReason}
                className={`flex-1 px-4 py-4 font-medium rounded-lg transition-colors min-h-[56px]
                  ${failReason ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
              >
                Confirm Fail
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
          sendToRework(selectedItem.id, currentUser.id, currentUser.name, 'Failed QC inspection - sent to rework');
          setSelectedItem(null);
          resetChecklist();
          setShowReworkConfirm(false);
        }}
      />
    </div>
  );
}
