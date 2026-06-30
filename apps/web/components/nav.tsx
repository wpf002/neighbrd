'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, Calendar, Target, Sparkles, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const items = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/advisor', label: 'AI Advisor', icon: Sparkles },
  { href: '/profile', label: 'My Profile', icon: UserCircle },
];

export function Nav() {
  const path = usePathname();
  const { logout } = useAuth();
  return (
    <nav className="sticky top-0 z-20 flex items-center gap-2 bg-ink px-7 py-3.5 text-white max-md:px-4">
      <div className="mr-5 flex items-center gap-3">
        <div className="relative grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-white font-serif text-xl font-bold text-ink">
          N<span className="absolute right-[5px] top-[5px] h-2 w-2 rounded-full bg-rust" />
        </div>
        <b className="font-serif text-[22px] font-semibold max-md:hidden">Neighbrd</b>
      </div>
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 whitespace-nowrap rounded-[11px] px-[18px] py-[11px] text-[16px] font-medium transition max-lg:px-3 ${
                active ? 'bg-rust text-white' : 'text-[#aeb6c0] hover:text-[#e7eaee]'
              }`}
            >
              <Icon size={19} /> <span className="max-lg:hidden">{label}</span>
            </Link>
          );
        })}
      </div>
      <button
        onClick={logout}
        title="Log out"
        className="ml-2 grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[11px] text-[#aeb6c0] transition hover:bg-white/10 hover:text-white"
      >
        <LogOut size={19} />
      </button>
    </nav>
  );
}
