import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Button, Card } from './UI';
import { Initiative } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, Briefcase, Users, Heart, 
  Plus, Activity, Globe, Target, Edit3, MessageCircle,
  ArrowLeft, Home
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Mascot } from './Mascot';

interface KaryaModuleProps {
  onBack?: () => void;
  onHome?: () => void;
}

export const KaryaModule: React.FC<KaryaModuleProps> = ({ onBack, onHome }) => {
  const { user } = useAuth();
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/initiatives`), orderBy('createdAt', 'desc'));
    const path = `users/${user.uid}/initiatives`;
    return onSnapshot(q, 
      (s) => setInitiatives(s.docs.map(d => ({ id: d.id, ...d.data() } as Initiative))),
      (e) => handleFirestoreError(e, OperationType.LIST, path)
    );
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 overflow-x-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <Button 
              onClick={onBack} 
              variant="outline" 
              className="px-5 py-3.5 bg-stone-900 border-2 border-stone-500 text-stone-100 hover:text-amber-500 hover:border-amber-500 hover:bg-stone-800 transition-all font-bold shadow-md rounded-2xl flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </Button>
            <Button 
              onClick={onHome} 
              variant="outline" 
              className="px-5 py-3.5 bg-stone-900 border-2 border-stone-500 text-stone-100 hover:text-amber-500 hover:border-amber-500 hover:bg-stone-800 transition-all font-bold shadow-md rounded-2xl flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" /> Back to Home
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-white">Big Projects</h1>
          <p className="text-stone-400 font-serif italic text-lg">"Change your world."</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-600 hover:bg-amber-500 text-white rounded-2xl px-10 py-5 font-black shadow-2xl shadow-amber-900/40 ring-2 ring-amber-400/20">
          <Plus className="w-6 h-6 mr-3" /> New Project
        </Button>
      </header>

      <div className="bg-stone-900/40 p-8 rounded-[3rem] border border-stone-800 flex items-center gap-8">
         <Mascot mood="excited" className="scale-75 shrink-0" message="Hello! I am Bodh. I am excited to help you finish your big projects!" />
         <div className="space-y-2">
            <h3 className="text-2xl font-display text-white">Your Impact</h3>
            <p className="text-stone-400 font-serif italic text-lg leading-relaxed">Turn your best ideas into real things.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initiatives.map(initiative => (
          <InitiativeCard key={initiative.id} initiative={initiative} userId={user?.uid || ''} />
        ))}
        {initiatives.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-stone-800 rounded-[3rem] bg-stone-900/20">
            <Rocket className="w-20 h-20 mx-auto mb-6 text-stone-800" />
            <h3 className="text-2xl font-serif text-stone-600 italic">No projects yet. You have so much power in you!</h3>
          </div>
        )}
      </div>

      <AddInitiativeModal isOpen={showAdd} onClose={() => setShowAdd(false)} userId={user?.uid || ''} />
    </div>
  );
};

const InitiativeCard: React.FC<{ initiative: Initiative; userId: string }> = ({ initiative, userId }) => {
  const [updating, setUpdating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const typeIcons = {
    profit: <Briefcase className="w-5 h-5" />,
    'non-profit': <Heart className="w-5 h-5" />,
    community: <Users className="w-5 h-5" />,
    personal: <Target className="w-5 h-5" />,
    others: <Globe className="w-5 h-5" />
  };

  const stageColors = {
    idea: 'bg-stone-800 text-stone-400 border-stone-700',
    pilot: 'bg-amber-900/40 text-amber-500 border-amber-900/50',
    active: 'bg-emerald-900/40 text-emerald-500 border-emerald-900/50',
    growing: 'bg-indigo-900/40 text-indigo-500 border-indigo-900/50'
  };

  const stages = ['idea', 'pilot', 'active', 'growing'] as const;
  const progress = initiative.stage === 'idea' ? 20 : initiative.stage === 'pilot' ? 45 : initiative.stage === 'active' ? 75 : 100;

  const updateStage = async (newStage: string) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, `users/${userId}/initiatives`, initiative.id), {
        stage: newStage
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${userId}/initiatives/${initiative.id}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col p-10 bg-stone-900/80 border-stone-800 hover:border-amber-600/40 hover:shadow-[0_0_50px_rgba(217,119,6,0.1)] transition-all rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-600/5 rounded-full blur-3xl group-hover:bg-amber-600/10 transition-all" />
        
        <div className="flex justify-between items-start mb-10">
          <div className="p-4 bg-stone-800 rounded-2xl text-amber-500 border border-stone-700/50 shadow-inner group-hover:scale-110 transition-transform">
            {typeIcons[initiative.type] || <Rocket className="w-6 h-6" />}
          </div>
          <div className="flex flex-col items-end gap-2">
            <select 
              value={initiative.stage} 
              disabled={updating}
              onChange={(e) => updateStage(e.target.value)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest border backdrop-blur-sm cursor-pointer outline-none transition-all", 
                stageColors[initiative.stage as keyof typeof stageColors]
              )}
            >
              {stages.map(s => <option key={s} value={s} className="bg-stone-900 text-stone-300">{s} Phase</option>)}
            </select>
            <span className="text-[10px] font-black text-stone-600 tracking-widest uppercase">LVL {Math.floor(progress / 20)} Project</span>
          </div>
        </div>
        
        <h3 className="text-3xl font-display text-white mb-4 leading-tight group-hover:text-amber-500 transition-colors uppercase tracking-tighter italic">{initiative.name}</h3>
        <p className="text-stone-400 text-lg mb-8 line-clamp-3 italic font-serif leading-relaxed">"{initiative.problemStatement}"</p>
        
        {initiative.solution && (
          <div className="mb-8 p-4 bg-stone-950/40 rounded-2xl border border-stone-800/50">
             <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest mb-2 block">Action Plan</span>
             <p className="text-stone-500 font-serif italic text-sm leading-relaxed truncate">{initiative.solution}</p>
          </div>
        )}

        <div className="flex gap-2 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 rounded-xl bg-stone-800 border-stone-700 text-stone-400 hover:text-white"
            onClick={() => setShowEdit(true)}
          >
            <Edit3 className="w-4 h-4 mr-2" /> Edit
          </Button>
        </div>
        
        <div className="mt-auto space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black tracking-[0.2em] text-stone-600 uppercase">
              <span>Momentum</span>
              <span className="text-amber-500">{progress}%</span>
            </div>
            <div className="w-full bg-stone-950 h-3 rounded-full overflow-hidden border border-stone-800 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-all duration-1000" 
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-stone-700 bg-stone-950/40 p-3 rounded-xl border border-stone-800/50">
            <span className="flex items-center gap-2">Target Group</span>
            <span className="text-stone-400 truncate max-w-[120px]">{initiative.targetGroup || 'Universal'}</span>
          </div>
        </div>
      </Card>
      <UpdateInitiativeModal 
        isOpen={showEdit} 
        onClose={() => setShowEdit(false)} 
        userId={userId} 
        initiative={initiative} 
      />
    </motion.div>
  );
};

const AddInitiativeModal: React.FC<{ isOpen: boolean; onClose: () => void; userId: string }> = ({ isOpen, onClose, userId }) => {
  const [form, setForm] = useState({ name: '', type: 'profit', stage: 'idea', problemStatement: '', solution: '', targetGroup: '' });
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addDoc(collection(db, `users/${userId}/initiatives`), { ...form, createdAt: serverTimestamp() });
    setLoading(false); onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-stone-900 border border-stone-800 rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] space-y-10">
        <div className="flex flex-col items-center text-center space-y-4">
           <Mascot mood="excited" className="scale-75" message="Hello! I am Bodh. Write down your project below!" />
           <h3 className="text-4xl font-display text-white">New Project</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">Project Name</label>
              <input required className="w-full p-6 bg-stone-800 border-none rounded-3xl text-white font-serif italic text-2xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all shadow-inner" onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">What kind?</label>
              <select className="w-full p-6 bg-stone-800 border-none rounded-3xl text-white font-serif italic text-lg focus:ring-4 focus:ring-amber-900/20 outline-none transition-all shadow-inner" onChange={e => setForm({...form, type: e.target.value as any})}>
                <option value="profit">Business / Profit</option>
                <option value="non-profit">Social Good</option>
                <option value="community">Community</option>
                <option value="personal">Personal Project</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">The Problem (Why?)</label>
            <textarea required className="w-full p-6 bg-stone-800 border-none rounded-3xl text-white font-serif italic text-xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all min-h-[120px] shadow-inner" onChange={e => setForm({...form, problemStatement: e.target.value})} placeholder="What problem are you solving?" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">The Solution (How?)</label>
            <textarea required className="w-full p-6 bg-stone-800 border-none rounded-3xl text-white font-serif italic text-xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all min-h-[120px] shadow-inner" onChange={e => setForm({...form, solution: e.target.value})} placeholder="How will you fix it?" />
          </div>

          <div className="pt-6 flex flex-col gap-3">
            <Button className="w-full py-8 text-2xl bg-amber-600 hover:bg-amber-500 rounded-[2rem] shadow-xl shadow-amber-900/20" isLoading={loading}>Start Building</Button>
            <Button variant="ghost" className="w-full text-stone-500 hover:text-white" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const UpdateInitiativeModal: React.FC<{ isOpen: boolean; onClose: () => void; userId: string; initiative: Initiative }> = ({ isOpen, onClose, userId, initiative }) => {
  const [form, setForm] = useState({ ...initiative });
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateDoc(doc(db, `users/${userId}/initiatives`, initiative.id), { ...form });
    setLoading(false); onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-stone-900 border border-stone-800 rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] space-y-10">
        <div className="flex flex-col items-center text-center space-y-4">
           <Mascot mood="thinking" className="scale-75" message="Hello! I am Bodh. Let's update your project progress!" />
           <h3 className="text-4xl font-display text-white">Update Project</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">Project Name</label>
            <input required value={form.name} className="w-full p-6 bg-stone-800 border-none rounded-3xl text-white font-serif italic text-2xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all shadow-inner" onChange={e => setForm({...form, name: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">The Problem (Current View)</label>
            <textarea required value={form.problemStatement} className="w-full p-6 bg-stone-800 border-none rounded-3xl text-white font-serif italic text-xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all min-h-[120px] shadow-inner" onChange={e => setForm({...form, problemStatement: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">Current Status / Next Steps</label>
            <textarea required value={form.solution} className="w-full p-6 bg-stone-800 border-none rounded-3xl text-white font-serif italic text-xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all min-h-[120px] shadow-inner" onChange={e => setForm({...form, solution: e.target.value})} />
          </div>

          <div className="pt-6 flex flex-col gap-3">
            <Button className="w-full py-8 text-2xl bg-amber-600 hover:bg-amber-500 rounded-[2rem] shadow-xl shadow-amber-900/20" isLoading={loading}>Save Progress</Button>
            <Button variant="ghost" className="w-full text-stone-500 hover:text-white" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
