import { Package, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import type { WorkItem } from '../types';
import { WorkflowProgress } from './WorkflowProgress';

interface WorkItemCardProps {
  readonly item: WorkItem;
  readonly onClick?: (item: WorkItem) => void;
  readonly showOrder?: boolean;
}

export function WorkItemCard({
  item,
  onClick,
  showOrder = true,
}: WorkItemCardProps) {
  const priorityColors: Record<WorkItem['priority'], string> = {
    Low: 'border-l-gray-500',
    Normal: 'border-l-blue-500',
    High: 'border-l-yellow-500',
    Urgent: 'border-l-red-500',
  };

  const statusColors: Record<WorkItem['status'], { bg: string; text: string }> = {
    Pending: { bg: 'bg-gray-700', text: 'text-gray-300' },
    'In Progress': { bg: 'bg-blue-900/50', text: 'text-blue-400' },
    Completed: { bg: 'bg-green-900/50', text: 'text-green-400' },
  };

  const handleClick = (): void => {
    onClick?.(item);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        bg-gray-800 rounded-lg border-l-4 ${priorityColors[item.priority]}
        hover:bg-gray-750 transition-all duration-150
        ${onClick ? 'cursor-pointer hover:shadow-lg' : ''}
        ${item.onHold ? 'border-2 border-red-600 ring-2 ring-red-500/50 shadow-lg shadow-red-600/20' : ''}
      `}
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            {/* Item ID (Barcode) */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-blue-400">{item.id}</span>
              {item.onHold && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-900/50 text-red-400 rounded text-xs font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  HOLD
                </span>
              )}
            </div>

            {/* Item Name */}
            <h3 className="text-lg font-medium text-white truncate">{item.name}</h3>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-gray-400 truncate mt-0.5">{item.description}</p>
            )}
          </div>

          {/* Chevron for clickable items */}
          {onClick && (
            <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
          )}
        </div>

        {/* Info Row */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          {/* Order ID */}
          {showOrder && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <Package className="w-4 h-4" />
              <span>{item.orderId}</span>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Qty: {item.quantity}</span>
          </div>

          {/* Status Badge */}
          <div
            className={`
              px-2 py-1 rounded text-xs font-medium
              ${statusColors[item.status].bg} ${statusColors[item.status].text}
            `}
          >
            {item.status}
          </div>

          {/* Priority Badge */}
          {item.priority !== 'Normal' && (
            <div
              className={`
                px-2 py-1 rounded text-xs font-medium
                ${item.priority === 'Urgent'
                  ? 'bg-red-900/50 text-red-400'
                  : item.priority === 'High'
                  ? 'bg-yellow-900/50 text-yellow-400'
                  : 'bg-gray-700 text-gray-400'
                }
              `}
            >
              {item.priority}
            </div>
          )}
        </div>

        {/* Workflow Progress */}
        <WorkflowProgress currentStep={item.currentStep} onHold={item.onHold} compact />

        {/* Hold Reason */}
        {item.onHold && item.holdReason && (
          <div className="mt-3 px-3 py-2 bg-red-900/20 border border-red-800 rounded text-sm text-red-300">
            <strong>Hold Reason:</strong> {item.holdReason}
          </div>
        )}
      </div>
    </div>
  );
}
