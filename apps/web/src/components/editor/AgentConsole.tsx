import React, { useRef, useEffect } from 'react';
import { Terminal, ShieldAlert, CheckCircle2, AlertTriangle, Wrench, Bot } from 'lucide-react';

export interface AgentConsoleLog {
  id: string;
  type: 'thought' | 'tool_call' | 'verify' | 'gate' | 'complete';
  message: string;
  filePath?: string;
  timestamp: string;
}

interface AgentConsoleProps {
  logs: AgentConsoleLog[];
  isAgentRunning: boolean;
}

export const AgentConsole: React.FC<AgentConsoleProps> = ({ logs, isAgentRunning }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-44 bg-slate-950 border-t border-surface-border font-mono text-[11px] flex flex-col overflow-hidden">
      {/* Console Header */}
      <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-accent-purple" />
          <span className="text-xs font-semibold text-white font-sans flex items-center gap-1.5">
            Antigravity ReAct Agent Terminal Log
          </span>
        </div>
        {isAgentRunning && (
          <span className="flex items-center gap-1 text-[10px] text-purple-400 font-semibold font-sans animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>
            Agent Active
          </span>
        )}
      </div>

      {/* Terminal Output Log List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1.5 text-slate-300">
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">No agent log output yet. Click "🚀 Autonomous Agentic Build" to start!</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>

              {log.type === 'thought' && (
                <div className="flex items-start gap-1.5 text-purple-300">
                  <Bot className="w-3.5 h-3.5 shrink-0 text-purple-400 mt-0.5" />
                  <span>{log.message}</span>
                </div>
              )}

              {log.type === 'tool_call' && (
                <div className="flex items-start gap-1.5 text-blue-300">
                  <Wrench className="w-3.5 h-3.5 shrink-0 text-blue-400 mt-0.5" />
                  <span>{log.message}</span>
                </div>
              )}

              {log.type === 'verify' && (
                <div className="flex items-start gap-1.5 text-emerald-300">
                  {log.message.includes('Passed') ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                  )}
                  <span>{log.message}</span>
                </div>
              )}

              {log.type === 'gate' && (
                <div className="flex items-start gap-1.5 text-amber-300 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span>{log.message}</span>
                </div>
              )}

              {log.type === 'complete' && (
                <div className="flex items-start gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{log.message}</span>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
