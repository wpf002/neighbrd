'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, MessageSquare, Calendar, TrendingUp, Cake, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { DashboardData } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { fmtDate, fmtDateShort, dueLabel, ACTIVITY_STYLES, ACTIVITY_OPTIONS } from '@/lib/format';
import { Avatar, PageLoader } from '@/components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>('/api/dashboard').then(setData);
  }, []);

  if (!data) return <PageLoader />;

  const firstName = user?.name?.split(' ')[0] ?? 'neighbor';
  const stats = [
    { label: 'Total Contacts', value: String(data.stats.totalContacts), cap: 'People in your circle', icon: Users, tint: 'bg-[#f3f2ef]', ic: 'bg-[#e7e9ec] text-[#5a6573]' },
    { label: 'This Month', value: String(data.stats.checkInsThisMonth), cap: 'Check-ins this month', icon: MessageSquare, tint: 'bg-[#fbf4ee]', ic: 'bg-[#f6e0cf] text-[#bd744a]' },
    { label: 'Coming Up', value: String(data.stats.upcomingBirthdays), cap: 'Birthdays next 30 days', icon: Calendar, tint: 'bg-[#fbf7ee]', ic: 'bg-[#f3e6c8] text-[#b48a3c]' },
    { label: 'Network Growth', value: `+${data.stats.networkGrowth}`, cap: 'New contacts this month', icon: TrendingUp, tint: 'bg-[#f1f6f1]', ic: 'bg-[#dcecdd] text-[#4f9a5c]' },
  ];

  return (
    <div>
      <h1 className="font-serif text-[54px] font-semibold leading-none max-md:text-[40px]">Howdy, {firstName}.</h1>
      <p className="mt-2.5 text-[19px] text-muted">Stay close to the people who matter.</p>

      <div className="mt-9 grid grid-cols-4 gap-6 max-xl:grid-cols-2 max-md:grid-cols-1">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-card border border-line/70 ${s.tint} px-6 pb-5 pt-6 shadow-card`}>
            <div className="flex items-start justify-between">
              <span className="eyebrow text-[12px] font-medium text-muted">{s.label}</span>
              <span className={`grid h-12 w-12 place-items-center rounded-[13px] ${s.ic}`}>
                <s.icon size={22} />
              </span>
            </div>
            <div className="my-1.5 font-serif text-[46px] font-semibold">{s.value}</div>
            <div className="text-[15px] text-muted-2">{s.cap}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        <Panel title="Upcoming Birthdays" icon={<Cake size={22} className="text-rust-soft" />}>
          {data.birthdays.length === 0 ? (
            <Empty>No birthdays in the next 30 days</Empty>
          ) : (
            data.birthdays.map((b) => (
              <Link href={`/contacts/${b.id}`} key={b.id} className="flex items-center gap-4 border-t border-line py-4 first:border-t-0">
                <Avatar name={b.name} size={48} />
                <div>
                  <div className="text-[18px] font-semibold">{b.name}</div>
                  <div className="text-[14px] text-muted">
                    {fmtDateShort(b.nextBirthday)} · {b.inDays === 0 ? 'Today!' : `in ${b.inDays} day${b.inDays === 1 ? '' : 's'}`}
                  </div>
                </div>
              </Link>
            ))
          )}
        </Panel>

        <Panel title="Time to reach out" icon={<AlertCircle size={22} className="text-rust" />}>
          {data.overdue.length === 0 ? (
            <Empty>You&apos;re all caught up — nicely done.</Empty>
          ) : (
            data.overdue.map((c) => (
              <Link href={`/contacts/${c.id}`} key={c.id} className="group flex items-center gap-4 border-t border-line py-4 first:border-t-0">
                <Avatar name={c.name} size={48} />
                <div>
                  <div className="text-[18px] font-semibold">{c.name}</div>
                  <div className="text-[14px] text-muted">{dueLabel(c)}</div>
                </div>
                <ArrowRight size={18} className="ml-auto text-muted-2 transition group-hover:translate-x-0.5 group-hover:text-rust" />
              </Link>
            ))
          )}
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        <Panel title="Upcoming Events" icon={<Calendar size={22} className="text-[#5b6ad0]" />} action={<Link href="/calendar">View All</Link>}>
          {data.upcomingEvents.length === 0 ? (
            <Empty>No upcoming events</Empty>
          ) : (
            data.upcomingEvents.map((e) => (
              <div key={e.id} className="border-t border-line py-4 first:border-t-0">
                <div className="text-[18px] font-semibold">{e.title}</div>
                <div className="text-[14px] text-muted">
                  {fmtDate(e.startsAt)}
                  {e.contact ? ` · ${e.contact.firstName} ${e.contact.lastName ?? ''}`.trimEnd() : ''}
                </div>
              </div>
            ))
          )}
        </Panel>

        <Panel title="Recent Activity" icon={<Clock size={22} className="text-[#5a6573]" />}>
          {data.recentActivity.length === 0 ? (
            <Empty>No activity yet</Empty>
          ) : (
            data.recentActivity.map((a) => {
              const name = `${a.contact.firstName} ${a.contact.lastName ?? ''}`.trim();
              return (
                <div key={a.id} className="border-t border-line py-4 first:border-t-0">
                  <div className="text-[18px] font-semibold">
                    {name}{' '}
                    <span className={`ml-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${ACTIVITY_STYLES[a.type]}`}>{a.type.toLowerCase()}</span>
                  </div>
                  <div className="text-[14px] text-muted">{a.title || ACTIVITY_OPTIONS.find((o) => o.value === a.type)?.label}</div>
                  <div className="text-[14px] text-muted-2">{fmtDate(a.occurredAt)}</div>
                </div>
              );
            })
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line/70 bg-white px-[30px] py-7 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-3 font-serif text-[25px] font-semibold">
          {icon}
          {title}
        </h3>
        {action && <span className="cursor-pointer text-[15px] font-medium text-muted hover:text-ink">{action}</span>}
      </div>
      <div className="mt-[18px] border-t border-line">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="py-16 text-center text-[17px] text-muted-2">{children}</div>;
}
