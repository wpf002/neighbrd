import type { FastifyInstance } from 'fastify';
import { prisma } from '@neighbrd/db';
import { eventCreateSchema } from '@neighbrd/schemas';
import { currentUserId } from '../lib/auth.js';

export async function eventRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const userId = await currentUserId(req);
    return prisma.event.findMany({ where: { userId }, orderBy: { startsAt: 'asc' }, include: { contact: true } });
  });

  app.post('/', async (req, reply) => {
    const userId = await currentUserId(req);
    const data = eventCreateSchema.parse(req.body);
    const event = await prisma.event.create({ data: { ...data, userId } });
    return reply.code(201).send(event);
  });

  app.delete('/:id', async (req, reply) => {
    const userId = await currentUserId(req);
    const { id } = req.params as { id: string };
    const { count } = await prisma.event.deleteMany({ where: { id, userId } });
    return reply.code(count ? 204 : 404).send();
  });
}
