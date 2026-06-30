'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Pencil, Trash2, Plus, Check } from 'lucide-react';
import { api } from '@/lib/api';
import type { Goal } from '@/lib/types';
import { fmtDate } from '@/lib/format';
import { Button, Modal, Input, Textarea, PageLoader } from '@/components/ui';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  async function load() {
    setGoals(await api.get<Goal[]>('/api/goals'));
  }
  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, body: Partial<Goal>) {
    const updated = await api.patch<Goal>(`/api/goals/${id}`, body);
    setGoals((prev) => (prev ? prev.map((g) => (g.id === updated.id ? updated : g)) : prev));
  }

  async function remove(id: string) {
    if (!confirm('Delete this goal?')) return;
    await api.del(`/api/goals/${id}`);
    setGoals((prev) => (prev ? prev.filter((g) => g.id !== id) : prev));
  }

  const active = goals?.filter((g) => g.status === 'ACTIVE') ?? [];
  const done = goals?.filter((g) => g.status !== 'ACTIVE') ?? [];

  return (
    <div>
      <div className="flex items-start justify-between max-md:flex-col max-md:gap-4">
        <div>
          <h1 className="font-serif text-[54px] font-semibold leading-none max-md:text-[40px]">Goals</h1>
          <p className="mt-2.5 text-[19px] text-muted">Track your networking and business objectives</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={17} /> Add Goal
        </Button>
      </div>

      {goals === null ? (
        <PageLoader />
      ) : goals.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-line bg-white/50 py-24 text-center">
          <p className="text-[19px] text-muted">No goals yet. Set your first one.</p>
        </div>
      ) : (
        <>
          <h2 className="mb-6 mt-9 font-serif text-[30px] font-semibold">Active Goals</h2>
          {active.length === 0 ? (
            <p className="text-[17px] text-muted-2">No active goals.</p>
          ) : (
            <div className="grid grid-cols-2 gap-7 max-lg:grid-cols-1">
              {active.map((g) => (
                <GoalCard
                  key={g.id}
                  g={g}
                  onIncrement={() => patch(g.id, { current: Math.min(g.target, g.current + 1) })}
                  onComplete={() => patch(g.id, { status: 'COMPLETED' })}
                  onEdit={() => {
                    setEditing(g);
                    setFormOpen(true);
                  }}
                  onDelete={() => remove(g.id)}
                />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <>
              <h2 className="mb-6 mt-12 font-serif text-[30px] font-semibold">Completed</h2>
              <div className="grid grid-cols-2 gap-7 max-lg:grid-cols-1">
                {done.map((g) => (
                  <GoalCard key={g.id} g={g} onEdit={() => { setEditing(g); setFormOpen(true); }} onDelete={() => remove(g.id)} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <GoalForm open={formOpen} onClose={() => setFormOpen(false)} goal={editing} onSaved={load} />
    </div>
  );
}

function GoalCard({
  g,
  onIncrement,
  onComplete,
  onEdit,
  onDelete,
}: {
  g: Goal;
  onIncrement?: () => void;
  onComplete?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
  const completed = g.status !== 'ACTIVE';
  return (
    <div className="rounded-card border border-line/70 bg-white p-[26px] shadow-card">
      <div className="flex items-start justify-between">
        <div className={`grid h-[46px] w-[46px] place-items-center rounded-xl ${completed ? 'bg-sage/20 text-sage' : 'bg-sage/15 text-sage'}`}>
          {completed ? <Check size={22} /> : <TrendingUp size={22} />}
        </div>
        <div className="flex gap-3.5 text-muted-2">
          <button onClick={onEdit} className="hover:text-ink" title="Edit">
            <Pencil size={19} />
          </button>
          <button onClick={onDelete} className="hover:text-[#c2473f]" title="Delete">
            <Trash2 size={19} />
          </button>
        </div>
      </div>
      <h4 className="mb-1.5 mt-5 font-serif text-[26px] font-semibold">{g.title}</h4>
      {g.description && <div className="mb-5 text-[16px] text-muted">{g.description}</div>}

      <div className="flex justify-between text-[18px] font-medium text-[#3a4450]">
        <span>Progress</span>
        <span>
          <b className="font-bold text-ink">{g.current}</b> / {g.target}
        </span>
      </div>
      <div className="my-3 h-[9px] overflow-hidden rounded-full bg-[#e7e1d2]">
        <i className="block h-full bg-sage transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-[15px] text-muted-2">{pct}% complete</div>

      {g.tags.length > 0 && (
        <div className="my-5 flex flex-wrap gap-3">
          {g.tags.map((t) => (
            <span key={t} className="rounded-full border border-line px-4 py-1.5 text-[14px] font-semibold text-[#3a4450]">
              {t}
            </span>
          ))}
        </div>
      )}

      {(g.startsAt || g.endsAt) && (
        <div className="border-t border-line pt-[18px] text-[15px] leading-7 text-muted">
          {g.startsAt && (
            <>
              Start: {fmtDate(g.startsAt)}
              <br />
            </>
          )}
          {g.endsAt && <>End: {fmtDate(g.endsAt)}</>}
        </div>
      )}

      {!completed && onIncrement && (
        <div className="mt-5 flex gap-3">
          <button onClick={onIncrement} disabled={g.current >= g.target} className="flex-1 rounded-xl border border-line bg-[#f4f1ea] py-3.5 text-center font-semibold transition hover:bg-[#ece6da] disabled:opacity-50">
            Update Progress
          </button>
          <button onClick={onComplete} className="grid w-[54px] place-items-center rounded-xl bg-sage text-white transition hover:opacity-90" title="Mark complete">
            <Check size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

function GoalForm({ open, onClose, goal, onSaved }: { open: boolean; onClose: () => void; goal: Goal | null; onSaved: () => void }) {
  const editing = !!goal;
  const [form, setForm] = useState(() => init(goal));
  const [busy, setBusy] = useState(false);

  const key = goal?.id ?? 'new';
  const [seen, setSeen] = useState(key);
  if (open && seen !== key) {
    setForm(init(goal));
    setSeen(key);
  }

  function set<K extends keyof ReturnType<typeof init>>(k: K, v: ReturnType<typeof init>[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      target: Number(form.target) || 1,
      current: Number(form.current) || 0,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
    };
    if (editing) await api.patch(`/api/goals/${goal!.id}`, payload);
    else await api.post('/api/goals', payload);
    setBusy(false);
    onSaved();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Goal' : 'Add Goal'}>
      <form onSubmit={submit} className="space-y-5">
        <Input label="Title" required placeholder="Work Referrals" value={form.title} onChange={(e) => set('title', e.target.value)} />
        <Textarea label="Description" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
        <div className="grid grid-cols-2 gap-5">
          <Input label="Current" type="number" min={0} value={form.current} onChange={(e) => set('current', e.target.value)} />
          <Input label="Target" type="number" min={1} value={form.target} onChange={(e) => set('target', e.target.value)} />
        </div>
        <Input label="Tags (comma separated)" placeholder="Referrals, Quarterly" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
        <div className="grid grid-cols-2 gap-5">
          <Input label="Start date" type="date" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
          <Input label="End date" type="date" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function init(g: Goal | null) {
  return {
    title: g?.title ?? '',
    description: g?.description ?? '',
    target: String(g?.target ?? 5),
    current: String(g?.current ?? 0),
    tags: (g?.tags ?? []).join(', '),
    startsAt: g?.startsAt ? g.startsAt.slice(0, 10) : '',
    endsAt: g?.endsAt ? g.endsAt.slice(0, 10) : '',
  };
}
