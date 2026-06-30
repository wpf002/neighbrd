'use client';

import { Mail, Phone, Building2, GraduationCap, MapPin, Linkedin, Instagram, Twitter, Facebook } from 'lucide-react';
import type { Profile } from '@/lib/types';
import { LOVE_LANGUAGES } from '@/lib/format';

type Partial = Pick<
  Profile,
  | 'fullName'
  | 'bio'
  | 'email'
  | 'phone'
  | 'jobTitle'
  | 'company'
  | 'college'
  | 'organizations'
  | 'mailingAddress'
  | 'linkedin'
  | 'instagram'
  | 'x'
  | 'facebook'
  | 'snapchat'
  | 'loveLanguage'
>;

export function ProfileCard({ p }: { p: Partial }) {
  const name = p.fullName?.trim();
  const role = [p.jobTitle, p.company].filter(Boolean).join(' at ');
  const init = name
    ? name
        .split(/\s+/)
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';
  const love = LOVE_LANGUAGES.find((l) => l.value === p.loveLanguage)?.label;

  return (
    <div className="overflow-hidden rounded-[18px] bg-ink text-white shadow-card">
      <div className="flex flex-col items-center px-8 pb-8 pt-10 text-center">
        <div className="grid h-[120px] w-[120px] place-items-center rounded-full bg-gradient-to-br from-[#d98a4f] to-rust font-serif text-[44px] font-semibold">
          {init}
        </div>
        <h2 className="mt-5 font-serif text-[30px] font-semibold">{name || 'Your Name'}</h2>
        {role && <p className="mt-1 text-[16px] text-[#aeb6c0]">{role}</p>}
        {p.bio && <p className="mt-4 max-w-[340px] text-[15px] leading-relaxed text-[#c6cdd6]">{p.bio}</p>}
      </div>

      <div className="space-y-3 border-t border-white/10 px-8 py-7 text-[15px]">
        {p.email && <CardRow icon={<Mail size={17} />}>{p.email}</CardRow>}
        {p.phone && <CardRow icon={<Phone size={17} />}>{p.phone}</CardRow>}
        {(p.jobTitle || p.company) && <CardRow icon={<Building2 size={17} />}>{role}</CardRow>}
        {p.college && <CardRow icon={<GraduationCap size={17} />}>{p.college}</CardRow>}
        {p.organizations && <CardRow icon={<Building2 size={17} />}>{p.organizations}</CardRow>}
        {p.mailingAddress && <CardRow icon={<MapPin size={17} />}>{p.mailingAddress}</CardRow>}
        {love && <CardRow icon={<span className="text-[15px]">💛</span>}>{love}</CardRow>}
      </div>

      {(p.linkedin || p.instagram || p.x || p.facebook) && (
        <div className="flex justify-center gap-4 border-t border-white/10 px-8 py-6">
          {p.linkedin && <Social href={p.linkedin}><Linkedin size={20} /></Social>}
          {p.instagram && <Social href={ig(p.instagram)}><Instagram size={20} /></Social>}
          {p.x && <Social href={twitter(p.x)}><Twitter size={20} /></Social>}
          {p.facebook && <Social href={p.facebook}><Facebook size={20} /></Social>}
        </div>
      )}
    </div>
  );
}

function CardRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[#dde2e8]">
      <span className="text-[#8a94a0]">{icon}</span>
      {children}
    </div>
  );
}

function Social({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
    >
      {children}
    </a>
  );
}

function ig(v: string) {
  return v.startsWith('http') ? v : `https://instagram.com/${v.replace(/^@/, '')}`;
}
function twitter(v: string) {
  return v.startsWith('http') ? v : `https://x.com/${v.replace(/^@/, '')}`;
}
