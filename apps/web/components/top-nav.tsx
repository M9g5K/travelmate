'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { token } from '@/lib/token';

const menus = [
  { href: '/', label: 'Home' },
  { href: '/requests', label: 'Requests' },
  { href: '/requests/mine', label: 'My Requests' },
  { href: '/matches', label: 'Matches' },
  { href: '/chats', label: 'Chats' },
  { href: '/reports', label: 'Reports' },
  { href: '/blocks', label: 'Blocks' },
  { href: '/me', label: 'Profile' },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    if (href === '/requests') return pathname === '/requests';
    return pathname.startsWith(href);
  }

  function logout() {
    token.clear();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          TravelMate
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive(menu.href)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {menu.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={logout}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
        >
          Logout
        </button>
      </div>

      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 pb-4 md:hidden">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
              isActive(menu.href)
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {menu.label}
          </Link>
        ))}
      </div>
    </header>
  );
}