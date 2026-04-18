import React, { useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { Button, Card } from './UI';
import { Mascot } from './Mascot';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const SetupProfile: React.FC = () => {
  const [identity, setIdentity] = useState('');
  const [vision, setVision] = useState('');
  const [mission, setMission] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !identity) return;

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        email: auth.currentUser.email,
        identityStatement: identity,
        vision,
        mission,
        streak: 0,
        level: 1,
        focusTime: 25,
        breakTime: 5,
        role: 'user',
        createdAt: serverTimestamp(),
      });

      // Automatically create a Master Persona from the identity statement
      await addDoc(collection(db, `users/${auth.currentUser.uid}/identities`), {
        title: identity.length > 30 ? identity.substring(0, 30) + '...' : identity,
        description: `This is my core identity: ${identity}`,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1917] p-6 flex items-center justify-center overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full"
      >
        <Card className="p-10 bg-stone-900/60 border-stone-800 shadow-2xl backdrop-blur-md rounded-[3rem] space-y-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <Mascot mood="excited" message="Hi! I am Bodh. I will stay with you on this journey. Let's finish your profile!" />
            <div className="space-y-4">
              <h1 className="text-4xl font-display text-white">Start Your Training</h1>
              <p className="text-stone-400 font-serif italic text-lg leading-relaxed">
                Answer these simple things to get started.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-amber-500 tracking-[0.2em] pl-1">
                Who are you? (Type your identity)
              </label>
              <textarea
                required
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="Example: I am a person who finishes everything I start."
                className="w-full p-6 rounded-[2rem] bg-stone-800 border-none focus:ring-4 focus:ring-amber-900/20 outline-none transition-all min-h-[120px] font-serif italic text-lg text-white placeholder:text-stone-600"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-amber-500 tracking-[0.2em] pl-1">
                Your Big Goal (Vision)
              </label>
              <textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Example: I want to be a great artist."
                className="w-full p-6 rounded-3xl bg-stone-800 border-none focus:ring-4 focus:ring-amber-900/20 outline-none transition-all min-h-[100px] font-serif italic text-lg text-white placeholder:text-stone-600"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-amber-500 tracking-[0.2em] pl-1">
                How will you reach it? (Mission)
              </label>
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="Example: I will work 1 hour every day."
                className="w-full p-6 rounded-3xl bg-stone-800 border-none focus:ring-4 focus:ring-amber-900/20 outline-none transition-all min-h-[100px] font-serif italic text-lg text-white placeholder:text-stone-600"
              />
            </div>

            <Button type="submit" className="w-full py-8 text-2xl bg-amber-600 text-white hover:bg-amber-500 shadow-2xl shadow-amber-900/20 rounded-[2.5rem]" isLoading={loading}>
              Let's Start! <ArrowRight className="ml-4 w-8 h-8" />
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
