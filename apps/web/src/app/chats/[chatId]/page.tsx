'use client';

import { api } from '@/lib/api';
import { token } from '@/lib/token';
import { io, Socket } from 'socket.io-client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Msg = { id: string; senderId: string; content: string; createdAt: string };

export default function ChatRoomPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const r = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState<string | null>(null);
  const sockRef = useRef<Socket | null>(null);

  const wsUrl = useMemo(() => process.env.NEXT_PUBLIC_WS_URL!, []);

  // 로그인 체크
  useEffect(() => {
    if (!token.get()) r.push('/login');
  }, [r]);

  // 메시지 초기 로드
  useEffect(() => {
    (async () => {
      const res = await api.get(`/chats/${chatId}/messages?take=50`);
      const list = res.data?.data ?? [];
      setMsgs(list);

      const last = list.slice(-1)[0];
      await api.post(`/chats/${chatId}/seen`, { lastReadMsgId: last?.id });
    })();
  }, [chatId]);

  // socket 연결
  useEffect(() => {
    const t = token.get();
    if (!t) return;

    const s = io(wsUrl, {
      transports: ['websocket'],
      auth: { token: t },
    });

    sockRef.current = s;

    s.on('connect', () => {
      s.emit('joinChat', { chatId });
    });

    s.on('newMessage', (m: any) => {
      setMsgs((prev) => [...prev, m]);
      s.emit('messages:seen', { chatId, lastReadMsgId: m.id });
    });

    s.on('typing', (p: any) => {
      if (p?.chatId !== chatId) return;
      setTyping(p.isTyping ? `${p.userId} typing...` : null);
    });

    return () => {
      s.disconnect();
      sockRef.current = null;
    };
  }, [chatId, wsUrl]);

  function send() {
    const s = sockRef.current;
    if (!s) return;

    const content = text.trim();
    if (!content) return;

    s.emit('sendMessage', { chatId, content });
    setText('');
  }

  useEffect(() => {
    const s = sockRef.current;
    if (!s) return;

    if (text.length > 0) s.emit('typing:start', { chatId });
    const t = setTimeout(() => s.emit('typing:stop', { chatId }), 600);

    return () => clearTimeout(t);
  }, [text, chatId]);

  return (
    <main style={{ padding: 24 }}>
      <button onClick={() => r.push('/chats')}>← Back</button>

      <h1 style={{ marginTop: 12 }}>Chat Room</h1>

      {typing && <p style={{ opacity: 0.7 }}>{typing}</p>}

      <div style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 12,
        height: 360,
        overflow: 'auto'
      }}>
        {msgs.map((m) => (
          <div key={m.id} style={{ padding: '6px 0' }}>
            <span style={{ opacity: 0.6, marginRight: 8 }}>
              {new Date(m.createdAt).toLocaleTimeString()}
            </span>
            <span>{m.content}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1 }}
        />

        <button onClick={send}>Send</button>
      </div>
    </main>
  );
}
