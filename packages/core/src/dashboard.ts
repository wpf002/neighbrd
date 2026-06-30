import { daysUntilDue, isOverdue, type CadenceInput } from './cadence';

export interface DashboardContact extends CadenceInput {
  id: string;
  name: string;
  relationshipHealth: number;
  birthday?: Date | null;
}

/** Overdue contacts, most-overdue first. Drives the dashboard + the AI Advisor. */
export function overdueCheckIns(contacts: DashboardContact[], now = new Date()) {
  return contacts
    .filter((c) => isOverdue({ ...c, now }))
    .sort((a, b) => daysUntilDue({ ...a, now }) - daysUntilDue({ ...b, now }));
}

/** Birthdays within the next `window` days (handles year wrap). */
export function upcomingBirthdays(contacts: DashboardContact[], windowDays = 30, now = new Date()) {
  return contacts
    .filter((c) => c.birthday)
    .map((c) => {
      const b = c.birthday as Date;
      const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if (next < now) next.setFullYear(next.getFullYear() + 1);
      const inDays = Math.round((next.getTime() - now.getTime()) / 86_400_000);
      return { ...c, nextBirthday: next, inDays };
    })
    .filter((c) => c.inDays <= windowDays)
    .sort((a, b) => a.inDays - b.inDays);
}
