import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Scan, X, Search, AlertCircle, Dice6, AlertTriangle, Factory, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { NavTab, WorkItem } from '../../types';
import type { FactoryUser } from '../../types/auth';

import { useWorkflow } from '../../contexts/WorkflowContext';
import { useAuth } from '../../contexts';

interface HeaderProps {
  readonly activeTab: NavTab;
  readonly onItemScanned?: (item: WorkItem) => void;
  readonly onTabChange?: (tab: NavTab) => void;
  readonly currentUser?: FactoryUser;
  readonly currentStep?: string;
}

export function Header({ activeTab, onItemScanned, onTabChange, currentUser: _headerUser, currentStep }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { getItemById, getAllItems } = useWorkflow();

  const [scanInput, setScanInput] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<{ found: boolean; item?: WorkItem; barcode: string; stationMismatch?: boolean } | null>(null);
  const [showScanPopup, setShowScanPopup] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusScannerInput = useCallback(() => {
    // next-tick focus to recover from button clicks / modal interactions
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Focus scanner input when opened
  useEffect(() => {
    if (showScanner && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showScanner]);

  // Clear scan result when tab or step changes
  useEffect(() => {
    setLastScanResult(null);
    setShowScanPopup(false);
    setShowScanner(false);
    setScanInput('');
  }, [activeTab, currentStep]);

  // When scanner is open, refocus after ANY click (buttons included).
  useEffect(() => {
    if (!showScanner) return;
    const handleAnyClick = () => focusScannerInput();
    document.addEventListener('click', handleAnyClick, true);
    return () => document.removeEventListener('click', handleAnyClick, true);
  }, [showScanner, focusScannerInput]);

  // Compute suggestions based on input (derived state)
  const allItems = getAllItems();
  const suggestions = useMemo(() => {
    if (scanInput.length < 2) return [];
    const query = scanInput.toLowerCase();
    return allItems.filter(
      (item) =>
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [scanInput, allItems]);

  // Handle keyboard shortcuts for global scanner
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to toggle scanner
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowScanner((prev) => !prev);
      }
      // Escape to close scanner
      if (e.key === 'Escape' && showScanner) {
        setShowScanner(false);
        setScanInput('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showScanner]);

  const handleScan = useCallback((barcode: string) => {
    const trimmedBarcode = barcode.trim().toUpperCase();
    if (!trimmedBarcode) return;

    const item = getItemById(trimmedBarcode);

    if (item) {
      // Check if item's station matches active tab
      // activeTab can be 'Operator', 'QC', 'Shipping', 'Supervisor'
      // Map activeTab to operator steps: Operator = Saw/Thread/CNC, QC = QC, Shipping = Ship
      const operatorSteps = ['Saw', 'Thread', 'CNC'];
      const isStationMatch = 
        (activeTab === 'Operator' && operatorSteps.includes(item.currentStep)) ||
        (activeTab === 'QC' && item.currentStep === 'QC') ||
        (activeTab === 'Shipping' && item.currentStep === 'Ship') ||
        (activeTab === 'Supervisor'); // Supervisor can see all

      setLastScanResult({ 
        found: true, 
        item, 
        barcode: trimmedBarcode,
        stationMismatch: !isStationMatch
      });
      onItemScanned?.(item);
      setShowScanPopup(true);  // Show popup instead of auto-closing
      setScanInput('');  // Clear input for next scan
      focusScannerInput();  // Keep focus on scanner
    } else {
      setLastScanResult({ found: false, barcode: trimmedBarcode });
      setShowScanPopup(true);  // Show popup for not found
      setScanInput('');
    }
  }, [getItemById, onItemScanned, focusScannerInput]);

  const handleMockScan = useCallback(() => {
    if (allItems.length === 0) return;
    const random = allItems[Math.floor(Math.random() * allItems.length)];
    handleScan(random.id);
  }, [allItems, handleScan]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScan(scanInput);
    }
  };

  const handleSuggestionClick = (item: WorkItem) => {
    handleScan(item.id);
  };

  return (
    <>
      <header className="h-16 bg-gray-900 border-b border-gray-700 px-6 flex items-center justify-between">
        {/* Left: Page Title */}
        <div className="flex items-center gap-3">
          <Factory className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">{activeTab} View</h2>
            <p className="text-sm text-gray-400">{currentDate}</p>
          </div>
        </div>

        {/* Center: Global Scanner Button */}
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors min-h-[44px]"
        >
          <Scan className="w-5 h-5 text-blue-400" />
          <span className="text-gray-300 hidden md:inline">Scan Item</span>
          <kbd className="hidden md:inline px-2 py-0.5 text-xs text-gray-500 bg-gray-700 rounded">
            Ctrl+K
          </kbd>
        </button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Last Scan Result Indicator */}
          {lastScanResult && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
              lastScanResult.found
                ? 'bg-green-900/30 border border-green-700 text-green-400'
                : 'bg-red-900/30 border border-red-700 text-red-400'
            }`}>
              {lastScanResult.found ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>{lastScanResult.item?.name}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Not found</span>
                </>
              )}
            </div>
          )}

          {/* Notifications */}
          <button
            className="relative p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Info */}
          {currentUser && (
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-800 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentUser.role === 'Operator' ? 'bg-blue-600' :
                currentUser.role === 'QC' ? 'bg-green-600' :
                currentUser.role === 'Shipping' ? 'bg-purple-600' :
                'bg-yellow-600'
              }`}>
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-400">{currentUser.role}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Logout"
                title="Logout / Switch Station"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Global Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center pt-20 z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 shadow-2xl">
            {/* Scanner Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Scan className="w-5 h-5 text-blue-400" />
                Global Scanner
              </h3>
              <button
                onClick={() => { setShowScanner(false); setScanInput(''); }}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scanner Input */}
            <div className="flex gap-3 items-stretch">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                  <Scan className="w-6 h-6" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Scan barcode or enter item ID..."
                  className="w-full h-16 pl-14 pr-4 bg-gray-900 border-2 border-gray-600 rounded-xl text-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono tracking-wide"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <button
                onClick={() => {
                  handleMockScan();
                  focusScannerInput();
                }}
                className="px-4 bg-blue-900/30 border-2 border-blue-600 rounded-xl text-blue-300 hover:bg-blue-900/50 hover:border-blue-500 transition-colors min-h-[64px] min-w-[180px] flex items-center justify-center gap-2 font-medium active:scale-95"
                type="button"
                title="Test scan with random item"
              >
                <Dice6 className="w-5 h-5" />
                Simulate Scan
              </button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-2 bg-gray-900 border border-gray-600 rounded-lg overflow-hidden">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleSuggestionClick(item);
                      focusScannerInput();
                    }}
                    className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 min-h-[48px]"
                  >
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-blue-400">{item.id}</div>
                      <div className="text-sm text-gray-300 truncate">{item.name}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      item.onHold
                        ? 'bg-red-900/50 text-red-400'
                        : item.status === 'In Progress'
                        ? 'bg-blue-900/50 text-blue-400'
                        : item.status === 'Completed'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {item.onHold ? 'HOLD' : item.currentStep}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Helper Text */}
            <p className="mt-4 text-sm text-gray-500 text-center">
              Scan a barcode or type an item ID and press Enter
            </p>
          </div>
        </div>
      )}

      {/* Scan Result Popup */}
      {showScanner && showScanPopup && lastScanResult && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md border-2 pointer-events-auto" 
            style={{ 
              borderColor: lastScanResult.found ? (lastScanResult.stationMismatch ? '#f59e0b' : '#10b981') : '#ef4444',
              boxShadow: lastScanResult.found 
                ? (lastScanResult.stationMismatch 
                  ? '0 0 30px rgba(245, 158, 11, 0.3)'
                  : '0 0 30px rgba(16, 185, 129, 0.3)')
                : '0 0 30px rgba(239, 68, 68, 0.3)'
            }}>
            
            {lastScanResult.found ? (
              <>
                {/* Station Match vs Mismatch Header */}
                {lastScanResult.stationMismatch ? (
                  // MISMATCH HEADER
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                      <h3 className="text-xl font-bold text-amber-400">⚠ STATION MISMATCH</h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowScanPopup(false);
                        focusScannerInput();
                      }}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  // MATCH HEADER
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <h3 className="text-xl font-bold text-green-400">✓ FOUND</h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowScanPopup(false);
                        focusScannerInput();
                      }}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                )}

                <div className="bg-gray-900 rounded-lg p-6 space-y-4 mb-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Barcode</p>
                    <p className="font-mono text-lg text-blue-400 font-bold mt-1">{lastScanResult.barcode}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Item Name</p>
                    <p className="text-xl font-semibold text-white mt-1">{lastScanResult.item?.name}</p>
                  </div>

                  {lastScanResult.item?.description && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Description</p>
                      <p className="text-sm text-gray-300 mt-1">{lastScanResult.item.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                      <p className={`text-sm font-semibold mt-1 ${
                        lastScanResult.item?.status === 'Completed' ? 'text-green-400' :
                        lastScanResult.item?.status === 'In Progress' ? 'text-blue-400' :
                        'text-yellow-400'
                      }`}>
                        {lastScanResult.item?.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Step</p>
                      <p className="text-sm font-semibold text-purple-400 mt-1">{lastScanResult.item?.currentStep}</p>
                    </div>
                  </div>

                  {/* Station Mismatch Warning Message */}
                  {lastScanResult.stationMismatch && (
                    <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-amber-300 font-semibold text-sm">This item belongs at the <span className="font-bold text-amber-200">{lastScanResult.item?.currentStep}</span> station.</p>
                          <p className="text-amber-200 text-xs mt-1">Please move it to the correct department or switch stations.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {lastScanResult.item?.onHold && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mt-4">
                      <div className="flex items-center gap-2 text-red-400 font-semibold">
                        <AlertTriangle className="w-5 h-5" />
                        ON HOLD
                      </div>
                      {lastScanResult.item?.holdReason && (
                        <p className="text-sm text-red-300 mt-2">Reason: {lastScanResult.item.holdReason}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button - Conditional */}
                {lastScanResult.stationMismatch ? (
                  // Switch Button for Mismatch
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        // Map step to tab
                        const stepToTab: { [key: string]: NavTab } = {
                          'Saw': 'Operator',
                          'Thread': 'Operator',
                          'CNC': 'Operator',
                          'QC': 'QC',
                          'Ship': 'Shipping'
                        };
                        const targetTab = stepToTab[lastScanResult.item?.currentStep || ''] || activeTab;
                        onTabChange?.(targetTab);
                        setShowScanPopup(false);
                        focusScannerInput();
                      }}
                      className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-5 h-5" />
                      Switch to {lastScanResult.item?.currentStep} Station
                    </button>
                    <button
                      onClick={() => {
                        setShowScanPopup(false);
                        focusScannerInput();
                      }}
                      className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold rounded-lg transition-colors"
                    >
                      Continue Scanning
                    </button>
                  </div>
                ) : (
                  // Go to Item Button for Match
                  <button
                    onClick={() => {
                      setShowScanPopup(false);
                      focusScannerInput();
                    }}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Continue Scanning
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <h3 className="text-xl font-bold text-red-400">NOT FOUND</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowScanPopup(false);
                      focusScannerInput();
                    }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-400">Barcode not found in system:</p>
                  <p className="font-mono text-lg text-gray-300 font-bold mt-3">{lastScanResult.barcode}</p>
                  <p className="text-xs text-gray-500 mt-3">Please verify the barcode and try again.</p>
                </div>

                <button
                  onClick={() => {
                    setShowScanPopup(false);
                    focusScannerInput();
                  }}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
