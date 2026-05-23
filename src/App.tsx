import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Landing } from './components/Landing';
import { SetupProfile } from './components/SetupProfile';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Ritual } from './components/Ritual';
import { AtomicModule } from './components/AtomicModule';
import { KaryaModule } from './components/KaryaModule';
import { BookModule } from './components/BookModule';
import { SettingsModule } from './components/SettingsModule';

const AppContent: React.FC = () => {
  const { user, profile, loading, isAuthReady } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [history, setHistory] = useState<string[]>(['dashboard']);

  const navigate = (tab: string) => {
    setHistory(prev => [...prev, tab]);
    setActiveTab(tab);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // current tab
      const lastTab = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setActiveTab(lastTab);
    } else {
      setActiveTab('dashboard');
    }
  };

  if (!isAuthReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1c1917]">
        <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(217,119,6,0.3)]" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  if (!profile) {
    return <SetupProfile />;
  }

  const renderContent = () => {
    const commonProps = { 
      onNavigate: navigate, 
      onBack: goBack,
      onHome: () => navigate('dashboard')
    };

    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={navigate} />;
      case 'life': return <Ritual {...commonProps} onComplete={() => navigate('dashboard')} />;
      case 'atomic': return <AtomicModule {...commonProps} />;
      case 'karya': return <KaryaModule {...commonProps} />;
      case 'book': return <BookModule {...commonProps} />;
      case 'settings': return <SettingsModule {...commonProps} />;
      default: return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={navigate}>
      {renderContent()}
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
