import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button, Card, SectionTitle } from './UI';
import { Shield, Target, Compass } from 'lucide-react';

export const IdentityModule: React.FC = () => {
  const { profile, user } = useAuth();
  const [identity, setIdentity] = useState(profile?.identityStatement || '');
  const [vision, setVision] = useState(profile?.vision || '');
  const [mission, setMission] = useState(profile?.mission || '');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        identityStatement: identity,
        vision,
        mission,
      });
      setEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
      <div className="flex items-end justify-between">
        <SectionTitle subtitle="Define who you are and where you are going.">
          Identity & Vision
        </SectionTitle>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>Edit Statements</Button>
        )}
      </div>

      <div className="grid gap-8">
        <StatementCard
          icon={<Shield className="w-6 h-6" />}
          title="Identity Statement"
          description="Your core identity. Who are you at your best?"
          value={identity}
          editing={editing}
          onChange={setIdentity}
          placeholder="I am a..."
        />
        <StatementCard
          icon={<Compass className="w-6 h-6" />}
          title="Vision"
          description="Your long-term destination. Where will you be in 10-20 years?"
          value={vision}
          editing={editing}
          onChange={setVision}
          placeholder="My vision is..."
        />
        <StatementCard
          icon={<Target className="w-6 h-6" />}
          title="Mission"
          description="Your daily commitment. How will you achieve your vision?"
          value={mission}
          editing={editing}
          onChange={setMission}
          placeholder="My mission is..."
        />
      </div>

      {editing && (
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={loading}>Save All Statements</Button>
        </div>
      )}
    </div>
  );
};

const StatementCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
  editing: boolean;
  onChange: (val: string) => void;
  placeholder: string;
}> = ({ icon, title, description, value, editing, onChange, placeholder }) => (
  <Card className="p-8">
    <div className="flex items-start gap-6">
      <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-900 border border-stone-100 shrink-0">
        {icon}
      </div>
      <div className="flex-1 space-y-4">
        <div>
          <h3 className="text-xl font-serif font-medium text-stone-900">{title}</h3>
          <p className="text-sm text-stone-500 mt-1">{description}</p>
        </div>
        
        {editing ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none min-h-[120px]"
          />
        ) : (
          <p className="text-lg text-stone-700 font-serif leading-relaxed italic">
            "{value || 'Not yet defined.'}"
          </p>
        )}
      </div>
    </div>
  </Card>
);
