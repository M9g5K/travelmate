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
    country?: string;
    languages?: string[];
    profileImageUrl?: string | null;
  };
  local?: {
    id: string;
    nickname?: string;
    type?: string;
    country?: string;
    languages?: string[];
    profileImageUrl?: string | null;
  };
};

export default function RequestLikesPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;

  const [likes, setLikes] = useState<LikeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    loadLikes();
  }, []);

  async function loadLikes() {
    try {
      const res = await api.get(`/requests/${requestId}/likes`);
      console.log('likes response:', res.data);

      const payload = res.data?.data ?? res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : [];

      setLikes(list);
    } catch (e) {
      console.error(e);
      alert('Failed to load likes');
    } finally {
      setLoading(false);
    }
  }

  function openUserProfile(userId?: string) {
    if (!userId) {
      alert('User info missing');
      return;
    }

    router.push(`/users/${userId}`);
  }

  async function accept(likeId: string) {
    try {
      setAcceptingId(likeId);

      await api.post(`/requests/${requestId}/accept`, {
        likeId,
      });

      alert('Match created!');
      router.push('/matches');
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message
          ? JSON.stringify(e.response.data.message)
          : 'Failed to accept';
      alert(msg);
    } finally {
      setAcceptingId(null);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center text-sm text-slate-500">
          Loading likes...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-3xl px-6 py-10">
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
            const country = person?.country;
            const languages = person?.languages ?? [];
            const profileImageUrl = person?.profileImageUrl ?? null;

            return (
              <div
                key={like.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => openUserProfile(person?.id)}
                        className="shrink-0"
                      >
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt="profile"
                            className="h-14 w-14 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-base font-semibold text-white">
                            {nickname.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </button>

                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => openUserProfile(person?.id)}
                          className="text-left"
                        >
                          <h2 className="truncate text-lg font-semibold text-slate-900 hover:underline">
                            {nickname}
                          </h2>
                        </button>

                        <p className="mt-1 text-sm text-slate-500">
                          {type}
                          {country ? ` · ${country}` : ''}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {languages.map((lang) => (
                            <span
                              key={lang}
                              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => accept(like.id)}
                    disabled={acceptingId === like.id}
                    className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    {acceptingId === like.id ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              </div>
            );
          })}

          {likes.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No one liked this request yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                When locals like your request, they will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}