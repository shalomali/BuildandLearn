import React, { useEffect, useState } from 'react';
import { request } from '../api/client';
import { useProjectStore } from '../state/projectStore';
import { Trophy, CheckCircle2, Award, Sparkles, Rocket } from 'lucide-react';

export const CompletionReport: React.FC = () => {
  const { currentProject } = useProjectStore();
  const [reportData, setReportData] = useState<any>(null);
  const [nextProjects, setNextProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProject) return;
    const fetchReport = async () => {
      try {
        const [repRes, nextRes] = await Promise.all([
          request<any>(`/projects/${currentProject.id}/report`),
          request<any>(`/projects/${currentProject.id}/next-projects`)
        ]);
        setReportData(repRes);
        setNextProjects(nextRes.nextProjects || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [currentProject]);

  if (loading) {
    return (
      <div className="text-center p-16 text-slate-400 space-y-3">
        <Trophy className="w-12 h-12 text-amber-400 animate-bounce mx-auto" />
        <p className="text-sm font-semibold text-white">Generating Completion & Independence Report...</p>
      </div>
    );
  }

  const stats = reportData?.independenceStats || { learnerPct: 65, aiPct: 35 };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-3 p-8 glass-panel rounded-3xl border border-surface-border glow-purple">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto glow-amber">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" /> Project Successfully Completed!
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{currentProject?.title}</h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          {reportData?.report?.summary || 'You have successfully navigated through design, concept gates, micro-teaching, and implementation challenges!'}
        </p>
      </div>

      {/* Independence Breakdown Card */}
      <div className="glass-panel p-6 rounded-2xl border border-surface-border space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-blue" /> Code Attribution & Learner Independence Metric
        </h2>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-400">Learner Written: {stats.learnerPct}%</span>
            <span className="text-blue-400">AI Streamed: {stats.aiPct}%</span>
          </div>
          <div className="h-4 w-full rounded-full bg-slate-900 overflow-hidden flex border border-surface-border">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${stats.learnerPct}%` }} />
            <div className="h-full bg-blue-500 transition-all" style={{ width: `${stats.aiPct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
            <div className="text-2xl font-extrabold text-emerald-400">{stats.learnerLines || 45}</div>
            <div className="text-xs text-slate-400">Lines Written by Learner</div>
          </div>
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-center">
            <div className="text-2xl font-extrabold text-blue-400">{stats.aiLines || 25}</div>
            <div className="text-xs text-slate-400">Lines Streamed by AI</div>
          </div>
        </div>
      </div>

      {/* Next Project Recommender */}
      <div className="glass-panel p-6 rounded-2xl border border-surface-border space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Rocket className="w-4 h-4 text-accent-purple" /> Recommended Next Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextProjects.map((p, idx) => (
            <div key={idx} className="p-4 rounded-xl glass-card border border-surface-border space-y-2 hover:border-slate-600 transition-all">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{p.title}</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {p.level}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
