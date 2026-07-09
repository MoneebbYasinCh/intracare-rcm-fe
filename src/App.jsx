import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthGate } from './components/auth/AuthGate';
import { CashIntelligencePage } from './pages/CashIntelligencePage';
import { CashIntelligenceLoginPage } from './pages/CashIntelligenceLoginPage';
import { HomePlaceholderPage } from './pages/HomePlaceholderPage';
import { RevenueOpportunityPage } from './pages/RevenueOpportunityPage';
import { OperationalIntelligencePage } from './pages/OperationalIntelligencePage';

function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <Routes>
          <Route path="/" element={<CashIntelligenceLoginPage />} />
          <Route path="/home" element={<HomePlaceholderPage />} />
          <Route path="/cash-intelligence/dashboard" element={<CashIntelligencePage />} />
          <Route path="/revenue-opportunity" element={<RevenueOpportunityPage />} />
          <Route path="/operational-intelligence" element={<OperationalIntelligencePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGate>
    </AuthProvider>
  );
}

export default App;
