import { Sparkles, Database, Cpu, GitBranch, Scale, ClipboardCheck, MessageSquare, Target, ListChecks, ChevronRight, GraduationCap, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { sessions, TOTAL_POINTS } from '@/data/sessions';
import type { AssessmentSession } from '@/types/assessment';

interface HomeScreenProps {
  onStartSession: (session: AssessmentSession) => void;
  onTeacherDashboard: () => void;
  onFinalReview: () => void;
  completedSessions: number[];
}

const iconMap: Record<string, LucideIcon> = {
  Sparkles, Database, Cpu, GitBranch, Scale, ClipboardCheck, MessageSquare, Target, ListChecks,
};

export function HomeScreen({ onStartSession, onTeacherDashboard, onFinalReview, completedSessions }: HomeScreenProps) {
  const allCompleted = completedSessions.length === sessions.length;

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[#262642]">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-transparent to-cyan-950/20" />
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-600/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-16">
          <div className="animate-fade-in">
            <span className="section-label">Review & Diagnostic Assessment</span>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
              AI Foundations<br />Assessment
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
              A comprehensive review of everything learned before beginning the Generative AI image-generation unit. Nine sessions covering AI fundamentals, learning, models, evaluation, prompting, and structured communication.
            </p>

            {/* Student info card */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="card flex items-center gap-3 px-5 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Student</p>
                  <p className="font-semibold text-white">Michael Oge</p>
                  <p className="text-xs text-slate-500">Grade 8 · Age 13</p>
                </div>
              </div>
              <div className="card flex items-center gap-3 px-5 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tutor</p>
                  <p className="font-semibold text-white">Favour Momodu</p>
                  <p className="text-xs text-slate-500">AI Literacy</p>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              <div>
                <p className="text-3xl font-bold text-indigo-400">9</p>
                <p className="text-sm text-slate-500">Sessions</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-cyan-400">90</p>
                <p className="text-sm text-slate-500">Questions</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{TOTAL_POINTS}</p>
                <p className="text-sm text-slate-500">Total Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment sessions */}
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Assessment Sessions</h2>
          <div className="flex gap-2">
            <button onClick={onTeacherDashboard} className="btn-secondary text-sm">
              Teacher Dashboard
            </button>
            {allCompleted && (
              <button onClick={onFinalReview} className="btn-primary text-sm">
                Final Review
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sessions.map((session, idx) => {
            const Icon = iconMap[session.icon] || Sparkles;
            const isCompleted = completedSessions.includes(session.id);
            const staggerClass = `stagger-${Math.min(idx + 1, 9)}`;

            return (
              <button
                key={session.id}
                onClick={() => onStartSession(session)}
                className={`card card-hover p-5 text-left animate-slide-up ${staggerClass} group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white'
                  }`}>
                    {isCompleted ? <Sparkles size={22} /> : <Icon size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-400">SESSION {session.id}</span>
                      {isCompleted && (
                        <span className="badge bg-emerald-950/40 text-emerald-400">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {session.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400 line-clamp-2">
                      {session.subtitle}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                      <span>10 questions</span>
                      <span>·</span>
                      <span>14 points</span>
                      <ChevronRight size={14} className="ml-auto text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-12 rounded-2xl border border-indigo-900/30 bg-indigo-950/10 p-6 text-center">
          <p className="text-sm leading-relaxed text-slate-400">
            This assessment determines whether Michael genuinely understands the AI concepts he has learned before moving into the new Generative AI phase. It prioritizes <span className="text-indigo-300 font-semibold">understanding, reasoning, and application</span> over memorization alone.
          </p>
        </div>
      </div>
    </div>
  );
}
