'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { token } from '@/lib/token';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState('traveler@example.com');
  const [password, setPassword] = useState('123456');
  const [err, setErr] = useState<string | null>(null);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      const res = await api.post('/auth/login', { email, password });
      const accessToken = res.data?.data?.accessToken;

      if (!accessToken) throw new Error('No accessToken in response');

      token.set(accessToken);
      r.push('/chats');
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.message ?? 'Login failed');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>

      <form onSubmit={onLogin} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%' }}
            autoComplete="email"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%' }}
            autoComplete="current-password"
          />
        </label>

        <button type="submit">Login</button>

        {err && <p style={{ color: 'crimson' }}>{String(err)}</p>}
      </form>

      <p style={{ marginTop: 12, opacity: 0.7 }}>
        Seed 계정: traveler@example.com / 123456
      </p>
    </main>
  );
}
