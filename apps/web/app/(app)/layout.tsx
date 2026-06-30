'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Nav } from '@/components/nav';
import { useAuth } from '@/lib/auth';
import { PageLoader } from '@/components/ui';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'guest') router.replace('/login');
  }, [status, router]);

  if (status !== 'authed') {
    return (
      <main className="grid min-h-screen place-items-center">
        <PageLoader />
      </main>
    );
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-[1640px] px-14 pb-24 pt-12 max-md:px-5 max-md:pt-8">{children}</main>
    </>
  );
}
