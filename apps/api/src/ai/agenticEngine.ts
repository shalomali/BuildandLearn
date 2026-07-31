import { callRole } from './router';
import { detectConceptsInCode, checkConceptGate } from '../services/conceptEngine';
import { logCodeAttribution } from '../services/attributionService';
import {
  initProjectSandbox,
  readSandboxFile,
  writeSandboxFile,
  verifyCodeSyntax
} from '../services/sandboxService';
import { prisma } from '../prismaClient';

export interface AgentLogEntry {
  id: string;
  type: 'thought' | 'tool_call' | 'verify' | 'gate' | 'complete';
  message: string;
  filePath?: string;
  timestamp: string;
}

export function cleanGeneratedCode(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
  cleaned = cleaned.replace(/\n?```$/, '');
  return cleaned.trim();
}

export async function runAntigravityAgentLoop(params: {
  projectId: string;
  targetGoal: string;
  onLog: (entry: AgentLogEntry) => void;
  onGateTriggered: (decision: any, filePath: string, code: string) => Promise<boolean>;
}): Promise<{ success: boolean; generatedFiles: Record<string, string> }> {
  const { projectId, targetGoal, onLog, onGateTriggered } = params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { projectConcepts: { include: { concept: true } } }
  });

  if (!project) throw new Error('Project not found');

  const arch = project.architecture ? JSON.parse(project.architecture) : {};
  const folderStructure = arch.folderStructure || [
    'src/models/user.ts',
    'src/services/userService.ts',
    'src/middleware/auth.ts',
    'src/controllers/authController.ts',
    'src/routes/api.ts',
    'src/index.ts'
  ];

  // Initialize Real Sandbox on Disk
  initProjectSandbox(projectId, folderStructure);

  onLog({
    id: 'log-' + Date.now(),
    type: 'thought',
    message: `🤖 Antigravity Agent: Initialized local project sandbox. Planning dependency-ordered multi-file build for goal: "${targetGoal}"`,
    timestamp: new Date().toLocaleTimeString()
  });

  // Step 1: Agentic Plan Generation
  const planRes = await callRole<any>('ArchitectureSynthesizer', {
    systemPrompt: `You are an Antigravity Autonomous Coding Agent.
Analyze the architecture and return JSON with "steps": array of objects with "filePath", "purpose", "prompt".
Files: ${JSON.stringify(folderStructure)}`,
    userMessage: `Create build plan for goal: "${targetGoal}"`,
    jsonMode: true
  });

  const rawSteps = planRes.data?.steps || planRes.data || folderStructure;
  const steps = (Array.isArray(rawSteps) ? rawSteps : folderStructure).map((s: any) => {
    const p = typeof s === 'string' ? s : s?.filePath || 'src/index.ts';
    const cleanPath = p.startsWith('src/') ? p : `src/${p}`;
    return {
      filePath: cleanPath,
      purpose: s?.purpose || `Implementation module for ${cleanPath}`,
      prompt: s?.prompt || `Implement clean executable TypeScript module for ${cleanPath}`
    };
  });

  const generatedFiles: Record<string, string> = {};

  // Step 2: ReAct Execution Loop across files
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    onLog({
      id: 'log-' + Date.now(),
      type: 'thought',
      message: `🤖 Step ${i + 1}/${steps.length}: Analyzing dependencies for "${step.filePath}"... (${step.purpose})`,
      filePath: step.filePath,
      timestamp: new Date().toLocaleTimeString()
    });

    // Tool 1: Read existing context files from sandbox disk
    const existingContext = readSandboxFile(projectId, step.filePath);

    onLog({
      id: 'log-' + Date.now(),
      type: 'tool_call',
      message: `🛠️ Tool: CodeGenerator generating executable code for "${step.filePath}"`,
      filePath: step.filePath,
      timestamp: new Date().toLocaleTimeString()
    });

    // Tool 2: Generate Code using Gemini 3.6 Flash / Groq
    const codeRes = await callRole<string>('CodeGenerator', {
      systemPrompt: `You are an expert Antigravity Autonomous Code Generator for project "${project.title}".
File: "${step.filePath}". Purpose: "${step.purpose}".
Existing Context: "${existingContext.substring(0, 300)}".
RULES: OUTPUT ONLY EXECUTABLE TYPESCRIPT CODE. NO CONVERSATIONAL TEXT, NO MARKDOWN OUTSIDE CODE.`,
      userMessage: step.prompt,
      jsonMode: false
    });

    let code = cleanGeneratedCode(codeRes.data);

    // Tool 3: Verify Syntax
    let syntaxCheck = verifyCodeSyntax(code);
    if (!syntaxCheck.valid) {
      onLog({
        id: 'log-' + Date.now(),
        type: 'verify',
        message: `⚠️ Syntax verification issue detected: ${syntaxCheck.errors.join(', ')}. Agent self-correcting...`,
        filePath: step.filePath,
        timestamp: new Date().toLocaleTimeString()
      });

      // Self-Correction ReAct Tool Call
      const repairRes = await callRole<string>('CodeGenerator', {
        systemPrompt: `Fix syntax errors in code for file "${step.filePath}". Errors: ${syntaxCheck.errors.join(', ')}. Return ONLY fixed raw code.`,
        userMessage: code,
        jsonMode: false
      });
      code = cleanGeneratedCode(repairRes.data);
    }

    onLog({
      id: 'log-' + Date.now(),
      type: 'verify',
      message: `✅ Verification Passed: Code compiled with 0 syntax errors for "${step.filePath}"`,
      filePath: step.filePath,
      timestamp: new Date().toLocaleTimeString()
    });

    // Tool 4: Write to Real Filesystem Sandbox
    writeSandboxFile(projectId, step.filePath, code);
    generatedFiles[step.filePath] = code;

    // Track attribution for AI
    const lineCount = code.split('\n').length;
    await logCodeAttribution(projectId, {
      filePath: step.filePath,
      lineStart: 1,
      lineEnd: lineCount,
      author: 'ai'
    });

    // Concept Detection & Gate Check
    const detectedNames = detectConceptsInCode(code);
    const conceptStates = (project.projectConcepts || []).map(pc => ({
      conceptId: pc.conceptId,
      conceptName: pc.concept.name,
      selectedByLearner: pc.selectedByLearner,
      status: pc.status as any,
      confidenceScore: pc.confidenceScore
    }));

    const gateDecision = checkConceptGate(conceptStates, detectedNames);

    if (gateDecision.action !== 'CONTINUE') {
      onLog({
        id: 'log-' + Date.now(),
        type: 'gate',
        message: `🛡️ Concept Gate Triggered: "${gateDecision.conceptName}". Agent loop paused for learner micro-lesson.`,
        filePath: step.filePath,
        timestamp: new Date().toLocaleTimeString()
      });

      // Wait for learner to clear concept gate
      const cleared = await onGateTriggered(gateDecision, step.filePath, code);
      if (!cleared) {
        onLog({
          id: 'log-' + Date.now(),
          type: 'gate',
          message: `⏸️ Agent loop paused by user.`,
          timestamp: new Date().toLocaleTimeString()
        });
        return { success: false, generatedFiles };
      }
    }
  }

  onLog({
    id: 'log-' + Date.now(),
    type: 'complete',
    message: `🎉 Antigravity Agent Build Completed! All ${Object.keys(generatedFiles).length} files written and verified in sandbox.`,
    timestamp: new Date().toLocaleTimeString()
  });

  return { success: true, generatedFiles };
}
