import { ArrowLeft, Save, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { AssessmentSession } from '@/types/assessment';
import { useAssessmentState, computeObjectiveScore, computeAutoScores } from '@/hooks/useAssessmentState';
import { QuestionCard } from './QuestionCard';

interface SessionViewProps {
  session: AssessmentSession;
  onBack: () => void;
  onComplete: () => void;
}

export function SessionView({ session, onBack, onComplete }: SessionViewProps) {
  const {
    state,
    loading,
    saving,
    setAnswer,
    revealQuestion,
    submit,
    setTeacherNotes,
    setTeacherGrade,
    save,
  } = useAssessmentState(session);

  const [showFeedback, setShowFeedback] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(1);

  const totalObjective = session.questions.filter(q => q.type !== 'theory').length;
  const answeredCount = Object.keys(state.answers).filter(k => state.answers[Number(k)] && state.answers[Number(k)].trim()).length;
  const objectiveScore = useMemo(
    () => computeObjectiveScore(session.questions, state.answers),
    [session.questions, state.answers]
  );
  const autoScores = useMemo(
    () => computeAutoScores(session.questions, state.answers),
    [session.questions, state.answers]
  );
  const correctObjective = Object.values(autoScores).filter(Boolean).length;
  const theoryGrade = state.teacherGrades[10] || 0;
  const totalScore = objectiveScore + theoryGrade;
  const maxScore = 14;

  const conceptsUnderstood = useMemo(() => {
    const understood: string[] = [];
    const review: string[] = [];
    session.questions.forEach((q, idx) => {
      if (q.type === 'theory') return;
      if (autoScores[q.id]) {
        if (q.type === 'multiple-choice' || q.type === 'true-false' || q.type === 'comparison') {
          understood.push(`Q${idx + 1}: ${q.prompt.slice(0, 50)}...`);
        }
      } else if (state.answers[q.id]) {
        review.push(`Q${idx + 1}: ${q.prompt.slice(0, 50)}...`);
      }
    });
    return { understood, review };
  }, [session.questions, autoScores, state.answers]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-400">Loading assessment...</div>
      </div>
    );
  }

  const handleSubmit = () => {
    submit();
    setShowFeedback(true);
    save({ status: 'submitted' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAndExit = async () => {
    await save();
    onBack();
  };

  const progressPercent = Math.round((answeredCount / session.questions.length) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-[#262642] bg-[#0a0a14]/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <button onClick={handleSaveAndExit} className="btn-ghost flex items-center gap-2">
              <ArrowLeft size={18} />
              All Sessions
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-500 sm:inline">
                Session {session.id} of 9
              </span>
              <button
                onClick={() => save()}
                disabled={saving}
                className="btn-ghost flex items-center gap-2 text-indigo-400"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Session header */}
      <div className="mx-auto max-w-5xl px-4 pt-8 pb-4">
        <div className="animate-fade-in">
          <span className="section-label">Assessment {session.id}</span>
          <h1 className="mt-2 text-3xl font-bold text-white">{session.title}</h1>
          <p className="mt-2 text-slate-400">{session.description}</p>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-400">Progress: {answeredCount} of {session.questions.length} answered</span>
              <span className="font-semibold text-indigo-400">{progressPercent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#1a1a2e]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Concepts */}
          <div className="mt-4 flex flex-wrap gap-2">
            {session.concepts.map((concept, i) => (
              <span key={i} className="badge bg-[#1a1a2e] text-slate-400">
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback panel */}
      {showFeedback && (
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="card animate-scale-in p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="text-indigo-400" size={24} />
              <h2 className="text-xl font-bold text-white">Session {session.id} Results</h2>
            </div>

            {/* Score display */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#262642] bg-[#0d0d18] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Raw Score</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {totalScore}<span className="text-lg text-slate-500">/{maxScore}</span>
                </p>
              </div>
              <div className="rounded-xl border border-[#262642] bg-[#0d0d18] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Knowledge Score</p>
                <p className="mt-1 text-2xl font-bold text-cyan-400">
                  {objectiveScore}<span className="text-lg text-slate-500">/{totalObjective}</span>
                </p>
                <p className="text-xs text-slate-500">Objective questions</p>
              </div>
              <div className="rounded-xl border border-[#262642] bg-[#0d0d18] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Understanding Score</p>
                <p className="mt-1 text-2xl font-bold text-indigo-400">
                  {theoryGrade}<span className="text-lg text-slate-500">/5</span>
                </p>
                <p className="text-xs text-slate-500">Theory (graded by tutor)</p>
              </div>
            </div>

            {/* What you understand / What to review */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/15 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <CheckCircle2 size={16} /> What You Understand
                </h3>
                {conceptsUnderstood.understood.length > 0 ? (
                  <ul className="space-y-1">
                    {conceptsUnderstood.understood.map((item, i) => (
                      <li key={i} className="text-sm text-slate-300">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Complete the objective questions to see results.</p>
                )}
              </div>
              <div className="rounded-xl border border-amber-900/30 bg-amber-950/15 p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-400">
                  <AlertCircle size={16} /> What to Review
                </h3>
                {conceptsUnderstood.review.length > 0 ? (
                  <ul className="space-y-1">
                    {conceptsUnderstood.review.map((item, i) => (
                      <li key={i} className="text-sm text-slate-300">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No incorrect objective answers so far.</p>
                )}
              </div>
            </div>

            {/* Teacher notes */}
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-slate-300">Teacher Notes (Favour)</h3>
              <textarea
                value={state.teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                onBlur={() => save()}
                placeholder="Add notes about Michael's performance on this session..."
                className="text-area min-h-[100px]"
              />
            </div>

            {/* Theory grading */}
            <div className="mt-4 rounded-xl border border-indigo-900/30 bg-indigo-950/15 p-4">
              <h3 className="mb-2 text-sm font-semibold text-indigo-300">Theory Question Grading (Q10)</h3>
              <p className="mb-3 text-xs text-slate-500">Grade on conceptual understanding, not writing style. Scale: 0 (no evidence) to 5 (excellent understanding).</p>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5].map(score => (
                  <button
                    key={score}
                    onClick={() => { setTeacherGrade(10, score); save(); }}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                      theoryGrade === score
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#1a1a2e] text-slate-400 hover:bg-[#22223a]'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-lg bg-[#0d0d18] p-3">
                <p className="text-xs leading-relaxed text-slate-500">{session.questions[9].explanation}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowFeedback(false)} className="btn-secondary">
                Back to Questions
              </button>
              <button onClick={onComplete} className="btn-primary flex items-center gap-2">
                Continue
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="mx-auto max-w-5xl px-4 py-4 space-y-6">
        {/* Quick nav */}
        <div className="flex flex-wrap gap-2">
          {session.questions.map((q, i) => {
            const qNum = i + 1;
            const isAnswered = state.answers[q.id] && state.answers[q.id].trim();
            const isActive = activeQuestion === qNum;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setActiveQuestion(qNum);
                  document.getElementById(`question-${qNum}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : isAnswered
                    ? 'bg-emerald-900/40 text-emerald-400'
                    : 'bg-[#1a1a2e] text-slate-500'
                }`}
              >
                {qNum}
              </button>
            );
          })}
        </div>

        {session.questions.map((question, index) => (
          <div key={question.id} id={`question-${index + 1}`}>
            <QuestionCard
              question={question}
              questionNumber={index + 1}
              answer={state.answers[question.id] || ''}
              revealed={state.revealedQuestions.includes(question.id)}
              onAnswer={(value) => setAnswer(question.id, value)}
              onReveal={() => revealQuestion(question.id)}
            />
          </div>
        ))}

        {/* Submit button */}
        <div className="flex flex-col items-center gap-4 pb-12 pt-4">
          {answeredCount < session.questions.length ? (
            <p className="text-sm text-slate-500">
              {session.questions.length - answeredCount} question{session.questions.length - answeredCount !== 1 ? 's' : ''} remaining
            </p>
          ) : null}
          <button
            onClick={handleSubmit}
            disabled={answeredCount === 0}
            className="btn-primary flex items-center gap-2 px-8 py-4 text-lg"
          >
            <CheckCircle2 size={20} />
            Submit Assessment {session.id}
          </button>
        </div>
      </div>
    </div>
  );
}
