'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Cake } from 'lucide-react';
import { api } from '@/lib/api';
import type { EventItem, Contact } from '@/lib/types';
import { fullName } from '@/lib/format';
import { Button, Modal, Input, Select, Textarea, PageLoader } from '@/components/ui';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface DayMarker {
  kind: 'event' | 'birthday';
  label: string;
  id: string;
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState<string>('');

  async function load() {
    const [ev, cs] = await Promise.all([api.get<EventItem[]>('/api/events'), api.get<Contact[]>('/api/contacts')]);
    setEvents(ev);
    setContacts(cs);
  }
  useEffect(() => {
    load();
  }, []);

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map day-of-month -> markers (events + birthdays) for the displayed month.
  const markers = useMemo(() => {
    const m = new Map<number, DayMarker[]>();
    const push = (day: number, marker: DayMarker) => {
      const arr = m.get(day) ?? [];
      arr.push(marker);
      m.set(day, arr);
    };
    (events ?? []).forEach((e) => {
      const d = new Date(e.startsAt);
      if (d.getFullYear() === year && d.getMonth() === month) push(d.getDate(), { kind: 'event', label: e.title, id: e.id });
    });
    contacts.forEach((c) => {
      if (!c.birthday) return;
      const b = new Date(c.birthday);
      if (b.getMonth() === month) push(b.getDate(), { kind: 'birthday', label: `${fullName(c)}'s birthday`, id: `b-${c.id}` });
    });
    return m;
  }, [events, contacts, year, month]);

  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  function go(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setMonth(m);
    setYear(y);
  }

  function openAdd(day?: number) {
    const d = day ?? today.getDate();
    setAddDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    setAddOpen(true);
  }

  return (
    <div>
      <div className="flex items-start justify-between max-md:flex-col max-md:gap-4">
        <h1 className="font-serif text-[54px] font-semibold leading-none max-md:text-[40px]">Calendar</h1>
        <Button onClick={() => openAdd()}>
          <Plus size={17} /> Add Event
        </Button>
      </div>

      {events === null ? (
        <PageLoader />
      ) : (
        <div className="mt-6 rounded-card border border-line/70 bg-white p-5 shadow-card max-md:p-4">
          <div className="relative flex items-center justify-center gap-[18px] pb-4 pt-1">
            <button onClick={() => go(-1)} className="absolute left-0 grid h-[46px] w-[46px] place-items-center rounded-[11px] border border-line-cool bg-white text-[#3a4450] hover:bg-[#f4f1ea]">
              <ChevronLeft size={20} />
            </button>
            <span className="font-serif text-[26px] font-semibold">
              {MONTHS[month]} {year}
            </span>
            <button onClick={() => go(1)} className="absolute right-0 grid h-[46px] w-[46px] place-items-center rounded-[11px] border border-line-cool bg-white text-[#3a4450] hover:bg-[#f4f1ea]">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 px-1 pb-2 text-[15px] text-muted max-md:gap-1 max-md:text-[13px]">
            {DOW.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 max-md:gap-1">
            {cells.map((d, i) =>
              d === null ? (
                <div key={i} className="min-h-[88px] rounded-[11px] bg-[#f4f5f6] max-md:min-h-[52px]" />
              ) : (
                <button
                  key={i}
                  onClick={() => openAdd(d)}
                  className={`flex min-h-[88px] flex-col gap-1 overflow-hidden rounded-[11px] border p-2.5 text-left text-[16px] font-semibold transition hover:border-rust max-md:min-h-[52px] max-md:p-1.5 max-md:text-[13px] ${
                    isToday(d) ? 'border-ink bg-ink text-white' : 'border-line-cool text-[#2a3440]'
                  }`}
                >
                  <span>{d}</span>
                  <span className="flex flex-col gap-0.5 overflow-hidden">
                    {(markers.get(d) ?? []).slice(0, 2).map((mk) => (
                      <span
                        key={mk.id}
                        className={`truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${
                          mk.kind === 'birthday' ? 'bg-[#fbe6ef] text-[#bb3f7d]' : 'bg-[#e6eefb] text-[#3f63bb]'
                        }`}
                      >
                        {mk.kind === 'birthday' && <Cake size={10} className="mr-0.5 inline" />}
                        {mk.label}
                      </span>
                    ))}
                    {(markers.get(d)?.length ?? 0) > 2 && <span className="px-1 text-[11px] text-muted-2">+{markers.get(d)!.length - 2} more</span>}
                  </span>
                </button>
              ),
            )}
          </div>
        </div>
      )}

      <AddEventModal open={addOpen} onClose={() => setAddOpen(false)} defaultDate={addDate} contacts={contacts} onSaved={load} />
    </div>
  );
}

function AddEventModal({
  open,
  onClose,
  defaultDate,
  contacts,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: string;
  contacts: Contact[];
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [location, setLocation] = useState('');
  const [contactId, setContactId] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  // Sync the date field when opened for a specific day.
  const [seen, setSeen] = useState(defaultDate);
  if (open && seen !== defaultDate) {
    setDate(defaultDate);
    setSeen(defaultDate);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await api.post('/api/events', {
      title: title.trim(),
      startsAt: new Date(date).toISOString(),
      location: location.trim() || undefined,
      contactId: contactId || undefined,
      notes: notes.trim() || undefined,
    });
    setBusy(false);
    setTitle('');
    setLocation('');
    setContactId('');
    setNotes('');
    onSaved();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Event">
      <form onSubmit={submit} className="space-y-5">
        <Input label="Title" required placeholder="Coffee with…" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="grid grid-cols-2 gap-5">
          <Input label="Date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <Select label="Linked contact (optional)" value={contactId} onChange={(e) => setContactId(e.target.value)}>
          <option value="">—</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {fullName(c)}
            </option>
          ))}
        </Select>
        <Textarea label="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Add Event'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
