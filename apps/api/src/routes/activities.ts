import type { FastifyInstance } from 'fastify';
import { prisma } from '@neighbrd/db';
import { relationshipHealth } from '@neighbrd/core';
import { activityCreateSchema } from '@neighbrd/schemas';
import { currentUserId } from '../lib/auth.js';

export async function activityRoutes(app: FastifyInstance) {
  // Logging an activity is what updates lastCheckInAt + recomputes health.
  app.post('/:id/activities', async (req, reply) => {
    const userId = await currentUserId(req);
    const { id } = req.params as { id: string };
    const data = activityCreateSchema.parse(req.body);

    const contact = await prisma.contact.findFirst({ where: { id, userId } });
    if (!contact) return reply.code(404).send({ error: 'Not found' });

    const occurredAt = data.occurredAt ?? new Date();
    await prisma.activity.create({ data: { ...data, occurredAt, contactId: id } });

    const since = new Date(Date.now() - 90 * 86_400_000);
    const activityCountLast90d = await prisma.activity.count({
      where: { contactId: id, occurredAt: { gte: since } },
    });

    const health = relationshipHealth({
      cadenceDays: contact.cadenceDays,
      lastCheckInAt: occurredAt,
      activityCountLast90d,
      relationship: contact.relationship,
    });

    return prisma.contact.update({
      where: { id },
      data: { lastCheckInAt: occurredAt, relationshipHealth: health },
    });
  });
}
