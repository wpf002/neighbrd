'use client';

import { useEffect, useState } from 'react';
import { Save, Eye, Share2, Link2, Check, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import type { Profile } from '@/lib/types';
import { LOVE_LANGUAGES } from '@/lib/format';
import { Button, Input, PageLoader } from '@/components/ui';
import { ProfileCard } from '@/components/profile-card';

type Form = Record<string, string>;

// Fields that can be toggled in Sharing Options (identity fields are always public).
const SHAREABLE: { key: string; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'company', label: 'Company' },
  { key: 'college', label: 'College / University' },
  { key: 'organizations', label: 'Organizations' },
  { key: 'mailingAddress', label: 'Mailing Address' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'x', label: 'X (Twitter)' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'snapchat', label: 'Snapchat' },
  { key: 'loveLanguage', label: 'Love Language' },
];

const SECTIONS: { label: string; fields: [string, string, string, boolean?][] }[] = [
  {
    label: 'Basic Info',
    fields: [
      ['fullName', 'Full Name', 'Your name'],
      ['bio', 'Bio', 'Short bio'],
      ['email', 'Email', 'email@example.com'],
      ['phone', 'Phone', '+1 (555) 000-0000'],
    ],
  },
  {
    label: 'Professional',
    fields: [
      ['jobTitle', 'Job Title', 'Software Engineer'],
      ['company', 'Company', 'Acme Inc.'],
    ],
  },
  {
    label: 'Education & Community',
    fields: [
      ['college', 'College / University', 'Baylor University'],
      ['organizations', 'Organizations', 'Rotary Club, YPO…'],
      ['mailingAddress', 'Mailing Address', '123 Main St, City, State ZIP', true],
    ],
  },
  {
    label: 'Social Accounts',
    fields: [
      ['linkedin', 'LinkedIn URL', 'https://linkedin.com/in/…'],
      ['instagram', 'Instagram', '@username'],
      ['x', 'X (Twitter)', '@username'],
      ['facebook', 'Facebook', 'Username or m.me link'],
      ['snapchat', 'Snapchat', 'username'],
    ],
  },
];

const EMPTY: Form = {
  fullName: '',
  bio: '',
  email: '',
  phone: '',
  jobTitle: '',
  company: '',
  college: '',
  organizations: '',
  mailingAddress: '',
  linkedin: '',
  instagram: '',
  x: '',
  facebook: '',
  snapchat: '',
  loveLanguage: '',
};

