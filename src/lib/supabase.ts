import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AssessmentResult {
  id?: string;
  student_name: string;
  session_id: number;
  session_title: string;
  answers: Record<number, string>;
  auto_scores: Record<number, boolean>;
  teacher_grades: Record<number, number>;
  objective_score: number;
  theory_score: number;
  teacher_notes: string;
  status: 'not-started' | 'in-progress' | 'submitted' | 'reviewed';
  created_at?: string;
  updated_at?: string;
}
