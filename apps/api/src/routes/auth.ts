import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '@neighbrd/db';
import { signupSchema, loginSchema } from '@neighbrd/schemas';
import { signToken, currentUserId } from '../lib/auth.js';

function publicUser(u: { id: string; email: string; name: string | null }) {
  return { id: u.id, email: u.email, name: u.name };
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/signup', async (req, reply) => {
    const { email, password, name } = signupSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return reply.code(409).send({ error: 'An account with that email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name ?? email.split('@')[0] },
    });
    const token = signToken({ userId: user.id, email: user.email });
    return reply.code(201).send({ token, user: publicUser(user) });
  });

  app.post('/login', async (req, reply) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }
    const token = signToken({ userId: user.id, email: user.email });
    return { token, user: publicUser(user) };
  });

  app.get('/me', async (req) => {
    const userId = await currentUserId(req);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return { user: publicUser(user) };
  });
}
