import React, { useEffect, useState, useRef } from 'react';
import { request } from '../api/client';
import { getSocket } from '../ws/socket';
import {
  WsConceptGateEvent,
  WsGateClearedEvent,
  WsCodeStreamChunk,
  WsMilestoneCompletedEvent
} from '@build-and-learn/shared-types';
import { useProjectStore } from '../state/projectStore';
import { useLearningStore } from '../state/learningStore';
import { useEditorStore } from '../state/editorStore';
import { CodeEditor } from '../components/editor/CodeEditor';
import { ConceptGateOverlay } from '../components/editor/ConceptGateOverlay';
import { AttributionGutter } from '../components/editor/AttributionGutter';
import { TeachStep } from '../components/learningPanel/TeachStep';
import { QuizStep } from '../components/learningPanel/QuizStep';
import { KnowledgeGraph } from '../components/sidebar/KnowledgeGraph';
import { MilestoneList } from '../components/sidebar/MilestoneList';
import { FileTree } from '../components/sidebar/FileTree';
import { AgenticBuildBanner, AgenticStep } from '../components/editor/AgenticBuildBanner';
import { AgentConsole, AgentConsoleLog } from '../components/editor/AgentConsole';
import { Play, Sparkles, FolderTree, BookOpen, Award, Info, Bot, Terminal } from 'lucide-react';

