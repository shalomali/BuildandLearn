import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { callRole } from '../ai/router';
import { detectConceptsInCode, checkConceptGate, computeNextDifficulty } from '../services/conceptEngine';
import { computeIndependenceReport, logCodeAttribution } from '../services/attributionService';
import { runAntigravityAgentLoop } from '../ai/agenticEngine';

export const projectRouter = Router();

// Phase 1: Create Project & Generate Roadmap
projectRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, stack, experienceLevel, familiarWithStack, priority, designMode } = req.body;

    const project = await prisma.project.create({
      data: {
        title: title || 'Untitled Project',
        description: description || 'Interactive learning project',
        stack: JSON.stringify(stack || ['React', 'Node.js', 'Express', 'TypeScript']),
        experienceLevel: experienceLevel || 'intermediate',
        familiarWithStack: Boolean(familiarWithStack),
        priority: priority || 'learning',
        designMode: designMode || 'guided',
        phase: 'definition'
      }
    });

    // Call RoadmapGenerator AI role
    const roadmapRes = await callRole<any>('RoadmapGenerator', {
      systemPrompt: `Generate a structured 4-milestone roadmap for building a project. Title: ${title}, Description: ${description}. Stack: ${JSON.stringify(stack)}. Return valid JSON.`,
      userMessage: `Create a learning roadmap tailored for a ${experienceLevel} level developer.`,
      jsonMode: true
    });

    const roadmapData = roadmapRes.data;

    // Update project phase & roadmap
    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        phase: 'learning_plan',
        roadmap: JSON.stringify(roadmapData)
      }
    });

    // Create default milestone records
    if (roadmapData.milestones && Array.isArray(roadmapData.milestones)) {
      for (let i = 0; i < roadmapData.milestones.length; i++) {
        const m = roadmapData.milestones[i];
        await prisma.milestone.create({
          data: {
            projectId: project.id,
            title: m.title,
            description: m.description,
            orderIndex: i + 1,
            status: i === 0 ? 'active' : 'pending'
          }
        });
      }
    }

    // Auto-link default catalog concepts so concept gates fire immediately for learning
    const defaultConcepts = await prisma.concept.findMany();
    for (const c of defaultConcepts) {
      await prisma.projectConcept.create({
        data: {
          projectId: project.id,
          conceptId: c.id,
          selectedByLearner: true,
          status: 'not_started',
          confidenceScore: 0.0
        }
      }).catch(() => {});
    }

    res.json({ project: updated, roadmap: roadmapData, providerUsed: roadmapRes.providerUsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET Project details
projectRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        projectConcepts: { include: { concept: true } },
        milestones: true
      }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function normalizeArray<T = any>(input: any): T[] {
  if (Array.isArray(input)) return input;
  if (input && typeof input === 'object') {
    for (const key of ['concepts', 'suggested', 'items', 'data', 'recommendations', 'milestones', 'nextProjects', 'results']) {
      if (Array.isArray(input[key])) return input[key];
    }
    const arrayVal = Object.values(input).find(v => Array.isArray(v));
    if (arrayVal) return arrayVal as T[];
  }
  return [];
}

// Phase 2: Suggested Concepts & Selection
projectRouter.get('/:id/concepts/suggested', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Fetch existing catalog concepts
    const catalog = await prisma.concept.findMany();

    const aiRes = await callRole<any>('ConceptRecommender', {
      systemPrompt: 'Recommend 4 core software engineering concepts for this project. Return JSON array of objects with fields: name, category, description.',
      userMessage: `Project: ${project.title}. Stack: ${project.stack}`,
      jsonMode: true
    });

    const suggested = normalizeArray(aiRes.data);
    res.json({ suggested, catalog, providerUsed: aiRes.providerUsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

projectRouter.post('/:id/concepts', async (req: Request, res: Response) => {
  try {
    const { conceptIds } = req.body; // Array of concept IDs or names
    const projectId = req.params.id;

    if (Array.isArray(conceptIds)) {
      for (const cid of conceptIds) {
        let concept = await prisma.concept.findUnique({ where: { id: cid } });
        if (!concept) {
          concept = await prisma.concept.findUnique({ where: { name: cid } });
        }
        if (concept) {
          await prisma.projectConcept.upsert({
            where: { projectId_conceptId: { projectId, conceptId: concept.id } },
            update: { selectedByLearner: true },
            create: {
              projectId,
              conceptId: concept.id,
              selectedByLearner: true,
              status: 'not_started',
              confidenceScore: 0.0
            }
          });
        }
      }
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { phase: 'system_design' },
      include: { projectConcepts: { include: { concept: true } } }
    });

    res.json({ project: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

function cleanGeneratedCode(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();
  // Remove markdown triple backticks wrapper if present
  cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
  cleaned = cleaned.replace(/\n?```$/, '');
  return cleaned.trim();
}

// Phase 3: Conversational System Design Chat (Educator + Architect)
projectRouter.post('/:id/design/message', async (req: Request, res: Response) => {
  try {
    const { message, chatHistory } = req.body;
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { projectConcepts: { include: { concept: true } } }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    const selectedConceptNames = (project.projectConcepts || []).map(pc => pc.concept.name).join(', ');

    const systemPrompt = `You are a dual-role AI: System Design Architect AND Educator.
Your job is to guide the learner through designing their system architecture for project: "${project.title}".
Learner Experience Level: "${project.experienceLevel}".
Design Guidance Mode: "${project.designMode}".
Selected Target Concepts: "${selectedConceptNames}".

PEDAGOGICAL & DESIGN RULES:
1. NEVER treat the learner as the sole expert. If they are a beginner/intermediate, DO NOT ask them technical jargon choices (e.g. "Do you prefer OAuth2 PKCE or Session Cookies?").
2. ALWAYS educate first: Explain technologies, trade-offs, and WHY a specific folder layout, database schema, or API endpoint is recommended for their project in clear, accessible language.
3. Depending on experience level:
   - "beginner": Proactively propose decisions and explain them simply with analogies. Ask friendly, high-level preference questions (e.g., "We'll set up a database to save user accounts. Would you like to start with basic user profiles?").
   - "guided": Present 2 clear options with pros/cons and your strong recommendation.
   - "advanced": Engage in peer-level architectural trade-off discussions.
4. LIVE ARCHITECTURE PANELS: In every response, output JSON with two fields:
   - "reply": Your conversational response to the learner (markdown allowed).
   - "updatedArchitecture": An object containing current or newly proposed architecture items:
     {
       "folderStructure": ["src/controllers", "src/services", "src/models", "src/routes", "src/middleware"],
       "dbDesign": [{ "table": "users", "fields": ["id UUID", "email TEXT", "password_hash TEXT"] }],
       "apiPlan": [{ "endpoint": "/api/users", "method": "GET", "description": "Fetch user list" }],
       "uiFlow": ["User Registration", "Dashboard Screen", "Workspace Editor"]
     }`;

    const aiRes = await callRole<any>('DesignFacilitator', {
      systemPrompt,
      userMessage: `Learner message: "${message}". Previous history: ${JSON.stringify(chatHistory || [])}`,
      jsonMode: true
    });

    let replyText = '';
    let updatedArchitecture: any = null;

    if (typeof aiRes.data === 'object' && aiRes.data !== null) {
      replyText = aiRes.data.reply || JSON.stringify(aiRes.data);
      updatedArchitecture = aiRes.data.updatedArchitecture || null;
    } else {
      replyText = String(aiRes.data);
    }

    // Save updated architecture snippet if present
    if (updatedArchitecture) {
      const existingArch = project.architecture ? JSON.parse(project.architecture) : {};
      const mergedArch = { ...existingArch, ...updatedArchitecture };
      await prisma.project.update({
        where: { id: project.id },
        data: { architecture: JSON.stringify(mergedArch) }
      });
    }

    res.json({
      reply: replyText,
      updatedArchitecture,
      providerUsed: aiRes.providerUsed
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

projectRouter.post('/:id/design/finalize', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });

    const aiRes = await callRole<any>('ArchitectureSynthesizer', {
      systemPrompt: 'Synthesize complete system design architecture into JSON with fields: folderStructure (string array of files/folders), dbDesign (table objects with table & fields), apiPlan (endpoint objects with endpoint, method, description), uiFlow (string array).',
      userMessage: `Finalize architecture for ${project?.title}`,
      jsonMode: true
    });

    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        phase: 'development',
        architecture: JSON.stringify(aiRes.data)
      }
    });

    res.json({ project: updated, architecture: aiRes.data, providerUsed: aiRes.providerUsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 4: IDE Workspace & Code Generation
projectRouter.get('/:id/workspace', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        projectConcepts: { include: { concept: true } },
        milestones: true
      }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json({
      project,
      architecture: project.architecture ? JSON.parse(project.architecture) : null,
      milestones: project.milestones,
      concepts: project.projectConcepts
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

projectRouter.post('/:id/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, filePath } = req.body;
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { projectConcepts: { include: { concept: true } } }
    });

    const aiRes = await callRole<string>('CodeGenerator', {
      systemPrompt: `You are an expert software engineer generating code for file "${filePath}" in project "${project?.title}".
CRITICAL RULE: OUTPUT ONLY EXECUTABLE CODE. DO NOT INCLUDE CONVERSATIONAL INTRODUCTIONS, EXPLANATIONS, OR MARKDOWN BLOCK WRAPPERS OUTSIDE THE CODE. OUTPUT RAW CLEAN CODE ONLY.`,
      userMessage: prompt || `Generate standard implementation code for ${filePath}.`,
      jsonMode: false
    });

    const generatedCode = cleanGeneratedCode(aiRes.data);

    // Run Concept Detection Engine
    const detectedNames = detectConceptsInCode(generatedCode);
    const conceptStates = (project?.projectConcepts || []).map(pc => ({
      conceptId: pc.conceptId,
      conceptName: pc.concept.name,
      selectedByLearner: pc.selectedByLearner,
      status: pc.status as any,
      confidenceScore: pc.confidenceScore
    }));

    const gateDecision = checkConceptGate(conceptStates, detectedNames);

    // Track code attribution for AI
    const lineCount = generatedCode.split('\n').length;
    await logCodeAttribution(req.params.id, {
      filePath: filePath || 'src/index.ts',
      lineStart: 1,
      lineEnd: lineCount,
      author: 'ai'
    });

    res.json({
      code: generatedCode,
      detectedConcepts: detectedNames,
      gateDecision,
      providerUsed: aiRes.providerUsed
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 4: Agentic Autonomous Multi-File Builder Plan
projectRouter.post('/:id/agentic/plan', async (req: Request, res: Response) => {
  try {
    const { targetGoal } = req.body;
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: { milestones: true, projectConcepts: { include: { concept: true } } }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    const arch = project.architecture ? JSON.parse(project.architecture) : {};
    const folderStructure = arch.folderStructure || ['src/models/user.ts', 'src/services/userService.ts', 'src/middleware/auth.ts', 'src/controllers/authController.ts', 'src/routes/api.ts', 'src/index.ts'];

    const systemPrompt = `You are an Agentic Software Architect AI (like Antigravity).
Your task is to analyze a project's architecture and create a dependency-ordered multi-file construction plan for an autonomous coding agent.
Project: "${project.title}". Stack: "${project.stack}".
Synthesized Architecture Folders/Files: ${JSON.stringify(folderStructure)}.

RULES:
1. Arrange files in exact dependency build order (e.g. data models -> services -> middleware -> controllers -> routers -> index server).
2. Output valid JSON object with fields:
   - "planSummary": Brief 1-sentence summary of the build sequence.
   - "steps": Array of objects:
     [
       {
         "filePath": "src/models/user.ts",
         "purpose": "User data model schema and TypeScript interfaces",
         "prompt": "Create user model interface and database schema types."
       }
     ]`;

    const aiRes = await callRole<any>('ArchitectureSynthesizer', {
      systemPrompt,
      userMessage: `Create agentic multi-file build plan. Target goal: "${targetGoal || 'Build complete system architecture'}".`,
      jsonMode: true
    });

    const planData = aiRes.data;
    const rawSteps = normalizeArray(planData?.steps || planData?.plan || planData);
    const steps = (rawSteps.length > 0 ? rawSteps : folderStructure).map((s: any) => {
      if (typeof s === 'string') {
        const cleanPath = s.startsWith('src/') ? s : `src/${s}`;
        return {
          filePath: cleanPath,
          purpose: `Implementation module for ${cleanPath}`,
          prompt: `Implement clean TypeScript module for ${cleanPath}`
        };
      }
      const rawPath = s?.filePath || s?.path || s?.name || 'src/index.ts';
      const cleanPath = typeof rawPath === 'string' && rawPath.startsWith('src/') ? rawPath : `src/${rawPath}`;
      return {
        filePath: cleanPath,
        purpose: s?.purpose || s?.description || `Implementation module for ${cleanPath}`,
        prompt: s?.prompt || `Implement clean TypeScript module for ${cleanPath}`
      };
    });

    res.json({
      planSummary: planData?.planSummary || `Autonomous multi-file build plan (${steps.length} files)`,
      steps,
      providerUsed: aiRes.providerUsed
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

projectRouter.post('/:id/agentic/run', async (req: Request, res: Response) => {
  try {
    const { targetGoal } = req.body;
    const projectId = req.params.id;

    const logs: any[] = [];

    const result = await runAntigravityAgentLoop({
      projectId,
      targetGoal: targetGoal || 'Build complete system architecture',
      onLog: (entry) => {
        logs.push(entry);
      },
      onGateTriggered: async (decision, filePath, code) => {
        // Concept gate encountered during agentic run
        return true;
      }
    });

    res.json({
      success: result.success,
      logs,
      generatedFiles: result.generatedFiles
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Micro-teaching endpoint
projectRouter.post('/:id/concepts/:conceptId/teach', async (req: Request, res: Response) => {
  try {
    const concept = await prisma.concept.findUnique({ where: { id: req.params.conceptId } });

    const aiRes = await callRole<any>('Teacher', {
      systemPrompt: 'Teach concept using JSON: conceptId, conceptName, summary, analogy, keyTakeaways (array), codeExample.',
      userMessage: `Explain concept: ${concept?.name || req.params.conceptId}`,
      jsonMode: true
    });

    res.json({ teachContent: aiRes.data, providerUsed: aiRes.providerUsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Micro-quiz endpoint
projectRouter.post('/:id/concepts/:conceptId/quiz', async (req: Request, res: Response) => {
  try {
    const concept = await prisma.concept.findUnique({ where: { id: req.params.conceptId } });

    const aiRes = await callRole<any>('QuizGenerator', {
      systemPrompt: 'Generate interactive code quiz in JSON: id, conceptId, format, prompt, codeContext, options, expectedAnswerPattern, difficulty.',
      userMessage: `Generate quiz question for concept ${concept?.name}`,
      jsonMode: true
    });

    res.json({ question: aiRes.data, providerUsed: aiRes.providerUsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Quiz submission
projectRouter.post('/:id/quiz/:quizId/submit', async (req: Request, res: Response) => {
  try {
    const { conceptId, learnerAnswer, expectedAnswerPattern } = req.body;
    const projectId = req.params.id;

    const pc = await prisma.projectConcept.findUnique({
      where: { projectId_conceptId: { projectId, conceptId } }
    });

    const isPass = expectedAnswerPattern
      ? new RegExp(expectedAnswerPattern, 'i').test(learnerAnswer)
      : learnerAnswer.trim().length > 3;

    const currentScore = pc ? pc.confidenceScore : 0.0;
    const { newScore, newStatus } = computeNextDifficulty(currentScore, isPass ? 'pass' : 'fail');

    if (pc) {
      await prisma.projectConcept.update({
        where: { id: pc.id },
        data: {
          confidenceScore: newScore,
          status: newStatus,
          learnedAt: newStatus === 'mastered' || newStatus === 'learned' ? new Date() : undefined
        }
      });
    }

    res.json({
      passed: isPass,
      result: isPass ? 'pass' : 'fail',
      newConfidenceScore: newScore,
      newStatus,
      explanation: isPass
        ? 'Great work! You demonstrated solid understanding.'
        : 'Not quite. Review the micro-lesson and try once more.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Learner manual code attempt & Mistake Analyzer
projectRouter.post('/:id/code/attempt', async (req: Request, res: Response) => {
  try {
    const { code, filePath, lineCount } = req.body;

    // Track attribution for learner
    await logCodeAttribution(req.params.id, {
      filePath: filePath || 'index.ts',
      lineStart: 1,
      lineEnd: lineCount || code?.split('\n').length || 1,
      author: 'learner'
    });

    const aiRes = await callRole<any>('MistakeAnalyzer', {
      systemPrompt: 'Analyze learner code snippet for bugs or flaws. Return JSON with diagnosis, suggestion, fixedSnippet.',
      userMessage: `Learner submitted code:\n${code}`,
      jsonMode: true
    });

    res.json({ analysis: aiRes.data, providerUsed: aiRes.providerUsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 5: Milestone Reinforcement
projectRouter.post('/:id/milestones/:milestoneId/complete', async (req: Request, res: Response) => {
  try {
    const m = await prisma.milestone.update({
      where: { id: req.params.milestoneId },
      data: { status: 'completed', completedAt: new Date() }
    });

    const aiRes = await callRole<any>('MilestoneExerciseGenerator', {
      systemPrompt: 'Generate a synthesis challenge exercise for milestone completion in JSON: title, instructions, startingCode, testCases (array).',
      userMessage: `Milestone completed: ${m.title}`,
      jsonMode: true
    });

    res.json({ milestone: m, exercise: aiRes.data, providerUsed: aiRes.providerUsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 6: Self-Reflection
projectRouter.post('/:id/reflection', async (req: Request, res: Response) => {
  try {
    const { learnerReflection } = req.body;

    const aiRes = await callRole<any>('ReflectionAnalyzer', {
      systemPrompt: 'Analyze learner self-reflection feedback. Return JSON: confidenceScore, sentiment, feedback.',
      userMessage: `Learner reflection: ${learnerReflection}`,
      jsonMode: true
    });

    await prisma.project.update({
      where: { id: req.params.id },
      data: { phase: 'completed' }
    });

    res.json({ reflectionAnalysis: aiRes.data, providerUsed: aiRes.providerUsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Phase 7: Completion Report & Independence Metric
projectRouter.get('/:id/report', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        projectConcepts: { include: { concept: true } },
        milestones: true
      }
    });

    const independenceStats = await computeIndependenceReport(req.params.id);

    const aiRes = await callRole<any>('ReportGenerator', {
      systemPrompt: 'Generate project completion report summary in JSON: summary, keyLearnings (array), recommendation.',
      userMessage: `Project ${project?.title} completed. Stats: ${JSON.stringify(independenceStats)}`,
      jsonMode: true
    });

    res.json({
      project,
      independenceStats,
      report: aiRes.data,
      providerUsed: aiRes.providerUsed
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

projectRouter.get('/:id/next-projects', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });

    const aiRes = await callRole<any>('NextProjectRecommender', {
      systemPrompt: 'Recommend 2 next-level projects in JSON array of objects: title, level, description.',
      userMessage: `Completed project: ${project?.title}`,
      jsonMode: true
    });

    const nextProjects = normalizeArray(aiRes.data);
    res.json({ nextProjects, providerUsed: aiRes.providerUsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
