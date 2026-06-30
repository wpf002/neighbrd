import type { Contact, RelationshipType, ActivityType } from './types';

export function fullName(c: { firstName: string; lastName?: string | null }): string {
  return [c.firstName, c.lastName].filter(Boolean).join(' ');
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (!first) return '?';
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? '';
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function fmtDateShort(d: string | Date | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** Date a contact is next due, derived from lastCheckInAt + cadenceDays. */
export function dueLabel(c: Pick<Contact, 'lastCheckInAt' | 'cadenceDays'>): string {
  if (!c.lastCheckInAt) return 'Never contacted';
  const due = new Date(c.lastCheckInAt);
  due.setDate(due.getDate() + c.cadenceDays);
  return `Due ${fmtDateShort(due)}`;
}

export const RELATIONSHIP_STYLES: Record<RelationshipType, string> = {
  FRIEND: 'bg-[#e7eef8] text-[#3f6aa3]',
  FAMILY: 'bg-[#e9f4ea] text-[#4f9a5c]',
  ASSOCIATE: 'bg-[#ece9f8] text-[#6a5db1]',
  COLLEAGUE: 'bg-[#fbf0e4] text-[#bd744a]',
};

export const ACTIVITY_STYLES: Record<ActivityType, string> = {
  CALL: 'bg-[#e6eefb] text-[#3f63bb]',
  MESSAGE: 'bg-[#e9f4ea] text-[#4f9a5c]',
  EVENT: 'bg-[#fbe6ef] text-[#bb3f7d]',
  MEETING: 'bg-[#fbf0e4] text-[#bd744a]',
  NOTE: 'bg-[#eef0f2] text-[#5a6573]',
};

export const TAG_COLORS = ['#7c5fc0', '#c08a3c', '#3f6aa3', '#4f9a5c', '#bb3f7d', '#bd744a'];

export function tagColor(tag: string): string {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[h % TAG_COLORS.length] ?? TAG_COLORS[0]!;
}

export const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string }[] = [
  { value: 'FRIEND', label: 'Friend' },
  { value: 'FAMILY', label: 'Family' },
  { value: 'ASSOCIATE', label: 'Associate' },
  { value: 'COLLEAGUE', label: 'Colleague' },
];

export const ACTIVITY_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: 'CALL', label: 'Call' },
  { value: 'MESSAGE', label: 'Message' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'EVENT', label: 'Event' },
  { value: 'NOTE', label: 'Note' },
];

export const LOVE_LANGUAGES: { value: string; label: string }[] = [
  { value: 'PHYSICAL_TOUCH', label: 'Physical Touch' },
  { value: 'QUALITY_TIME', label: 'Quality Time' },
  { value: 'WORDS_OF_AFFIRMATION', label: 'Words of Affirmation' },
  { value: 'GIFTS', label: 'Gifts' },
  { value: 'ACTS_OF_SERVICE', label: 'Acts of Service' },
];
