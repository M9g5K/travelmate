'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import TopNav from '@/components/top-nav';

type LikeItem = {
  id: string;
  user?: {
    id: string;
    nickname?: string;
    type?: string;
  };
  local?: {
    id: string;
    nickname?: string;
    type?: string;
  };
};

export default function RequestLikesPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [likes, setLikes] = useState<LikeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikes();
  }, []);

  async function loadLikes() {
    try {
      const res = await api.get(`/requests/${requestId}/likes`);
      console.log('likes response:', res.data);
      setLikes(res.data?.data ?? []);
    } catch (e) {
      console.error(e);
      alert('Failed to load likes');
    } finally {
      setLoading(false);
    }
  }

  async function accept(likeId: string) {
    try {
      await api.post(`/requests/${requestId}/accept`, {
        likeId,
      });

      alert('Match created!');
      router.push('/chats');
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message
          ? JSON.stringify(e.response.data.message)
          : 'Failed to accept';
      alert(msg);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center">
          Loading likes...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            People Interested
          </h1>
          <p className="text-sm text-slate-500">
            Locals who liked your request
          </p>
        </header>

        <div className="space-y-4">
          {likes.map((like) => {
            const person = like.user ?? like.local;
            const nickname = person?.nickname ?? 'Unknown user';
            const type = person?.type ?? 'LOCAL';

            return (
              <div
                key={like.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{nickname}</p>
                  <p className="text-sm text-slate-500">{type}</p>
                </div>

                <button
                  onClick={() => accept(like.id)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
                >
                  Accept
                </button>
              </div>
            );
          })}

          {likes.length === 0 && (
            <div className="text-center text-sm text-slate-500">
              No one liked this request yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}