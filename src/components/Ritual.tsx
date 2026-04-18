import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, updateDoc, serverTimestamp, increment, collection, query, onSnapshot } from 'firebase/firestore';
import { Button, Card } from './UI';
import { RitualStep } from '../types';
import { format } from 'date-fns';
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { Mascot } from './Mascot';
import { cn } from '../lib/utils';

export const Ritual: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { profile, user } = useAuth();
  const [step, setStep] = useState<RitualStep>('identity');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [reflection, setReflection] = useState('');
  const [acted, setActed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState<any[]>([]);
  const [habitLogs, setHabitLogs] = useState<any[]>([]);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!user) return;
    const qHabits = query(collection(db, `users/${user.uid}/habits`));
    const qLogs = query(collection(db, `users/${user.uid}/habitLogs`));
    
    const u1 = onSnapshot(qHabits, (s) => setHabits(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(qLogs, (s) => setHabitLogs(s.docs.map(d => d.data())));
    
    return () => { u1(); u2(); };
  }, [user]);

  const nextStep = () => {
    setCompletedSteps(prev => [...new Set([...prev, step])]);
    if (step === 'identity') setStep('visualization');
    else if (step === 'visualization') setStep('suggestion');
    else if (step === 'suggestion') setStep('action');
    else if (step === 'action') setStep('reflection');
  };

  const prevStep = () => {
    if (step === 'visualization') setStep('identity');
    else if (step === 'suggestion') setStep('visualization');
    else if (step === 'action') setStep('suggestion');
    else if (step === 'reflection') setStep('action');
  };

  const finishRitual = async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const ritualPath = `users/${user.uid}/rituals/${today}`;
      await setDoc(doc(db, ritualPath), {
        date: today,
        stepsCompleted: [...completedSteps, 'reflection'],
        reflection,
        actedAccordingToIdentity: acted,
        timestamp: serverTimestamp(),
      });

      if (profile.lastRitualDate !== today) {
        const newRitualsCount = (profile.ritualsCompletedCount || 0) + 1;
        const shouldLevelUp = newRitualsCount % 5 === 0;
        
        await updateDoc(doc(db, 'users', user.uid), {
          streak: increment(1),
          lastRitualDate: today,
          ritualsCompletedCount: newRitualsCount,
          level: shouldLevelUp ? increment(1) : (profile.level || 1)
        });
      }
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/rituals/${today}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {step === 'identity' && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="flex flex-col items-center text-center space-y-8">
              <Mascot mood="peaceful" message="Take a deep breath. Center yourself. Read your truth." />
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-display text-white italic tracking-tighter">Identity Anchor</h1>
                <p className="text-stone-500 font-serif italic text-lg uppercase tracking-widest">The source of your power</p>
              </div>
            </div>
            
            <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-16 relative overflow-hidden bg-stone-900 border-stone-800 shadow-[0_0_80px_rgba(0,0,0,0.5)] rounded-[4rem]">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-600/5 to-transparent pointer-events-none" />
              <motion.div 
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-4xl md:text-7xl font-serif italic font-medium leading-[1.3] text-amber-500 max-w-2xl px-4"
              >
                "{profile?.identityStatement}"
              </motion.div>
              
              <div className="mt-16 flex items-center gap-4 text-stone-600">
                 <div className="w-12 h-px bg-stone-800" />
                 <span className="text-[10px] font-black tracking-[0.3em] uppercase">Breathe into this</span>
                 <div className="w-12 h-px bg-stone-800" />
              </div>
            </Card>

            <div className="flex justify-center pt-8">
              <Button onClick={nextStep} className="px-24 py-10 text-3xl bg-amber-600 rounded-[2.5rem] hover:bg-amber-500 shadow-3xl shadow-amber-950/40 group">
                I Read it <ArrowRight className="ml-4 w-10 h-10 group-hover:translate-x-3 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'visualization' && (
          <motion.div
            key="visualization"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-12"
          >
            <div className="flex flex-col items-center text-center space-y-8">
              <Mascot mood="thinking" message="Now, project your future. See every detail clearly." />
              <h1 className="text-4xl md:text-6xl font-display text-white italic tracking-tighter">The Vision Projection</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <VisualizationCard 
                title="The Long Game" 
                content={profile?.vision || "See yourself happy and strong 10 years from now. Every goal achieved."} 
              />
              <VisualizationCard 
                title="The Daily Win" 
                content="Imagine yourself today, working with absolute focus and flow." 
              />
            </div>

            <div className="flex justify-between items-center pt-8">
              <Button variant="outline" onClick={prevStep} className="rounded-[2rem] border-stone-800 text-stone-500 py-6 px-12 text-xl font-bold hover:text-white">
                <ArrowLeft className="mr-3 w-6 h-6" /> Back
              </Button>
              <Button onClick={nextStep} className="px-20 py-10 text-3xl bg-amber-600 rounded-[2.5rem] hover:bg-amber-500 shadow-3xl group">
                I See it <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'suggestion' && (
          <motion.div
            key="suggestion"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-12"
          >
            <div className="flex flex-col items-center text-center space-y-8">
              <Mascot mood="excited" message="Speak these as absolute facts. Your neurons are listening." />
              <h1 className="text-4xl md:text-6xl font-display text-white italic tracking-tighter">Direct Commands</h1>
            </div>
            
            <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
              <SuggestionItem text="My focus is absolute." delay={0} />
              <SuggestionItem text="I execute with precision." delay={0.1} />
              <SuggestionItem text="Resistance is data, not a block." delay={0.2} />
              <SuggestionItem text="I am the architect of my time." delay={0.3} />
            </div>

            <div className="flex justify-between items-center pt-8">
              <Button variant="outline" onClick={prevStep} className="rounded-[2rem] border-stone-800 text-stone-500 py-6 px-12 text-xl hover:text-white">
                <ArrowLeft className="mr-3 w-6 h-6" /> Re-anchor
              </Button>
              <Button onClick={nextStep} className="px-20 py-10 text-3xl bg-amber-600 rounded-[2.5rem] hover:bg-amber-500 shadow-3xl group">
                I Say it <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'action' && (
          <motion.div
            key="action"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <Mascot mood="excited" message="Execution is the only truth. Here is your loop for today." />
              <h1 className="text-4xl md:text-6xl font-display text-white italic tracking-tighter">The Daily Loop</h1>
            </div>
            
            <div className="space-y-8 max-w-3xl mx-auto">
              {habits.slice(0, 3).map((h, i) => {
                const isDone = habitLogs.some(l => l.habitId === h.id && l.date === today && l.completed);
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.1 }}
                    key={h.id}
                    className={cn(
                      "bg-stone-900 border border-stone-800 p-8 rounded-[3rem] flex items-center justify-between group transition-all shadow-2xl",
                      isDone && "border-emerald-600/50 bg-emerald-900/10"
                    )}
                  >
                    <div className="space-y-1">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", isDone ? "text-emerald-500" : "text-amber-500")}>
                        {isDone ? "Loop Finished" : "Active System"}
                      </span>
                      <h3 className="text-3xl font-display text-white">{h.title}</h3>
                      <p className="text-stone-500 font-serif italic">{h.target}</p>
                    </div>
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center border transition-all",
                      isDone ? "bg-emerald-600 border-emerald-500 text-white" : "bg-stone-800 border-stone-700 text-stone-600"
                    )}>
                      {isDone ? <CheckCircle2 className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
                    </div>
                  </motion.div>
                );
              })}
              {habits.length === 0 && <p className="text-center text-stone-600 font-serif italic text-2xl">No active loops found. Set them in the Lab.</p>}
            </div>

            <div className="flex justify-between items-center pt-8">
              <Button variant="outline" onClick={prevStep} className="rounded-[2rem] border-stone-800 text-stone-500 py-6 px-12 text-xl hover:text-white">
                <ArrowLeft className="mr-3 w-6 h-6" /> Back
              </Button>
              <Button onClick={nextStep} className="px-20 py-10 text-3xl bg-amber-600 rounded-[2.5rem] hover:bg-amber-500 shadow-3xl group">
                I am Ready <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'reflection' && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <Mascot mood="happy" message="Great job! How do you feel about today?" />
              <h1 className="text-4xl md:text-5xl font-display text-white">Well Done!</h1>
            </div>
            
            <Card className="p-12 bg-stone-900/60 border-stone-800 shadow-2xl rounded-[3rem] space-y-12">
              <div className="space-y-6">
                <label className="block text-2xl font-serif italic text-stone-300">
                  Did you live as your best self today?
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button 
                    variant={acted === true ? 'primary' : 'outline'} 
                    className={cn(
                      "flex-1 py-8 rounded-[2rem] text-xl border-stone-700",
                      acted === true && "bg-emerald-600 text-white border-none shadow-emerald-900/20"
                    )}
                    onClick={() => setActed(true)}
                  >
                    Yes, I did!
                  </Button>
                  <Button 
                    variant={acted === false ? 'primary' : 'outline'} 
                    className={cn(
                      "flex-1 py-8 rounded-[2rem] text-xl border-stone-700",
                      acted === false && "bg-amber-600 text-white border-none shadow-amber-900/20"
                    )}
                    onClick={() => setActed(false)}
                  >
                    Not yet, tomorrow I will.
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black text-stone-500 uppercase tracking-widest pl-2">
                  Notes (How was your day?)
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="I felt strong today because..."
                  className="w-full p-8 rounded-[2.5rem] bg-stone-800 border-none focus:ring-4 focus:ring-amber-900/20 outline-none min-h-[160px] font-serif italic text-xl text-white placeholder:text-stone-600 shadow-inner"
                />
              </div>
            </Card>

            <div className="flex justify-between items-center pt-8">
              <Button variant="outline" onClick={prevStep} className="rounded-2xl border-stone-800 text-stone-500 py-6 px-10">
                <ArrowLeft className="mr-2 w-5 h-5" /> Back
              </Button>
              <Button onClick={finishRitual} className="px-20 py-8 text-2xl bg-emerald-600 hover:bg-emerald-500 shadow-2xl shadow-emerald-900/40 rounded-[2.5rem] text-white" isLoading={loading}>
                Finish Day
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VisualizationCard: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <Card className="p-8 bg-stone-900/40 border-stone-800 rounded-[2rem] hover:bg-stone-800 transition-colors cursor-default group">
    <h4 className="text-xl font-display font-medium text-amber-500 mb-4 group-hover:scale-105 transition-transform origin-left">{title}</h4>
    <p className="text-stone-400 leading-relaxed font-serif italic text-lg">{content}</p>
  </Card>
);

const SuggestionItem: React.FC<{ text: string, delay?: number }> = ({ text, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    whileHover={{ x: 10 }}
    className="p-8 bg-stone-900/60 border border-stone-800 rounded-[2.5rem] flex items-center gap-6 shadow-xl"
  >
    <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-900/20">
      <CheckCircle2 className="w-6 h-6" />
    </div>
    <p className="text-2xl text-stone-200 font-serif italic leading-relaxed">{text}</p>
  </motion.div>
);
