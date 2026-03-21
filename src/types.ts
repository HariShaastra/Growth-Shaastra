import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  identityStatement: string;
  vision?: string;
  mission?: string;
  streak: number;
  lastRitualDate?: string; // YYYY-MM-DD
  createdAt: Timestamp;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: Timestamp;
}

export interface RitualLog {
  date: string;
  stepsCompleted: string[];
  reflection?: string;
  actedAccordingToIdentity?: boolean;
  timestamp: Timestamp;
}

export interface LifeStory {
  content: string;
  updatedAt: Timestamp;
}

export type RitualStep = 'identity' | 'visualization' | 'suggestion' | 'action' | 'reflection';
