'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Cake,
  Pencil,
  Trash2,
  Plus,
  Linkedin,
  Instagram,
  Clock,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ContactWithActivities, Contact } from '@/lib/types';
import {
  fullName,
  fmtDate,
  fmtDateShort,
  dueLabel,
  RELATIONSHIP_STYLES,
  ACTIVITY_STYLES,
  ACTIVITY_OPTIONS,
  tagColor,
} from '@/lib/format';
import { Avatar, HealthBar, Button, Modal, Input, Select, Textarea, PageLoader } from '@/components/ui';
import { ContactForm } from '@/components/contact-form';

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<ContactWithActivities | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  async function load() {
    try {
      const data = await api.get<ContactWithActivities>(`/api/contacts/${id}`);
      setContact(data);
    } catch {
      setNotFound(true);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onDelete() {
    if (!confirm('Delete this contact? This cannot be undone.')) return;
    await api.del(`/api/contacts/${id}`);
    router.push('/contacts');
  }

  if (notFound)
    return (
      <div className="py-24 text-center">
        <p className="text-[19px] text-muted">Contact not found.</p>
        <Link href="/contacts" className="mt-4 inline-block font-semibold text-rust hover:underline">
          ← Back to contacts
        </Link>
      </div>
    );

  if (!contact) return <PageLoader />;

  const name = fullName(contact);
  const role = [contact.jobTitle, contact.company].filter(Boolean).join(' at ');

  return (
    <div className="max-w-[1320px]">
      <Link href="/contacts" className="mb-7 inline-flex items-center gap-2 text-[16px] font-medium text-muted hover:text-ink">
        <ArrowLeft size={18} /> Back to Contacts
      </Link>

      <div className="grid grid-cols-[1.4fr_1fr] items-stretch gap-7 max-lg:grid-cols-1">
        {/* Left: identity + activity */}
        <div className="space-y-7">
          <section className="rounded-card border border-line/70 bg-white p-8 shadow-card">
            <div className="flex items-start gap-5">
              <Avatar name={name} size={84} />
              <div className="flex-1">
                <h1 className="font-serif text-[38px] font-semibold leading-tight">{name}</h1>
                <span className={`mt-1.5 inline-block rounded-full px-3 py-1 text-[13px] font-semibold ${RELATIONSHIP_STYLES[contact.relationship]}`}>
                  {contact.relationship.toLowerCase()}
                </span>
              </div>
              <div className="flex gap-2.5 text-muted-2">
                <button onClick={() => setEditOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-[#f1ede5] hover:text-ink" title="Edit">
                  <Pencil size={19} />
                </button>
                <button onClick={onDelete} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-[#fbe9e7] hover:text-[#c2473f]" title="Delete">
                  <Trash2 size={19} />
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-2.5">
              {role && <Meta icon={<Building2 size={18} />}>{role}</Meta>}
              {contact.email && <Meta icon={<Mail size={18} />}>{contact.email}</Meta>}
              {contact.phone && <Meta icon={<Phone size={18} />}>{contact.phone}</Meta>}
              {contact.birthday && <Meta icon={<Cake size={18} />}>{fmtDate(contact.birthday)}</Meta>}
              {contact.socials?.linkedin && <Meta icon={<Linkedin size={18} />}>{contact.socials.linkedin}</Meta>}
              {contact.socials?.instagram && <Meta icon={<Instagram size={18} />}>{contact.socials.instagram}</Meta>}
            </div>

            {contact.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {contact.tags.map((t) => (
                  <span key={t} className="rounded-full px-3 py-1 text-[14px] font-medium" style={{ color: tagColor(t), background: `${tagColor(t)}1a` }}>
                    {t}
                  </span>
                ))}
              </div>
            )}

            {contact.notes && <p className="mt-5 border-t border-line pt-5 text-[16px] leading-relaxed text-[#404a56]">{contact.notes}</p>}
          </section>

          <section className="rounded-card border border-line/70 bg-white p-8 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-3 font-serif text-[25px] font-semibold">
                <Clock size={22} className="text-muted" /> Activity
              </h3>
              <Button onClick={() => setLogOpen(true)}>
                <Plus size={17} /> Log Check-in
              </Button>
            </div>
            <div className="mt-6">
              {contact.activities.length === 0 ? (
                <p className="py-12 text-center text-[17px] text-muted-2">No activity yet. Log your first check-in.</p>
              ) : (
                contact.activities.map((a) => (
                  <div key={a.id} className="flex items-start gap-4 border-t border-line py-4 first:border-t-0">
                    <span className={`mt-0.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${ACTIVITY_STYLES[a.type]}`}>
                      {a.type.toLowerCase()}
                    </span>
                    <div className="flex-1">
                      <div className="text-[17px] font-medium">{a.title || ACTIVITY_OPTIONS.find((o) => o.value === a.type)?.label}</div>
                      {a.notes && <div className="text-[15px] text-muted">{a.notes}</div>}
                    </div>
                    <div className="text-[14px] text-muted-2">{fmtDateShort(a.occurredAt)}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right: health + cadence — stretches to match the left column's height */}
        <section className="flex flex-col rounded-card border border-line/70 bg-white p-8 shadow-card">
          <h3 className="font-serif text-[22px] font-semibold">Relationship Health</h3>
          <div className="my-auto py-6">
            <div className="font-serif text-[46px] font-semibold">
              {contact.relationshipHealth}
              <span className="text-[24px] text-muted-2">/100</span>
            </div>
            <div className="mt-4">
              <HealthBar value={contact.relationshipHealth} />
            </div>
          </div>
          <dl className="space-y-3.5 border-t border-line pt-6 text-[16px]">
            <Row label="Check-in cadence">Every {contact.cadenceDays} days</Row>
            <Row label="Last check-in">{contact.lastCheckInAt ? fmtDate(contact.lastCheckInAt) : 'Never'}</Row>
            <Row label="Status">{dueLabel(contact)}</Row>
          </dl>
        </section>
      </div>

      <ContactForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        contact={contact}
        onSaved={(c: Contact) => setContact((prev) => (prev ? { ...prev, ...c } : prev))}
      />
      <LogActivityModal open={logOpen} onClose={() => setLogOpen(false)} contactId={contact.id} onLogged={load} />
    </div>
  );
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[16px] text-[#404a56]">
      <span className="text-muted-2">{icon}</span>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}

function LogActivityModal({
  open,
  onClose,
  contactId,
  onLogged,
}: {
  open: boolean;
  onClose: () => void;
  contactId: string;
  onLogged: () => void;
}) {
  const [type, setType] = useState('CALL');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await api.post(`/api/contacts/${contactId}/activities`, {
      type,
      title: title.trim() || undefined,
      notes: notes.trim() || undefined,
      occurredAt: new Date(occurredAt).toISOString(),
    });
    setBusy(false);
    setTitle('');
    setNotes('');
    onLogged();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Check-in">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            {ACTIVITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Input label="Date" type="date" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
        </div>
        <Input label="Title" placeholder="Quick call" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea label="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Logging…' : 'Log Check-in'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
