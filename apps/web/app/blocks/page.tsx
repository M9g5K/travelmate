'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import TopNav from '@/components/top-nav';

type BlockItem = {
  id: string;
  createdAt: string;
  blockedUser?: {
    id: string;
    nickname?: string;
    type?: string;
    country?: string;
    profileImageUrl?: string | null;
  };
};

export default function BlocksPage() {
  const [items, setItems] = useState<BlockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlocks();
  }, []);

  async function loadBlocks() {
    try {
      const res = await api.get('/blocks');
      console.log('blocks response:', res.data);

      const payload = res.data?.data ?? res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : [];

      setItems(list);
    } catch (e) {
      console.error(e);
      alert('Failed to load blocks');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center text-sm text-slate-500">
          Loading blocks...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Blocked Users</h1>
          <p className="text-sm text-slate-500">
            Users you have blocked
          </p>
        </header>

        <div className="space-y-4">
          {items.map((block) => {
            const user = block.blockedUser;

            return (
              <div
                key={block.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="profile"
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-base font-semibold text-white">
                      {user?.nickname?.slice(0, 1).toUpperCase() ?? 'U'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold text-slate-900">
                      {user?.nickname ?? 'Unknown user'}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {user?.type ?? 'User'}
                      {user?.country ? ` · ${user.country}` : ''}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Blocked at {formatDate(block.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No blocked users
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Users you block will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}