import React, { useState } from 'react';
import { request } from '../api/client';
import { useProjectStore } from '../state/projectStore';
import { Rocket, Sparkles, Code2, Sliders } from 'lucide-react';

export const NewProject: React.FC = () => {
  const { setProject, setRoadmap } = useProjectStore();
  const [title, setTitle] = useState('Real-Time Collaborative Code Editor');
  const [description, setDescription] = useState('Build a web-based code editor with real-time state synchronization, WebSocket communication, and AST code analysis.');
  const [stack, setStack] = useState('React, TypeScript, Node.js, Express, Socket.IO, SQLite');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [priority, setPriority] = useState<'learning' | 'balanced' | 'fast'>('learning');
  const [designMode, setDesignMode] = useState<'beginner' | 'guided' | 'independent'>('guided');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await request<any>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          stack: stack.split(',').map((s) => s.trim()),
          experienceLevel,
          priority,
          designMode
        })
      });

      setProject(res.project);
      if (res.roadmap) setRoadmap(res.roadmap);
    } catch (err: any) {
      alert(`Error creating project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-accent-blue text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Phase 1: Project Definition Wizard
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">What would you like to build?</h1>
        <p className="text-sm text-slate-400">
          Build&Learn will generate a custom learning roadmap and auto-detect core concepts as you code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-surface-border space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Project Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-surface-border text-sm text-slate-100 focus:outline-none focus:border-accent-blue"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Description & Brief</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-surface-border text-sm text-slate-100 focus:outline-none focus:border-accent-blue"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">Target Tech Stack (comma separated)</label>
          <input
            type="text"
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-surface-border text-sm text-slate-100 focus:outline-none focus:border-accent-blue"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-accent-blue" /> Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e: any) => setExperienceLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-surface-border text-xs text-slate-200 focus:outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-accent-purple" /> Priority
            </label>
            <select
              value={priority}
              onChange={(e: any) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-surface-border text-xs text-slate-200 focus:outline-none"
            >
              <option value="learning">Max Learning</option>
              <option value="balanced">Balanced</option>
              <option value="fast">Fast Delivery</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-accent-emerald" /> Design Mode
            </label>
            <select
              value={designMode}
              onChange={(e: any) => setDesignMode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-surface-border text-xs text-slate-200 focus:outline-none"
            >
              <option value="beginner">Beginner (Step-by-step)</option>
              <option value="guided">Guided (Conversational)</option>
              <option value="independent">Independent</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-accent-blue via-accent-purple to-accent-emerald text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all glow-blue"
        >
          {loading ? (
            <span>Generating Custom AI Roadmap...</span>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              <span>Initialize Project & Generate AI Roadmap</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
