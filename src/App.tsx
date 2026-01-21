import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NavTab } from './types';
import { MainLayout } from './components/layout';
import {
  OperatorView,
  QCView,
  ShippingView,
  SupervisorView,
} from './components/views';
import { useAuth } from './contexts';

function App() {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NavTab>('Operator');
  const [scannedItem, setScannedItem] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Set active tab based on user role when authenticated
  useEffect(() => {
    if (currentUser) {
      setActiveTab(currentUser.role as NavTab);
    }
  }, [currentUser]);

  if (!isAuthenticated || !currentUser) {
    return null; // Will redirect to login
  }

  const renderView = () => {
    switch (activeTab) {
      case 'Operator':
        return <OperatorView scannedItem={scannedItem} onClearScan={() => setScannedItem(null)} />;
      case 'QC':
        return <QCView scannedItem={scannedItem} onClearScan={() => setScannedItem(null)} />;
      case 'Shipping':
        return <ShippingView scannedItem={scannedItem} onClearScan={() => setScannedItem(null)} />;
      case 'Supervisor':
        return <SupervisorView scannedItem={scannedItem} onClearScan={() => setScannedItem(null)} />;
      default:
        return <OperatorView scannedItem={scannedItem} onClearScan={() => setScannedItem(null)} />;
    }
  };

  return (
    <MainLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      currentUser={currentUser}
      onItemScanned={setScannedItem}
    >
      {renderView()}
    </MainLayout>
  );
}

export default App;
