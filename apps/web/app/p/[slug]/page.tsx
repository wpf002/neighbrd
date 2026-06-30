'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Profile } from '@/lib/types';
import { api, ApiError } from '@/lib/api';
import { ProfileCard } from '@/components/profile-card';
import { PageLoader } from '@/components/ui';

export default function PublicProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<Profile>(`/api/profile/public/${slug}`)
      .then(setProfile)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Profile not found'));
  }, [slug]);

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="relative grid h-[40px] w-[40px] place-items-center rounded-[10px] bg-ink font-serif text-lg font-bold text-white">
            N<span className="absolute right-[5px] top-[5px] h-1.5 w-1.5 rounded-full bg-rust" />
          </div>
          <b className="font-serif text-[22px] font-semibold">Neighbrd</b>
        </div>

        {error ? (
          <div className="rounded-card border border-line/70 bg-white p-10 text-center shadow-card">
            <p className="text-[19px] text-muted">{error}</p>
            <p className="mt-2 text-[15px] text-muted-2">This card may be private or the link is incorrect.</p>
          </div>
        ) : !profile ? (
          <PageLoader />
        ) : (
          <>
            <ProfileCard p={profile} />
            <p className="mt-6 text-center text-[14px] text-muted-2">
              Powered by <span className="font-semibold text-muted">Neighbrd</span> — stay close to the people who matter.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
