'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { token } from '@/lib/token';
import TopNav from '@/components/top-nav';

const cards = [
  {
    title: 'Browse Requests',
    description: 'See travel requests from travelers and like the ones you can help with.',
    href: '/requests',
  },
  {
    title: 'My Requests',
    description: 'Manage the requests you created and check who is interested.',
    href: '/requests/mine',
  },
  {
    title: 'Matches',
    description: 'View people you matched with and continue the conversation.',
    href: '/matches',
  },
  {
    title: 'Chats',
    description: 'Open your conversations and send messages.',
    href: '/chats',
  },
  {
    title: 'Profile',
    description: 'Check your account information and current role.',
    href: '/me',
  },
];

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (!token.get()) {
      router.push('/login');
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              TravelMate Dashboard
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Connect travelers with real locals
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              TravelMate helps travelers create requests, connect with locals,
              accept matches, and continue conversations through chat.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/requests/new')}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create Request
              </button>

              <button
                onClick={() => router.push('/requests')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Browse Requests
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
      </div>
    </main>
  );
}