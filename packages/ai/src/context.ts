// Builds the read-only relationship snapshot the Advisor reasons over.
// Keep this lean: the model gets a structured digest, not the whole DB.

export interface AdvisorContact {
  name: string;
  relationship: string;
  jobTitle?: string | null;
  company?: string | null;
  tags: string[];
  relationshipHealth: number;
  daysUntilDue: number; // negative = overdue
  nextBirthdayInDays?: number | null;
}

export function buildContextBlock(contacts: AdvisorContact[]): string {
  const lines = contacts.map((c) => {
    const role = [c.jobTitle, c.company].filter(Boolean).join(' at ');
    const status = !Number.isFinite(c.daysUntilDue)
      ? 'never contacted'
      : c.daysUntilDue < 0
        ? `${-c.daysUntilDue}d overdue`
        : `due in ${c.daysUntilDue}d`;
    const bday = c.nextBirthdayInDays != null ? `, birthday in ${c.nextBirthdayInDays}d` : '';
    return `- ${c.name} (${c.relationship}${role ? ', ' + role : ''}) — health ${c.relationshipHealth}/100, ${status}${bday}, tags: ${c.tags.join('/') || 'none'}`;
  });
  return lines.join('\n');
}
