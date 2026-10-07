export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'scenario' | 'comparison' | 'theory';

export interface QuestionOption {
  label: string;
  correct?: boolean;
}

export interface Question {
  id: number;
  type: QuestionType;
  prompt: string;
  context?: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  explanation: string;
  points: number;
}

export interface AssessmentSession {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  concepts: string[];
  questions: Question[];
}

export interface SavedAnswer {
  value: string;
  revealed: boolean;
}

export interface SessionResult {
  sessionId: number;
  sessionTitle: string;
  answers: Record<number, string>;
  autoScores: Record<number, boolean>;
  teacherGrades: Record<number, number>;
  teacherNotes: string;
  status: 'not-started' | 'in-progress' | 'submitted' | 'reviewed';
}
