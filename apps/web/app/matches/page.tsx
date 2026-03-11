'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/top-nav';

type MatchItem = {
  id: string;
  status?: string;
  request?: {
    id: string;
    city?: string;
    tags?: string[];
    description?: string;
  };
  counterpart?: {
    id: string;
    nickname?: string;
    type?: string;
  };
  chatId?: string | null;
};

export default function MatchesPage() {
  const router = useRouter();
  const [items, setItems] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const res = await api.get('/matches/mine');
      console.log('matches response:', res.data);
      setItems(res.data?.data ?? []);
    } catch (e) {
      console.error(e);
      alert('Failed to load matches');
    } finally {
      setLoading(false);
    }
  }

  function openChat(item: MatchItem) {
    if (item.chatId) {
      router.push(`/chats/${item.chatId}`);
      return;
    }

    router.push('/chats');
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center text-sm text-slate-500">
          Loading matches...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">My Matches</h1>
          <p className="text-sm text-slate-500">
            People you are connected with
          </p>
        </header>

        <div className="space-y-4">
          {items.map((match) => (
            <div
              key={match.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {match.counterpart?.nickname?.slice(0, 1).toUpperCase() ?? 'M'}
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        {match.counterpart?.nickname ?? 'Unknown user'}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {match.counterpart?.type ?? 'User'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    {match.status && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {match.status}
                      </span>
                    )}

                    {match.request?.city && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {match.request.city}
                      </span>
                    )}

                    {(match.request?.tags ?? []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 px-2 py-1"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {match.request?.description && (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {match.request.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => openChat(match)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
                >
                  Open Chat
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-700">No matches yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Once you accept a like, your matches will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}