import type { FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export class AuthError extends Error {
  statusCode = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '30d' });
}

function readToken(req: FastifyRequest): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  // Fallback to cookie if present (set by the web app).
  const cookie = (req.headers.cookie ?? '')
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('neighbrd_token='));
  return cookie ? decodeURIComponent(cookie.slice('neighbrd_token='.length)) : null;
}

/** Resolve the authenticated user id from the JWT, or throw a 401. */
export async function currentUserId(req: FastifyRequest): Promise<string> {
  const token = readToken(req);
  if (!token) throw new AuthError('Missing auth token');
  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    return payload.userId;
  } catch {
    throw new AuthError('Invalid or expired token');
  }
}
