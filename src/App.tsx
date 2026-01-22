/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Factory } from 'lucide-react';
import type { NavTab } from './types';
import { MainLayout } from './components/layout';
import {
  OperatorView,
  QCView,
  ShippingView,
  SupervisorView,
} from './components/views';
import { useAuth } from './hooks';

function App() {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NavTab>(
    (currentUser?.role as NavTab) ?? 'Operator'
  );
  const [scannedItem, setScannedItem] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<string | undefined>(undefined);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Sync active tab when user role changes (e.g., after login)
  const userRole = currentUser?.role as NavTab | undefined;
  if (userRole && userRole !== activeTab) {
    setActiveTab(userRole);
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-xl border-2 border-blue-600 p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <Factory className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Cyclone Manufacturing</h1>
          <p className="text-gray-400 mb-6">Workflow Control System</p>
          
          <div className="bg-blue-900/30 border-l-4 border-blue-500 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <LogIn className="w-5 h-5 text-blue-400" />
              <p className="font-semibold text-blue-400">Login Required</p>
            </div>
            <p className="text-sm text-gray-300">
              You need to login first to access the dashboard. Please select your role to get started.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors mb-3 min-h-[48px]"
          >
            Go to Login
          </button>

          <p className="text-xs text-gray-500">
            Available roles: Operator, QC, Shipping, Supervisor
          </p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeTab) {
      case 'Operator':
        return <OperatorView scannedItem={scannedItem} onClearScan={() => setScannedItem(null)} onStepChange={setCurrentStep} />;
      case 'QC':
        return <QCView scannedItem={scannedItem} onClearScan={() => setScannedItem(null)} />;
      case 'Shipping':
        return <ShippingView scannedItem={scannedItem} onClearScan={() => setScannedItem(null)} />;
      case 'Supervisor':
        return <SupervisorView scannedItem={scannedItem} onClearScan={() => setScannedItem(null)} />;
      default:
        return <OperatorView scannedItem={scannedItem} onClearScan={() => setScannedItem(null)} onStepChange={setCurrentStep} />;
    }
  };

  return (
    <MainLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      currentUser={currentUser}
      onItemScanned={setScannedItem}
      currentStep={currentStep}
    >
      {renderView()}
    </MainLayout>
  );
}

export default App;
