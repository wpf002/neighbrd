// Relationship health scoring (0..100).
// Model: recency vs cadence is the dominant signal, lightly weighted by relationship type
// and recent activity frequency. Pure function so it is trivially testable.

import type { RelationshipKind } from './types';

export interface HealthInput {
  cadenceDays: number;
  lastCheckInAt: Date | null;
  activityCountLast90d: number;
  relationship: RelationshipKind;
  now?: Date;
}

const TYPE_WEIGHT: Record<RelationshipKind, number> = {
  FAMILY: 1.1,
  FRIEND: 1.0,
  COLLEAGUE: 0.95,
  ASSOCIATE: 0.9,
};

export function relationshipHealth(input: HealthInput): number {
  const now = input.now ?? new Date();

  // 1. Recency component (0..70). Full marks if within cadence, decays after.
  let recency = 0;
  if (input.lastCheckInAt) {
    const daysSince = (now.getTime() - input.lastCheckInAt.getTime()) / 86_400_000;
    const ratio = daysSince / Math.max(input.cadenceDays, 1);
    // ratio 0 -> 70, ratio 1 (exactly due) -> ~45, ratio >=3 -> ~0
    recency = Math.max(0, 70 - ratio * 23);
  }

  // 2. Frequency component (0..30). More logged touches in 90d = healthier.
  const frequency = Math.min(30, input.activityCountLast90d * 6);

  const raw = (recency + frequency) * TYPE_WEIGHT[input.relationship];
  return Math.round(Math.max(0, Math.min(100, raw)));
}
