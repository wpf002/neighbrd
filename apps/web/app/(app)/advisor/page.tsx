'use client';

import { useRef, useState, useEffect } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

const chips = [
  'Who should I reach out to this week?',
  'Give me a weekly priority list',
  'Who from my contacts works in tech?',
  'Show me my relationship health overview',
];

interface Msg {
  role: 'user' | 'assistant';
  text: string;
}

export default function Advisor() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function send(prompt: string) {
    const text = prompt.trim();
    if (!text || busy) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setBusy(true);
    try {
      const { answer } = await api.post<{ answer: string }>('/api/advisor', { prompt: text });
      setMessages((m) => [...m, { role: 'assistant', text: answer }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: err instanceof ApiError ? `⚠️ ${err.message}` : '⚠️ Something went wrong.' },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const empty = messages.length === 0;

  return (
    <div>
      <div className="mb-6 flex items-center gap-[18px]">
        <div className="grid h-[56px] w-[56px] place-items-center rounded-[14px] bg-gradient-to-br from-[#7c6ad0] to-[#5f4fb0] text-white">
          <Sparkles size={28} />
        </div>
        <div>
          <h1 className="font-serif text-[40px] font-semibold max-md:text-[32px]">AI Relationship Advisor</h1>
          <p className="mt-1 text-[17px] text-muted">Your intelligent assistant for maintaining meaningful connections</p>
        </div>
      </div>

      <div className="flex min-h-[440px] flex-col rounded-card border border-line/70 bg-white shadow-card">
        <div ref={scrollRef} className="flex flex-1 flex-col gap-5 overflow-y-auto px-10 py-7 max-md:px-5" style={{ maxHeight: '58vh' }}>
          {empty ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 grid h-[72px] w-[72px] place-items-center rounded-full bg-[#ece9f8] text-[#6a5db1]">
                <Sparkles size={34} />
              </div>
              <h2 className="mb-2.5 font-serif text-[26px] font-semibold">Start a Conversation</h2>
              <p className="mb-7 max-w-[460px] text-[17px] text-muted">
                Ask me anything about your contacts, get recommendations, or request summaries
              </p>
              <div className="grid w-full max-w-[880px] grid-cols-2 gap-[18px] max-md:grid-cols-1">
                {chips.map((c) => (
                  <button
                    key={c}
                    onClick={() => send(c)}
                    className="rounded-[13px] border border-line-cool bg-white px-[22px] py-5 text-left text-[17px] font-medium transition hover:border-[#cdd4dd] hover:shadow-card"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-5 py-3.5 text-[16px] leading-relaxed ${
                      m.role === 'user' ? 'bg-ink text-white' : 'border border-line-cool bg-[#faf9f6] text-ink'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-line-cool bg-[#faf9f6] px-5 py-3.5 text-[16px] text-muted-2">
                    <span className="inline-flex gap-1">
                      <Dot /> <Dot /> <Dot />
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-3.5 border-t border-line p-[22px] max-md:p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your contacts, request recommendations…"
            className="flex-1 rounded-[13px] border border-line-cool px-5 py-[18px] text-[17px] outline-none focus:border-rust"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="grid w-[62px] place-items-center rounded-[13px] bg-[#ece9f8] text-[#6a5db1] transition hover:bg-[#e0dbf3] disabled:opacity-50"
          >
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-2" style={{ animationDuration: '0.9s' }} />;
}
