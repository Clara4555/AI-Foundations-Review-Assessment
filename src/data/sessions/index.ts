import { session1 } from './session1';
import { session2 } from './session2';
import { session3 } from './session3';
import { session4 } from './session4';
import { session5 } from './session5';
import { session6 } from './session6';
import { session7 } from './session7';
import { session8 } from './session8';
import { session9 } from './session9';
import type { AssessmentSession } from '@/types/assessment';

export const sessions: AssessmentSession[] = [
  session1,
  session2,
  session3,
  session4,
  session5,
  session6,
  session7,
  session8,
  session9,
];

export const TOTAL_SESSIONS = sessions.length;
export const POINTS_PER_SESSION = 14;
export const TOTAL_POINTS = TOTAL_SESSIONS * POINTS_PER_SESSION;

export const finalReviewConcepts = [
  {
    category: 'AI Foundations',
    items: ['What AI is', 'AI applications', 'AI vs robots', 'AI vs humans'],
  },
  {
    category: 'AI Learning',
    items: ['Data', 'Training data', 'Patterns', 'Training', 'Testing', 'Inference', 'Data quality', 'Parameters'],
  },
  {
    category: 'AI Models',
    items: ['Models', 'Model behaviour', 'Why models differ'],
  },
  {
    category: 'AI Types',
    items: ['Generative', 'Predictive', 'Classification', 'Discriminative'],
  },
  {
    category: 'AI Evaluation',
    items: ['Observation', 'Evaluation', 'Assessment Matrix', 'Accuracy', 'Usefulness', 'Audience fit'],
  },
  {
    category: 'Prompting',
    items: ['Prompts', 'Weak vs strong prompts', 'Specificity', 'Relevant detail', 'Iteration'],
  },
  {
    category: 'GRACE',
    items: ['Goal', 'Role', 'Audience', 'Context', 'Examples'],
  },
  {
    category: 'Advanced Prompting',
    items: ['Structured steps', 'Expert roles/personas'],
  },
];
