import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../state/projectStore';
import { useAuthStore } from '../state/authStore';
import { AuthModal } from '../components/AuthModal';
import { NewProject } from '../routes/NewProject';
import { LearningPlan } from '../routes/LearningPlan';
import { SystemDesign } from '../routes/SystemDesign';
import { Workspace } from '../routes/Workspace';
import { MilestoneReview } from '../routes/MilestoneReview';
import { Reflection } from '../routes/Reflection';
import { CompletionReport } from '../routes/CompletionReport';
import { ProviderUsagePanel } from '../components/admin/ProviderUsagePanel';
import { Layers, Activity, Sparkles, X, LogIn, UserPlus, LogOut, User as UserIcon } from 'lucide-react';

export const ProjectShell: React.FC = () => {
  const { phase, setPhase, currentProject } = useProjectStore();
  const { user, openAuthModal, logout, checkAuth } = useAuthStore();
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const phases = [
    { id: 'definition', name: '1. Definition' },
    { id: 'learning_plan', name: '2. Concepts' },
    { id: 'system_design', name: '3. Design' },
    { id: 'development', name: '4. Code IDE' },
    { id: 'milestone_reinforcement', name: '5. Milestone' },
    { id: 'reflection', name: '6. Reflection' },
    { id: 'completed', name: '7. Report' }
  ];

  const renderActivePhase = () => {
    switch (phase) {
      case 'definition': return <NewProject />;
      case 'learning_plan': return <LearningPlan />;
      case 'system_design': return <SystemDesign />;
      case 'development': return <Workspace />;
      case 'milestone_reinforcement': return <MilestoneReview />;
      case 'reflection': return <Reflection />;
      case 'completed': return <CompletionReport />;
      default: return <NewProject />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-slate-100 overflow-hidden">
      {/* Top Application Header */}
      <header className="h-14 px-4 bg-slate-900/90 border-b border-surface-border flex items-center justify-between shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-accent-blue to-accent-purple text-white glow-blue">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              Build&Learn <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">v2 Multi-Provider</span>
            </h1>
            {currentProject && (
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{currentProject.title}</p>
            )}
          </div>
        </div>

        {/* Phase Step Indicator Pills */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-surface-border">
          {phases.map((p) => {
            const isActive = phase === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPhase(p.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-md glow-blue'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Admin Quota Usage Panel Button */}
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <Activity className="w-3.5 h-3.5 text-accent-emerald" />
            <span className="hidden sm:inline">Monitor</span>
          </button>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-1 pr-2.5 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 truncate max-w-[100px] leading-tight">
                  {user.name || user.email.split('@')[0]}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[100px] leading-tight">
                  {user.email}
                </p>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="ml-1 text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-slate-900 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-95 text-xs text-white font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal />

      {/* Main Active Route View */}
      <main className="flex-1 overflow-y-auto relative">
        {renderActivePhase()}

        {/* Admin Panel Modal Overlay */}
        {showAdminPanel && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="w-full max-w-3xl relative">
              <button
                onClick={() => setShowAdminPanel(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <ProviderUsagePanel />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
