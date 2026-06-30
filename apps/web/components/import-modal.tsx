'use client';

import { useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { RelationshipType } from '@/lib/types';

interface ParsedContact {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  relationship?: RelationshipType;
  tags?: string[];
}

export function ImportModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const [rows, setRows] = useState<ParsedContact[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function reset() {
    setRows([]);
    setFileName('');
    setError('');
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setFileName(file.name);
    const text = await file.text();
    try {
      const parsed = /vcf|vcard/i.test(file.name) || text.includes('BEGIN:VCARD') ? parseVCard(text) : parseCsv(text);
      if (parsed.length === 0) setError('No contacts found in that file.');
      setRows(parsed);
    } catch {
      setError('Could not parse that file.');
      setRows([]);
    }
  }

  async function doImport() {
    if (rows.length === 0) return;
    setBusy(true);
    setError('');
    try {
      await api.post('/api/contacts/import', rows);
      onImported();
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Import Contacts"
    >
      <p className="mb-5 text-[16px] text-muted">
        Upload a <b>CSV</b> (columns like name, email, phone, company, title, tags) or a <b>vCard (.vcf)</b> export.
      </p>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-line-cool bg-[#fcfbf9] px-6 py-12 text-center transition hover:border-rust">
        <UploadCloud size={36} className="text-rust" />
        <span className="text-[16px] font-medium">Choose a file</span>
        <span className="text-[14px] text-muted-2">CSV or vCard</span>
        <input type="file" accept=".csv,.vcf,.vcard,text/csv,text/vcard" className="hidden" onChange={onFile} />
      </label>

      {fileName && (
        <div className="mt-4 flex items-center gap-2.5 text-[15px] text-muted">
          <FileText size={17} /> {fileName} — <b className="text-ink">{rows.length}</b> contact{rows.length === 1 ? '' : 's'} found
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-4 max-h-[180px] overflow-y-auto rounded-lg border border-line-cool">
          {rows.slice(0, 50).map((r, i) => (
            <div key={i} className="flex justify-between border-b border-line/60 px-4 py-2 text-[14px] last:border-b-0">
              <span className="font-medium">{[r.firstName, r.lastName].filter(Boolean).join(' ')}</span>
              <span className="text-muted-2">{r.email || r.phone || r.company || ''}</span>
            </div>
          ))}
        </div>
      )}

      {error && <div className="mt-4 rounded-lg bg-[#fbe9e7] px-4 py-3 text-[15px] text-[#c2473f]">{error}</div>}

      <div className="mt-6 flex justify-end gap-3">
        <Button
          variant="ghost"
          onClick={() => {
            reset();
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button onClick={doImport} disabled={busy || rows.length === 0}>
          {busy ? 'Importing…' : `Import ${rows.length || ''}`.trim()}
        </Button>
      </div>
    </Modal>
  );
}

// --- parsers -------------------------------------------------------------

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCsv(text: string): ParsedContact[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const headerLine = lines[0];
  if (!headerLine || lines.length < 2) return [];
  const headers = splitCsvLine(headerLine).map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
  const idx = (...names: string[]) => headers.findIndex((h) => names.includes(h));

  const map = {
    first: idx('firstname', 'first', 'givenname'),
    last: idx('lastname', 'last', 'surname', 'familyname'),
    name: idx('name', 'fullname', 'displayname'),
    email: idx('email', 'emailaddress', 'mail'),
    phone: idx('phone', 'phonenumber', 'mobile', 'tel'),
    company: idx('company', 'organization', 'org'),
    title: idx('jobtitle', 'title', 'role', 'position'),
    relationship: idx('relationship', 'type'),
    tags: idx('tags', 'tag', 'groups', 'labels'),
  };

  const rows: ParsedContact[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i] ?? '');
    const get = (n: number) => (n >= 0 ? cells[n] ?? '' : '');
    let firstName = get(map.first);
    let lastName = get(map.last);
    if (!firstName && map.name >= 0) {
      const parts = get(map.name).split(/\s+/);
      firstName = parts[0] ?? '';
      lastName = parts.slice(1).join(' ');
    }
    if (!firstName) continue;
    rows.push({
      firstName,
      lastName: lastName || undefined,
      email: get(map.email) || undefined,
      phone: get(map.phone) || undefined,
      company: get(map.company) || undefined,
      jobTitle: get(map.title) || undefined,
      relationship: normalizeRel(get(map.relationship)),
      tags: get(map.tags)
        ? get(map.tags)
            .split(/[;|]/)
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    });
  }
  return rows;
}

function parseVCard(text: string): ParsedContact[] {
  const cards = text.split(/BEGIN:VCARD/i).slice(1);
  const rows: ParsedContact[] = [];
  for (const card of cards) {
    const line = (re: RegExp) => card.match(re)?.[1]?.trim();
    const fn = line(/\nFN[^:]*:(.+)/i);
    const n = line(/\nN[^:]*:(.+)/i);
    let firstName = '';
    let lastName = '';
    if (n) {
      const [last, first] = n.split(';');
      firstName = (first ?? '').trim();
      lastName = (last ?? '').trim();
    }
    if (!firstName && fn) {
      const parts = fn.split(/\s+/);
      firstName = parts[0] ?? '';
      lastName = parts.slice(1).join(' ');
    }
    if (!firstName) continue;
    rows.push({
      firstName,
      lastName: lastName || undefined,
      email: line(/\nEMAIL[^:]*:(.+)/i),
      phone: line(/\nTEL[^:]*:(.+)/i),
      company: line(/\nORG[^:]*:(.+)/i)?.split(';')[0],
      jobTitle: line(/\nTITLE[^:]*:(.+)/i),
    });
  }
  return rows;
}

function normalizeRel(v: string): RelationshipType | undefined {
  const u = v.toUpperCase();
  if (['FRIEND', 'FAMILY', 'ASSOCIATE', 'COLLEAGUE'].includes(u)) return u as RelationshipType;
  return undefined;
}
