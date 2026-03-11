'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/top-nav';

type RequestItem = {
  id: string;
  city: string;
  tags: string[];
  description?: string;
  status?: string;
};

export default function RequestsPage() {
  const router = useRouter();
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likingId, setLikingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const res = await api.get('/requests?take=20');
      setItems(res.data?.data ?? []);
    } catch (e) {
      console.error(e);
      alert('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }

  async function likeRequest(id: string) {
    try {
      setLikingId(id);
      await api.post(`/requests/${id}/like`);
      alert('Liked successfully!');
      await loadRequests();
    } catch (e) {
      console.error(e);
      alert('Failed to like request');
    } finally {
      setLikingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center text-sm text-slate-500">
          Loading requests...
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
            <h1 className="text-2xl font-semibold text-slate-900">
              Travel Requests
            </h1>
            <p className="text-sm text-slate-500">
              Browse requests from travelers
            </p>
          </div>

          <button
            onClick={() => router.push('/requests/new')}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            Create Request
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

                  <p className="mt-1 text-sm text-slate-500">
                    {req.status ?? 'ACTIVE'}
                  </p>
                </div>

                <button
                  onClick={() => likeRequest(req.id)}
                  disabled={likingId === req.id}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  {likingId === req.id ? 'Liking...' : 'Like'}
                </button>
              </div>

              {req.description && (
                <p className="mt-3 text-sm text-slate-600">
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
              <p className="text-sm font-medium text-slate-700">
                No travel requests yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Create a request or come back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}