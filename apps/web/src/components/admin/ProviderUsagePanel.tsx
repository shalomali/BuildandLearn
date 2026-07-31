import React, { useEffect, useState } from 'react';
import { request } from '../../api/client';
import { Activity, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export const ProviderUsagePanel: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const res = await request<any>('/admin/provider-usage');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  return (
    <div className="glass-panel p-5 rounded-lg border border-surface-border space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent-blue" />
          <h2 className="text-sm font-bold text-white">AI Provider Quota & Fallback Usage Monitor</h2>
        </div>
        <button
          onClick={fetchUsage}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          title="Refresh Quota Stats"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {data && data.summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(data.summary).map(([provider, stats]: [string, any]) => (
            <div key={provider} className="glass-card p-3 rounded-lg border border-surface-border space-y-1">
              <div className="text-xs font-bold uppercase text-accent-blue flex items-center justify-between">
                <span>{provider}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-base font-extrabold text-white">{stats.total} calls</div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Avg Latency: {stats.avgLatency}ms</span>
                <span className="text-emerald-400">{stats.success} success</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Feed */}
      {data && data.recentCalls && (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent-amber" /> Recent Provider Calls & Fallbacks
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px]">
            {data.recentCalls.map((c: any) => (
              <div key={c.id} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-purple-300 font-semibold">[{c.role}]</span>
                  <span className="text-blue-400">{c.provider}</span>
                  {c.fallbackFrom && (
                    <span className="text-amber-400 text-[10px]">(fallback from {c.fallbackFrom})</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>{c.latencyMs}ms</span>
                  <span className={c.success ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {c.success ? '200 OK' : 'FAIL'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
