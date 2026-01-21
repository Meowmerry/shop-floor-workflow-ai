import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { LoginPage } from './components/LoginPage';
import { AuthProvider, WorkflowProvider } from './contexts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <WorkflowProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<App />} />
          </Routes>
        </WorkflowProvider>
      </AuthProvider>
    </Router>
  </StrictMode>,
)
