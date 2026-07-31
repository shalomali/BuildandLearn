import { prisma } from '../prismaClient';

export interface LineRangeAttribution {
  filePath: string;
  lineStart: number;
  lineEnd: number;
  author: 'ai' | 'learner';
  conceptId?: string;
}

export async function logCodeAttribution(
  projectId: string,
  attribution: LineRangeAttribution
) {
  return await prisma.codeAttribution.create({
    data: {
      projectId,
      filePath: attribution.filePath,
      lineStart: attribution.lineStart,
      lineEnd: attribution.lineEnd,
      author: attribution.author,
      conceptId: attribution.conceptId
    }
  });
}

export async function computeIndependenceReport(projectId: string) {
  const records = await prisma.codeAttribution.findMany({
    where: { projectId }
  });

  let aiLines = 0;
  let learnerLines = 0;

  for (const r of records) {
    const count = Math.max(1, r.lineEnd - r.lineStart + 1);
    if (r.author === 'ai') {
      aiLines += count;
    } else {
      learnerLines += count;
    }
  }

  const total = aiLines + learnerLines;
  const learnerPct = total > 0 ? Math.round((learnerLines / total) * 100) : 50;
  const aiPct = total > 0 ? 100 - learnerPct : 50;

  return {
    totalLines: total,
    aiLines,
    learnerLines,
    aiPct,
    learnerPct
  };
}
