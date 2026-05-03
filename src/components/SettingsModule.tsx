import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button, Card } from './UI';
import { User, Zap, Rocket, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Mascot } from './Mascot';

export const SettingsModule: React.FC = () => {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    identityStatement: profile?.identityStatement || '',
    focusTime: profile?.focusTime || 25,
    breakTime: profile?.breakTime || 5,
    vision: profile?.vision || '',
    mission: profile?.mission || '',
  });

  // Sync with profile when it's loaded
  React.useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        identityStatement: profile.identityStatement || '',
        focusTime: profile.focusTime || 25,
        breakTime: profile.breakTime || 5,
        vision: profile.vision || '',
        mission: profile.mission || '',
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);
    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      setMessage({ text: 'Settings updated successfully!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      setMessage({ text: 'Failed to save settings. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 pb-48">
      <header className="space-y-2 mb-12">
        <h1 className="text-4xl md:text-5xl font-display text-white">Settings</h1>
        <p className="text-stone-400 font-serif italic text-lg opacity-80">"Fix your system, grow your life."</p>
      </header>

      <div className="bg-stone-900/40 p-10 rounded-[3rem] border border-stone-800 flex items-center gap-10 mb-12">
         <Mascot mood="thinking" className="scale-75 shrink-0" message="This is where we fine-tune your growth machine!" />
         <div className="space-y-2">
            <h3 className="text-2xl font-display text-white">System Controls</h3>
            <p className="text-stone-400 font-serif italic text-lg leading-relaxed">Adjust your timers and core goals to fit your daily life.</p>
         </div>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-[2rem] mb-12 flex items-center justify-center text-lg font-display",
            message.type === 'success' ? "bg-emerald-900/20 text-emerald-500 border border-emerald-900/30" : "bg-red-900/20 text-red-500 border border-red-900/30"
          )}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Card className="p-10 space-y-10 md:col-span-2 bg-stone-900/60 border-stone-800 rounded-[3rem] shadow-2xl shadow-black">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-stone-800 rounded-2xl shadow-inner border border-stone-700/50">
              <User className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-3xl font-display text-white">My Persona</h3>
          </div>
          <div className="grid grid-cols-1 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">Display Name</label>
              <input 
                className="w-full p-6 rounded-3xl bg-stone-800/50 border-none text-white font-serif italic text-2xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all shadow-inner" 
                value={formData.displayName} 
                onChange={e => setFormData({...formData, displayName: e.target.value})} 
                placeholder="How should I call you?"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">My Growth Vow</label>
              <textarea 
                className="w-full p-6 rounded-3xl bg-stone-800/50 border-none text-white font-serif italic text-2xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all min-h-[160px] leading-relaxed shadow-inner" 
                value={formData.identityStatement} 
                onChange={e => setFormData({...formData, identityStatement: e.target.value})} 
                placeholder="I am someone who..."
              />
            </div>
          </div>
        </Card>

        <Card className="p-10 space-y-10 bg-stone-900/60 border-stone-800 rounded-[3rem] shadow-2xl shadow-black">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-stone-800 rounded-2xl shadow-inner border border-stone-700/50">
              <Zap className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-3xl font-display text-white">Focus Timer</h3>
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">Focus Time (minutes)</label>
              <input 
                type="number"
                className="w-full p-6 rounded-3xl bg-stone-800/50 border-none text-white font-serif italic text-3xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all shadow-inner" 
                value={formData.focusTime} 
                onChange={e => setFormData({...formData, focusTime: parseInt(e.target.value) || 25})} 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">Break Time (minutes)</label>
              <input 
                type="number"
                className="w-full p-6 rounded-3xl bg-stone-800/50 border-none text-white font-serif italic text-3xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all shadow-inner" 
                value={formData.breakTime} 
                onChange={e => setFormData({...formData, breakTime: parseInt(e.target.value) || 5})} 
              />
            </div>
          </div>
        </Card>

        <Card className="p-10 space-y-10 bg-stone-900/60 border-stone-800 rounded-[3rem] shadow-2xl shadow-black">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-stone-800 rounded-2xl shadow-inner border border-stone-700/50">
              <Rocket className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-3xl font-display text-white">Big Goals</h3>
          </div>
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">My Vision</label>
              <textarea 
                className="w-full p-6 rounded-3xl bg-stone-800/50 border-none text-white font-serif italic text-xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all font-serif italic leading-relaxed shadow-inner min-h-[100px]" 
                value={formData.vision} 
                onChange={e => setFormData({...formData, vision: e.target.value})} 
                placeholder="Where do I see myself?"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-stone-600 tracking-widest pl-2">My Mission</label>
              <textarea 
                className="w-full p-6 rounded-3xl bg-stone-800/50 border-none text-white font-serif italic text-xl focus:ring-4 focus:ring-amber-900/20 outline-none transition-all font-serif italic leading-relaxed shadow-inner min-h-[100px]" 
                value={formData.mission} 
                onChange={e => setFormData({...formData, mission: e.target.value})} 
                placeholder="What will I do to get there?"
              />
            </div>
          </div>
        </Card>

        <div className="fixed bottom-12 left-0 right-0 p-8 lg:left-72 z-40">
          <div className="max-w-5xl mx-auto flex justify-end">
            <Button 
              className="px-20 py-8 text-2xl bg-amber-600 hover:bg-amber-500 shadow-2xl shadow-amber-900/20 rounded-[2.5rem]" 
              isLoading={loading}
              type="submit"
            >
              <Save className="w-8 h-8 mr-5" /> Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
