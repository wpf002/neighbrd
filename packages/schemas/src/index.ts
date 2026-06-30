import { z } from 'zod';

export const relationshipEnum = z.enum(['FRIEND', 'FAMILY', 'ASSOCIATE', 'COLLEAGUE']);
export const activityEnum = z.enum(['CALL', 'MESSAGE', 'EVENT', 'MEETING', 'NOTE']);
export const goalStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']);
export const loveLanguageEnum = z.enum([
  'PHYSICAL_TOUCH',
  'QUALITY_TIME',
  'WORDS_OF_AFFIRMATION',
  'GIFTS',
  'ACTS_OF_SERVICE',
]);

export const socialsSchema = z.object({
  linkedin: z.string().url().optional().or(z.literal('')),
  instagram: z.string().optional(),
  x: z.string().optional(),
  facebook: z.string().optional(),
  snapchat: z.string().optional(),
});

export const contactCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  relationship: relationshipEnum.default('FRIEND'),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  birthday: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  loveLanguage: loveLanguageEnum.optional(),
  notes: z.string().optional(),
  cadenceDays: z.number().int().min(1).max(365).default(30),
  socials: socialsSchema.optional(),
});
export const contactUpdateSchema = contactCreateSchema.partial();
export const contactImportSchema = z.array(contactCreateSchema).min(1).max(500);

export const activityCreateSchema = z.object({
  type: activityEnum,
  title: z.string().optional(),
  notes: z.string().optional(),
  occurredAt: z.coerce.date().optional(),
});

export const eventCreateSchema = z.object({
  title: z.string().min(1),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  contactId: z.string().optional(),
});

export const goalCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  target: z.number().int().min(1).default(1),
  current: z.number().int().min(0).default(0),
  tags: z.array(z.string()).default([]),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
});
export const goalUpdateSchema = goalCreateSchema.partial().extend({
  status: goalStatusEnum.optional(),
});

export const profileSchema = z.object({
  fullName: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  college: z.string().optional(),
  organizations: z.string().optional(),
  mailingAddress: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  x: z.string().optional(),
  facebook: z.string().optional(),
  snapchat: z.string().optional(),
  loveLanguage: loveLanguageEnum.optional(),
  isPublic: z.boolean().optional(),
  visibility: z.record(z.string(), z.boolean()).optional(),
});

export const advisorPromptSchema = z.object({
  prompt: z.string().min(1).max(1000),
});

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type Signup = z.infer<typeof signupSchema>;
export type Login = z.infer<typeof loginSchema>;
export type ContactCreate = z.infer<typeof contactCreateSchema>;
export type ActivityCreate = z.infer<typeof activityCreateSchema>;
export type EventCreate = z.infer<typeof eventCreateSchema>;
export type GoalCreate = z.infer<typeof goalCreateSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
