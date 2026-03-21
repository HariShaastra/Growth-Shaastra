import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { Button, Card, SectionTitle } from './UI';
import { Goal, RitualLog } from '../types';
import { format, isToday } from 'date-fns';
import { Flame, Target, Calendar, ArrowRight, CheckCircle2, Trophy } from 'lucide-react';

export const Dashboard: React.FC<{ onStartRitual: () => void }> = ({ onStartRitual }) => {
  const { profile, user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recentLogs, setRecentLogs] = useState<RitualLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const goalsQuery = query(
      collection(db, `users/${user.uid}/goals`),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const logsQuery = query(
      collection(db, `users/${user.uid}/rituals`),
      orderBy('timestamp', 'desc'),
      limit(7)
    );

    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal)));
    });

    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      setRecentLogs(snapshot.docs.map(doc => doc.data() as RitualLog));
      setLoading(false);
    });

    return () => {
      unsubGoals();
      unsubLogs();
    };
  }, [user]);

  const ritualDoneToday = profile?.lastRitualDate === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <SectionTitle subtitle="Welcome back to your mental training.">
          Hello, {profile?.displayName?.split(' ')[0] || 'Seeker'}
        </SectionTitle>
        
        <div className="flex gap-4">
          <StatCard 
            icon={<Flame className="text-orange-500 w-5 h-5" />} 
            label="Streak" 
            value={`${profile?.streak || 0} Days`} 
          />
          <StatCard 
            icon={<Trophy className="text-yellow-500 w-5 h-5" />} 
            label="Identity" 
            value="Active" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-stone-900 text-white border-none p-10 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-3xl font-serif mb-4">Daily Ritual</h3>
              <p className="text-stone-400 mb-8 max-w-md">
                {ritualDoneToday 
                  ? "You've completed your training for today. Great work staying aligned."
                  : "Your mind needs its daily conditioning. Spend 10 minutes to reinforce your identity."}
              </p>
              <Button 
                variant={ritualDoneToday ? 'secondary' : 'primary'} 
                className={cn("bg-white text-stone-900 hover:bg-stone-100", ritualDoneToday && "opacity-80")}
                onClick={onStartRitual}
              >
                {ritualDoneToday ? 'Repeat Ritual' : 'Start Ritual'} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </Card>

          <div className="space-y-4">
            <h4 className="text-lg font-medium text-stone-900 flex items-center gap-2">
              <Target className="w-5 h-5" /> Active Goals
            </h4>
            <div className="grid gap-4">
              {goals.length > 0 ? (
                goals.map(goal => (
                  <Card key={goal.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{goal.title}</p>
                      <p className="text-sm text-stone-500">{goal.targetDate ? `Target: ${goal.targetDate}` : 'No target date'}</p>
                    </div>
                    <CheckCircle2 className="text-stone-200 w-6 h-6" />
                  </Card>
                ))
              ) : (
                <p className="text-stone-400 italic">No active goals. Define them in the Goals module.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-stone-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Recent Activity
            </h4>
            <div className="space-y-3">
              {recentLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-stone-900" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-800">{format(new Date(log.date), 'MMM do')}</p>
                    <p className="text-xs text-stone-400">{log.stepsCompleted.length} steps completed</p>
                  </div>
                  {log.actedAccordingToIdentity && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-stone-400 text-sm italic">No logs yet. Start your first ritual.</p>
              )}
            </div>
          </div>

          <Card className="bg-stone-50 border-dashed border-stone-300">
            <h5 className="text-sm font-medium text-stone-900 mb-2">Identity Tip</h5>
            <p className="text-xs text-stone-500 leading-relaxed">
              Read your identity statement in the mirror to engage your visual cortex and reinforce self-recognition.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-white px-4 py-2 rounded-xl border border-stone-200 flex items-center gap-3 shadow-sm">
    <div className="p-1.5 bg-stone-50 rounded-lg">{icon}</div>
    <div>
      <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">{label}</p>
      <p className="text-sm font-bold text-stone-900">{value}</p>
    </div>
  </div>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
