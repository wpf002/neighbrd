'use client';

import { useState } from 'react';
import { Modal, Input, Select, Textarea, Button } from '@/components/ui';
import { RELATIONSHIP_OPTIONS, LOVE_LANGUAGES } from '@/lib/format';
import { api, ApiError } from '@/lib/api';
import type { Contact } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (c: Contact) => void;
  contact?: Contact | null;
}

export function ContactForm({ open, onClose, onSaved, contact }: Props) {
  const editing = !!contact;
  const [form, setForm] = useState(() => init(contact));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Re-seed the form whenever the modal opens for a different contact.
  const key = contact?.id ?? 'new';
  const [seenKey, setSeenKey] = useState(key);
  if (open && seenKey !== key) {
    setForm(init(contact));
    setSeenKey(key);
    setError('');
  }

  function set<K extends keyof ReturnType<typeof init>>(k: K, v: ReturnType<typeof init>[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim() || undefined,
      relationship: form.relationship,
      jobTitle: form.jobTitle.trim() || undefined,
      company: form.company.trim() || undefined,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      birthday: form.birthday ? new Date(form.birthday).toISOString() : undefined,
      cadenceDays: Number(form.cadenceDays) || 30,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      loveLanguage: form.loveLanguage || undefined,
      notes: form.notes.trim() || undefined,
      socials: {
        linkedin: form.linkedin.trim() || undefined,
        instagram: form.instagram.trim() || undefined,
        x: form.x.trim() || undefined,
        facebook: form.facebook.trim() || undefined,
        snapchat: form.snapchat.trim() || undefined,
      },
    };
    try {
      const saved = editing
        ? await api.patch<Contact>(`/api/contacts/${contact!.id}`, payload)
        : await api.post<Contact>('/api/contacts', payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save contact');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Neighbor' : 'Add Neighbor'} wide>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <Input label="First Name" required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
          <Input label="Last Name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
          <Select label="Relationship" value={form.relationship} onChange={(e) => set('relationship', e.target.value as Contact['relationship'])}>
            {RELATIONSHIP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Input
            label="Check-in cadence (days)"
            type="number"
            min={1}
            max={365}
            value={form.cadenceDays}
            onChange={(e) => set('cadenceDays', e.target.value)}
          />
          <Input label="Job Title" value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} />
          <Input label="Company" value={form.company} onChange={(e) => set('company', e.target.value)} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <Input label="Birthday" type="date" value={form.birthday} onChange={(e) => set('birthday', e.target.value)} />
          <Select label="Love Language" value={form.loveLanguage} onChange={(e) => set('loveLanguage', e.target.value)}>
            <option value="">—</option>
            {LOVE_LANGUAGES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <Input label="Tags (comma separated)" placeholder="Church Name, Baylor University" value={form.tags} onChange={(e) => set('tags', e.target.value)} />
        <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
          <Input label="LinkedIn" value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} />
          <Input label="Instagram" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} />
          <Input label="X (Twitter)" value={form.x} onChange={(e) => set('x', e.target.value)} />
          <Input label="Facebook" value={form.facebook} onChange={(e) => set('facebook', e.target.value)} />
        </div>
        <Textarea label="Things to remember" rows={3} placeholder="What do you want to remember about them?" value={form.notes} onChange={(e) => set('notes', e.target.value)} />

        {error && <div className="rounded-lg bg-[#fbe9e7] px-4 py-3 text-[15px] text-[#c2473f]">{error}</div>}
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Neighbor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function init(c?: Contact | null) {
  return {
    firstName: c?.firstName ?? '',
    lastName: c?.lastName ?? '',
    relationship: (c?.relationship ?? 'FRIEND') as Contact['relationship'],
    jobTitle: c?.jobTitle ?? '',
    company: c?.company ?? '',
    email: c?.email ?? '',
    phone: c?.phone ?? '',
    birthday: c?.birthday ? c.birthday.slice(0, 10) : '',
    cadenceDays: String(c?.cadenceDays ?? 30),
    tags: (c?.tags ?? []).join(', '),
    loveLanguage: (c?.loveLanguage ?? '') as string,
    notes: c?.notes ?? '',
    linkedin: c?.socials?.linkedin ?? '',
    instagram: c?.socials?.instagram ?? '',
    x: c?.socials?.x ?? '',
    facebook: c?.socials?.facebook ?? '',
    snapchat: c?.socials?.snapchat ?? '',
  };
}
