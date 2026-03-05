'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { token } from '@/lib/token';

type InboxItem = {
  chatId: string;
  counterpart: { id: string; nickname: string; type: string };
  lastMessage: null | { content: string; createdAt: string };
  unreadCount: number;
  request: { city: string; tags: string[]; status: string };
};

export default function ChatsPage() {
  const r = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token.get()) r.push('/login');
  }, [r]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/chats/mine?take=20');
        setItems(res.data?.data ?? []);
      } catch (e: any) {
        setErr(e?.response?.data?.message ?? e?.message ?? 'Failed to load chats');
      }
    })();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Inbox</h1>

      {err && <p style={{ color: 'crimson' }}>{err}</p>}

      <ul style={{ display: 'grid', gap: 12, padding: 0, listStyle: 'none' }}>
        {items.map((it) => (
          <li key={it.chatId} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <b>{it.counterpart.nickname}</b> <span style={{ opacity: 0.6 }}>({it.counterpart.type})</span>

                <div style={{ opacity: 0.8, marginTop: 4 }}>
                  {it.request.city} · {it.request.status} · #{(it.request.tags ?? []).join(' #')}
                </div>

                <div style={{ marginTop: 6 }}>
                  {it.lastMessage ? it.lastMessage.content : <span style={{ opacity: 0.6 }}>No messages</span>}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                {it.unreadCount > 0 && <span>Unread: {it.unreadCount}</span>}

                <div style={{ marginTop: 8 }}>
                  <Link href={`/chats/${it.chatId}`}>Open</Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button
        style={{ marginTop: 16 }}
        onClick={() => {
          token.clear();
          r.push('/login');
        }}
      >
        Logout
      </button>
    </main>
  );
}
