import type { FastifyInstance } from 'fastify';
import { prisma } from '@neighbrd/db';
import { overdueCheckIns, upcomingBirthdays, type DashboardContact } from '@neighbrd/core';
import { currentUserId } from '../lib/auth.js';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    const userId = await currentUserId(req);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const contacts = await prisma.contact.findMany({ where: { userId } });
    const mapped: DashboardContact[] = contacts.map((c) => ({
      id: c.id,
      name: [c.firstName, c.lastName].filter(Boolean).join(' '),
      cadenceDays: c.cadenceDays,
      lastCheckInAt: c.lastCheckInAt,
      relationshipHealth: c.relationshipHealth,
      birthday: c.birthday,
    }));

    const [checkInsThisMonth, newThisMonth, recentActivity, upcomingEvents] = await Promise.all([
      prisma.activity.count({ where: { contact: { userId }, occurredAt: { gte: monthStart } } }),
      prisma.contact.count({ where: { userId, createdAt: { gte: monthStart } } }),
      prisma.activity.findMany({
        where: { contact: { userId } },
        orderBy: { occurredAt: 'desc' },
        take: 8,
        include: { contact: { select: { firstName: true, lastName: true } } },
      }),
      prisma.event.findMany({
        where: { userId, startsAt: { gte: now } },
        orderBy: { startsAt: 'asc' },
        take: 5,
        include: { contact: true },
      }),
    ]);

    const overdue = overdueCheckIns(mapped, now);
    const birthdays = upcomingBirthdays(mapped, 30, now);

    return {
      stats: {
        totalContacts: contacts.length,
        checkInsThisMonth,
        upcomingBirthdays: birthdays.length,
        networkGrowth: newThisMonth,
      },
      overdue,
      birthdays,
      recentActivity,
      upcomingEvents,
    };
  });
}
