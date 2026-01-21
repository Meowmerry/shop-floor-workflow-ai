import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Scan, X, Search, AlertCircle } from 'lucide-react';
import type { WorkItem, ScanResult } from '../types';
import { findItemById, searchItems } from '../data/mockData';

interface BarcodeScannerProps {
  readonly onScan: (result: ScanResult) => void;
  readonly placeholder?: string;
}

export function BarcodeScanner({
  onScan,
  placeholder = 'Scan barcode or enter item ID...',
}: BarcodeScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);

  // Auto-focus on mount and refocus periodically
  useEffect(() => {
    const focusInput = (): void => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Initial focus
    focusInput();

    // Refocus when clicking anywhere on the page (barcode scanner behavior)
    const handleClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      // Don't steal focus from buttons or interactive elements
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        return;
      }
      focusInput();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Suggestions as derived state (no internal setState in effect)
  const derivedSuggestions = useMemo(
    () => (inputValue.length >= 2 ? searchItems(inputValue).slice(0, 5) : []),
    [inputValue]
  );
  const hasSuggestions = derivedSuggestions.length > 0;

  const handleScan = useCallback(
    (barcode: string): void => {
      const trimmedBarcode = barcode.trim().toUpperCase();
      if (!trimmedBarcode) return;

      const matchedItem = findItemById(trimmedBarcode);
      const result: ScanResult = {
        barcode: trimmedBarcode,
        timestamp: new Date(),
        matchedItem,
      };

      setLastScan(result);
      onScan(result);
      setInputValue('');
      // suggestions handled purely via derivedSuggestions now

      // Auto-clear last scan indicator after 3 seconds
      setTimeout(() => setLastScan(null), 3000);
    },
    [onScan]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScan(inputValue);
    } else if (e.key === 'Escape') {
      setInputValue('');
      // suggestions handled purely via derivedSuggestions now
    }
  };

  const handleSuggestionClick = (item: WorkItem): void => {
    handleScan(item.id);
  };

  const clearInput = (): void => {
    setInputValue('');
    // suggestions handled purely via derivedSuggestions now
    inputRef.current?.focus();
  };

  return (
    <div className="w-full">
      {/* Scanner Input Container */}
      <div className="relative">
        {/* Input Field */}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-blue-400">
            <Scan className="w-6 h-6" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={undefined}
            placeholder={placeholder}
            className="
              w-full h-16 pl-14 pr-14
              bg-gray-800 border-2 border-gray-600
              rounded-xl text-xl text-white
              placeholder-gray-500
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
              transition-all duration-150
              font-mono tracking-wide
            "
            aria-label="Barcode scanner input"
            autoComplete="off"
            spellCheck={false}
          />

          {/* Clear Button */}
          {inputValue && (
            <button
              onClick={clearInput}
              className="absolute right-4 p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear input"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {hasSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
            {derivedSuggestions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSuggestionClick(item)}
                className="
                  w-full px-4 py-3 flex items-center gap-4
                  text-left hover:bg-gray-700 transition-colors
                  border-b border-gray-700 last:border-b-0
                  min-h-[48px]
                "
              >
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-blue-400">{item.id}</div>
                  <div className="text-sm text-gray-300 truncate">{item.name}</div>
                </div>
                <div
                  className={`
                    px-2 py-1 rounded text-xs font-medium shrink-0
                    ${item.onHold
                      ? 'bg-red-900/50 text-red-400'
                      : item.status === 'In Progress'
                      ? 'bg-blue-900/50 text-blue-400'
                      : item.status === 'Completed'
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-gray-700 text-gray-400'
                    }
                  `}
                >
                  {item.onHold ? 'HOLD' : item.currentStep}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Last Scan Result Indicator */}
      {lastScan && (
        <div
          className={`
            mt-3 px-4 py-3 rounded-lg flex items-center gap-3
            ${lastScan.matchedItem
              ? 'bg-green-900/30 border border-green-700'
              : 'bg-red-900/30 border border-red-700'
            }
          `}
        >
          {lastScan.matchedItem ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">
                Found: {lastScan.matchedItem.name}
              </span>
              <span className="text-green-400/70 text-sm ml-auto">
                {lastScan.matchedItem.currentStep}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">
                Not found: {lastScan.barcode}
              </span>
            </>
          )}
        </div>
      )}

      {/* Helper Text */}
      <p className="mt-2 text-sm text-gray-500 text-center">
        Scan a barcode or type an item ID and press Enter
      </p>
    </div>
  );
}
