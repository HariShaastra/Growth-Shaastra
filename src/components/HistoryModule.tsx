import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card, SectionTitle } from './UI';
import { RitualLog } from '../types';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Calendar } from 'lucide-react';

export const HistoryModule: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<RitualLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/rituals`), orderBy('timestamp', 'desc'), limit(30));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => doc.data() as RitualLog));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
      <SectionTitle subtitle="Review your consistency and accountability over time.">
        Ritual History
      </SectionTitle>

      <div className="space-y-6">
        {logs.length > 0 ? (
          logs.map((log, i) => (
            <Card key={i} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center text-white shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-medium text-stone-900">
                      {format(new Date(log.date), 'EEEE, MMMM do, yyyy')}
                    </h4>
                    <p className="text-sm text-stone-500">
                      {log.stepsCompleted.length} steps completed
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 px-4 py-2 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-sm font-medium text-stone-600">Identity Alignment:</span>
                  {log.actedAccordingToIdentity === true ? (
                    <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" /> YES
                    </div>
                  ) : log.actedAccordingToIdentity === false ? (
                    <div className="flex items-center gap-1 text-red-600 font-bold text-sm">
                      <XCircle className="w-4 h-4" /> NO
                    </div>
                  ) : (
                    <span className="text-stone-400 text-sm">N/A</span>
                  )}
                </div>
              </div>

              {log.reflection && (
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <p className="text-sm font-medium text-stone-400 uppercase tracking-wider mb-2">Reflection</p>
                  <p className="text-stone-700 italic leading-relaxed">"{log.reflection}"</p>
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-20 text-stone-400 italic">
            No ritual logs found. Consistency is the key to mental training.
          </div>
        )}
      </div>
    </div>
  );
};
