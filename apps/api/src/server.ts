import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import { env } from './env.js';
import { AuthError } from './lib/auth.js';
import { authRoutes } from './routes/auth.js';
import { contactRoutes } from './routes/contacts.js';
import { activityRoutes } from './routes/activities.js';
import { eventRoutes } from './routes/events.js';
import { goalRoutes } from './routes/goals.js';
import { profileRoutes } from './routes/profile.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { advisorRoutes } from './routes/advisor.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: env.webOrigin, credentials: true });

app.setErrorHandler((err, _req, reply) => {
  if (err instanceof ZodError) {
    return reply.code(400).send({ error: 'Validation failed', issues: err.issues });
  }
  if (err instanceof AuthError) {
    return reply.code(err.statusCode).send({ error: err.message });
  }
  app.log.error(err);
  const e = err as { statusCode?: number; message?: string };
  return reply.code(e.statusCode ?? 500).send({ error: e.message ?? 'Internal Server Error' });
});

app.get('/health', async () => ({ ok: true }));

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(contactRoutes, { prefix: '/api/contacts' });
await app.register(activityRoutes, { prefix: '/api/contacts' });
await app.register(eventRoutes, { prefix: '/api/events' });
await app.register(goalRoutes, { prefix: '/api/goals' });
await app.register(profileRoutes, { prefix: '/api/profile' });
await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
await app.register(advisorRoutes, { prefix: '/api/advisor' });

app
  .listen({ port: env.port, host: env.host })
  .then(() => app.log.info(`API on :${env.port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
