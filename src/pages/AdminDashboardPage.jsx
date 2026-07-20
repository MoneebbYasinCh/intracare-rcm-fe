import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Loader2, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { useToast } from '../components/shared/Toast';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { Header, PageWrapper, PageContent } from '../components/layout';
import { ExamplesTab, DDLTab, BusinessRulesTab } from '../components/admin';

const TABS = [
  { key: 'examples', label: 'Examples' },
  { key: 'ddl', label: 'DDL Files' },
  { key: 'business-rules', label: 'Business Rules' },
];

export function AdminDashboardPage() {
  const { user, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'examples';
  const [training, setTraining] = useState(false);
  const [confirmTrain, setConfirmTrain] = useState(false);
  const [allVerified, setAllVerified] = useState(false);
  const [verifyInfo, setVerifyInfo] = useState({ verified: 0, total: 0 });

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isAdmin) {
    return (
      <PageWrapper>
        <Header title="Access Denied" subtitle="You do not have permission to view this page" />
        <PageContent className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger-light">
              <span className="text-2xl font-poppins font-bold text-danger">403</span>
            </div>
            <p className="font-prompt text-text-secondary">You need admin privileges to access this page.</p>
          </div>
        </PageContent>
      </PageWrapper>
    );
  }

  const setTab = (tab) => setSearchParams({ tab });

  const handleTrain = async () => {
    setConfirmTrain(false);
    setTraining(true);
    try {
      const result = await api.adminTrain();
      toast.success(
        `Training complete — ${result.cleared_vectors ?? 0} vectors cleared, ${result.synced_examples ?? 0} examples synced`
      );
    } catch (e) {
      toast.error(e.message);
    } finally {
      setTraining(false);
    }
  };

  return (
    <PageWrapper>
      <Header
        title="Admin Dashboard"
        subtitle={`Managing NL-to-SQL data for ${user?.name || 'Admin'}`}
        systemStatus="active"
      />
      <PageContent className="px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-poppins font-bold text-2xl text-text-primary">Admin Panel</h2>
            <p className="font-prompt text-sm text-text-secondary">Manage examples and DDL files</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'examples' && (
              <div className="text-right">
                <p className="font-prompt text-xs text-text-secondary">
                  {verifyInfo.total > 0
                    ? `${verifyInfo.verified}/${verifyInfo.total} verified`
                    : 'No examples'}
                </p>
              </div>
            )}
            {activeTab === 'examples' && (
              <button
                onClick={() => setConfirmTrain(true)}
                disabled={training || !allVerified}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-header text-white font-poppins text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 shadow-md"
                title={!allVerified && verifyInfo.total > 0 ? `Run & verify all ${verifyInfo.total} examples first` : ''}
              >
                {training ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Training...
                  </>
                ) : (
                  <>
                    <Brain size={16} />
                    Train Now
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="border-b border-border">
          <nav className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`px-5 py-3 font-poppins text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-[50vh]">
          {activeTab === 'examples' && (
            <ExamplesTab
              onVerifyChange={({ allVerified, verified, total }) => {
                setAllVerified(allVerified);
                setVerifyInfo({ verified, total });
              }}
            />
          )}
          {activeTab === 'ddl' && <DDLTab />}
          {activeTab === 'business-rules' && <BusinessRulesTab />}
        </div>

        <ConfirmDialog
          open={confirmTrain}
          title="Train Now"
          message="This will clear existing vectors and re-sync all examples to the vector database. Make sure you've saved your changes first. Continue?"
          confirmLabel={training ? 'Training...' : 'Start Training'}
          onConfirm={handleTrain}
          onCancel={() => !training && setConfirmTrain(false)}
        />
      </PageContent>
    </PageWrapper>
  );
}
