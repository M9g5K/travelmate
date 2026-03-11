'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/top-nav';

type InboxItem = {
  chatId: string;
  counterpart?: {
    id: string;
    nickname: string;
    type: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  } | null;
  unreadCount?: number;
  request?: {
    city?: string;
    tags?: string[];
    status?: string;
  };
};

export default function ChatsPage() {
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      const res = await api.get('/chats/mine?take=20');
      setItems(res.data?.data ?? []);
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.message ?? 'Failed to load chats');
    }
  }

  function formatTime(value?: string) {
    if (!value) return '';
    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">TravelMate</h1>
            <p className="text-sm text-slate-500">Your conversations</p>
          </div>
        </header>

        {err && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {err}
          </div>
        )}

        <div className="space-y-3">
          {items.map((chat) => (
            <div
              key={chat.chatId}
              onClick={() => router.push(`/chats/${chat.chatId}`)}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {chat.counterpart?.nickname?.slice(0, 1).toUpperCase() ?? 'C'}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900">
                        {chat.counterpart?.nickname ?? `Chat ${chat.chatId.slice(0, 6)}`}
                      </div>
                      <div className="text-xs text-slate-500">
                        {chat.counterpart?.type ?? 'Conversation'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      {chat.request?.city ?? 'Unknown city'}
                    </span>
                    {chat.request?.status && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {chat.request.status}
                      </span>
                    )}
                    {(chat.request?.tags ?? []).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 px-2 py-1"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 truncate text-sm text-slate-600">
                    {chat.lastMessage?.content ?? 'No messages yet.'}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  {chat.lastMessage?.createdAt && (
                    <div className="text-xs text-slate-400">
                      {formatTime(chat.lastMessage.createdAt)}
                    </div>
                  )}

                  {(chat.unreadCount ?? 0) > 0 && (
                    <div className="mt-2 inline-flex min-w-6 items-center justify-center rounded-full bg-slate-900 px-2 py-1 text-xs font-medium text-white">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No conversations yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Once you match with someone, your chats will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}