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
    country?: string;
    languages?: string[];
    profileImageUrl?: string | null;
  };
  chatId?: string | null;
};

export default function MatchesPage() {
  const router = useRouter();
  const [items, setItems] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTargetId, setReviewTargetId] = useState<string | null>(null);
  const [reviewTargetName, setReviewTargetName] = useState('');
  const [reviewMatchId, setReviewMatchId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      const res = await api.get('/matches/mine');
      console.log('matches response:', res.data);

      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.items)
        ? raw.items
        : Array.isArray(raw?.data?.items)
        ? raw.data.items
        : [];

      setItems(list);
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

  function openReview(match: MatchItem) {
    const person = match.counterpart;

    if (!person?.id) {
      alert('User info missing');
      return;
    }

    setReviewTargetId(person.id);
    setReviewTargetName(person.nickname ?? 'User');
    setReviewMatchId(match.id);
    setRating(5);
    setComment('');
    setReviewOpen(true);
  }

  async function submitReview() {
    if (!reviewTargetId || !reviewMatchId) {
      alert('Invalid review data');
      return;
    }

    try {
      setSubmittingReview(true);

      await api.post('/reviews', {
        targetUserId: reviewTargetId,
        matchId: reviewMatchId,
        rating,
        comment,
      });

      alert('Review submitted!');
      setReviewOpen(false);
    } catch (e: any) {
      console.error(e);

      const msg =
        e?.response?.data?.message
          ? JSON.stringify(e.response.data.message)
          : 'Failed to submit review';

      alert(msg);
    } finally {
      setSubmittingReview(false);
    }
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
          {items.map((match) => {
            const person = match.counterpart;

            return (
              <div
                key={match.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-4">
                      {person?.profileImageUrl ? (
                        <img
                          src={person.profileImageUrl}
                          alt="profile"
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-base font-semibold text-white">
                          {person?.nickname?.slice(0, 1).toUpperCase() ?? 'M'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-slate-900">
                          {person?.nickname ?? 'Unknown user'}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {person?.type ?? 'User'}
                          {person?.country ? ` · ${person.country}` : ''}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {(person?.languages ?? []).map((lang) => (
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

                  <div className="shrink-0">
                    <button
                      onClick={() => openChat(match)}
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Open Chat
                    </button>

                    <button
                      onClick={() => openReview(match)}
                      className="mt-3 block rounded-xl border border-yellow-300 px-3 py-2 text-xs font-medium text-yellow-700 hover:bg-yellow-50"
                    >
                      ⭐ Write Review
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

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

      {reviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">
              Write Review
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review {reviewTargetName}
            </p>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">
                Rating
              </label>

              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              >
                <option value={5}>⭐⭐⭐⭐⭐</option>
                <option value={4}>⭐⭐⭐⭐</option>
                <option value={3}>⭐⭐⭐</option>
                <option value={2}>⭐⭐</option>
                <option value={1}>⭐</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">
                Comment
              </label>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Share your experience..."
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setReviewOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={submitReview}
                disabled={submittingReview}
                className="rounded-2xl bg-yellow-500 px-4 py-3 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}