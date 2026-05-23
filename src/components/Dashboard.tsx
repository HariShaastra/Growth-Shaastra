import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { Card, Button } from './UI';
import { Flame, Zap, Rocket, BookMarked, Shield, ArrowRight, CheckCircle2, Star, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { Mascot } from './Mascot';

export const Dashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({ habits: 0, initiatives: 0, books: 0, ritualsToday: false });

  useEffect(() => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const hPath = `users/${user.uid}/habits`;
    const iPath = `users/${user.uid}/initiatives`;
    const bPath = `users/${user.uid}/books`;
    const rPath = `users/${user.uid}/rituals/${today}`;

    const u1 = onSnapshot(collection(db, hPath), 
      s => setStats(prev => ({ ...prev, habits: s.size })),
      e => handleFirestoreError(e, OperationType.LIST, hPath)
    );
    
    const u2 = onSnapshot(collection(db, iPath), 
      s => setStats(prev => ({ ...prev, initiatives: s.size })),
      e => handleFirestoreError(e, OperationType.LIST, iPath)
    );
    
    const u3 = onSnapshot(collection(db, bPath), 
      s => setStats(prev => ({ ...prev, books: s.size })),
      e => handleFirestoreError(e, OperationType.LIST, bPath)
    );
    
    const u4 = onSnapshot(doc(db, rPath), 
      s => setStats(prev => ({ ...prev, ritualsToday: s.exists() })),
      e => handleFirestoreError(e, OperationType.GET, rPath)
    );

    return () => { u1(); u2(); u3(); u4(); };
  }, [user]);

  const level = profile?.level || 1;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 overflow-x-hidden">
      {/* 1. Attractive Introductory Box with Bodh */}
      <section className="relative">
        <div className="absolute inset-0 bg-amber-600/10 blur-[120px] rounded-full -z-10 animate-pulse" />
        <Card className="p-6 md:p-12 xl:p-20 bg-stone-900/40 text-white overflow-hidden relative border-stone-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-xl rounded-[4rem] border-t-amber-600/20">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <Shield className="w-96 h-96 text-white rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col items-center xl:flex-row xl:items-center gap-8 xl:gap-16 text-center xl:text-left">
            <Mascot mood="happy" className="scale-90 md:scale-100 xl:scale-125" message="Hi! I am Bodh. I'm here to help you get better." />
            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <span className="text-amber-500 font-black text-[12px] uppercase tracking-[0.4em]">Simple Plan</span>
                <h2 className="text-3xl md:text-5xl xl:text-7xl font-display font-medium tracking-tighter leading-tight italic">Growth Shaastra</h2>
              </div>
              <p className="text-lg md:text-xl xl:text-2xl text-stone-300 font-serif leading-relaxed max-w-2xl italic">
                This is your private space to grow. We help you focus on three simple things: <span className="text-amber-500">Your Mind</span>, <span className="text-amber-500">Your Habits</span>, and <span className="text-amber-500">Your Projects</span>.
              </p>
              <div className="bg-stone-950/60 p-8 rounded-[2.5rem] border border-stone-800/80 shadow-inner">
                <p className="text-xs text-stone-600 italic font-serif leading-loose uppercase tracking-widest">
                  Zero AI. Just your hard work.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 2. Duolingo-like Clear Progression UI */}
      <section className="bg-stone-900 border border-stone-800 p-8 rounded-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-6">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-amber-600/10 rounded-full flex items-center justify-center border border-amber-600/20 shrink-0">
               <Zap className="w-10 h-10 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-display text-white italic">Current Sequence</h3>
              <p className="text-stone-500 font-serif italic text-lg">Follow the highlighted path below.</p>
            </div>
          </div>
          <Button 
            onClick={() => {
              if (!stats.ritualsToday) onNavigate('life');
              else onNavigate('atomic');
            }}
            className="px-16 py-8 text-2xl bg-amber-600 hover:bg-amber-500 rounded-[2.5rem] shadow-2xl shadow-amber-950/40 text-white font-display border-b-[6px] border-amber-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            {stats.ritualsToday ? "Continue Training" : "Initialize Day"} <ArrowRight className="ml-4 w-8 h-8" />
          </Button>
        </div>
      </section>

      {/* 3. Stats Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 px-4">
        <div>
          <h1 className="text-5xl md:text-6xl font-display text-white mb-3">
            Hello, {profile?.displayName?.split(' ')[0] || 'Seeker'}
          </h1>
          <p className="text-stone-500 font-serif italic text-xl">
            You are on Level {level} of your journey.
          </p>
        </div>
        
        <div className="flex items-center gap-6 bg-stone-900/60 p-5 rounded-[2.5rem] border border-stone-800 shadow-xl min-w-[320px]">
          <div className="flex flex-col items-center px-8 border-r border-stone-800">
            <span className="text-[10px] uppercase font-black text-stone-600 tracking-[0.2em] mb-1">Your Streak</span>
            <div className="flex items-center gap-2 text-white">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span className="text-3xl font-display font-bold">{profile?.streak || 0}</span>
            </div>
          </div>
          <div className="flex flex-col items-center px-8">
             <span className="text-[10px] uppercase font-black text-stone-600 tracking-[0.2em] mb-2">Evolution</span>
             <div className="flex items-center gap-2">
               {[...Array(3)].map((_, i) => (
                 <Star key={i} className={cn("w-5 h-5", i < (level % 3 || 3) ? "text-amber-500 fill-amber-500" : "text-stone-700")} />
               ))}
             </div>
          </div>
        </div>
      </header>

      {/* 4. Simple Path */}
      <section className="space-y-12">
        <div className="relative space-y-16">
          {/* Path Line */}
          <div className="absolute left-[44px] top-12 bottom-12 w-1 bg-stone-800 -z-0" />
          
          <PathStep 
            number="1"
            title="Mind Power"
            description="Read your words and see your future."
            icon={<Shield className="w-10 h-10" />}
            completed={stats.ritualsToday}
            active={!stats.ritualsToday}
            onClick={() => onNavigate('life')}
            mood="peaceful"
          />
          
          <PathStep 
            number="2"
            title="Everyday Habits"
            description="Do your small tasks to stay strong."
            icon={<Zap className="w-10 h-10" />}
            completed={false}
            active={stats.ritualsToday}
            onClick={() => onNavigate('atomic')}
            mood="excited"
          />
          
          <PathStep 
            number="3"
            title="Big Projects"
            description="Work on things that matter for your life."
            icon={<Rocket className="w-10 h-10" />}
            completed={false}
            active={false}
            onClick={() => onNavigate('karya')}
            mood="thinking"
          />
          
          <PathStep 
            number="4"
            title="Reading Room"
            description="Write down what you learn from books."
            icon={<BookMarked className="w-10 h-10" />}
            completed={false}
            active={false}
            onClick={() => onNavigate('book')}
            mood="happy"
          />
        </div>
      </section>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-stone-800">
        <StatSummary title="Mind" value={stats.ritualsToday ? "Ready" : "Waiting"} sub="Your mind needs training." />
        <StatSummary title="Habits" value={`${stats.habits} Active`} sub="Count your small wins." />
        <StatSummary title="Projects" value={`${stats.initiatives} Running`} sub="Building for the future." />
      </div>
    </div>
  );
};

