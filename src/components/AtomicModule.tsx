import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, addDoc, updateDoc, doc, query, onSnapshot, 
  serverTimestamp, setDoc, deleteDoc, orderBy 
} from 'firebase/firestore';
import { Button, Card, SectionTitle } from './UI';
import { Habit, GrowthIdentity, HabitLog } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Target, Flame, Zap, Timer, 
  ChevronRight, ChevronLeft, Check, Grid, List, PlusCircle, RefreshCw
} from 'lucide-react';
import { Mascot } from './Mascot';
import { cn } from '../lib/utils';

export const AtomicModule: React.FC = () => {
  const { user, profile } = useAuth();
  const [identities, setIdentities] = useState<GrowthIdentity[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [activeView, setActiveView] = useState<'identities' | 'habits' | 'daily' | 'timer'>('daily');
  const [showAddIdentity, setShowAddIdentity] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [bodhMood, setBodhMood] = useState<'happy' | 'thinking' | 'excited' | 'peaceful' | 'celebrating'>('excited');
  const [bodhMessage, setBodhMessage] = useState('Hello! I am Bodh. I am here to help you get better every day.');

  useEffect(() => {
    if (!user) return;
    const qIds = query(collection(db, `users/${user.uid}/identities`), orderBy('createdAt', 'desc'));
    const qHabits = query(collection(db, `users/${user.uid}/habits`), orderBy('createdAt', 'desc'));
    const qLogs = query(collection(db, `users/${user.uid}/habitLogs`));

    const p1 = `users/${user.uid}/identities`;
    const p2 = `users/${user.uid}/habits`;
    const p3 = `users/${user.uid}/habitLogs`;

    const u1 = onSnapshot(qIds, 
      (s) => setIdentities(s.docs.map(d => ({ id: d.id, ...d.data() } as GrowthIdentity))),
      (e) => handleFirestoreError(e, OperationType.LIST, p1)
    );
    const u2 = onSnapshot(qHabits, 
      (s) => setHabits(s.docs.map(d => ({ id: d.id, ...d.data() } as Habit))),
      (e) => handleFirestoreError(e, OperationType.LIST, p2)
    );
    const u3 = onSnapshot(qLogs, 
      (s) => setHabitLogs(s.docs.map(d => d.data() as HabitLog)),
      (e) => handleFirestoreError(e, OperationType.LIST, p3)
    );

    return () => { u1(); u2(); u3(); };
  }, [user]);

  // Auto-creation of Master Persona if missing
  useEffect(() => {
    if (user && profile && identities.length === 0 && profile.identityStatement) {
      const autoCreate = async () => {
        try {
          // Check if there are really no identities (double check to avoid race conditions)
          // We rely on the identities state being populated by the snapshot
          await addDoc(collection(db, `users/${user.uid}/identities`), { 
            title: profile.identityStatement.length > 25 ? profile.identityStatement.substring(0, 25) + '...' : profile.identityStatement,
            description: `Core identity: ${profile.identityStatement}`,
            createdAt: serverTimestamp() 
          });
        } catch (e) { console.error(e); }
      };
      autoCreate();
    }
  }, [user, profile, identities.length]);

  const celebrate = () => {
    setBodhMood('celebrating');
    setBodhMessage('YES! Another vote for your best self! Unstoppable!');
    setTimeout(() => {
      setBodhMood('happy');
      setBodhMessage('Every step counts. Keep building.');
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-display text-white">Everyday Habits</h1>
          <p className="text-stone-400 font-serif italic text-xl border-l-4 border-amber-600 pl-6">"You do not rise to the level of your goals. You fall to the level of your systems."</p>
        </div>
        <div className="flex bg-stone-900/80 p-2 rounded-[2.5rem] gap-1 border border-stone-800 backdrop-blur-xl self-start overflow-x-auto max-w-full">
          <ViewTab id="daily" label="Daily Tracker" active={activeView === 'daily'} onClick={() => setActiveView('daily')} />
          <ViewTab id="habits" label="Habit Lab" active={activeView === 'habits'} onClick={() => setActiveView('habits')} />
          <ViewTab id="identities" label="My Personas" active={activeView === 'identities'} onClick={() => setActiveView('identities')} />
          <ViewTab id="timer" label="Focus Timer" active={activeView === 'timer'} onClick={() => setActiveView('timer')} />
        </div>
      </div>

      <div className="bg-gradient-to-br from-stone-900 via-stone-900/80 to-stone-900/40 p-10 rounded-[4rem] border border-stone-800 flex flex-col md:flex-row items-center gap-10 shadow-3xl">
         <Mascot mood={bodhMood} className="scale-90 shrink-0" message={bodhMessage} />
         <div className="space-y-4">
            <div className="inline-flex bg-amber-600/10 text-amber-500 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-amber-600/20">Daily System</div>
            <h3 className="text-3xl md:text-4xl font-display text-white">Your Habits</h3>
            <p className="text-stone-400 font-serif italic text-xl leading-relaxed">Every small action helps you become the person you want to be.</p>
         </div>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'daily' && (
          <motion.div key="daily" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-4xl font-display text-white">Today's Mission</h3>
              <p className="text-stone-500 font-mono text-sm">{format(new Date(), 'EEEE, MMMM do')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {habits.map(habit => (
                <DailyHabitCard 
                  key={habit.id} 
                  habit={habit} 
                  logs={habitLogs} 
                  userId={user?.uid || ''} 
                  identity={identities.find(i => i.id === habit.identityId)}
                  onComplete={celebrate}
                />
              ))}
              {habits.length === 0 && (
                <Card className="py-32 flex flex-col items-center justify-center border-dashed border-stone-800 bg-transparent">
                  <Zap className="w-16 h-16 text-stone-800 mb-6" />
                  <p className="text-stone-500 font-serif italic text-2xl">Your habit list is empty.</p>
                  <Button onClick={() => setActiveView('habits')} variant="outline" className="mt-8">Go to Habit Lab</Button>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {activeView === 'identities' && (
          <motion.div key="identities" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {identities.map(id => (
              <IdentityCard key={id.id} identity={id} habits={habits.filter(h => h.identityId === id.id)} />
            ))}
            <button 
              onClick={() => setShowAddIdentity(true)}
              className="border-2 border-dashed border-stone-800 rounded-[3.5rem] p-16 flex flex-col items-center justify-center text-stone-600 hover:border-amber-600/50 hover:bg-stone-900/40 hover:text-amber-500 transition-all group bg-stone-900/10"
            >
              <PlusCircle className="w-16 h-16 mb-6 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500" />
              <p className="font-serif italic text-2xl">New Persona</p>
              <p className="text-[10px] uppercase font-black tracking-widest mt-4 opacity-40">Identity-Based Growth</p>
            </button>
          </motion.div>
        )}

        {activeView === 'habits' && (
          <motion.div key="habits" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
              <div className="space-y-1">
                <h3 className="text-4xl font-display text-white italic">Habit Lab</h3>
                <p className="text-stone-500 font-serif italic text-lg tracking-wide">Design your daily systems.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <Button onClick={() => setShowAddIdentity(true)} variant="outline" className="border-stone-800 text-stone-500 px-8 py-4 rounded-2xl hover:text-white flex-1 md:flex-none">
                  <PlusCircle className="w-5 h-5 mr-3" /> New Persona
                </Button>
                <Button onClick={() => setShowAddHabit(true)} className="bg-amber-600 hover:bg-amber-500 rounded-2xl px-12 py-6 text-xl bg-amber-600 hover:bg-amber-500 shadow-2xl shadow-amber-900/40 flex-1 md:flex-none">
                  <Plus className="w-6 h-6 mr-3" /> Build Loop
                </Button>
              </div>
            </div>
            <div className="grid gap-8">
              {habits.map(habit => (
                <HabitLoopCard key={habit.id} habit={habit} identity={identities.find(i => i.id === habit.identityId)} />
              ))}
            </div>
          </motion.div>
        )}

        {activeView === 'timer' && (
          <motion.div key="timer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <FocusTimer focusTime={profile?.focusTime || 25} breakTime={profile?.breakTime || 5} habits={habits} />
          </motion.div>
        )}
      </AnimatePresence>

      <AddIdentityModal isOpen={showAddIdentity} onClose={() => setShowAddIdentity(false)} userId={user?.uid || ''} />
      <AddHabitModal isOpen={showAddHabit} onClose={() => setShowAddHabit(false)} userId={user?.uid || ''} identities={identities} />
    </div>
  );
};

const IdentityCard: React.FC<{ identity: GrowthIdentity; habits: Habit[] }> = ({ identity, habits }) => (
  <Card className="p-10 bg-stone-900/60 border-stone-800 rounded-[3rem] shadow-2xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
      <Target className="w-20 h-20 text-stone-700" />
    </div>
    <div className="relative z-10 space-y-6">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase font-black text-amber-500 tracking-[0.2em]">Persona System</span>
        <h3 className="text-4xl font-display text-white">{identity.title}</h3>
      </div>
      <div className="space-y-4">
        <div className="p-6 bg-stone-800/40 rounded-3xl border border-stone-800/50">
           <div className="text-[10px] uppercase font-black text-stone-600 mb-2 tracking-widest">Active Loops</div>
           <div className="text-2xl font-display text-white">{habits.length}</div>
        </div>
      </div>
    </div>
  </Card>
);

const ViewTab: React.FC<{ id: string; label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} className={cn("px-10 py-4 rounded-[2rem] text-sm font-bold transition-all whitespace-nowrap", active ? "bg-stone-100 text-stone-900 shadow-xl" : "text-stone-500 hover:text-stone-300 hover:bg-stone-800/50")}>
    {label}
  </button>
);

const DailyHabitCard: React.FC<{ habit: Habit; logs: HabitLog[]; userId: string; identity?: GrowthIdentity; onComplete: () => void }> = ({ habit, logs, userId, identity, onComplete }) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isDone = logs.find(l => l.habitId === habit.id && l.date === todayStr)?.completed;
  
  const toggleLog = async () => {
    const logId = `${habit.id}_${todayStr}`;
    try {
      const newStatus = !isDone;
      await setDoc(doc(db, `users/${userId}/habitLogs`, logId), {
        habitId: habit.id,
        date: todayStr,
        completed: newStatus,
        timestamp: serverTimestamp()
      });
      if (newStatus) {
        onComplete();
      }
    } catch (e) { handleFirestoreError(e, OperationType.WRITE, `users/${userId}/habitLogs/${logId}`); }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden p-0 rounded-[3rem] border-2 transition-all duration-500",
      isDone ? "border-emerald-600/30 bg-emerald-950/20 shadow-emerald-950/20" : "border-stone-800 bg-stone-900/60 hover:border-amber-600/20"
    )}>
      <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
        <button 
          onClick={toggleLog}
          className={cn(
            "w-24 h-24 rounded-[2rem] border-4 flex items-center justify-center transition-all duration-500 shrink-0 shadow-2xl",
            isDone 
              ? "bg-emerald-600 border-emerald-400 text-white scale-110" 
              : "bg-stone-800 border-stone-700 text-stone-600 hover:border-amber-600/50 hover:bg-stone-800/80"
          )}
        >
          {isDone ? <Check className="w-12 h-12" /> : <Flame className="w-12 h-12" />}
        </button>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <span className="text-[10px] uppercase font-black text-amber-500 tracking-[0.2em]">{identity?.title || 'Persona'}</span>
             {isDone && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-emerald-600/20 text-emerald-500 text-[10px] px-3 py-1 rounded-full font-black border border-emerald-600/30">VOTE CASTED</motion.span>}
          </div>
          <h4 className="text-3xl md:text-4xl font-display text-white">{habit.title}</h4>
          <p className="text-stone-400 font-serif italic text-xl">Target: {habit.target}</p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
           <div className="text-[10px] uppercase font-black text-stone-600 tracking-widest">Reward</div>
           <div className="text-amber-500 font-serif italic text-2xl">{habit.reward}</div>
        </div>
      </div>
      
      {/* Visual progress bar at bottom if multiple habits were a thing, but for single habit just a glow */}
      {isDone && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-2 bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />}
    </Card>
  );
};

const HabitLoopCard: React.FC<{ habit: Habit; identity?: GrowthIdentity }> = ({ habit, identity }) => (
  <Card className="p-12 bg-stone-900/60 border-stone-800 rounded-[3.5rem] relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 grayscale group-hover:grayscale-0 group-hover:opacity-20 transition-all duration-700">
      <RefreshCw className="w-24 h-24 text-amber-500 animate-spin-slow" />
    </div>

    <div className="flex flex-col lg:flex-row gap-12 relative z-10">
      <div className="lg:w-1/3 space-y-4">
        <span className="text-[10px] uppercase font-black text-amber-500 tracking-widest">Persona Architecture</span>
        <h4 className="text-4xl font-display text-white">{habit.title}</h4>
        <div className="flex items-center gap-4 pt-2">
          <div className="px-5 py-2 bg-stone-800 rounded-full text-[10px] font-black text-stone-400 border border-stone-700 tracking-widest uppercase">{identity?.title || 'Global'}</div>
          <div className="px-5 py-2 bg-stone-800 rounded-full text-[10px] font-black text-stone-400 border border-stone-700 tracking-widest uppercase">{habit.difficulty}</div>
        </div>
      </div>

      <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
        <LoopStep title="Cue" value={habit.cue} icon={<Zap className="w-5 h-5" />} color="text-sky-500" />
        <LoopStep title="Craving" value={habit.craving} icon={<Flame className="w-5 h-5" />} color="text-amber-500" />
        <LoopStep title="Response" value={habit.response} icon={<Target className="w-5 h-5" />} color="text-emerald-500" />
        <LoopStep title="Reward" value={habit.reward} icon={<Check className="w-5 h-5" />} color="text-rose-500" />
      </div>
    </div>
  </Card>
);

const LoopStep: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="space-y-3 p-6 bg-stone-800/30 rounded-[2rem] border border-stone-800/50 hover:border-amber-600/20 transition-all">
    <div className={cn("flex items-center gap-3 font-black text-[10px] uppercase tracking-widest", color)}>
      {icon} {title}
    </div>
    <p className="text-stone-300 font-serif italic text-lg leading-relaxed">{value}</p>
  </div>
);

const FocusTimer: React.FC<{ focusTime: number; breakTime: number; habits: Habit[] }> = ({ focusTime, breakTime, habits }) => {
  const [timeLeft, setTimeLeft] = useState(focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [selectedHabitId, setSelectedHabitId] = useState('');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const reset = () => {
    setIsActive(false);
    setTimeLeft((mode === 'focus' ? focusTime : breakTime) * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className="max-w-2xl mx-auto p-16 flex flex-col items-center text-center bg-stone-900/60 border-stone-800 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-stone-800 overflow-hidden">
         <motion.div 
           className="h-full bg-amber-600"
           initial={{ width: '0%' }}
           animate={{ width: `${(timeLeft / ((mode === 'focus' ? focusTime : breakTime) * 60)) * 100}%` }}
           transition={{ ease: "linear" }}
         />
      </div>

      <div className="flex bg-stone-800/50 p-2 rounded-[2rem] gap-1 mb-16 border border-stone-700">
        <button onClick={() => { setMode('focus'); setTimeLeft(focusTime * 60); setIsActive(false); }} className={cn("px-8 py-3 rounded-2xl text-sm font-black transition-all", mode === 'focus' ? "bg-amber-600 text-white shadow-lg" : "text-stone-500")}>Deep Focus</button>
        <button onClick={() => { setMode('break'); setTimeLeft(breakTime * 60); setIsActive(false); }} className={cn("px-8 py-3 rounded-2xl text-sm font-black transition-all", mode === 'break' ? "bg-amber-600 text-white shadow-lg" : "text-stone-500")}>Strategic Break</button>
      </div>

      <div className="mb-10 w-full group">
        <select 
          value={selectedHabitId}
          onChange={(e) => setSelectedHabitId(e.target.value)}
          className="w-full bg-stone-800/50 p-6 border border-stone-700 rounded-3xl text-stone-300 font-serif italic text-2xl outline-none cursor-pointer appearance-none text-center shadow-inner hover:bg-stone-800 transition-all"
        >
          <option value="">What is your focus now?</option>
          {habits.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
        </select>
        <p className="text-[10px] uppercase font-black text-stone-600 mt-4 tracking-widest">Select an intention for this session</p>
      </div>

      <div className="text-9xl font-display font-medium text-white mb-16 tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
        {minutes.toString().padStart(2, '0')}<span className="text-amber-600 opacity-50 shrink-0">:</span>{seconds.toString().padStart(2, '0')}
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full">
        <Button className="flex-1 py-8 text-2xl bg-amber-600 hover:bg-amber-500 rounded-[2rem] shadow-xl shadow-amber-900/20" onClick={() => setIsActive(!isActive)}>
          {isActive ? 'Pause Flow' : 'Start Flow'}
        </Button>
        <Button variant="outline" className="px-10 py-8 rounded-[2rem] border-stone-700 text-stone-400" onClick={reset}><RefreshCw className="w-8 h-8" /></Button>
      </div>
    </Card>
  );
};// Modals
const AddIdentityModal: React.FC<{ isOpen: boolean; onClose: () => void; userId: string }> = ({ isOpen, onClose, userId }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addDoc(collection(db, `users/${userId}/identities`), { title, createdAt: serverTimestamp() });
    setLoading(false); onClose(); setTitle('');
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-stone-900 border border-stone-800 rounded-[3rem] p-12 max-w-lg w-full shadow-2xl space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
           <Mascot mood="excited" className="scale-75" message="New persona! Who are we becoming?" />
           <h3 className="text-3xl font-display text-white">Create Persona</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            required 
            placeholder="e.g., I am a Reader" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-6 bg-stone-800 border-none rounded-3xl text-white font-serif italic text-xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all" 
          />
          <div className="flex flex-col gap-3">
            <Button className="w-full py-6 text-xl bg-amber-600 hover:bg-amber-500 rounded-2xl" isLoading={loading}>Initiate Persona</Button>
            <Button variant="ghost" className="w-full text-stone-500 hover:text-white" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AddHabitModal: React.FC<{ isOpen: boolean; onClose: () => void; userId: string; identities: GrowthIdentity[] }> = ({ isOpen, onClose, userId, identities }) => {
  const [form, setForm] = useState({ 
    title: '', 
    target: '', 
    identityId: '', 
    difficulty: 'easy', 
    cue: '', 
    craving: '',
    response: '',
    reward: '' 
  });
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addDoc(collection(db, `users/${userId}/habits`), { ...form, category: 'general', createdAt: serverTimestamp() });
    setLoading(false); onClose();
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-stone-950 border border-stone-800 rounded-[4rem] p-10 md:p-16 max-w-4xl w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] my-8">
        <div className="flex flex-col items-center text-center space-y-6 mb-12">
           <Mascot mood="thinking" className="scale-100" message="A habit is a tiny architecture. Let's design it perfectly." />
           <div className="space-y-2">
             <h3 className="text-4xl md:text-5xl font-display text-white italic">Design the Loop</h3>
             <p className="text-stone-500 font-serif italic text-lg">Follow the Atomic Habit law: Make it obvious, attractive, easy, and satisfying.</p>
           </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1: Core */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-stone-600 tracking-[0.2em] ml-4">Habit Name</label>
              <input placeholder="e.g. Morning Focus" className="w-full p-6 bg-stone-900 border border-stone-800 rounded-3xl text-white outline-none focus:border-amber-600/50 transition-all font-display text-xl" onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-stone-600 tracking-[0.2em] ml-4">Linked Persona</label>
              <select className={cn("w-full p-6 bg-stone-900 border border-stone-800 rounded-3xl text-white outline-none focus:border-amber-600/50 transition-all font-display text-xl cursor-pointer", identities.length === 0 && "border-red-900/50")} onChange={e => setForm({...form, identityId: e.target.value})} required>
                <option value="">{identities.length === 0 ? "Create a Persona first!" : "Who are you?"}</option>
                {identities.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
              </select>
              {identities.length === 0 && (
                <p className="text-[10px] text-amber-500 font-bold ml-4 uppercase tracking-tighter">You need a Persona to link your habit to.</p>
              )}
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-stone-600 tracking-[0.2em] ml-4">Daily Target</label>
              <input placeholder="e.g. 10 minutes" className="w-full p-6 bg-stone-900 border border-stone-800 rounded-3xl text-white outline-none focus:border-amber-600/50 transition-all font-display text-xl" onChange={e => setForm({...form, target: e.target.value})} />
            </div>
          </div>

          {/* Section 2: The Loop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-stone-900/40 p-10 rounded-[3rem] border border-stone-800/50">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-sky-500 tracking-[0.2em] flex items-center gap-2"><Zap className="w-3 h-3" /> Step 1: The Cue</label>
              <textarea placeholder="The obvious trigger (e.g. After I pour my coffee...)" className="w-full p-6 bg-stone-950 border border-stone-800 rounded-3xl text-stone-300 outline-none focus:border-sky-600/50 transition-all font-serif italic leading-relaxed min-h-[100px]" onChange={e => setForm({...form, cue: e.target.value})} required />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-amber-500 tracking-[0.2em] flex items-center gap-2"><Flame className="w-3 h-3" /> Step 2: The Craving</label>
              <textarea placeholder="What makes it attractive? (e.g. I want to feel sharp...)" className="w-full p-6 bg-stone-950 border border-stone-800 rounded-3xl text-stone-300 outline-none focus:border-amber-600/50 transition-all font-serif italic leading-relaxed min-h-[100px]" onChange={e => setForm({...form, craving: e.target.value})} required />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-emerald-500 tracking-[0.2em] flex items-center gap-2"><Target className="w-3 h-3" /> Step 3: The Response</label>
              <textarea placeholder="Make it easy (e.g. I will write one sentence...)" className="w-full p-6 bg-stone-950 border border-stone-800 rounded-3xl text-stone-300 outline-none focus:border-emerald-600/50 transition-all font-serif italic leading-relaxed min-h-[100px]" onChange={e => setForm({...form, response: e.target.value})} required />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-rose-500 tracking-[0.2em] flex items-center gap-2"><Check className="w-3 h-3" /> Step 4: The Reward</label>
              <textarea placeholder="Make it satisfying (e.g. I get to check the app...)" className="w-full p-6 bg-stone-950 border border-stone-800 rounded-3xl text-stone-300 outline-none focus:border-rose-600/50 transition-all font-serif italic leading-relaxed min-h-[100px]" onChange={e => setForm({...form, reward: e.target.value})} required />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 pt-6">
            <Button className="flex-1 py-8 text-2xl bg-amber-600 hover:bg-amber-500 rounded-[2.5rem] shadow-3xl shadow-amber-950/40" isLoading={loading}>Create Habit</Button>
            <Button variant="ghost" className="px-12 py-8 text-stone-600 hover:text-white" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
