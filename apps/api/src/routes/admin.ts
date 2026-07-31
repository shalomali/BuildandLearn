import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';

export const adminRouter = Router();

adminRouter.get('/provider-usage', async (req: Request, res: Response) => {
  try {
    const calls = await prisma.aIProviderCall.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const summary: Record<string, { total: number; success: number; failed: number; avgLatency: number }> = {};

    for (const c of calls) {
      if (!summary[c.provider]) {
        summary[c.provider] = { total: 0, success: 0, failed: 0, avgLatency: 0 };
      }
      const s = summary[c.provider];
      s.total++;
      if (c.success) s.success++; else s.failed++;
      s.avgLatency = Math.round((s.avgLatency * (s.total - 1) + c.latencyMs) / s.total);
    }

    res.json({
      summary,
      recentCalls: calls
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
