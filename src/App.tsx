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
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'life': return <Ritual onComplete={() => setActiveTab('dashboard')} />;
      case 'atomic': return <AtomicModule />;
      case 'karya': return <KaryaModule />;
      case 'book': return <BookModule />;
      case 'settings': return <SettingsModule />;
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
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
