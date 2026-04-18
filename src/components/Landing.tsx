import React, { useState } from 'react';
import { loginWithGoogle } from '../firebase';
import { Button } from './UI';
import { Shield, Zap, Rocket, BookMarked, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { Mascot } from './Mascot';

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
    <div className="min-h-screen bg-[#1c1917] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto space-y-16 py-20"
      >
        <div className="flex flex-col items-center space-y-10 relative">
          <div className="absolute -top-20 -z-10 blur-[100px] w-64 h-64 bg-amber-600/20 rounded-full" />
          <Logo className="w-56 h-56 md:w-72 md:h-72 drop-shadow-[0_0_50px_rgba(217,119,6,0.2)]" />
          <div className="space-y-4">
            <h1 className="text-6xl md:text-9xl font-display font-medium text-white leading-tight tracking-tighter">
              Growth Shaastra
            </h1>
            <p className="text-xl md:text-3xl text-stone-400 font-serif italic max-w-3xl mx-auto leading-relaxed">
              "A simple way to build good habits and reach your goals."
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 bg-stone-900/40 p-10 rounded-[3rem] border border-stone-800 shadow-2xl backdrop-blur-md">
           <Mascot mood="excited" message="Hi! I am Bodh. I will help you get better every day!" />
           <div className="text-left space-y-6 max-w-md">
              <p className="text-stone-300 font-serif text-xl leading-relaxed">
                <b>Growth Shaastra</b> makes it easy to change your life. You can track your daily habits and finish your big projects without any stress.
              </p>
              <div className="p-6 bg-stone-800/30 rounded-2xl border border-stone-800/50">
                <p className="text-xs text-stone-500 font-sans uppercase tracking-[0.1em] leading-loose opacity-80">
                  <b>No AI here.</b> This app is just for you. You are the boss of your own growth.
                </p>
              </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center pt-8">
          <Button 
            onClick={handleLogin} 
            size="lg" 
            isLoading={loading}
            className="px-16 py-10 text-2xl bg-amber-600 text-white hover:bg-amber-500 shadow-2xl shadow-amber-900/20 group rounded-[2.5rem] transition-all"
          >
            Start Now <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 pt-12 md:pt-20">
          <FeatureIcon icon={<Shield className="w-6 h-6" />} label="Strong Mind" />
          <FeatureIcon icon={<Zap className="w-6 h-6" />} label="Daily Habits" />
          <FeatureIcon icon={<Rocket className="w-6 h-6" />} label="Big Goals" />
          <FeatureIcon icon={<BookMarked className="w-6 h-6" />} label="Reading Room" />
        </div>
      </motion.div>

      <footer className="mt-12 pb-12 text-stone-600 text-[10px] uppercase font-black tracking-[0.4em] font-sans">
        Built for a better life &copy; 2026
      </footer>
    </div>
  );
};

const FeatureIcon: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex flex-col items-center space-y-4 opacity-40 hover:opacity-100 transition-all group cursor-default">
    <div className="w-16 h-16 bg-stone-800 rounded-[1.5rem] flex items-center justify-center text-amber-500 shadow-lg group-hover:scale-110 group-hover:shadow-amber-900/20 transition-all border border-stone-700">
      {icon}
    </div>
    <span className="text-[10px] uppercase font-black tracking-widest text-stone-500 group-hover:text-amber-500">{label}</span>
  </div>
);
