import React, { useState } from 'react';
import { request } from '../api/client';
import { useProjectStore } from '../state/projectStore';
import { DesignChat } from '../components/design/DesignChat';
import { ArchitecturePreview } from '../components/design/ArchitecturePreview';
import { DesignChatMessage, ArchitectureDoc } from '@build-and-learn/shared-types';
import { Network } from 'lucide-react';

export const SystemDesign: React.FC = () => {
  const { currentProject, setPhase, setArchitecture } = useProjectStore();
  const [architecture, setLocalArchitecture] = useState<ArchitectureDoc | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const level = currentProject?.experienceLevel || 'intermediate';
  const initialText = level === 'beginner'
    ? `Welcome to Phase 3: System Design! I am your AI Design Architect & Educator. We're going to design the structure for "${currentProject?.title || 'your project'}" step-by-step. I'll explain each component as we build it. To start, I've outlined a standard folder layout and database setup on your right. Let me know if you'd like to explore how user authentication works!`
    : `Welcome to Phase 3: System Design Session! I am your AI Design Facilitator & Educator. Let's design the architecture for "${currentProject?.title || 'your project'}". As we chat, watch the live architecture panel on your right build out the folder tree, database schema, and REST API endpoints in real time!`;

  const [messages, setMessages] = useState<DesignChatMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: initialText,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const handleSendMessage = async (userText: string) => {
    const userMsg: DesignChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await request<any>(`/projects/${currentProject?.id}/design/message`, {
        method: 'POST',
        body: JSON.stringify({ message: userText, chatHistory: messages })
      });

      const aiMsg: DesignChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Update architecture preview in real time!
      if (res.updatedArchitecture) {
        setLocalArchitecture((prev) => {
          const merged = { ...prev, ...res.updatedArchitecture };
          setArchitecture(merged);
          return merged;
        });
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleFinalize = async () => {
    if (!currentProject) return;
    setIsFinalizing(true);
    try {
      const res = await request<any>(`/projects/${currentProject.id}/design/finalize`, {
        method: 'POST'
      });
      setLocalArchitecture(res.architecture);
      setArchitecture(res.architecture);
      setPhase('development');
    } catch (err: any) {
      alert(`Error finalizing design: ${err.message}`);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-accent-purple" />
          <h1 className="text-lg font-bold text-white">Phase 3: Interactive System Design Session</h1>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
        <DesignChat
          messages={messages}
          onSendMessage={handleSendMessage}
          onFinalizeArchitecture={handleFinalize}
          isFinalizing={isFinalizing}
        />
        <ArchitecturePreview architecture={architecture} />
      </div>
    </div>
  );
};
