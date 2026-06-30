'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Tag, Download, Plus, Building2, Mail, Phone, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { Contact } from '@/lib/types';
import { fullName, dueLabel, RELATIONSHIP_STYLES, RELATIONSHIP_OPTIONS, tagColor } from '@/lib/format';
import { Avatar, HealthBar, Button, PageLoader } from '@/components/ui';
import { ContactForm } from '@/components/contact-form';
import { ImportModal } from '@/components/import-modal';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [q, setQ] = useState('');
  const [rel, setRel] = useState('ALL');
  const [tag, setTag] = useState('ALL');
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  async function load() {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (rel !== 'ALL') params.set('relationship', rel);
    if (tag !== 'ALL') params.set('tag', tag);
    const data = await api.get<Contact[]>(`/api/contacts?${params.toString()}`);
    setContacts(data);
  }

  // Debounced reload on filter change.
  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, rel, tag]);

  // Tag options derived from the full set (loaded once, unfiltered).
  const [allTags, setAllTags] = useState<string[]>([]);
  useEffect(() => {
    api.get<Contact[]>('/api/contacts').then((all) => {
      setAllTags([...new Set(all.flatMap((c) => c.tags))].sort());
    });
  }, []);

  const count = contacts?.length ?? 0;
  const subtitle = useMemo(() => `${count} ${count === 1 ? 'person' : 'people'} in your network`, [count]);

  function onSaved(c: Contact) {
    setContacts((prev) => (prev ? [c, ...prev.filter((x) => x.id !== c.id)] : [c]));
    if (c.tags.some((t) => !allTags.includes(t))) {
      setAllTags((prev) => [...new Set([...prev, ...c.tags])].sort());
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between max-md:flex-col max-md:gap-4">
        <div>
          <h1 className="font-serif text-[54px] font-semibold leading-none max-md:text-[40px]">Contacts</h1>
          <p className="mt-2.5 text-[19px] text-muted">{subtitle}</p>
        </div>
        <div className="flex gap-3.5">
          <Button variant="ghost" onClick={() => setImportOpen(true)}>
            <Download size={17} /> Import
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={17} /> Add Neighbor
          </Button>
        </div>
      </div>

      <div className="mb-7 mt-8 grid grid-cols-[1fr_250px_250px] gap-[18px] max-md:grid-cols-1">
        <Field icon={<Search size={18} />}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search contacts…"
            className="w-full bg-transparent outline-none placeholder:text-muted-2"
          />
        </Field>
        <Field icon={<Filter size={18} />}>
          <select value={rel} onChange={(e) => setRel(e.target.value)} className="w-full appearance-none bg-transparent outline-none">
            <option value="ALL">All Relationships</option>
            {RELATIONSHIP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field icon={<Tag size={18} />}>
          <select value={tag} onChange={(e) => setTag(e.target.value)} className="w-full appearance-none bg-transparent outline-none">
            <option value="ALL">All Tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {contacts === null ? (
        <PageLoader />
      ) : contacts.length === 0 ? (
        <EmptyState onAdd={() => setFormOpen(true)} filtered={q.trim() !== '' || rel !== 'ALL' || tag !== 'ALL'} />
      ) : (
        <div className="grid max-w-[1180px] grid-cols-2 gap-[26px] max-md:grid-cols-1">
          {contacts.map((c) => (
            <ContactCard key={c.id} c={c} />
          ))}
        </div>
      )}

      <ContactForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={onSaved} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onImported={load} />
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[13px] border border-line-cool bg-white px-[17px] py-3.5 text-[16px] text-ink">
      <span className="text-muted-2">{icon}</span>
      <span className="flex-1">{children}</span>
    </div>
  );
}

function ContactCard({ c }: { c: Contact }) {
  const name = fullName(c);
  const role = [c.jobTitle, c.company].filter(Boolean).join(' at ');
  return (
    <Link
      href={`/contacts/${c.id}`}
      className="group flex items-start gap-[18px] rounded-card border border-line/70 bg-white px-6 pb-6 pt-6 shadow-card transition hover:border-rust/40"
    >
      <Avatar name={name} size={62} />
      <div className="min-w-0 flex-1">
        <div className="font-serif text-[24px] font-semibold">{name}</div>
        <span className={`my-2 inline-block rounded-full px-3 py-1 text-[13px] font-semibold ${RELATIONSHIP_STYLES[c.relationship]}`}>
          {c.relationship.toLowerCase()}
        </span>
        {role && <Meta icon={<Building2 size={17} />}>{role}</Meta>}
        {c.email && <Meta icon={<Mail size={17} />}>{c.email}</Meta>}
        {c.phone && <Meta icon={<Phone size={17} />}>{c.phone}</Meta>}
        {c.tags.length > 0 && (
          <div className="my-3.5 flex flex-wrap gap-x-3.5 gap-y-1.5 text-[15px] font-medium">
            {c.tags.map((t) => (
              <span key={t} style={{ color: tagColor(t) }}>
                {t}
              </span>
            ))}
          </div>
        )}
        <HealthBar value={c.relationshipHealth} />
        <div className="mt-2 text-[13px] text-muted-2">{dueLabel(c)}</div>
      </div>
      <ArrowRight size={20} className="text-muted-2 transition group-hover:translate-x-0.5 group-hover:text-rust" />
    </Link>
  );
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="my-1.5 flex items-center gap-2.5 text-[16px] text-[#404a56]">
      <span className="text-muted-2">{icon}</span>
      {children}
    </div>
  );
}

function EmptyState({ onAdd, filtered }: { onAdd: () => void; filtered: boolean }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-white/50 py-24 text-center">
      <p className="text-[19px] text-muted">
        {filtered ? 'No neighbors match your filters.' : 'No neighbors yet — start with a few you care about most.'}
      </p>
      {!filtered && (
        <div className="mt-5">
          <Button onClick={onAdd}>
            <Plus size={17} /> Add your first neighbor
          </Button>
        </div>
      )}
    </div>
  );
}
