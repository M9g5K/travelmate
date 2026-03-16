'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import TopNav from '@/components/top-nav';

type ReportItem = {
  id: string;
  reason: string;
  detail?: string;
  chatId?: string | null;
  createdAt: string;
  targetUser?: {
    id: string;
    nickname?: string;
    type?: string;
    country?: string;
  };
};

export default function ReportsPage() {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const res = await api.get('/reports/mine');
      console.log('reports response:', res.data);

      const payload = res.data?.data ?? res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
        ? payload.items
        : [];

      setItems(list);
    } catch (e) {
      console.error(e);
      alert('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

  function formatReason(reason: string) {
    switch (reason) {
      case 'harassment':
        return 'Harassment';
      case 'spam':
        return 'Spam';
      case 'scam':
        return 'Scam';
      case 'abusive_language':
        return 'Abusive language';
      case 'inappropriate_behavior':
        return 'Inappropriate behavior';
      case 'other':
        return 'Other';
      default:
        return reason;
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center text-sm text-slate-500">
          Loading reports...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">My Reports</h1>
          <p className="text-sm text-slate-500">
            Reports you have submitted
          </p>
        </header>

        <div className="space-y-4">
          {items.map((report) => (
            <div
              key={report.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {report.targetUser?.nickname ?? 'Unknown user'}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {report.targetUser?.type ?? 'User'}
                    {report.targetUser?.country
                      ? ` · ${report.targetUser.country}`
                      : ''}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-red-50 px-2 py-1 text-red-600">
                      {formatReason(report.reason)}
                    </span>

                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      {formatDate(report.createdAt)}
                    </span>

                    {report.chatId && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        Chat report
                      </span>
                    )}
                  </div>

                  {report.detail && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {report.detail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-700">
                No reports yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Reports you submit will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}