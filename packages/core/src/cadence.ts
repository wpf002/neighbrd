// Cadence engine. "Overdue" is always derived, never persisted.

export interface CadenceInput {
  cadenceDays: number;
  lastCheckInAt: Date | null;
  now?: Date;
}

/** Date a contact is next due for a check-in. Null means never contacted -> due now. */
export function dueDate({ cadenceDays, lastCheckInAt }: CadenceInput): Date | null {
  if (!lastCheckInAt) return null;
  const d = new Date(lastCheckInAt);
  d.setDate(d.getDate() + cadenceDays);
  return d;
}

export function isOverdue(input: CadenceInput): boolean {
  const now = input.now ?? new Date();
  const due = dueDate(input);
  return due === null ? true : due.getTime() < now.getTime();
}

/** Negative = days overdue, positive = days remaining. Null lastCheckIn -> most overdue. */
export function daysUntilDue(input: CadenceInput): number {
  const now = input.now ?? new Date();
  const due = dueDate(input);
  if (due === null) return -Infinity;
  return Math.round((due.getTime() - now.getTime()) / 86_400_000);
}
