// Deterministic, read-only advisor used when no Anthropic key is configured (and as a
// safety net). It reasons purely over the snapshot — it never invents contacts. The four
// dashboard chips map to the branches below.

import type { AdvisorContact } from './context';

const TECH_KEYWORDS = [
  'engineer', 'developer', 'software', 'tech', 'data', 'product manager', 'designer',
  'devops', 'cto', 'cio', 'programmer', 'it ', 'machine learning', 'ai', 'startup',
  'saas', 'cloud', 'security', 'frontend', 'backend', 'full stack', 'fullstack',
];

function overdue(contacts: AdvisorContact[]) {
  return contacts
    .filter((c) => c.daysUntilDue < 0)
    .sort((a, b) => a.relationshipHealth - b.relationshipHealth || a.daysUntilDue - b.daysUntilDue);
}

function line(c: AdvisorContact) {
  const role = [c.jobTitle, c.company].filter(Boolean).join(' at ');
  const overdueBy = !Number.isFinite(c.daysUntilDue)
    ? 'never contacted'
    : c.daysUntilDue < 0
      ? `${-c.daysUntilDue}d overdue`
      : `due in ${c.daysUntilDue}d`;
  return `• ${c.name}${role ? ` — ${role}` : ''} (health ${c.relationshipHealth}/100, ${overdueBy})`;
}

export function localAdvisor(prompt: string, contacts: AdvisorContact[]): string {
  const p = prompt.toLowerCase();

  if (contacts.length === 0) {
    return "You don't have any contacts yet. Add a few people and I'll help you stay close to them.";
  }

  // Who should I reach out to?
  if (/(reach out|reach-out|who should i|get in touch|contact this week)/.test(p)) {
    const od = overdue(contacts).slice(0, 5);
    if (od.length === 0) return "You're all caught up — nobody is overdue right now. Nice work. 🎉";
    return `Here's who to reach out to this week, lowest relationship health first:\n\n${od.map(line).join('\n')}\n\nStart at the top — those connections are fading fastest.`;
  }

  // Weekly priority list (overdue + upcoming birthdays).
  if (/(priorit|weekly|this week|to-?do|focus)/.test(p)) {
    const od = overdue(contacts).slice(0, 5);
    const bdays = contacts
      .filter((c) => c.nextBirthdayInDays != null && c.nextBirthdayInDays <= 30)
      .sort((a, b) => (a.nextBirthdayInDays ?? 0) - (b.nextBirthdayInDays ?? 0));
    const parts: string[] = [];
    if (od.length) parts.push(`Overdue check-ins:\n${od.map(line).join('\n')}`);
    if (bdays.length)
      parts.push(
        `Upcoming birthdays:\n${bdays.map((c) => `• ${c.name} — in ${c.nextBirthdayInDays} day${c.nextBirthdayInDays === 1 ? '' : 's'}`).join('\n')}`,
      );
    if (!parts.length) return "Nothing urgent this week — no overdue contacts and no birthdays in the next 30 days.";
    return `Your priorities this week:\n\n${parts.join('\n\n')}`;
  }

  // Works in tech?
  if (/(tech|software|engineer|developer|startup)/.test(p)) {
    const tech = contacts.filter((c) => {
      const hay = `${c.jobTitle ?? ''} ${c.company ?? ''}`.toLowerCase();
      return TECH_KEYWORDS.some((k) => hay.includes(k));
    });
    if (tech.length === 0) return "None of your contacts list a tech-related role or company right now.";
    return `These contacts work in or around tech:\n\n${tech.map(line).join('\n')}`;
  }

  // Health overview.
  if (/(health|overview|how am i doing|summary|aggregate)/.test(p)) {
    const avg = Math.round(contacts.reduce((s, c) => s + c.relationshipHealth, 0) / contacts.length);
    const strong = contacts.filter((c) => c.relationshipHealth >= 67).length;
    const fading = contacts.filter((c) => c.relationshipHealth < 34).length;
    const od = contacts.filter((c) => c.daysUntilDue < 0).length;
    return [
      `Relationship health overview (${contacts.length} contact${contacts.length === 1 ? '' : 's'}):`,
      ``,
      `• Average health: ${avg}/100`,
      `• Strong (67+): ${strong}`,
      `• Fading (<34): ${fading}`,
      `• Overdue for a check-in: ${od}`,
      ``,
      od > 0 ? `Focus on the ${od} overdue connection${od === 1 ? '' : 's'} to lift your average.` : `Great balance — keep the cadence going.`,
    ].join('\n');
  }

  // Generic: surface the most at-risk relationships.
  const od = overdue(contacts).slice(0, 3);
  if (od.length)
    return `Based on your contacts, the relationships needing attention most are:\n\n${od.map(line).join('\n')}\n\nAsk me "who should I reach out to this week?" for a full list.`;
  return `You have ${contacts.length} contacts and everyone is on cadence. Ask me for a weekly priority list or a health overview anytime.`;
}
