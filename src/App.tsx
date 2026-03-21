import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Landing } from './components/Landing';
import { SetupProfile } from './components/SetupProfile';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Ritual } from './components/Ritual';
import { IdentityModule } from './components/IdentityModule';
import { GoalModule } from './components/GoalModule';
import { StoryModule } from './components/StoryModule';
import { HistoryModule } from './components/HistoryModule';

const AppContent: React.FC = () => {
  const { user, profile, loading, isAuthReady } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRitualActive, setIsRitualActive] = useState(false);

  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-12 h-12 border-4 border-stone-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  if (!profile) {
    return <SetupProfile />;
  }

  if (isRitualActive) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Ritual onComplete={() => setIsRitualActive(false)} />
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard onStartRitual={() => setIsRitualActive(true)} />}
      {activeTab === 'identity' && <IdentityModule />}
      {activeTab === 'goals' && <GoalModule />}
      {activeTab === 'story' && <StoryModule />}
      {activeTab === 'history' && <HistoryModule />}
    </Layout>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

