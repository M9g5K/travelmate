'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import TopNav from '@/components/top-nav';

type UserProfile = {
  id: string;
  nickname?: string;
  type?: string;
  country?: string;
  languages?: string[];
  bio?: string;
  profileImageUrl?: string | null;
  createdAt?: string;
};

type ReviewItem = {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: {
    id: string;
    nickname?: string;
    type?: string;
    country?: string;
    profileImageUrl?: string | null;
  };
  match?: {
    id: string;
  };
};

type BlockItem = {
  id: string;
  blockedUser?: {
    id: string;
  };
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    loadPage();
  }, [userId]);

  async function loadPage() {
    try {
      setLoading(true);

      const [userRes, reviewsRes, blocksRes] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/reviews/users/${userId}`),
        api.get('/blocks'),
      ]);

      setUser(userRes.data?.data ?? null);

      const reviewsPayload = reviewsRes.data?.data ?? reviewsRes.data;
      const reviewList = Array.isArray(reviewsPayload)
        ? reviewsPayload
        : Array.isArray(reviewsPayload?.items)
        ? reviewsPayload.items
        : [];
      setReviews(reviewList);

      const blocksPayload = blocksRes.data?.data ?? blocksRes.data;
      const blockList: BlockItem[] = Array.isArray(blocksPayload)
        ? blocksPayload
        : Array.isArray(blocksPayload?.items)
        ? blocksPayload.items
        : [];

      const blocked = blockList.some((b) => b.blockedUser?.id === userId);
      setIsBlocked(blocked);
    } catch (e) {
      console.error(e);
      alert('Failed to load user');
    } finally {
      setLoading(false);
    }
  }

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  async function handleBlock() {
    if (!userId) return;
    if (!window.confirm('Block this user?')) return;

    try {
      setBlocking(true);
      await api.post('/blocks', { blockedUserId: userId });
      setIsBlocked(true);
      alert('User blocked');
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message
          ? JSON.stringify(e.response.data.message)
          : 'Failed to block user';
      alert(msg);
    } finally {
      setBlocking(false);
    }
  }

  async function handleUnblock() {
    if (!userId) return;
    if (!window.confirm('Unblock this user?')) return;

    try {
      setBlocking(true);
      await api.delete(`/blocks/${userId}`);
      setIsBlocked(false);
      alert('User unblocked');
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message
          ? JSON.stringify(e.response.data.message)
          : 'Failed to unblock user';
      alert(msg);
    } finally {
      setBlocking(false);
    }
  }

  function formatDate(value?: string) {
    if (!value) return '';
    return new Date(value).toLocaleDateString();
  }

  function renderStars(rating: number) {
    return '⭐'.repeat(rating);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center text-sm text-slate-500">
          Loading user...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center text-sm text-slate-500">
          User not found
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="profile"
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white">
                {user.nickname?.slice(0, 1).toUpperCase() ?? 'U'}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900">
                  {user.nickname ?? 'Unknown user'}
                </h1>

                {isBlocked ? (
                  <button
                    onClick={handleUnblock}
                    disabled={blocking}
                    className="rounded-xl border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {blocking ? 'Updating...' : 'Unblock'}
                  </button>
                ) : (
                  <button
                    onClick={handleBlock}
                    disabled={blocking}
                    className="rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {blocking ? 'Blocking...' : 'Block'}
                  </button>
                )}

                <button
                  onClick={() => router.back()}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Back
                </button>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {user.type ?? 'User'}
                {user.country ? ` · ${user.country}` : ''}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {(user.languages ?? []).map((lang) => (
                  <span
                    key={lang}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700">
                  {reviews.length > 0
                    ? `⭐ ${averageRating.toFixed(1)}`
                    : 'No rating yet'}
                </div>

                <div className="text-sm text-slate-500">
                  {reviews.length} review{reviews.length === 1 ? '' : 's'}
                </div>

                {user.createdAt && (
                  <div className="text-sm text-slate-400">
                    Joined {formatDate(user.createdAt)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Bio
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {user.bio ?? 'No bio yet.'}
            </p>
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Reviews</h2>
            <p className="text-sm text-slate-500">
              Feedback from matched users
            </p>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {review.reviewer?.profileImageUrl ? (
                    <img
                      src={review.reviewer.profileImageUrl}
                      alt="reviewer"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {review.reviewer?.nickname?.slice(0, 1).toUpperCase() ?? 'U'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {review.reviewer?.nickname ?? 'Anonymous'}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {review.reviewer?.type ?? 'User'}
                          {review.reviewer?.country
                            ? ` · ${review.reviewer.country}`
                            : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-yellow-600">
                          {renderStars(review.rating)}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {review.comment ?? 'No comment provided.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {reviews.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No reviews yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Reviews from matched users will appear here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}