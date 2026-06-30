import type { FastifyInstance } from 'fastify';
import { prisma } from '@neighbrd/db';
import { createAdvisor, localAdvisor, type AdvisorContact } from '@neighbrd/ai';
import { daysUntilDue, upcomingBirthdays, type DashboardContact } from '@neighbrd/core';
import { advisorPromptSchema } from '@neighbrd/schemas';
import { currentUserId } from '../lib/auth.js';
import { env } from '../env.js';

export async function advisorRoutes(app: FastifyInstance) {
  // Use the real model only when a non-placeholder key is present; otherwise the
  // deterministic local advisor keeps the feature fully functional.
  const hasKey = env.anthropicApiKey && env.anthropicApiKey.startsWith('sk-ant-') && !env.anthropicApiKey.includes('placeholder');
  const ask = hasKey ? createAdvisor({ apiKey: env.anthropicApiKey, model: env.flintModel }) : null;

  app.post('/', async (req) => {
    const userId = await currentUserId(req);
    const { prompt } = advisorPromptSchema.parse(req.body);
    const now = new Date();

    const contacts = await prisma.contact.findMany({ where: { userId } });
    const dash: DashboardContact[] = contacts.map((c) => ({
      id: c.id,
      name: [c.firstName, c.lastName].filter(Boolean).join(' '),
      cadenceDays: c.cadenceDays,
      lastCheckInAt: c.lastCheckInAt,
      relationshipHealth: c.relationshipHealth,
      birthday: c.birthday,
    }));
    const bdays = new Map(upcomingBirthdays(dash, 60, now).map((b) => [b.id, b.inDays]));

    const snapshot: AdvisorContact[] = contacts.map((c) => ({
      name: [c.firstName, c.lastName].filter(Boolean).join(' '),
      relationship: c.relationship,
      jobTitle: c.jobTitle,
      company: c.company,
      tags: c.tags,
      relationshipHealth: c.relationshipHealth,
      daysUntilDue: daysUntilDue({ cadenceDays: c.cadenceDays, lastCheckInAt: c.lastCheckInAt, now }),
      nextBirthdayInDays: bdays.get(c.id) ?? null,
    }));

    if (!ask) return { answer: localAdvisor(prompt, snapshot) };
    try {
      const answer = await ask(prompt, snapshot);
      return { answer };
    } catch (err) {
      app.log.error(err, 'advisor model call failed; falling back to local');
      return { answer: localAdvisor(prompt, snapshot) };
    }
  });
}
