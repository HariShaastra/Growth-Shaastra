import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button, Card, SectionTitle } from './UI';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Edit3, Save, X } from 'lucide-react';

export const StoryModule: React.FC = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, `users/${user.uid}/stories`, 'main'), (doc) => {
      if (doc.exists()) {
        setContent(doc.data().content);
      }
      setInitialLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, `users/${user.uid}/stories`, 'main'), {
        content,
        updatedAt: serverTimestamp(),
      });
      setEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/stories/main`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-12 text-center text-stone-400">Loading your story...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
      <div className="flex items-end justify-between">
        <SectionTitle subtitle="Write the narrative of your future life. Be specific and bold.">
          Story-Based Career Design
        </SectionTitle>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            <Edit3 className="w-4 h-4 mr-2" /> Edit Story
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditing(false)}><X className="w-4 h-4 mr-2" /> Cancel</Button>
            <Button onClick={handleSave} isLoading={loading}><Save className="w-4 h-4 mr-2" /> Save Story</Button>
          </div>
        )}
      </div>

      <Card className="min-h-[600px] p-10">
        {editing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your future life story here... Start from where you are and describe the milestones, challenges, and ultimate success."
            className="w-full h-full min-h-[500px] p-6 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 outline-none font-serif text-lg leading-relaxed"
          />
        ) : (
          <div className="prose prose-stone max-w-none font-serif text-lg leading-relaxed text-stone-700">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <div className="text-center py-20 text-stone-400 italic">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                Your story hasn't been written yet. Click edit to begin.
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
