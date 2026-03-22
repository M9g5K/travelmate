'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { token } from '@/lib/token';
import { api } from '@/lib/api';
import TopNav from '@/components/top-nav';

type MatchItem = {
  id: string;
  status?: string;
  request?: {
    city?: string;
    tags?: string[];
    description?: string;
  };
  counterpart?: {
    id: string;
    nickname?: string;
    type?: string;
    country?: string;
    profileImageUrl?: string | null;
  };
  chatId?: string | null;
};

type ChatItem = {
  chatId: string;
  counterpart?: {
    id: string;
    nickname?: string;
    type?: string;
    country?: string;
    profileImageUrl?: string | null;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  } | null;
  request?: {
    city?: string;
    tags?: string[];
    status?: string;
  };
};

const cards = [
  {
    title: 'Create Request',
    description: 'Create a new travel request and get connected with locals.',
    href: '/requests/new',
  },
  {
    title: 'Browse Requests',
    description: 'See travel requests from travelers and help with matching.',
    href: '/requests',
  },
  {
    title: 'My Requests',
    description: 'Manage your travel requests and check likes.',
    href: '/requests/mine',
  },
  {
    title: 'Matches',
    description: 'See who you matched with and continue the conversation.',
    href: '/matches',
  },
  {
    title: 'Chats',
    description: 'Open your conversations and send messages.',
    href: '/chats',
  },
  {
    title: 'Profile',
    description: 'Edit your profile, country, languages, bio, and image.',
    href: '/me',
  },
];

export default function HomePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [recentMatches, setRecentMatches] = useState<MatchItem[]>([]);
  const [recentChats, setRecentChats] = useState<ChatItem[]>([]);

  useEffect(() => {
    if (!token.get()) {
      router.push('/login');
      return;
    }

    loadHome();
  }, [router]);

  async function loadHome() {
    try {
      setLoading(true);

      const [matchesRes, chatsRes] = await Promise.all([
        api.get('/matches/mine'),
        api.get('/chats/mine?take=3'),
      ]);

      const matchesRaw = matchesRes.data;
      const matchesList = Array.isArray(matchesRaw)
        ? matchesRaw
        : Array.isArray(matchesRaw?.data)
        ? matchesRaw.data
        : Array.isArray(matchesRaw?.items)
        ? matchesRaw.items
        : Array.isArray(matchesRaw?.data?.items)
        ? matchesRaw.data.items
        : [];

      const chatsPayload = chatsRes.data?.data ?? chatsRes.data;
      const chatsList = Array.isArray(chatsPayload)
        ? chatsPayload
        : Array.isArray(chatsPayload?.items)
        ? chatsPayload.items
        : [];

      setRecentMatches(matchesList.slice(0, 3));
      setRecentChats(chatsList.slice(0, 3));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(value?: string) {
    if (!value) return '';
    return new Date(value).toLocaleDateString();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              TravelMate Dashboard
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Connect travelers with real locals
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Create travel requests, browse local matches, chat safely, manage
              reports and blocks, and build trust with reviews.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/requests/new')}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create Request
              </button>

              <button
                onClick={() => router.push('/matches')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                View Matches
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.href}
              onClick={() => router.push(card.href)}
              className="rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {card.description}
              </p>
              <div className="mt-4 text-sm font-medium text-slate-900">
                Open →
              </div>
            </button>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Recent Matches
                </h2>
                <p className="text-sm text-slate-500">
                  Your latest connected users
                </p>
              </div>

              <button
                onClick={() => router.push('/matches')}
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                View all
              </button>
            </div>

            {loading ? (
              <div className="text-sm text-slate-500">Loading matches...</div>
            ) : recentMatches.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No matches yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Once you accept a like, your matches will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMatches.map((match) => {
                  const person = match.counterpart;
                  const nickname = person?.nickname ?? 'Unknown user';

                  return (
                    <div
                      key={match.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            person?.id && router.push(`/users/${person.id}`)
                          }
                          className="shrink-0"
                        >
                          {person?.profileImageUrl ? (
                            <img
                              src={person.profileImageUrl}
                              alt="profile"
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                              {nickname.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() =>
                              person?.id && router.push(`/users/${person.id}`)
                            }
                            className="text-left"
                          >
                            <h3 className="truncate text-sm font-semibold text-slate-900 hover:underline">
                              {nickname}
                            </h3>
                          </button>

                          <p className="mt-1 text-xs text-slate-500">
                            {person?.type ?? 'User'}
                            {person?.country ? ` · ${person.country}` : ''}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {match.request?.city && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                {match.request.city}
                              </span>
                            )}

                            {(match.request?.tags ?? []).slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            match.chatId
                              ? router.push(`/chats/${match.chatId}`)
                              : router.push('/matches')
                          }
                          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          Open Chat
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Recent Chats
                </h2>
                <p className="text-sm text-slate-500">
                  Your latest conversations
                </p>
              </div>

              <button
                onClick={() => router.push('/chats')}
                className="text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                View all
              </button>
            </div>

            {loading ? (
              <div className="text-sm text-slate-500">Loading chats...</div>
            ) : recentChats.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No chats yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Once you match with someone, your chats will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentChats.map((chat) => {
                  const person = chat.counterpart;
                  const nickname = person?.nickname ?? 'Unknown user';

                  return (
                    <div
                      key={chat.chatId}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            person?.id && router.push(`/users/${person.id}`)
                          }
                          className="shrink-0"
                        >
                          {person?.profileImageUrl ? (
                            <img
                              src={person.profileImageUrl}
                              alt="profile"
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                              {nickname.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() =>
                              person?.id && router.push(`/users/${person.id}`)
                            }
                            className="text-left"
                          >
                            <h3 className="truncate text-sm font-semibold text-slate-900 hover:underline">
                              {nickname}
                            </h3>
                          </button>

                          <p className="mt-1 text-xs text-slate-500">
                            {person?.type ?? 'User'}
                            {person?.country ? ` · ${person.country}` : ''}
                          </p>

                          <p className="mt-2 truncate text-sm text-slate-600">
                            {chat.lastMessage?.content ?? 'No messages yet.'}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {chat.request?.city && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                {chat.request.city}
                              </span>
                            )}

                            {chat.lastMessage?.createdAt && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                                {formatTime(chat.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => router.push(`/chats/${chat.chatId}`)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}