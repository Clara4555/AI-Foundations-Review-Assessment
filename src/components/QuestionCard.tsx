import { CheckCircle2, XCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Question } from '@/types/assessment';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  answer: string;
  revealed: boolean;
  onAnswer: (value: string) => void;
  onReveal: () => void;
}

const typeLabels: Record<string, string> = {
  'multiple-choice': 'Multiple Choice',
  'true-false': 'True / False',
  'short-answer': 'Short Answer',
  'scenario': 'Scenario',
  'comparison': 'Comparison',
  'theory': 'Theory / Discussion',
};

export function QuestionCard({ question, questionNumber, answer, revealed, onAnswer, onReveal }: QuestionCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const isObjective = question.options !== undefined;
  const isTheory = question.type === 'theory';
  const isWritten = question.type === 'short-answer' || question.type === 'scenario' || question.type === 'theory';

  const isCorrect = isObjective && revealed && question.correctAnswer ? answer === question.correctAnswer : null;
  const isAnswered = answer !== undefined && answer !== '';

  return (
    <div className="card p-6 animate-slide-up">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
            isTheory ? 'bg-indigo-600 text-white' : 'bg-[#1a1a2e] text-indigo-400'
          }`}>
            {questionNumber}
          </div>
          <div>
            <span className="badge bg-[#1a1a2e] text-indigo-300">
              {typeLabels[question.type]}
            </span>
            <span className="ml-2 text-xs font-medium text-slate-500">
              {question.points} {question.points === 1 ? 'point' : 'points'}
            </span>
          </div>
        </div>
        {isObjective && revealed && isCorrect !== null && (
          <div className={`flex items-center gap-1.5 text-sm font-semibold ${
            isCorrect ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {isCorrect ? 'Correct' : 'Incorrect'}
          </div>
        )}
      </div>

      {/* Context box */}
      {question.context && (
        <div className="mb-4 rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-4">
          <p className="text-sm leading-relaxed text-indigo-200/80">{question.context}</p>
        </div>
      )}

      {/* Prompt */}
      <p className="mb-4 whitespace-pre-wrap text-base leading-relaxed text-slate-100">
        {question.prompt}
      </p>

      {/* Multiple choice / true-false options */}
      {question.options && (
        <div className="space-y-2.5">
          {question.options.map((option, idx) => {
            const isSelected = answer === option.label;
            const showCorrect = revealed && option.correct;
            const showIncorrect = revealed && isSelected && !option.correct;

            return (
              <button
                key={idx}
                onClick={() => !revealed && onAnswer(option.label)}
                disabled={revealed}
                className={`option-btn ${isSelected && !revealed ? 'option-btn-selected' : ''} ${
                  showCorrect ? 'option-btn-correct' : ''
                } ${showIncorrect ? 'option-btn-incorrect' : ''} ${
                  revealed && !isSelected && !option.correct ? 'opacity-40' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm leading-relaxed">{option.label}</span>
                  {showCorrect && <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />}
                  {showIncorrect && <XCircle size={18} className="shrink-0 text-red-400" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Written answer */}
      {isWritten && (
        <textarea
          value={answer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder={isTheory ? 'Explain your thinking in your own words. Write as if you were teaching this idea to someone else...' : 'Type your answer here...'}
          className={`text-area ${isTheory ? 'min-h-[220px]' : ''}`}
        />
      )}

      {/* Theory rubric hint */}
      {isTheory && (
        <div className="mt-3 rounded-lg border border-indigo-900/30 bg-[#0d0d18] p-3">
          <p className="text-xs leading-relaxed text-slate-500">
            <span className="font-semibold text-indigo-400">Graded on understanding, not writing style.</span> A strong answer explains the concept accurately, uses appropriate terminology, gives reasoning or examples, and shows independent understanding. Scored 0–5 by your tutor.
          </p>
        </div>
      )}

      {/* Reveal explanation */}
      {isObjective && (
        <div className="mt-4">
          {!revealed ? (
            <button
              onClick={onReveal}
              disabled={!isAnswered}
              className="btn-ghost flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
            >
              <Lightbulb size={16} />
              Reveal Explanation
            </button>
          ) : (
            <div className="rounded-xl border border-[#262642] bg-[#0d0d18] p-4 animate-fade-in">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb size={16} className="text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-300">Explanation</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{question.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Written answer reference (only after reveal for non-theory) */}
      {isWritten && !isTheory && (
        <div className="mt-4">
          {!revealed ? (
            <button
              onClick={onReveal}
              disabled={!isAnswered}
              className="btn-ghost flex items-center gap-2 text-indigo-400 hover:text-indigo-300"
            >
              <Lightbulb size={16} />
              Reveal Reference Answer
            </button>
          ) : (
            <div className="rounded-xl border border-[#262642] bg-[#0d0d18] p-4 animate-fade-in">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb size={16} className="text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-300">Reference Answer (for tutor review)</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{question.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
