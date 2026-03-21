import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { Button, Card, SectionTitle } from './UI';
import { RitualStep } from '../types';
import { format } from 'date-fns';
import { CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';

export const Ritual: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { profile, user } = useAuth();
  const [step, setStep] = useState<RitualStep>('identity');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [upsideDown, setUpsideDown] = useState(false);
  const [reflection, setReflection] = useState('');
  const [acted, setActed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

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

      // Update streak if not already done today
      if (profile.lastRitualDate !== today) {
        await updateDoc(doc(db, 'users', user.uid), {
          streak: increment(1),
          lastRitualDate: today,
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
    <div className="max-w-3xl mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        {step === 'identity' && (
          <motion.div
            key="identity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <SectionTitle subtitle="Read your identity statement aloud. Internalize it.">
              Identity Activation
            </SectionTitle>
            
            <Card className="min-h-[300px] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
              <div className={cn(
                "text-3xl md:text-4xl font-serif leading-relaxed text-stone-900 transition-all duration-500",
                mirrorMode && "scale-x-[-1]",
                upsideDown && "rotate-180"
              )}>
                {profile?.identityStatement}
              </div>
              
              <div className="absolute bottom-6 right-6 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setMirrorMode(!mirrorMode)}
                  className={cn(mirrorMode && "bg-stone-900 text-white")}
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Mirror
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setUpsideDown(!upsideDown)}
                  className={cn(upsideDown && "bg-stone-900 text-white")}
                >
                  <RefreshCw className="w-4 h-4 mr-2 rotate-90" /> Flip
                </Button>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={nextStep} className="group">
                Next Step <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'visualization' && (
          <motion.div
            key="visualization"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <SectionTitle subtitle="Close your eyes. See your future self.">
              Future Visualization
            </SectionTitle>
            
            <div className="grid gap-6">
              <VisualizationCard 
                title="The Long View" 
                content="Imagine your life 20 years from now. You have achieved your greatest goals. What does your day look like?" 
              />
              <VisualizationCard 
                title="The Achievement" 
                content="Step back to the moment of success. See the result of your hard work. Feel the emotion of that moment." 
              />
              <VisualizationCard 
                title="The Process" 
                content="Now, see yourself doing the work today. Studying, writing, executing. See yourself focused and unstoppable." 
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button onClick={nextStep} className="group">
                Next Step <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'suggestion' && (
          <motion.div
            key="suggestion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <SectionTitle subtitle="Repeat these commands to program your intent.">
              Auto-Suggestion
            </SectionTitle>
            
            <div className="space-y-4">
              <SuggestionItem text="I focus now with absolute clarity." />
              <SuggestionItem text="I execute without distraction or delay." />
              <SuggestionItem text="I complete what I start." />
              <SuggestionItem text="My actions align with my identity." />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button onClick={nextStep} className="group">
                Next Step <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            className="space-y-8"
          >
            <SectionTitle subtitle="What is the one specific task you will start right now?">
              Action Trigger
            </SectionTitle>
            
            <Card className="p-12 text-center">
              <p className="text-2xl text-stone-600 mb-8 italic">
                "The secret of getting ahead is getting started."
              </p>
              <div className="max-w-md mx-auto">
                <p className="text-stone-900 font-medium mb-4">I will now begin:</p>
                <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-xl font-serif">
                  Your primary task for today
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button onClick={nextStep} className="group">
                Next Step <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            className="space-y-8"
          >
            <SectionTitle subtitle="Close the loop on your daily mental training.">
              Reflection
            </SectionTitle>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-4">
                  Did I act according to my identity today?
                </label>
                <div className="flex gap-4">
                  <Button 
                    variant={acted === true ? 'primary' : 'outline'} 
                    className="flex-1 py-4"
                    onClick={() => setActed(true)}
                  >
                    Yes, I was aligned
                  </Button>
                  <Button 
                    variant={acted === false ? 'primary' : 'outline'} 
                    className="flex-1 py-4"
                    onClick={() => setActed(false)}
                  >
                    No, I need to adjust
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Daily Reflection (Optional)
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What did I learn today? What will I improve tomorrow?"
                  className="w-full p-4 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none min-h-[120px]"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button onClick={finishRitual} className="px-12" isLoading={loading}>
                Complete Ritual
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VisualizationCard: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <Card className="p-6">
    <h4 className="text-lg font-serif font-medium text-stone-900 mb-2">{title}</h4>
    <p className="text-stone-600 leading-relaxed">{content}</p>
  </Card>
);

const SuggestionItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="p-6 bg-white border border-stone-200 rounded-2xl flex items-center gap-4 shadow-sm">
    <div className="w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center text-white shrink-0">
      <CheckCircle2 className="w-5 h-5" />
    </div>
    <p className="text-xl text-stone-800 font-serif">{text}</p>
  </div>
);

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
