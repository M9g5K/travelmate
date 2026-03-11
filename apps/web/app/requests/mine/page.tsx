'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/top-nav';

type MyRequestItem = {
  id: string;
  city: string;
  tags: string[];
  description?: string;
  status?: string;
  createdAt?: string;
};

export default function MyRequestsPage() {
  const router = useRouter();
  const [items, setItems] = useState<MyRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyRequests();
  }, []);

  async function loadMyRequests() {
    try {
      const res = await api.get('/requests/mine');
      setItems(res.data?.data ?? []);
    } catch (e) {
      console.error(e);
      alert('Failed to load my requests');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value?: string) {
    if (!value) return '';
    return new Date(value).toLocaleDateString();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center text-sm text-slate-500">
          Loading your requests...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">My Requests</h1>
            <p className="text-sm text-slate-500">
              Requests you created as a traveler
            </p>
          </div>

          <button
            onClick={() => router.push('/requests/new')}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            New Request
          </button>
        </header>

        <div className="space-y-4">
          {items.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {req.city}
                  </h2>

                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                    {req.status && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {req.status}
                      </span>
                    )}

                    {req.createdAt && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {formatDate(req.createdAt)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/requests/${req.id}/likes`)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                >
                  View Likes
                </button>
              </div>

              {req.description && (
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {req.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {(req.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-700">No requests yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Create your first travel request to get matched with locals.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}