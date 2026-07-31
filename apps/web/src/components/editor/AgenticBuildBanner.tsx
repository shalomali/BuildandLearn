import React from 'react';
import { Bot, Sparkles, CheckCircle2, Pause, Play, XCircle, ArrowRight } from 'lucide-react';

export interface AgenticStep {
  filePath: string;
  purpose: string;
  prompt: string;
}

interface AgenticBuildBannerProps {
  planSummary: string;
  steps: AgenticStep[];
  currentStepIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export const AgenticBuildBanner: React.FC<AgenticBuildBannerProps> = ({
  planSummary,
  steps,
  currentStepIndex,
  isRunning,
  isPaused,
  onPause,
  onResume,
  onCancel
}) => {
  if (!isRunning && steps.length === 0) return null;

  const total = steps.length;
  const currentStep = steps[currentStepIndex];
  const progressPct = total > 0 ? Math.round(((currentStepIndex + (isPaused ? 0 : 0.5)) / total) * 100) : 0;

  return (
    <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-blue-950/80 border-2 border-accent-purple/60 shadow-lg glow-purple space-y-3 animate-fade-in">
      {/* Top Banner Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-accent-purple/20 text-accent-purple border border-purple-500/30 animate-pulse">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent-purple" /> Agentic Autonomous Code Builder
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-semibold">
                {isPaused ? '⏸️ Paused for Concept Gate' : isRunning ? '⚡ Agent Building' : '✅ Completed'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono line-clamp-1">{planSummary}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {isRunning && (
            isPaused ? (
              <button
                onClick={onResume}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-all glow-emerald"
              >
                <Play className="w-3.5 h-3.5" /> Resume Agent
              </button>
            ) : (
              <button
                onClick={onPause}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Pause className="w-3.5 h-3.5" /> Pause Agent
              </button>
            )
          )}
          <button
            onClick={onCancel}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
            title="Exit Agentic Mode"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Step {Math.min(currentStepIndex + 1, total)} of {total}: <strong className="text-white">{currentStep?.filePath}</strong></span>
          <span className="text-purple-300 font-bold">{progressPct}% Complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-accent-purple to-accent-blue transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps Pipeline Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const rawPath = typeof step === 'string' ? step : step?.filePath || 'file';
          const fileName = rawPath.split('/').pop() || rawPath;

          return (
            <div
              key={idx}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono shrink-0 border transition-all ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : isCurrent
                  ? 'bg-purple-950/60 border-purple-500/60 text-white font-bold glow-purple'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : isCurrent ? (
                <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
              ) : (
                <ArrowRight className="w-3 h-3 text-slate-600" />
              )}
              <span>{fileName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
