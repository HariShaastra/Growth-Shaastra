import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Button, Card, SectionTitle } from './UI';
import { Goal } from '../types';
import { cn } from '../lib/utils';
import { Plus, Trash2, CheckCircle2, Circle, Calendar, Target } from 'lucide-react';

export const GoalModule: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/goals`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    });
    return unsubscribe;
  }, [user]);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGoalTitle) return;
    setLoading(true);
    try {
      await addDoc(collection(db, `users/${user.uid}/goals`), {
        title: newGoalTitle,
        targetDate: newGoalDate,
        status: 'active',
        createdAt: serverTimestamp(),
      });
      setNewGoalTitle('');
      setNewGoalDate('');
      setShowAdd(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/goals`);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoalStatus = async (goal: Goal) => {
    if (!user) return;
    const newStatus = goal.status === 'completed' ? 'active' : 'completed';
    try {
      await updateDoc(doc(db, `users/${user.uid}/goals`, goal.id), {
        status: newStatus,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/goals/${goal.id}`);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/goals`, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/goals/${id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
      <div className="flex items-end justify-between">
        <SectionTitle subtitle="Translate your vision into clear, measurable outcomes.">
          Goal Structuring
        </SectionTitle>
        <Button onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Goal</>}
        </Button>
      </div>

      {showAdd && (
        <Card className="p-8 border-stone-900 border-2">
          <form onSubmit={handleAddGoal} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Goal Title</label>
                <input
                  required
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g., Master Advanced Calculus"
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Target Date (Optional)</label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none"
                />
              </div>
            </div>
            <Button type="submit" className="w-full py-3" isLoading={loading}>Create Goal</Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {goals.length > 0 ? (
          goals.map(goal => (
            <Card key={goal.id} className={cn(
              "p-6 flex items-center justify-between transition-all",
              goal.status === 'completed' && "opacity-60 bg-stone-50"
            )}>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleGoalStatus(goal)} className="text-stone-400 hover:text-stone-900 transition-colors">
                  {goal.status === 'completed' ? (
                    <CheckCircle2 className="w-8 h-8 text-stone-900" />
                  ) : (
                    <Circle className="w-8 h-8" />
                  )}
                </button>
                <div>
                  <h4 className={cn("text-xl font-serif font-medium", goal.status === 'completed' && "line-through")}>
                    {goal.title}
                  </h4>
                  {goal.targetDate && (
                    <p className="text-sm text-stone-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" /> {goal.targetDate}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => deleteGoal(goal.id)}
                className="p-2 text-stone-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-3xl">
            <Target className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400 font-serif text-lg italic">No goals defined yet. Start by adding your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
};
