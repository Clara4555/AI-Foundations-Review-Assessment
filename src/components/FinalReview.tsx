import { ArrowLeft, CheckCircle2, Rocket } from 'lucide-react';
import { finalReviewConcepts } from '@/data/sessions';

interface FinalReviewProps {
  onBack: () => void;
}

export function FinalReview({ onBack }: FinalReviewProps) {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="sticky top-0 z-40 border-b border-[#262642] bg-[#0a0a14]/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <button onClick={onBack} className="btn-ghost flex items-center gap-2">
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-900/30 bg-gradient-to-br from-indigo-950/30 via-[#12121f] to-cyan-950/20 p-8 text-center animate-scale-in">
          <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-indigo-600/15 blur-3xl" />
          <div className="relative">
            <span className="section-label">Final Review</span>
            <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
              Are You Ready to<br />Build With AI?
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              You've completed the AI Foundations assessment. Here's a summary of everything you've studied.
            </p>
          </div>
        </div>

        {/* Concept map */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {finalReviewConcepts.map((group, idx) => (
            <div
              key={idx}
              className={`card p-5 animate-slide-up stagger-${Math.min(idx + 1, 9)}`}
            >
              <h3 className="mb-3 flex items-center gap-2 font-bold text-white">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                  {idx + 1}
                </span>
                {group.category}
              </h3>
              <ul className="space-y-2">
                {group.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bridge message */}
        <div className="mt-8 rounded-2xl border border-indigo-900/40 bg-gradient-to-r from-indigo-950/40 to-cyan-950/20 p-8 text-center animate-slide-up">
          <Rocket className="mx-auto text-indigo-400" size={32} />
          <p className="mt-4 text-xl font-semibold leading-relaxed text-white">
            You've learned how AI works and how to communicate with AI.
          </p>
          <p className="mt-2 text-lg text-indigo-300">
            The next phase is learning how to <span className="font-bold">BUILD</span> with it.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
            <div className="h-px w-16 bg-slate-700" />
            <span>AI Foundations Complete</span>
            <div className="h-px w-16 bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
