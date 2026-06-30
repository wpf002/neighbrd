import Anthropic from '@anthropic-ai/sdk';
import { buildContextBlock, type AdvisorContact } from './context';

// Flint adapter. Phase 1 targets Anthropic directly (pinned model). When the shared
// @flint/core layer is wired in, swap `client.messages.create` for the Flint call and
// keep this module's signature identical.

const SYSTEM = `You are the relationship advisor inside Neighbrd, a personal CRM.
You help the user nurture their real-world relationships. You ONLY use the contact
snapshot provided. Be specific and actionable: name people, say why, suggest the next
move. Never invent contacts or facts not in the snapshot. Keep answers tight.`;

export interface AdvisorDeps {
  apiKey: string;
  model?: string;
}

export function createAdvisor({ apiKey, model = process.env.FLINT_MODEL ?? 'claude-sonnet-4-6' }: AdvisorDeps) {
  const client = new Anthropic({ apiKey });

  return async function ask(prompt: string, contacts: AdvisorContact[]): Promise<string> {
    const context = buildContextBlock(contacts);
    const res = await client.messages.create({
      model,
      max_tokens: 1024,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Contact snapshot:\n${context}\n\nRequest: ${prompt}`,
        },
      ],
    });
    return res.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
  };
}

// The four dashboard suggestion chips map to canned prompts:
export const SUGGESTED_PROMPTS = {
  reachOut: 'Who should I reach out to this week?',
  priorityList: 'Give me a weekly priority list.',
  worksInTech: 'Who from my contacts works in tech?',
  healthOverview: 'Show me my relationship health overview.',
} as const;
