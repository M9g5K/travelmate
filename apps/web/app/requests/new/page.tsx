'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { token } from '@/lib/token';
import { useRouter } from 'next/navigation';

export default function NewRequestPage() {
  const router = useRouter();

  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'info' | 'chat' | 'offline'>('offline');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token.get()) {
      router.push('/login');
    }
  }, [router]);

  async function submit() {
    if (!city.trim()) {
      alert('City is required');
      return;
    }

    if (!startDate || !endDate) {
      alert('Start date and end date are required');
      return;
    }

    try {
      setLoading(true);

      await api.post('/requests', {
        city,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        description,
        modeInfoOnly: mode === 'info',
        modeChat: mode === 'chat',
        modeOffline: mode === 'offline',
      });

      router.push('/requests/mine');
    } catch (e: any) {
      console.error('create request error:', e?.response?.data ?? e);

      const msg = e?.response?.data?.message
        ? JSON.stringify(e.response.data.message)
        : e?.message ?? 'Failed to create request';

      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">
          Create Travel Request
        </h1>

        <div className="space-y-5">
          <div>
            <label className="text-sm text-slate-600">City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Seoul"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-slate-600">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Tags</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="food, cafe, culture"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell locals what you want to do..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Mode</label>
            <select
              value={mode}
              onChange={(e) =>
                setMode(e.target.value as 'info' | 'chat' | 'offline')
              }
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="info">Info only</option>
              <option value="chat">Chat guide</option>
              <option value="offline">Offline meet</option>
            </select>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Request'}
          </button>
        </div>
      </div>
    </main>
  );
}