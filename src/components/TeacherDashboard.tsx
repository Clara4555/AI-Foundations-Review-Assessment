import { ArrowLeft, CheckCircle2, AlertCircle, XCircle, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { sessions } from '@/data/sessions';

interface TeacherDashboardProps {
  onBack: () => void;
}

interface SessionData {
  id: string;
  session_id: number;
  session_title: string;
  objective_score: number;
  theory_score: number;
  status: string;
  teacher_notes: string;
  answers: Record<number, string>;
  auto_scores: Record<number, boolean>;
  teacher_grades: Record<number, number>;
}

function getStatusColor(status: string, objectiveScore: number, theoryScore: number, totalObjective: number) {
  if (status === 'not-started') return 'gray';
  const objectivePercent = totalObjective > 0 ? (objectiveScore / totalObjective) * 100 : 0;
  const theoryPercent = (theoryScore / 5) * 100;
  const overall = (objectivePercent + theoryPercent) / 2;

  if (status === 'reviewed' || status === 'submitted') {
    if (overall >= 75) return 'green';
    if (overall >= 50) return 'amber';
    return 'red';
  }
  return 'gray';
}

const statusConfig = {
  green: { label: 'Strong understanding', bg: 'bg-emerald-950/30', text: 'text-emerald-400', border: 'border-emerald-900/40', icon: CheckCircle2 },
  amber: { label: 'Needs review', bg: 'bg-amber-950/30', text: 'text-amber-400', border: 'border-amber-900/40', icon: AlertCircle },
  red: { label: 'Needs reteaching', bg: 'bg-red-950/30', text: 'text-red-400', border: 'border-red-900/40', icon: XCircle },
  gray: { label: 'Not started', bg: 'bg-[#1a1a2e]', text: 'text-slate-500', border: 'border-[#262642]', icon: AlertCircle },
};

export function TeacherDashboard({ onBack }: TeacherDashboardProps) {
  const [data, setData] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>('');
  const [gradeDraft, setGradeDraft] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data: results, error } = await supabase
        .from('assessment_results')
        .select('*')
        .order('session_id', { ascending: true });

      if (error) {
        console.error('Dashboard load error:', error);
      }

      if (results) {
        setData(results as SessionData[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const getSessionData = (sessionId: number): SessionData | null => {
    return data.find(d => d.session_id === sessionId) || null;
  };

  const totalObjectivePossible = 9;
  const totalPossible = 126;

  const totalObjective = data.reduce((sum, d) => sum + d.objective_score, 0);
  const totalTheory = data.reduce((sum, d) => sum + d.theory_score, 0);
  const totalEarned = totalObjective + totalTheory;
  const overallPercent = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

  const sessionsCompleted = data.filter(d => d.status === 'submitted' || d.status === 'reviewed').length;
  const sessionsReviewed = data.filter(d => d.status === 'reviewed').length;

  const handleSaveNotes = async (sessionId: number) => {
    const existing = data.find(d => d.session_id === sessionId);
    if (!existing) return;
    await supabase
      .from('assessment_results')
      .update({ teacher_notes: notesDraft })
      .eq('id', existing.id);
    setData(prev => prev.map(d => d.session_id === sessionId ? { ...d, teacher_notes: notesDraft } : d));
  };

  const handleSaveGrade = async (sessionId: number, grade: number) => {
    const existing = data.find(d => d.session_id === sessionId);
    if (!existing) return;
    const newGrades = { ...existing.teacher_grades, 10: grade };
    await supabase
      .from('assessment_results')
      .update({ teacher_grades: newGrades, theory_score: grade, status: 'reviewed' })
      .eq('id', existing.id);
    setData(prev => prev.map(d => d.session_id === sessionId ? { ...d, teacher_grades: newGrades, theory_score: grade, status: 'reviewed' } : d));
    setGradeDraft(null);
  };

  const expand = (sessionId: number) => {
    const sd = getSessionData(sessionId);
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
    setNotesDraft(sd?.teacher_notes || '');
    setGradeDraft(sd?.teacher_grades[10] ?? null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-[#262642] bg-[#0a0a14]/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <button onClick={onBack} className="btn-ghost flex items-center gap-2">
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-indigo-400" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-white">Teacher Dashboard</h1>
              <p className="text-sm text-slate-500">Favour Momodu · AI Literacy Tutor</p>
            </div>
          </div>
        </div>

        {/* Student overview */}
        <div className="mt-6 card p-6 animate-slide-up">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Student</p>
              <p className="text-xl font-bold text-white">Michael Oge</p>
              <p className="text-sm text-slate-500">Grade 8 · Age 13</p>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-400">{sessionsCompleted}<span className="text-lg text-slate-600">/9</span></p>
                <p className="text-xs text-slate-500">Sessions Done</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-cyan-400">{sessionsReviewed}<span className="text-lg text-slate-600">/9</span></p>
                <p className="text-xs text-slate-500">Reviewed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{totalEarned}<span className="text-lg text-slate-600">/{totalPossible}</span></p>
                <p className="text-xs text-slate-500">Total Points</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">{overallPercent}%</p>
                <p className="text-xs text-slate-500">Overall</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall readiness */}
        <div className={`mt-4 card p-4 animate-slide-up stagger-1 ${
          overallPercent >= 75 && sessionsCompleted === 9
            ? 'border-emerald-900/40 bg-emerald-950/15'
            : 'border-amber-900/30 bg-amber-950/10'
        }`}>
          <div className="flex items-center gap-3">
            {overallPercent >= 75 && sessionsCompleted === 9 ? (
              <>
                <CheckCircle2 className="text-emerald-400" size={24} />
                <p className="font-semibold text-emerald-300">Michael appears ready to begin the Generative AI unit.</p>
              </>
            ) : sessionsCompleted < 9 ? (
              <>
                <AlertCircle className="text-amber-400" size={24} />
                <p className="font-semibold text-amber-300">
                  Assessment in progress — {9 - sessionsCompleted} session{9 - sessionsCompleted !== 1 ? 's' : ''} remaining before readiness can be determined.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="text-amber-400" size={24} />
                <p className="font-semibold text-amber-300">Some concepts may need review before beginning Generative AI.</p>
              </>
            )}
          </div>
        </div>

        {/* Session breakdown */}
        <div className="mt-6 space-y-3">
          {sessions.map((session, idx) => {
            const sd = getSessionData(session.id);
            const status = sd?.status || 'not-started';
            const objScore = sd?.objective_score || 0;
            const theoryScore = sd?.theory_score || 0;
            const totalScore = objScore + theoryScore;
            const percent = Math.round((totalScore / 14) * 100);
            const statusColor = getStatusColor(status, objScore, theoryScore, 9);
            const cfg = statusConfig[statusColor];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedSession === session.id;

            return (
              <div key={session.id} className={`card animate-slide-up stagger-${Math.min(idx + 1, 9)} overflow-hidden`}>
                <button
                  onClick={() => sd && expand(session.id)}
                  disabled={!sd}
                  className={`w-full p-5 text-left transition-all ${sd ? 'hover:bg-[#16162a] cursor-pointer' : 'cursor-default opacity-60'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cfg.bg} ${cfg.border} border`}>
                      <StatusIcon size={18} className={cfg.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-400">SESSION {session.id}</span>
                        <span className={`badge ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                      </div>
                      <h3 className="mt-0.5 font-semibold text-white truncate">{session.title}</h3>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-white">{totalScore}/14</p>
                        <p className="text-xs text-slate-500">Score</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-cyan-400">{objScore}/9</p>
                        <p className="text-xs text-slate-500">Knowledge</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-indigo-400">{theoryScore}/5</p>
                        <p className="text-xs text-slate-500">Theory</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-bold ${percent >= 75 ? 'text-emerald-400' : percent >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{percent}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile stats */}
                  <div className="mt-3 flex gap-4 text-sm sm:hidden">
                    <span className="text-slate-400">Score: <span className="font-bold text-white">{totalScore}/14</span></span>
                    <span className="text-slate-400">Knowledge: <span className="font-bold text-cyan-400">{objScore}/9</span></span>
                    <span className="text-slate-400">Theory: <span className="font-bold text-indigo-400">{theoryScore}/5</span></span>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && sd && (
                  <div className="border-t border-[#262642] p-5 animate-fade-in">
                    {/* Correct/incorrect breakdown */}
                    <h4 className="mb-3 text-sm font-semibold text-slate-300">Objective Question Results</h4>
                    <div className="grid grid-cols-9 gap-1.5 mb-4">
                      {Array.from({ length: 9 }, (_, i) => {
                        const qNum = i + 1;
                        const qId = session.questions[i].id;
                        const isCorrect = sd.auto_scores[qId];
                        const isAnswered = sd.answers[qId];
                        return (
                          <div
                            key={qNum}
                            className={`flex h-8 items-center justify-center rounded-md text-xs font-bold ${
                              isCorrect
                                ? 'bg-emerald-950/40 text-emerald-400'
                                : isAnswered
                                ? 'bg-red-950/40 text-red-400'
                                : 'bg-[#1a1a2e] text-slate-600'
                            }`}
                            title={session.questions[i].prompt.slice(0, 80)}
                          >
                            {qNum}
                          </div>
                        );
                      })}
                    </div>

                    {/* Concepts needing review */}
                    <h4 className="mb-2 text-sm font-semibold text-slate-300">Concepts Needing Review</h4>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {session.questions.slice(0, 9).map((q, i) => {
                        const qId = q.id;
                        if (sd.auto_scores[qId] || !sd.answers[qId]) return null;
                        return (
                          <span key={i} className="badge bg-red-950/30 text-red-300">
                            Q{i + 1}: {q.prompt.slice(0, 40)}...
                          </span>
                        );
                      })}
                      {session.questions.slice(0, 9).every((q, i) => sd.auto_scores[q.id] || !sd.answers[q.id]) && (
                        <span className="text-sm text-slate-500">No incorrect objective answers.</span>
                      )}
                    </div>

                    {/* Theory grading */}
                    <h4 className="mb-2 text-sm font-semibold text-indigo-300">Theory Question (Q10) — Grade: {sd.theory_score}/5</h4>
                    <p className="mb-3 text-xs text-slate-500">{session.questions[9].explanation}</p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4, 5].map(g => (
                        <button
                          key={g}
                          onClick={() => handleSaveGrade(session.id, g)}
                          className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                            (gradeDraft ?? sd.theory_score) === g
                              ? 'bg-indigo-600 text-white'
                              : 'bg-[#1a1a2e] text-slate-400 hover:bg-[#22223a]'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>

                    {/* Student's theory answer */}
                    {sd.answers[10] && (
                      <div className="mb-4 rounded-lg border border-[#262642] bg-[#0d0d18] p-3">
                        <p className="mb-1 text-xs font-semibold text-slate-500">Michael's Answer:</p>
                        <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">{sd.answers[10]}</p>
                      </div>
                    )}

                    {/* Teacher notes */}
                    <h4 className="mb-2 text-sm font-semibold text-slate-300">Teacher Notes</h4>
                    <textarea
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      onBlur={() => handleSaveNotes(session.id)}
                      placeholder="Add notes about Michael's performance on this session..."
                      className="text-area min-h-[80px]"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="py-20 text-center text-slate-400">Loading dashboard...</div>
        )}
      </div>
    </div>
  );
}
