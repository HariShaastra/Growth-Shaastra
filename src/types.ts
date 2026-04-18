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
  xp: number; // Experience Points
  level: number; // Evolution Level
  ritualsCompletedCount?: number;
  lastRitualDate?: string;
  focusTime: number; // default 25
  breakTime: number; // default 5
  createdAt: Timestamp;
}

export interface GrowthIdentity {
  id: string;
  title: string; // "I am a Reader"
  description?: string;
  color?: string;
  createdAt: Timestamp;
}

export interface Habit {
  id: string;
  identityId: string;
  title: string; // The "Response" name
  target: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cue: string;
  craving: string;
  response: string; // Detailed response action
  reward: string;
  createdAt: Timestamp;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  habitId: string;
  completed: boolean;
  timestamp: Timestamp;
}

export interface Initiative {
  id: string;
  name: string;
  type: 'profit' | 'non-profit' | 'community' | 'personal' | 'others';
  stage: 'idea' | 'pilot' | 'active' | 'growing';
  problemStatement: string;
  solution: string;
  targetGroup: string;
  createdAt: Timestamp;
}

export interface InitiativeAction {
  id: string;
  initiativeId: string;
  title: string;
  category: string;
  timeSpent: number; // minutes
  proofUrl?: string;
  timestamp: Timestamp;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  status: 'reading' | 'completed';
  dateAdded: Timestamp;
}

export interface Thought {
  id: string;
  bookId: string;
  content: string;
  tag: 'Thought' | 'Question' | 'Insight' | 'Feeling' | 'Changed Opinion';
  timestamp: Timestamp;
}

export interface RitualLog {
  date: string;
  stepsCompleted: string[];
  reflection?: string;
  actedAccordingToIdentity?: boolean;
  timestamp: Timestamp;
}

export type RitualStep = 'identity' | 'visualization' | 'suggestion' | 'action' | 'reflection';

export interface LifeStory {
  content: string;
  updatedAt: Timestamp;
}
