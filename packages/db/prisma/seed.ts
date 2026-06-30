import { PrismaClient, RelationshipType, ActivityType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Demo login: demo@neighbrd.app / demodemo
  const passwordHash = await bcrypt.hash('demodemo', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@neighbrd.app' },
    update: { passwordHash },
    create: { email: 'demo@neighbrd.app', name: 'Demo', passwordHash },
  });

  // Idempotent: clear this user's demo data so re-seeding is clean.
  await prisma.contact.deleteMany({ where: { userId: user.id } });
  await prisma.goal.deleteMany({ where: { userId: user.id } });
  await prisma.event.deleteMany({ where: { userId: user.id } });

  const test = await prisma.contact.create({
    data: {
      userId: user.id,
      firstName: 'Test',
      lastName: 'test',
      relationship: RelationshipType.FRIEND,
      jobTitle: 'TEST',
      company: 'TEST',
      tags: ['Church Name', 'Baylor University'],
      cadenceDays: 30,
      lastCheckInAt: new Date('2025-10-30'),
      relationshipHealth: 22,
    },
  });

  const bob = await prisma.contact.create({
    data: {
      userId: user.id,
      firstName: 'Bob',
      lastName: 'Billy',
      relationship: RelationshipType.ASSOCIATE,
      jobTitle: 'Professional Dancer',
      company: "Billy Bob's",
      email: 'billbobby@billybobs.com',
      phone: '555-555-5555',
      tags: ['Church Name', 'Baylor University'],
      cadenceDays: 30,
      lastCheckInAt: new Date('2025-11-03'),
      relationshipHealth: 12,
    },
  });

  await prisma.activity.createMany({
    data: [
      { contactId: test.id, type: ActivityType.EVENT, title: 'FTW Friendsgiving', occurredAt: new Date('2025-11-22') },
      { contactId: bob.id, type: ActivityType.CALL, title: 'Quick call', occurredAt: new Date('2025-11-03') },
    ],
  });

  await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Work Referrals',
      description: 'blah blah',
      target: 5,
      current: 0,
      tags: ['Referrals', 'Quarterly'],
      startsAt: new Date('2025-12-12'),
      endsAt: new Date('2026-03-12'),
    },
  });

  console.log('Seeded user', user.email);
}

main().finally(() => prisma.$disconnect());
