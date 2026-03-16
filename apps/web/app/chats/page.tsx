'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import TopNav from '@/components/top-nav';

type InboxItem = {
  chatId: string;
  counterpart?: {
    id: string;
    nickname?: string;
    type?: string;
    country?: string;
    languages?: string[];
    profileImageUrl?: string | null;
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

type ReportReason =
  | 'harassment'
  | 'spam'
  | 'scam'
  | 'abusive_language'
  | 'inappropriate_behavior'
  | 'other';

export default function ChatsPage() {
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportChatId, setReportChatId] = useState<string | null>(null);
  const [reportTargetUserId, setReportTargetUserId] = useState<string | null>(null);
  const [reportTargetName, setReportTargetName] = useState('');
  const [reportReason, setReportReason] = useState<ReportReason>('harassment');
  const [reportDetail, setReportDetail] = useState('');
  const [reporting, setReporting] = useState(false);

  const [blockingId, setBlockingId] = useState<string | null>(null);

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      const res = await api.get('/chats/mine?take=20');
      console.log('chats response:', res.data);

      const payload = res.data?.data ?? res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : [];

      setItems(list);
    } catch (e: any) {
      console.error(e);
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

  function openReportModal(chat: InboxItem) {
    if (!chat.counterpart?.id) {
      alert('Target user information is missing');
      return;
    }

    setReportChatId(chat.chatId);
    setReportTargetUserId(chat.counterpart.id);
    setReportTargetName(chat.counterpart.nickname ?? 'Unknown user');
    setReportReason('harassment');
    setReportDetail('');
    setReportOpen(true);
  }

  async function submitReport() {
    if (!reportTargetUserId) {
      alert('Target user is missing');
      return;
    }

    try {
      setReporting(true);

      await api.post('/reports', {
        targetUserId: reportTargetUserId,
        chatId: reportChatId,
        reason: reportReason,
        detail: reportDetail || undefined,
      });

      alert('Report submitted');
      setReportOpen(false);
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message
          ? JSON.stringify(e.response.data.message)
          : 'Failed to submit report';
      alert(msg);
    } finally {
      setReporting(false);
    }
  }

  async function blockUser(userId: string, nickname: string) {
    const ok = window.confirm(`${nickname} 을(를) 차단할까?`);
    if (!ok) return;

    try {
      setBlockingId(userId);

      await api.post('/blocks', {
        blockedUserId: userId,
      });

      alert('User blocked');
      await loadChats();
      router.push('/blocks');
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message
          ? JSON.stringify(e.response.data.message)
          : 'Failed to block user';
      alert(msg);
    } finally {
      setBlockingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Chats</h1>
            <p className="text-sm text-slate-500">Your conversations</p>
          </div>
        </header>

        {err && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {err}
          </div>
        )}

        <div className="space-y-4">
          {items.map((chat) => {
            const person = chat.counterpart;
            const nickname = person?.nickname ?? `Chat ${chat.chatId.slice(0, 6)}`;
            const type = person?.type ?? 'Conversation';
            const country = person?.country;
            const languages = person?.languages ?? [];
            const profileImageUrl = person?.profileImageUrl ?? null;

            return (
              <div
                key={chat.chatId}
                onClick={() => router.push(`/chats/${chat.chatId}`)}
                className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-4">
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

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-semibold text-slate-900">
                          {nickname}
                        </h2>

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

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
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

                    <div className="mt-3 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openReportModal(chat);
                        }}
                        className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Report
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (person?.id) {
                            blockUser(person.id, nickname);
                          }
                        }}
                        disabled={!person?.id || blockingId === person.id}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      >
                        {blockingId === person?.id ? 'Blocking...' : 'Block'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

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

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Report User</h2>
            <p className="mt-2 text-sm text-slate-500">
              Report <span className="font-medium text-slate-700">{reportTargetName}</span>
            </p>

            <div className="mt-5">
              <label className="text-sm font-medium text-slate-700">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as ReportReason)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="harassment">Harassment</option>
                <option value="spam">Spam</option>
                <option value="scam">Scam</option>
                <option value="abusive_language">Abusive language</option>
                <option value="inappropriate_behavior">Inappropriate behavior</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">Detail</label>
              <textarea
                value={reportDetail}
                onChange={(e) => setReportDetail(e.target.value)}
                rows={4}
                placeholder="Describe what happened..."
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={submitReport}
                disabled={reporting}
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {reporting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}