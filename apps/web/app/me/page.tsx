'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import TopNav from '@/components/top-nav';

type Me = {
  id: string;
  email: string;
  nickname?: string;
  type?: string;
  languages?: string[];
};

export default function MePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMe();
  }, []);

  async function loadMe() {
    try {
      const res = await api.get('/me');
      setMe(res.data?.data ?? null);
    } catch (e) {
      console.error(e);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center text-sm text-slate-500">
          Loading profile...
        </div>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center text-sm text-slate-500">
          Failed to load profile.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-500">
            Your account information
          </p>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white">
              {me.nickname?.slice(0, 1).toUpperCase() ?? 'U'}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {me.nickname ?? 'Unknown user'}
              </h2>
              <p className="text-sm text-slate-500">{me.email}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Account Type
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {me.type ?? 'Unknown'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Languages
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(me.languages ?? []).length > 0 ? (
                  me.languages!.map((lang) => (
                    <span
                      key={lang}
                      className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                    >
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No languages set</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              User ID
            </p>
            <p className="mt-2 break-all text-sm text-slate-700">{me.id}</p>
          </div>
        </div>
      </div>
    </main>
  );
}