import type { FastifyInstance } from 'fastify';
import { prisma, Prisma } from '@neighbrd/db';
import { contactCreateSchema, contactUpdateSchema, contactImportSchema } from '@neighbrd/schemas';
import { currentUserId } from '../lib/auth.js';

export async function contactRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const userId = await currentUserId(req);
    const { q, relationship, tag } = req.query as {
      q?: string;
      relationship?: string;
      tag?: string;
    };

    const where: Prisma.ContactWhereInput = { userId };

    if (relationship && relationship !== 'ALL') {
      where.relationship = relationship as Prisma.ContactWhereInput['relationship'];
    }
    if (tag && tag !== 'ALL') {
      where.tags = { has: tag };
    }
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } },
        { jobTitle: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { tags: { has: term } },
      ];
    }

    return prisma.contact.findMany({ where, orderBy: { createdAt: 'desc' } });
  });

  app.get('/:id', async (req, reply) => {
    const userId = await currentUserId(req);
    const { id } = req.params as { id: string };
    const contact = await prisma.contact.findFirst({
      where: { id, userId },
      include: { activities: { orderBy: { occurredAt: 'desc' } }, events: true },
    });
    if (!contact) return reply.code(404).send({ error: 'Not found' });
    return contact;
  });

  app.post('/', async (req, reply) => {
    const userId = await currentUserId(req);
    const data = contactCreateSchema.parse(req.body);
    const contact = await prisma.contact.create({ data: { ...data, userId, socials: data.socials ?? undefined } });
    return reply.code(201).send(contact);
  });

  // Bulk import (CSV / vCard parsed client-side into validated rows).
  app.post('/import', async (req, reply) => {
    const userId = await currentUserId(req);
    const rows = contactImportSchema.parse(req.body);
    const created = await prisma.$transaction(
      rows.map((data) =>
        prisma.contact.create({ data: { ...data, userId, socials: data.socials ?? undefined } }),
      ),
    );
    return reply.code(201).send({ imported: created.length });
  });

  app.patch('/:id', async (req, reply) => {
    const userId = await currentUserId(req);
    const { id } = req.params as { id: string };
    const owned = await prisma.contact.findFirst({ where: { id, userId }, select: { id: true } });
    if (!owned) return reply.code(404).send({ error: 'Not found' });
    const data = contactUpdateSchema.parse(req.body);
    return prisma.contact.update({ where: { id }, data: { ...data, socials: data.socials ?? undefined } });
  });

  app.delete('/:id', async (req, reply) => {
    const userId = await currentUserId(req);
    const { id } = req.params as { id: string };
    const { count } = await prisma.contact.deleteMany({ where: { id, userId } });
    return reply.code(count ? 204 : 404).send();
  });
}
