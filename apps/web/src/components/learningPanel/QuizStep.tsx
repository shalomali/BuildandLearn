import React, { useState } from 'react';
import { QuizQuestion, QuizResult } from '@build-and-learn/shared-types';
import { HelpCircle, CheckCircle2, XCircle, Send, Sparkles } from 'lucide-react';

interface QuizStepProps {
  quiz: QuizQuestion;
  onSubmit: (answer: string) => Promise<QuizResult>;
  onGateCleared: () => void;
}

export const QuizStep: React.FC<QuizStepProps> = ({ quiz, onSubmit, onGateCleared }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const handleSubmit = async () => {
    const answer = selectedOption || textAnswer;
    if (!answer.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await onSubmit(answer);
      setResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 space-y-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-accent-amber" />
          <h2 className="text-base font-bold text-white">Concept Verification Quiz</h2>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Difficulty: {quiz.difficulty}
        </span>
      </div>

      {/* Question Prompt */}
      <div className="glass-card p-3.5 rounded-lg border border-surface-border space-y-2">
        <p className="text-xs font-medium text-slate-200 leading-relaxed">{quiz.prompt}</p>
      </div>

      {/* Code Context */}
      {quiz.codeContext && (
        <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
          <code>{quiz.codeContext}</code>
        </pre>
      )}

      {/* Options or Text Input */}
      {quiz.options && quiz.options.length > 0 ? (
        <div className="space-y-2">
          {quiz.options.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedOption(opt)}
              className={`p-3 rounded-lg border cursor-pointer text-xs transition-all ${
                selectedOption === opt
                  ? 'bg-accent-blue/20 border-accent-blue text-white glow-blue'
                  : 'glass-card border-surface-border text-slate-300 hover:border-slate-600'
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      ) : (
        <textarea
          rows={3}
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder="Type your explanation or code solution here..."
          className="w-full p-3 rounded-lg bg-slate-900 border border-surface-border text-xs text-slate-200 focus:outline-none focus:border-accent-blue"
        />
      )}

      {/* Submit Button */}
      {!result && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!selectedOption && !textAnswer.trim())}
          className="w-full py-2.5 px-4 rounded-lg bg-accent-blue hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all glow-blue"
        >
          {isSubmitting ? (
            <span>Grading answer...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Answer</span>
            </>
          )}
        </button>
      )}

      {/* Quiz Result Banner */}
      {result && (
        <div
          className={`p-4 rounded-lg border space-y-3 ${
            result.passed
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {result.passed ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Passed! Gate Cleared</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>Needs Improvement</span>
              </>
            )}
          </div>

          <p className="text-xs leading-relaxed">{result.explanation}</p>

          {result.passed ? (
            <button
              onClick={onGateCleared}
              className="w-full py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all glow-emerald"
            >
              <Sparkles className="w-4 h-4" />
              <span>Unfreeze & Continue Streaming Code</span>
            </button>
          ) : (
            <button
              onClick={() => setResult(null)}
              className="w-full py-2 px-4 rounded bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold transition-all"
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