export default function ProfilePage() {
  const [form, setForm] = useState<Form | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [slug, setSlug] = useState<string | null>(null);
  const [tab, setTab] = useState<'edit' | 'share'>('edit');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get<Profile | null>('/api/profile').then((p) => {
      if (!p) {
        setForm(EMPTY);
        return;
      }
      setForm({
        ...EMPTY,
        ...Object.fromEntries(
          Object.entries(p)
            .filter(([k]) => k in EMPTY)
            .map(([k, v]) => [k, v ?? '']),
        ),
        loveLanguage: p.loveLanguage ?? '',
      } as Form);
      setIsPublic(p.isPublic ?? true);
      setVisibility(p.visibility ?? {});
      setSlug(p.shareSlug);
    });
  }, []);

  if (!form) return <PageLoader />;

  function set(k: string, v: string) {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    setSaved(false);
  }

  async function save() {
    if (!form) return;
    setBusy(true);
    const payload = {
      ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? undefined : v])),
      isPublic,
      loveLanguage: form.loveLanguage || undefined,
      visibility,
    };
    const updated = await api.put<Profile>('/api/profile', payload);
    setSlug(updated.shareSlug);
    setBusy(false);
    setSaved(true);
  }

  const shareUrl = slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${slug}` : '';

  // Preview honors the visibility toggles so it matches the public card.
  const previewProfile = Object.fromEntries(
    Object.entries(form).map(([k, v]) => [k, SHAREABLE.find((s) => s.key === k) && visibility[k] === false ? '' : v]),
  ) as unknown as Profile;

  return (
    <div>
      <div className="flex items-start justify-between max-md:flex-col max-md:gap-4">
        <div>
          <h1 className="font-serif text-[54px] font-semibold leading-none max-md:text-[40px]">My Profile</h1>
          <p className="mt-2.5 text-[19px] text-muted">Build your shareable contact card</p>
        </div>
        <Button onClick={save} disabled={busy}>
          {saved ? <Check size={17} /> : <Save size={17} />} {busy ? 'Saving…' : saved ? 'Saved' : 'Save Profile'}
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-[1.7fr_1fr] items-start gap-10 max-lg:grid-cols-1">
        <div className="rounded-card border border-line/70 bg-white p-[34px] shadow-card max-md:p-5">
          <div className="mb-2 inline-flex gap-1 rounded-xl bg-[#efece5] p-1.5">
            <button onClick={() => setTab('edit')} className={`rounded-[9px] px-[18px] py-2.5 font-semibold ${tab === 'edit' ? 'bg-white shadow-card' : 'text-muted'}`}>
              Edit Info
            </button>
            <button onClick={() => setTab('share')} className={`flex items-center gap-2 rounded-[9px] px-[18px] py-2.5 font-semibold ${tab === 'share' ? 'bg-white shadow-card' : 'text-muted'}`}>
              <Share2 size={16} /> Sharing Options
            </button>
          </div>

          {tab === 'edit' ? (
            <>
              {SECTIONS.map((s) => (
                <div key={s.label}>
                  <div className="mb-[18px] mt-[34px] eyebrow text-[13px] font-semibold text-rust">{s.label}</div>
                  <div className="grid grid-cols-2 gap-[22px] max-md:grid-cols-1">
                    {s.fields.map(([key, label, ph, full]) => (
                      <div key={key} className={full ? 'col-span-2 max-md:col-span-1' : ''}>
                        <Input label={label} placeholder={ph} value={form[key]} onChange={(e) => set(key, e.target.value)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mb-[18px] mt-[34px] eyebrow text-[13px] font-semibold text-rust">Love Languages</div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-md:grid-cols-1">
                {LOVE_LANGUAGES.map((l) => (
                  <label key={l.value} className="flex cursor-pointer items-center gap-3 text-[17px]">
                    <input type="radio" name="love" checked={form.loveLanguage === l.value} onChange={() => set('loveLanguage', l.value)} className="h-[20px] w-[20px] accent-rust" />
                    {l.label}
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-[30px]">
              <label className="flex items-center justify-between rounded-xl border border-line-cool bg-[#fcfbf9] px-5 py-4">
                <div>
                  <div className="text-[17px] font-semibold">Public profile</div>
                  <div className="text-[15px] text-muted">Anyone with your link can view the card.</div>
                </div>
                <input type="checkbox" checked={isPublic} onChange={(e) => { setIsPublic(e.target.checked); setSaved(false); }} className="h-6 w-6 accent-rust" />
              </label>

              <div className="mb-3 mt-8 eyebrow text-[13px] font-semibold text-rust">Visible fields</div>
              <p className="mb-4 text-[15px] text-muted">Name and bio are always shown. Toggle anything else.</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-md:grid-cols-1">
                {SHAREABLE.map((s) => (
                  <label key={s.key} className="flex cursor-pointer items-center gap-3 text-[16px]">
                    <input
                      type="checkbox"
                      checked={visibility[s.key] !== false}
                      onChange={(e) => {
                        setVisibility((v) => ({ ...v, [s.key]: e.target.checked }));
                        setSaved(false);
                      }}
                      className="h-5 w-5 accent-rust"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="mb-[18px] flex items-center gap-2.5 text-[17px] text-muted">
            <Eye size={19} /> Live Preview
          </div>
          <ProfileCard p={previewProfile} />

          {slug && isPublic ? (
            <div className="mt-5 rounded-card border border-line/70 bg-white p-5 shadow-card">
              <div className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-muted">
                <Link2 size={16} /> Shareable link
              </div>
              <div className="flex items-center gap-2">
                <input readOnly value={shareUrl} className="min-w-0 flex-1 truncate rounded-lg border border-line-cool bg-[#fcfbf9] px-3 py-2.5 text-[14px] text-ink" />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-white"
                  title="Copy"
                >
                  {copied ? <Check size={16} /> : <Link2 size={16} />}
                </button>
                <a href={shareUrl} target="_blank" rel="noreferrer" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-line text-muted hover:text-ink" title="Open">
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-[18px] text-center text-[16px] text-muted">
              {isPublic ? 'Save your profile to generate a shareable link' : 'Public profile is off — turn it on in Sharing Options.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
