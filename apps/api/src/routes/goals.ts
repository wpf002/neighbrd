import type { FastifyInstance } from 'fastify';
import { prisma } from '@neighbrd/db';
import { goalCreateSchema, goalUpdateSchema } from '@neighbrd/schemas';
import { currentUserId } from '../lib/auth.js';

export async function goalRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const userId = await currentUserId(req);
    return prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  });

  app.post('/', async (req, reply) => {
    const userId = await currentUserId(req);
    const data = goalCreateSchema.parse(req.body);
    const goal = await prisma.goal.create({ data: { ...data, userId } });
    return reply.code(201).send(goal);
  });

  app.patch('/:id', async (req, reply) => {
    const userId = await currentUserId(req);
    const { id } = req.params as { id: string };
    const owned = await prisma.goal.findFirst({ where: { id, userId }, select: { id: true } });
    if (!owned) return reply.code(404).send({ error: 'Not found' });
    const data = goalUpdateSchema.parse(req.body);
    return prisma.goal.update({ where: { id }, data });
  });

  app.delete('/:id', async (req, reply) => {
    const userId = await currentUserId(req);
    const { id } = req.params as { id: string };
    const { count } = await prisma.goal.deleteMany({ where: { id, userId } });
    return reply.code(count ? 204 : 404).send();
  });
}
