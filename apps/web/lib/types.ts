// Shared frontend types mirroring the API responses.

export type RelationshipType = 'FRIEND' | 'FAMILY' | 'ASSOCIATE' | 'COLLEAGUE';
export type ActivityType = 'CALL' | 'MESSAGE' | 'EVENT' | 'MEETING' | 'NOTE';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type LoveLanguage =
  | 'PHYSICAL_TOUCH'
  | 'QUALITY_TIME'
  | 'WORDS_OF_AFFIRMATION'
  | 'GIFTS'
  | 'ACTS_OF_SERVICE';

export interface Socials {
  linkedin?: string;
  instagram?: string;
  x?: string;
  facebook?: string;
  snapchat?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  relationship: RelationshipType;
  jobTitle: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  tags: string[];
  loveLanguage: LoveLanguage | null;
  notes: string | null;
  cadenceDays: number;
  lastCheckInAt: string | null;
  relationshipHealth: number;
  socials: Socials | null;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  contactId: string;
  type: ActivityType;
  title: string | null;
  notes: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface ContactWithActivities extends Contact {
  activities: Activity[];
  events: EventItem[];
}

export interface EventItem {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  notes: string | null;
  contactId: string | null;
  contact?: Contact | null;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  target: number;
  current: number;
  tags: string[];
  status: GoalStatus;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  fullName: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  company: string | null;
  college: string | null;
  organizations: string | null;
  mailingAddress: string | null;
  linkedin: string | null;
  instagram: string | null;
  x: string | null;
  facebook: string | null;
  snapchat: string | null;
  loveLanguage: LoveLanguage | null;
  shareSlug: string | null;
  isPublic: boolean;
  visibility: Record<string, boolean> | null;
}

export interface DashboardData {
  stats: {
    totalContacts: number;
    checkInsThisMonth: number;
    upcomingBirthdays: number;
    networkGrowth: number;
  };
  overdue: Array<{ id: string; name: string; relationshipHealth: number; lastCheckInAt: string | null; cadenceDays: number }>;
  birthdays: Array<{ id: string; name: string; nextBirthday: string; inDays: number }>;
  recentActivity: Array<{
    id: string;
    type: ActivityType;
    title: string | null;
    occurredAt: string;
    contact: { firstName: string; lastName: string | null };
  }>;
  upcomingEvents: EventItem[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}
