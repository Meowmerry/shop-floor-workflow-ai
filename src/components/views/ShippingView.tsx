import { useState } from 'react';
import { Package, Truck, CheckCircle, Printer, MapPin, AlertTriangle, History, AlertOctagon, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import type { WorkItem } from '../../types';
import { WorkItemCard } from '../WorkItemCard';
import { HistoryTimeline } from '../HistoryTimeline';
import { ConfirmDialog } from '../ConfirmDialog';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useAuth } from '../../contexts';
import { generatePackingSlipHTML } from '../../utils/packingSlip';

interface ShippingViewProps {
  readonly scannedItem?: WorkItem | null;
  readonly onClearScan?: () => void;
}

export function ShippingView({ scannedItem, onClearScan }: ShippingViewProps) {
  const { currentUser } = useAuth();
  const {
    orders,
    getAllItems,
    getItemById,
    getOrderById,
    startStep,
    shipItem,
    canShipItem,
  } = useWorkflow();

  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showShipConfirm, setShowShipConfirm] = useState(false);
  const [expandedPending, setExpandedPending] = useState(true);
  const [expandedHold, setExpandedHold] = useState(true);
  const [expandedShipped, setExpandedShipped] = useState(true);

  // Check if current user is Supervisor
  const isSupervisor = currentUser?.role === 'Supervisor';

  // Handle scanned item from parent - update selection when scannedItem changes
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  if (scannedItem && scannedItem.id !== lastScannedId) {
    const freshItem = getItemById(scannedItem.id);
    if (freshItem) {
      setSelectedItem(freshItem);
      setLastScannedId(scannedItem.id);
    }
  }

  // Get items at Ship step
  const allItems = getAllItems();
  const shipItems = allItems.filter((item) => item.currentStep === 'Ship');
  const pendingShip = shipItems.filter((item) => item.status !== 'Completed' && !item.onHold);
  const holdItems = shipItems.filter((item) => item.onHold);
  const shippedItems = shipItems.filter((item) => item.status === 'Completed');

  // Get orders ready to ship (all items at Ship step and not on hold)
  const ordersReadyToShip = orders.filter((order) =>
    order.items.every((item) => item.currentStep === 'Ship' && !item.onHold)
  );

  const handleItemClick = (item: WorkItem) => {
    const freshItem = getItemById(item.id);
    setSelectedItem(freshItem || item);
    onClearScan?.();
  };

  const handleStartPacking = () => {
    if (!selectedItem || !currentUser) return;
    if (startStep(selectedItem.id, currentUser.id, currentUser.name)) {
      setSelectedItem(getItemById(selectedItem.id) || null);
    }
  };

  const handleShipItem = () => {
    if (!selectedItem || !currentUser) return;
    const { canShip, reason } = canShipItem(selectedItem);
    if (!canShip) {
      alert(reason);
      return;
    }
    setShowShipConfirm(true);
  };

  // Get fresh item data
  const currentItem = selectedItem ? getItemById(selectedItem.id) : null;
  const currentOrder = currentItem ? getOrderById(currentItem.orderId) : null;

  // Check shipping status
  const shipStatus = currentItem ? canShipItem(currentItem) : null;

  const handlePrintPackingSlip = () => {
    if (!currentItem || !currentOrder) return;

    // Create HTML content for the packing slip
    const htmlContent = generatePackingSlipHTML(currentItem, currentOrder, currentUser);
    
    // Open print dialog in a new window
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-400">Ready to Pack</p>
          <p className="text-3xl font-bold text-white mt-1">{pendingShip.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-400">Shipped Today</p>
          <p className="text-3xl font-bold text-white mt-1">{shippedItems.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-gray-400">On Hold</p>
          <p className="text-3xl font-bold text-white mt-1">{holdItems.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-l-yellow-500">
          <p className="text-sm text-gray-400">Orders Ready</p>
          <p className="text-3xl font-bold text-white mt-1">{ordersReadyToShip.length}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ready to Ship */}
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
              <Package className="w-5 h-5 text-blue-400" />
              Ready to Pack & Ship
              <span className="ml-auto text-sm font-normal text-gray-400">{pendingShip.length} items</span>
            </button>
            {expandedPending && (
              <>
                {pendingShip.length > 0 ? (
                  <div className="space-y-3">
                    {pendingShip.map((item) => (
                      <WorkItemCard key={item.id} item={item} onClick={handleItemClick} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-400">All items have been shipped!</p>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Items on Hold */}
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
                Blocked - On Hold
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

          {/* Recently Shipped */}
          {shippedItems.length > 0 && (
            <section>
              <button
                onClick={() => setExpandedShipped(!expandedShipped)}
                className="w-full text-lg font-semibold text-white flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity group"
              >
                {expandedShipped ? (
                  <ChevronUp className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                )}
                <Truck className="w-5 h-5 text-green-400" />
                Recently Shipped
                <span className="ml-auto text-sm font-normal text-gray-400">{shippedItems.length} items</span>
              </button>
              {expandedShipped && (
                <div className="space-y-3">
                  {shippedItems.map((item) => (
                    <WorkItemCard key={item.id} item={item} onClick={handleItemClick} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Shipping Panel */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Shipping Panel</h3>

          {currentItem ? (
            <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 space-y-4">
              {/* SHIPMENT BLOCKED Banner */}
              {currentItem.onHold && (
                <div className="p-4 bg-red-600 rounded-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <AlertOctagon className="w-8 h-8 text-white" />
                    <div>
                      <p className="text-white font-bold text-lg">SHIPMENT BLOCKED</p>
                      <p className="text-red-100 text-sm">QC HOLD ACTIVE</p>
                    </div>
                  </div>
                  {currentItem.holdReason && (
                    <p className="text-red-100 text-sm mt-2 border-t border-red-500 pt-2">
                      Reason: {currentItem.holdReason}
                    </p>
                  )}
                </div>
              )}

              {/* Item Info */}
              <div>
                <p className="font-mono text-blue-400 text-sm">{currentItem.id}</p>
                <h4 className="text-xl font-semibold text-white mt-1">{currentItem.name}</h4>
                <p className="text-gray-400 text-sm mt-1">Order: {currentItem.orderId}</p>
              </div>

              {/* Shipping Info */}
              <div className="bg-gray-900 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-300 mb-3">Shipping Details</h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-400">Ship To:</p>
                      <p className="text-white">{currentOrder?.customerName || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-400">Quantity:</p>
                      <p className="text-white">{currentItem.quantity} units</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-400">Status:</p>
                      <p className={`font-medium ${
                        currentItem.status === 'Completed' ? 'text-green-400' :
                        currentItem.status === 'In Progress' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {currentItem.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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
                    {/* Start Packing */}
                    {currentItem.status === 'Pending' && !currentItem.onHold && (
                      <button
                        onClick={handleStartPacking}
                        className="w-full flex items-center justify-center gap-2 px-4 py-4
                                   bg-blue-600 hover:bg-blue-500 text-white font-medium
                                   rounded-lg transition-colors min-h-[56px]"
                      >
                        <Package className="w-5 h-5" />
                        Start Packing
                      </button>
                    )}

                    {/* Print Packing Slip */}
                    {!currentItem.onHold && currentItem.status !== 'Completed' && (
                      <button
                        onClick={handlePrintPackingSlip}
                        className="w-full flex items-center justify-center gap-2 px-4 py-4
                                   bg-gray-600 hover:bg-gray-500 text-white font-medium
                                   rounded-lg transition-colors min-h-[56px]"
                      >
                        <Printer className="w-5 h-5" />
                        Print Packing Slip
                      </button>
                )}

                    {/* Ship Item */}
                    {currentItem.status === 'In Progress' && (
                      <button
                        onClick={handleShipItem}
                        disabled={!shipStatus?.canShip}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-4
                          font-medium rounded-lg transition-colors min-h-[56px]
                          ${shipStatus?.canShip
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                      >
                        <Truck className="w-5 h-5" />
                        {shipStatus?.canShip ? 'Mark as Shipped' : 'Cannot Ship'}
                      </button>
                    )}

                    {/* Already Shipped */}
                    {currentItem.status === 'Completed' && (
                      <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg text-center">
                        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-green-400 font-medium">Item Shipped</p>
                      </div>
                    )}
                  </>
                )}

                {/* History Toggle - Always Available */}
                <button
                  title={isSupervisor ? "View audit history (Supervisor read-only)" : "View audit history"}
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
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Scan or select an item to ship</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Ship */}
      <ConfirmDialog
        open={showShipConfirm}
        title="Confirm Action?"
        message={
          currentItem ? (
            <>
              Mark <span className="font-mono text-blue-300">{currentItem.id}</span> as <strong>SHIPPED</strong>?
            </>
          ) : (
            'Mark this item as shipped?'
          )
        }
        confirmText="Mark as Shipped"
        cancelText="Cancel"
        variant="danger"
        onCancel={() => setShowShipConfirm(false)}
        onConfirm={() => {
          if (!selectedItem || !currentUser) return;
          if (shipItem(selectedItem.id, currentUser.id, currentUser.name)) {
            setSelectedItem(null);
          }
          setShowShipConfirm(false);
        }}
      />
    </div>
  );
}