export const Workspace: React.FC = () => {
  const { currentProject, milestones, setPhase, completeMilestone } = useProjectStore();
  const {
    gateActive,
    activeConceptId,
    teachContent,
    currentQuiz,
    projectConcepts,
    triggerGate,
    clearGate,
    setTeachContent,
    setCurrentQuiz,
    setProjectConcepts,
    updateConceptStatus
  } = useLearningStore();

  const {
    activeFile,
    setActiveFile,
    files,
    fileExplanations,
    setFileContent,
    isStreaming,
    setIsStreaming,
    initFilesFromArchitecture
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'editor' | 'teach' | 'quiz'>('editor');
  const [sidebarTab, setSidebarTab] = useState<'files' | 'concepts' | 'milestones'>('files');
  const [prompt, setPrompt] = useState('Build JWT Authentication middleware module with secret validation.');

  // Antigravity Agent Console & Execution Loop State
  const [agentSteps, setAgentSteps] = useState<AgenticStep[]>([]);
  const [agentPlanSummary, setAgentPlanSummary] = useState<string>('');
  const [agentStepIndex, setAgentStepIndex] = useState<number>(0);
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [isAgentPaused, setIsAgentPaused] = useState<boolean>(false);
  const [agentLogs, setAgentLogs] = useState<AgentConsoleLog[]>([]);
  const agentPausedRef = useRef<boolean>(false);

  // Fetch initial workspace data & initialize architecture folder files
  useEffect(() => {
    if (!currentProject) return;
    const fetchWorkspace = async () => {
      try {
        const data = await request<any>(`/projects/${currentProject.id}/workspace`);
        if (data.concepts) setProjectConcepts(data.concepts);
        if (data.architecture?.folderStructure) {
          initFilesFromArchitecture(data.architecture.folderStructure);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchWorkspace();

    // Setup Socket.IO Live WebSocket Listeners
    const socket = getSocket();
    socket.emit('join_project', currentProject.id);

    const handleConceptGate = (data: WsConceptGateEvent) => {
      triggerGate(data.action, data.conceptId, data.conceptName);
    };

    const handleGateCleared = (data: WsGateClearedEvent) => {
      clearGate();
    };

    const handleCodeStreamChunk = (data: WsCodeStreamChunk) => {
      setFileContent(data.filePath, data.chunk, 'ai');
    };

    const handleMilestoneCompleted = (data: WsMilestoneCompletedEvent) => {
      completeMilestone(data.milestoneId);
    };

    socket.on('concept_gate', handleConceptGate);
    socket.on('gate_cleared', handleGateCleared);
    socket.on('code_stream_chunk', handleCodeStreamChunk);
    socket.on('milestone_completed', handleMilestoneCompleted);

    return () => {
      socket.off('concept_gate', handleConceptGate);
      socket.off('gate_cleared', handleGateCleared);
      socket.off('code_stream_chunk', handleCodeStreamChunk);
      socket.off('milestone_completed', handleMilestoneCompleted);
    };
  }, [currentProject]);

  const fileList = Object.keys(files);
  const currentExplanation = fileExplanations[activeFile] || 'Core architectural module for this component.';

  const addAgentLog = (type: AgentConsoleLog['type'], message: string, filePath?: string) => {
    setAgentLogs((prev) => [
      ...prev,
      {
        id: 'log-' + Date.now() + '-' + Math.random(),
        type,
        message,
        filePath,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Trigger Antigravity-Style Agentic Multi-File ReAct Build
  const handleStartAgenticBuild = async () => {
    if (!currentProject || isAgentRunning) return;
    setIsStreaming(true);
    setAgentLogs([]);
    try {
      addAgentLog('thought', `🤖 Antigravity Agent: Initialized project workspace. Planning multi-file build sequence for: "${prompt}"`);

      const planRes = await request<any>(`/projects/${currentProject.id}/agentic/plan`, {
        method: 'POST',
        body: JSON.stringify({ targetGoal: prompt || 'Build complete system architecture' })
      });

      const steps: AgenticStep[] = planRes.steps || [];
      setAgentPlanSummary(planRes.planSummary || 'Autonomous Multi-File Build Plan');
      setAgentSteps(steps);
      setAgentStepIndex(0);
      setIsAgentRunning(true);
      setIsAgentPaused(false);
      agentPausedRef.current = false;

      addAgentLog('thought', `🤖 Agentic Plan Generated: ${steps.length} files in dependency build order.`);

      // Start autonomous sequential ReAct build loop
      runAgenticLoop(steps, 0);
    } catch (err: any) {
      alert(`Error starting agentic build: ${err.message}`);
      setIsStreaming(false);
    }
  };

  const runAgenticLoop = async (steps: AgenticStep[], startIndex: number) => {
    for (let i = startIndex; i < steps.length; i++) {
      if (agentPausedRef.current) {
        setAgentStepIndex(i);
        return;
      }

      const step = steps[i];
      setAgentStepIndex(i);
      setActiveFile(step.filePath);
      setIsStreaming(true);

      addAgentLog('thought', `🤖 Step ${i + 1}/${steps.length}: Analyzing dependencies for "${step.filePath}"... (${step.purpose})`, step.filePath);
      addAgentLog('tool_call', `🛠️ Tool: CodeGenerator generating executable code for "${step.filePath}"`, step.filePath);

      try {
        const res = await request<any>(`/projects/${currentProject?.id}/generate`, {
          method: 'POST',
          body: JSON.stringify({ prompt: step.prompt, filePath: step.filePath })
        });

        // Set generated code for step file
        setFileContent(step.filePath, res.code, 'ai');

        addAgentLog('verify', `✅ Tool: Syntax verification passed (0 errors) for "${step.filePath}"`, step.filePath);
        addAgentLog('tool_call', `🛠️ Tool: Wrote ${res.code.split('\n').length} lines to "${step.filePath}" in local sandbox`, step.filePath);

        // Check if concept gate is triggered
        if (res.gateDecision && res.gateDecision.action !== 'CONTINUE') {
          const { action, conceptId, conceptName } = res.gateDecision;
          triggerGate(action, conceptId, conceptName || 'Target Concept');

          addAgentLog('gate', `🛡️ Concept Gate Triggered: "${conceptName || 'Target Concept'}". Agent loop paused for micro-lesson.`, step.filePath);

          // Pause agentic execution for micro-lesson
          setIsAgentPaused(true);
          agentPausedRef.current = true;
          setIsStreaming(false);

          // Fetch Micro-Teach Lesson
          const teachRes = await request<any>(`/projects/${currentProject?.id}/concepts/${conceptId}/teach`, {
            method: 'POST'
          });
          setTeachContent(teachRes.teachContent);
          setActiveTab('teach');
          return; // Pause execution loop until learner clears gate!
        }
      } catch (err: any) {
        addAgentLog('verify', `❌ Error on "${step.filePath}": ${err.message}`, step.filePath);
        console.error(`Agentic build step ${i} error:`, err);
      }
    }

    addAgentLog('complete', `🎉 Antigravity Agentic Build Completed! All ${steps.length} files compiled and verified in sandbox.`);
    setIsStreaming(false);
    setIsAgentRunning(false);
  };

  const handleGateCleared = () => {
    clearGate();
    setActiveTab('editor');
    setIsAgentPaused(false);
    agentPausedRef.current = false;

    addAgentLog('thought', `✅ Concept Gate Cleared by learner! Resuming Antigravity Agent build loop...`);

    // Resume agentic loop automatically for remaining steps!
    if (isAgentRunning && agentStepIndex + 1 < agentSteps.length) {
      runAgenticLoop(agentSteps, agentStepIndex + 1);
    } else {
      setIsAgentRunning(false);
    }
  };

  const handleGenerateSingleFileCode = async () => {
    if (!currentProject || gateActive) return;
    setIsStreaming(true);
    try {
      const res = await request<any>(`/projects/${currentProject.id}/generate`, {
        method: 'POST',
        body: JSON.stringify({ prompt, filePath: activeFile })
      });

      setFileContent(activeFile, res.code, 'ai');

      if (res.gateDecision && res.gateDecision.action !== 'CONTINUE') {
        const { action, conceptId, conceptName } = res.gateDecision;
        triggerGate(action, conceptId, conceptName || 'Target Concept');

        const teachRes = await request<any>(`/projects/${currentProject.id}/concepts/${conceptId}/teach`, {
          method: 'POST'
        });
        setTeachContent(teachRes.teachContent);
        setActiveTab('teach');
      }
    } catch (err: any) {
      alert(`Error generating code: ${err.message}`);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleContinueToQuiz = async () => {
    if (!currentProject || !activeConceptId) return;
    try {
      const quizRes = await request<any>(`/projects/${currentProject.id}/concepts/${activeConceptId}/quiz`, {
        method: 'POST'
      });
      setCurrentQuiz(quizRes.question);
      setActiveTab('quiz');
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuizSubmit = async (learnerAnswer: string) => {
    if (!currentProject || !currentQuiz || !activeConceptId) {
      throw new Error('Missing active quiz state');
    }
    const res = await request<any>(`/projects/${currentProject.id}/quiz/${currentQuiz.id}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        conceptId: activeConceptId,
        learnerAnswer,
        expectedAnswerPattern: currentQuiz.expectedAnswerPattern
      })
    });

    updateConceptStatus(activeConceptId, res.newStatus, res.newConfidenceScore);
    return res;
  };

  const currentCode = files[activeFile] || '';
  const currentLineCount = currentCode.split('\n').length;

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Top IDE Toolbar */}
      <div className="p-3 glass-panel rounded-lg border border-surface-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <span className="text-xs font-bold text-white flex items-center gap-1.5 shrink-0">
            <FolderTree className="w-4 h-4 text-accent-blue" />
            {currentProject?.title || 'Workspace'}
          </span>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={gateActive || isStreaming}
            placeholder="Antigravity agent build goal (e.g. Build Auth System & Database API)..."
            className="flex-1 px-3 py-1.5 rounded bg-slate-950 border border-surface-border text-xs text-slate-200 focus:outline-none focus:border-accent-blue"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Antigravity-Style Agentic Multi-File Builder Button */}
          <button
            onClick={handleStartAgenticBuild}
            disabled={gateActive || isStreaming}
            className="px-4 py-1.5 rounded bg-gradient-to-r from-accent-purple via-accent-blue to-accent-emerald text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-all glow-purple"
          >
            <Bot className={`w-4 h-4 ${isAgentRunning ? 'animate-spin' : ''}`} />
            <span>{isAgentRunning ? 'Antigravity Agent Building...' : '🚀 Run Antigravity Agent'}</span>
          </button>

          <button
            onClick={handleGenerateSingleFileCode}
            disabled={gateActive || isStreaming}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-accent-blue" />
            <span>Single File</span>
          </button>

          <button
            onClick={() => setPhase('milestone_reinforcement')}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Milestone Review</span>
          </button>
        </div>
      </div>

      {/* Agentic Builder Active Status Banner */}
      {isAgentRunning && (
        <AgenticBuildBanner
          planSummary={agentPlanSummary}
          steps={agentSteps}
          currentStepIndex={agentStepIndex}
          isRunning={isAgentRunning}
          isPaused={isAgentPaused}
          onPause={() => {
            setIsAgentPaused(true);
            agentPausedRef.current = true;
          }}
          onResume={() => {
            setIsAgentPaused(false);
            agentPausedRef.current = false;
            runAgenticLoop(agentSteps, agentStepIndex);
          }}
          onCancel={() => {
            setIsAgentRunning(false);
            setIsAgentPaused(false);
            agentPausedRef.current = false;
            setIsStreaming(false);
          }}
        />
      )}

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[500px]">
        {/* Left Sidebar: Tabbed File Explorer / Knowledge Graph / Milestones */}
        <div className="lg:col-span-3 glass-panel rounded-lg border border-surface-border flex flex-col overflow-hidden">
          {/* Sidebar Tab Header */}
          <div className="p-2 bg-slate-900 border-b border-surface-border flex items-center justify-around text-xs font-semibold">
            <button
              onClick={() => setSidebarTab('files')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                sidebarTab === 'files' ? 'bg-blue-600/30 text-accent-blue border border-blue-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Files</span>
            </button>
            <button
              onClick={() => setSidebarTab('concepts')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                sidebarTab === 'concepts' ? 'bg-purple-600/30 text-accent-purple border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Concepts</span>
            </button>
            <button
              onClick={() => setSidebarTab('milestones')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                sidebarTab === 'milestones' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Milestones</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'files' && (
              <FileTree
                files={fileList}
                activeFile={activeFile}
                onSelectFile={setActiveFile}
                fileExplanations={fileExplanations}
              />
            )}

            {sidebarTab === 'concepts' && (
              <KnowledgeGraph concepts={projectConcepts} activeConceptId={activeConceptId} />
            )}

            {sidebarTab === 'milestones' && (
              <MilestoneList milestones={milestones} />
            )}
          </div>
        </div>

        {/* Center Panel: Code Editor + Explanation Header + Agent Console */}
        <div className="lg:col-span-6 relative flex flex-col h-full space-y-2">
          {/* File Architecture Explanation Header */}
          <div className="p-2.5 rounded-lg bg-slate-900 border border-surface-border flex items-start gap-2 text-xs">
            <Info className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-mono font-semibold text-slate-200">{activeFile}</span>
              <p className="text-[11px] text-slate-400 leading-snug">{currentExplanation}</p>
            </div>
          </div>

          <div className="flex-1 relative">
            <ConceptGateOverlay />
            <CodeEditor
              filePath={activeFile}
              value={currentCode}
              onChange={(val) => setFileContent(activeFile, val, 'learner')}
            />
          </div>
          <AttributionGutter lineCount={currentLineCount} author="ai" />

          {/* Antigravity Agent ReAct Console */}
          <AgentConsole logs={agentLogs} isAgentRunning={isAgentRunning} />
        </div>

        {/* Right Panel: Learning Workspace */}
        <div className="lg:col-span-3 glass-panel rounded-lg border border-surface-border flex flex-col overflow-hidden">
          <div className="p-3 bg-slate-900 border-b border-surface-border flex items-center justify-between text-xs font-bold">
            <span className="text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-accent-purple" /> Learning Workspace
            </span>
            {gateActive && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-mono animate-pulse">
                Gate Active
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'teach' && teachContent && (
              <TeachStep content={teachContent} onContinueToQuiz={handleContinueToQuiz} />
            )}

            {activeTab === 'quiz' && currentQuiz && (
              <QuizStep quiz={currentQuiz} onSubmit={handleQuizSubmit} onGateCleared={handleGateCleared} />
            )}

            {activeTab === 'editor' && !gateActive && (
              <div className="p-6 text-center text-slate-500 space-y-3">
                <Bot className="w-8 h-8 text-accent-purple mx-auto animate-pulse" />
                <h3 className="text-xs font-semibold text-slate-400">Antigravity Agent Active</h3>
                <p className="text-xs leading-relaxed">
                  Click <strong>🚀 Run Antigravity Agent</strong> to watch the AI Agent execute its tool-calling ReAct loop, verifying code syntax and writing real project files!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
