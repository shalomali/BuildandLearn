import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { DesignChatMessage } from '@build-and-learn/shared-types';

interface DesignChatProps {
  messages: DesignChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  onFinalizeArchitecture: () => Promise<void>;
  isFinalizing: boolean;
}

export const DesignChat: React.FC<DesignChatProps> = ({
  messages,
  onSendMessage,
  onFinalizeArchitecture,
  isFinalizing
}) => {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const txt = input;
    setInput('');
    setSending(true);
    try {
      await onSendMessage(txt);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-lg border border-surface-border overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-accent-purple" />
          <h2 className="text-sm font-bold text-white">System Design Facilitator Chat</h2>
        </div>
        <button
          onClick={onFinalizeArchitecture}
          disabled={isFinalizing}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-purple to-accent-blue text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-all glow-purple"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isFinalizing ? 'Synthesizing...' : 'Finalize Architecture & Advance'}
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 text-xs ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-3 rounded-xl max-w-[80%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-accent-blue text-white rounded-br-none'
                  : 'glass-card border border-surface-border text-slate-200 rounded-bl-none'
              }`}
            >
              {m.text}
            </div>
            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-300">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-900 border-t border-surface-border flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Discuss your preferred database, folder structure, or API endpoints..."
          className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-surface-border text-xs text-slate-200 focus:outline-none focus:border-accent-purple"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="px-3.5 py-2 rounded-lg bg-accent-purple hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
