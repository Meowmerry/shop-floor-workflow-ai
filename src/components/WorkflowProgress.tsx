import { Check, CircleDot, Circle } from 'lucide-react';
import { WORKFLOW_STEPS, type WorkflowStep } from '../types';

interface WorkflowProgressProps {
  readonly currentStep: WorkflowStep;
  readonly onHold?: boolean;
  readonly compact?: boolean;
}

export function WorkflowProgress({
  currentStep,
  onHold = false,
  compact = false,
}: WorkflowProgressProps) {
  const currentIndex = WORKFLOW_STEPS.indexOf(currentStep);

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
      {WORKFLOW_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex items-center">
            {/* Step Indicator */}
            <div
              className={`
                flex items-center justify-center rounded-full
                ${compact ? 'w-6 h-6' : 'w-8 h-8'}
                ${onHold && isCurrent
                  ? 'bg-red-600 text-white'
                  : isCompleted
                  ? 'bg-green-600 text-white'
                  : isCurrent
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400'
                }
              `}
              title={`${step}${isCurrent ? ' (Current)' : isCompleted ? ' (Complete)' : ''}`}
            >
              {isCompleted ? (
                <Check className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
              ) : isCurrent ? (
                <CircleDot className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
              ) : (
                <Circle className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
              )}
            </div>

            {/* Connector Line */}
            {index < WORKFLOW_STEPS.length - 1 && (
              <div
                className={`
                  ${compact ? 'w-3 h-0.5' : 'w-6 h-1'}
                  ${isCompleted ? 'bg-green-600' : 'bg-gray-700'}
                `}
              />
            )}
          </div>
        );
      })}

      {/* Step Labels (non-compact only) */}
      {!compact && (
        <div className="ml-4 text-sm">
          <span className={`font-medium ${onHold ? 'text-red-400' : 'text-blue-400'}`}>
            {currentStep}
          </span>
          {onHold && (
            <span className="ml-2 px-2 py-0.5 bg-red-900/50 text-red-400 rounded text-xs">
              HOLD
            </span>
          )}
        </div>
      )}
    </div>
  );
}