const StatSummary: React.FC<{ title: string; value: string; sub: string }> = ({ title, value, sub }) => (
  <Card className="p-10 bg-stone-900/40 border-stone-800 rounded-[2.5rem]">
     <h3 className="text-[10px] uppercase font-black text-stone-600 mb-6 tracking-[0.2em]">{title} Status</h3>
     <p className="text-4xl font-display font-medium text-white mb-2">{value}</p>
     <p className="text-sm text-stone-500 font-serif italic">{sub}</p>
  </Card>
);

const PathStep: React.FC<{ 
  number: string; 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  completed: boolean; 
  active: boolean;
  onClick: () => void;
  mood: any;
}> = ({ number, title, description, icon, completed, active, onClick, mood }) => (
  <motion.div 
    whileHover={{ x: 10 }}
    className={cn(
      "relative z-10 flex items-start gap-10 transition-opacity duration-700",
      !active && !completed && "opacity-30 grayscale hover:grayscale-0"
    )}
  >
    <div className={cn(
      "w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all duration-700 shrink-0",
      completed ? "bg-emerald-600 border-emerald-900 shadow-emerald-900/20 text-white" :
      active ? "bg-amber-500 border-amber-300 text-white shadow-amber-900/40 step-active-glow scale-110" :
      "bg-stone-800 border-stone-700 text-stone-600"
    )}>
      {completed ? <CheckCircle2 className="w-12 h-12" /> : icon}
    </div>
    
    <div className="flex-1 pt-3 flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-stone-900/20 p-8 rounded-[2.5rem] border border-transparent hover:border-stone-800 transition-all">
      <div className="space-y-2">
        <div className="flex items-center gap-3 mb-1">
           <span className="text-stone-500 font-mono text-sm tracking-widest">Action {number}</span>
        </div>
        <h3 className="text-3xl font-display text-white">{title}</h3>
        <p className="text-stone-400 font-serif italic text-lg leading-relaxed">{description}</p>
        <div className="pt-4">
          <Button 
            onClick={onClick} 
            variant={completed ? 'outline' : 'primary'}
            className={cn("px-10 py-4 rounded-2xl transition-all", active && "bg-amber-600 border-none shadow-xl scale-105")}
          >
            {completed ? "Do Again" : "Go to Step"} <ArrowRight className="ml-3 w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {active && <Mascot mood={mood} className="hidden xl:flex scale-75" message={`Hello! I am Bodh. Let's finish Step ${number} now.`} />}
    </div>
  </motion.div>
);
