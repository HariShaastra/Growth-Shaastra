import React, { useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button, Card, SectionTitle } from './UI';

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
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <SectionTitle subtitle="Define your core identity to begin your mental training.">
          Initial Setup
        </SectionTitle>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Identity Statement (Who are you?)
            </label>
            <textarea
              required
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="e.g., I am a disciplined learner who masters complex concepts with ease."
              className="w-full p-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Vision (Where are you going?)
            </label>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="e.g., To become a leading researcher in sustainable energy."
              className="w-full p-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Mission (How will you get there?)
            </label>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="e.g., By dedicating 4 hours daily to deep study and practical experimentation."
              className="w-full p-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none min-h-[80px]"
            />
          </div>

          <Button type="submit" className="w-full py-4 text-lg" isLoading={loading}>
            Complete Setup
          </Button>
        </form>
      </Card>
    </div>
  );
};
