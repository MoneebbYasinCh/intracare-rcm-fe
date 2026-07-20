import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/layout';
import { PageWrapper, PageContent } from '../components/layout';
import {
  AIQueryInterface,
  CashForecastChart,
  LiquidityRiskPanel,
  RevenueFlowPipeline,
  PaymentBehaviorIntelligence,
  EntityContributionIntelligence,
  StrategicInsights,
  ScenarioSimulationEngine,
} from '../components/dashboard';

export function CashIntelligencePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <PageWrapper>
      <Header
        title="Cash Intelligence & Liquidity Forecast"
        subtitle="Move beyond static reporting to forward-looking liquidity intelligence. Understand how revenue flows, where it slows, and what puts your cash position at risk."
        systemStatus="active"
        lastUpdated="2 minutes ago"
        dataRefresh="Real-Time"
      />
      <PageContent className="px-[2%] py-4 md:px-[5%] md:py-6 space-y-4 md:space-y-6">
        <AIQueryInterface />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <CashForecastChart />
          <LiquidityRiskPanel />
        </div>

        <RevenueFlowPipeline />
        <PaymentBehaviorIntelligence />
        <EntityContributionIntelligence />
        <StrategicInsights />
        <ScenarioSimulationEngine />
      </PageContent>
    </PageWrapper>
  );
}
