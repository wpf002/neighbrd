import type { FastifyInstance } from 'fastify';
import { prisma } from '@neighbrd/db';
import { profileSchema } from '@neighbrd/schemas';
import { currentUserId } from '../lib/auth.js';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 7);
}

export async function profileRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const userId = await currentUserId(req);
    return prisma.profile.findUnique({ where: { userId } });
  });

  app.put('/', async (req) => {
    const userId = await currentUserId(req);
    const data = profileSchema.parse(req.body);
    const existing = await prisma.profile.findUnique({ where: { userId } });
    // Mint a stable slug the first time the profile is saved (so a link always exists).
    const shareSlug = existing?.shareSlug ?? slugify(data.fullName || 'neighbor');
    return prisma.profile.upsert({
      where: { userId },
      update: { ...data, visibility: data.visibility ?? undefined, shareSlug },
      create: { ...data, userId, visibility: data.visibility ?? undefined, shareSlug },
    });
  });

  // Public read-only card. Honors the per-field visibility map (a field is shown unless
  // explicitly set to false). Identity fields (fullName, bio) are always shown.
  app.get('/public/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const profile = await prisma.profile.findFirst({ where: { shareSlug: slug, isPublic: true } });
    if (!profile) return reply.code(404).send({ error: 'Not found' });

    const visibility = (profile.visibility as Record<string, boolean> | null) ?? {};
    const ALWAYS = new Set(['id', 'fullName', 'bio', 'shareSlug', 'isPublic']);
    const HIDDEN = new Set(['userId', 'visibility', 'createdAt', 'updatedAt']);
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(profile)) {
      if (HIDDEN.has(key)) continue;
      if (ALWAYS.has(key) || visibility[key] !== false) out[key] = value;
    }
    return out;
  });
}
