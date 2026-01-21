import {
  Play,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Truck,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import type { AuditEntry } from '../types';

interface HistoryTimelineProps {
  readonly history: readonly AuditEntry[];
  readonly maxItems?: number;
}

const actionIcons: Record<string, typeof Play> = {
  Started: Play,
  Completed: CheckCircle,
  'Placed on Hold': AlertTriangle,
  'Released from Hold': RefreshCw,
  'Sent to Rework': RotateCcw,
  'Passed QC': CheckCircle,
  'Failed QC': XCircle,
  Shipped: Truck,
  Skipped: Clock,
};

const actionColors: Record<string, { bg: string; text: string; icon: string }> = {
  Started: { bg: 'bg-blue-900/30', text: 'text-blue-400', icon: 'text-blue-400' },
  Completed: { bg: 'bg-green-900/30', text: 'text-green-400', icon: 'text-green-400' },
  'Placed on Hold': { bg: 'bg-red-900/30', text: 'text-red-400', icon: 'text-red-400' },
  'Released from Hold': { bg: 'bg-yellow-900/30', text: 'text-yellow-400', icon: 'text-yellow-400' },
  'Sent to Rework': { bg: 'bg-orange-900/30', text: 'text-orange-400', icon: 'text-orange-400' },
  'Passed QC': { bg: 'bg-green-900/30', text: 'text-green-400', icon: 'text-green-400' },
  'Failed QC': { bg: 'bg-red-900/30', text: 'text-red-400', icon: 'text-red-400' },
  Shipped: { bg: 'bg-purple-900/30', text: 'text-purple-400', icon: 'text-purple-400' },
  Skipped: { bg: 'bg-gray-700', text: 'text-gray-400', icon: 'text-gray-400' },
};

const defaultColors = { bg: 'bg-gray-700', text: 'text-gray-400', icon: 'text-gray-400' };

function formatTimestamp(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatTimeOnly(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatRelativeTime(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function HistoryTimeline({ history, maxItems }: HistoryTimelineProps) {
  // Sort by timestamp descending (most recent first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const displayHistory = maxItems ? sortedHistory.slice(0, maxItems) : sortedHistory;

  if (displayHistory.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No history recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayHistory.map((entry, index) => {
        const Icon = actionIcons[entry.action] || Clock;
        const colors = actionColors[entry.action] || defaultColors;
        const isFirst = index === 0;

        return (
          <div
            key={entry.id}
            className={`
              relative flex gap-4 p-4 rounded-lg border
              ${colors.bg} border-gray-700/50
              ${isFirst ? 'ring-1 ring-blue-500/30' : ''}
              hover:border-gray-600 transition-colors
            `}
          >
            {/* Icon */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              bg-gray-800 flex-shrink-0 border border-gray-700
            `}>
              <Icon className={`w-6 h-6 ${colors.icon}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Timestamp at top - professional format */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-gray-300">
                  {formatTimeOnly(entry.timestamp)}
                </span>
                <span className="text-gray-600">–</span>
                <span className={`font-medium text-sm ${colors.text}`}>
                  {entry.action}
                </span>
              </div>

              {/* Step badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-gray-700 rounded text-xs text-gray-200 font-medium">
                  {entry.step}
                </span>
                {entry.notes && (
                  <span className="text-xs text-gray-500 italic">
                    {entry.notes}
                  </span>
                )}
              </div>

              {/* Operator info - professional */}
              <p className="text-sm text-gray-300 font-medium">
                By <span className="font-semibold">{entry.operatorName}</span>
                <span className="text-gray-500"> ({entry.operatorId})</span>
              </p>

              {/* Relative time */}
              <p className="text-xs text-gray-600 mt-1">
                {formatRelativeTime(entry.timestamp)}
              </p>
            </div>
          </div>
        );
      })}

      {maxItems && sortedHistory.length > maxItems && (
        <p className="text-center text-gray-500 text-sm py-2">
          +{sortedHistory.length - maxItems} more entries
        </p>
      )}
    </div>
  );
}
