import React, { useState } from 'react';
import { loginWithGoogle } from '../firebase';
import { Button } from './UI';
import { Shield, Target, Brain, Sparkles } from 'lucide-react';

export const Landing: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <div className="w-20 h-20 bg-stone-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Shield className="text-white w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-medium text-stone-900 mb-6 tracking-tight">
            Life Shaastra
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Your daily mental gym. Build a strong identity, gain clarity, and train your mind for consistent action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 w-full">
          <FeatureCard
            icon={<Target className="w-6 h-6" />}
            title="Identity First"
            description="Shape your thinking by reinforcing who you are before what you do."
          />
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            title="Mental Training"
            description="Structured daily rituals designed to program your behavior through repetition."
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="Action Aligned"
            description="Convert mindset into immediate execution with guided triggers."
          />
        </div>

        <Button size="lg" className="px-12 py-4 text-xl" onClick={handleLogin} isLoading={loading}>
          Begin Your Training
        </Button>
      </main>

      <footer className="p-8 text-stone-400 text-sm border-t border-stone-200 text-center">
        &copy; 2026 Life Shaastra. Mental Conditioning System.
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl border border-stone-200 text-left shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center mb-6 text-stone-900 border border-stone-100">
      {icon}
    </div>
    <h3 className="text-xl font-serif font-medium text-stone-900 mb-3">{title}</h3>
    <p className="text-stone-500 leading-relaxed">{description}</p>
  </div>
);
