import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AssessmentResult } from '@/lib/supabase';
import type { AssessmentSession, Question } from '@/types/assessment';

interface SessionState {
  answers: Record<number, string>;
  revealedQuestions: number[];
  teacherNotes: string;
  teacherGrades: Record<number, number>;
  status: 'not-started' | 'in-progress' | 'submitted' | 'reviewed';
}

export function useAssessmentState(session: AssessmentSession) {
  const [state, setState] = useState<SessionState>({
    answers: {},
    revealedQuestions: [],
    teacherNotes: '',
    teacherGrades: {},
    status: 'not-started',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  // Load existing state from Supabase
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('session_id', session.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('Load error:', error);
      }

      if (data) {
        setRecordId(data.id);
        setState({
          answers: data.answers || {},
          revealedQuestions: [],
          teacherNotes: data.teacher_notes || '',
          teacherGrades: data.teacher_grades || {},
          status: data.status || 'not-started',
        });
      }

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [session.id]);

  const save = useCallback(async (partialState?: Partial<SessionState>) => {
    const currentState = partialState ? { ...state, ...partialState } : state;
    setSaving(true);

    const payload: Omit<AssessmentResult, 'id' | 'created_at' | 'updated_at'> = {
      student_name: 'Michael Oge',
      session_id: session.id,
      session_title: session.title,
      answers: currentState.answers,
      auto_scores: computeAutoScores(session.questions, currentState.answers),
      teacher_grades: currentState.teacherGrades,
      objective_score: computeObjectiveScore(session.questions, currentState.answers),
      theory_score: currentState.teacherGrades[10] || 0,
      teacher_notes: currentState.teacherNotes,
      status: currentState.status,
    };

    if (recordId) {
      const { error } = await supabase
        .from('assessment_results')
        .update(payload)
        .eq('id', recordId);
      if (error) console.error('Update error:', error);
    } else {
      const { data, error } = await supabase
        .from('assessment_results')
        .insert(payload)
        .select()
        .single();
      if (error) {
        // Maybe record was created by a concurrent call — try update
        const { error: upErr } = await supabase
          .from('assessment_results')
          .update(payload)
          .eq('session_id', session.id);
        if (upErr) console.error('Upsert error:', upErr);
      } else if (data) {
        setRecordId(data.id);
      }
    }

    setSaving(false);
  }, [state, session, recordId]);

  const setAnswer = useCallback((questionId: number, value: string) => {
    setState(prev => {
      const newAnswers = { ...prev.answers, [questionId]: value };
      const newState = {
        ...prev,
        answers: newAnswers,
        status: prev.status === 'not-started' ? 'in-progress' as const : prev.status,
      };
      return newState;
    });
  }, []);

  const revealQuestion = useCallback((questionId: number) => {
    setState(prev => ({
      ...prev,
      revealedQuestions: prev.revealedQuestions.includes(questionId)
        ? prev.revealedQuestions
        : [...prev.revealedQuestions, questionId],
    }));
  }, []);

  const submit = useCallback(() => {
    setState(prev => ({ ...prev, status: 'submitted' as const }));
  }, []);

  const setTeacherNotes = useCallback((notes: string) => {
    setState(prev => ({ ...prev, teacherNotes: notes }));
  }, []);

  const setTeacherGrade = useCallback((questionId: number, grade: number) => {
    setState(prev => ({
      ...prev,
      teacherGrades: { ...prev.teacherGrades, [questionId]: grade },
      status: 'reviewed' as const,
    }));
  }, []);

  return {
    state,
    loading,
    saving,
    recordId,
    setAnswer,
    revealQuestion,
    submit,
    setTeacherNotes,
    setTeacherGrade,
    save,
  };
}

export function computeAutoScores(questions: Question[], answers: Record<number, string>): Record<number, boolean> {
  const scores: Record<number, boolean> = {};
  for (const q of questions) {
    if (q.type === 'theory' || q.type === 'short-answer' || q.type === 'scenario') {
      // These are manually graded or have reference answers
      if (q.type === 'scenario' && q.correctAnswer) {
        // Scenario questions with correctAnswer are not auto-scored (require teacher review)
        scores[q.id] = false;
      } else {
        scores[q.id] = false;
      }
    } else if (q.options && q.correctAnswer) {
      scores[q.id] = answers[q.id] === q.correctAnswer;
    }
  }
  return scores;
}

export function computeObjectiveScore(questions: Question[], answers: Record<number, string>): number {
  let score = 0;
  for (const q of questions) {
    if (q.type === 'theory') continue;
    if (q.options && q.correctAnswer && answers[q.id] === q.correctAnswer) {
      score += q.points;
    }
  }
  return score;
}
