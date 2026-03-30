'use client';

import { api } from '@/lib/api';
import { token } from '@/lib/token';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TopNav from '@/components/top-nav';

type Msg = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

function getUserIdFromAccessToken(rawToken?: string | null): string | null {
  if (!rawToken) return null;
  try {
    const parts = rawToken.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    // base64url -> base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = JSON.parse(atob(padded));
    // common keys: sub, userId, id
    return String(json.sub ?? json.userId ?? json.id ?? '');
  } catch {
    return null;
  }
}

export default function ChatRoomPage() {
  const params = useParams();
  const chatId = String(params.chatId);
  const router = useRouter();

  const [meId, setMeId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const access = token.get();
    if (!access) {
      router.push('/login');
      return;
    }

    // 1) Set meId immediately from JWT so alignment is correct even before /me resolves.
    const fromJwt = getUserIdFromAccessToken(access);
    if (fromJwt) setMeId(fromJwt);

    // 2) Also load /me to confirm (and handle APIs that return userId instead of id).
    (async () => {
      try {
        const res = await api.get('/me');
        const me = res.data?.data;
        const id = me?.id ?? me?.userId;
        if (id) setMeId(String(id));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [router]);

  async function loadMessages() {
    try {
      const res = await api.get(`/chats/${chatId}/messages?take=50`);
      const list = res.data?.data ?? [];
      setMsgs(list);

      const last = list.slice(-1)[0];
      if (last?.id) {
        await api.post(`/chats/${chatId}/seen`, { lastReadMsgId: last.id });
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  async function send() {
    const content = text.trim();
    if (!content || loading) return;

    try {
      setLoading(true);
      await api.post(`/chats/${chatId}/messages`, { content });
      setText('');
      await loadMessages();
    } catch (e) {
      console.error(e);
      alert('메시지 전송 실패');
    } finally {
      setLoading(false);
    }
  }

  function formatTime(value: string) {
    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto flex h-[calc(100vh-88px)] max-w-5xl flex-col px-4 py-6">
        <header className="mb-4 flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/chats')}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
            >
              ← Back
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              C
            </div>

            <div>
              <h1 className="text-base font-semibold text-slate-900">Conversation</h1>
              <p className="text-sm text-slate-500">TravelMate chat</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto bg-slate-50/70 px-4 py-5">
              <div className="space-y-4">
                {msgs.map((m) => {
                  const mine = Boolean(meId) && String(m.senderId) === String(meId);

                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[78%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            mine
                              ? 'rounded-br-md bg-slate-900 text-white'
                              : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                          }`}
                        >
                          <p className="leading-6">{m.content}</p>
                        </div>

                        <span className="mt-1 px-1 text-[11px] text-slate-400">
                          {formatTime(m.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div ref={bottomRef} />
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-4">
              <div className="flex items-end gap-3">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  rows={1}
                  className="max-h-40 min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />

                <button
                  onClick={send}
                  disabled={loading}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}