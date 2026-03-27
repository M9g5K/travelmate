'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { token } from '@/lib/token';

const COUNTRY_OPTIONS = [
  { value: 'Korea', label: 'Korea', emoji: '🇰🇷' },
  { value: 'USA', label: 'USA', emoji: '🇺🇸' },
  { value: 'Japan', label: 'Japan', emoji: '🇯🇵' },
  { value: 'China', label: 'China', emoji: '🇨🇳' },
  { value: 'UK', label: 'UK', emoji: '🇬🇧' },
  { value: 'France', label: 'France', emoji: '🇫🇷' },
  { value: 'Germany', label: 'Germany', emoji: '🇩🇪' },
  { value: 'Canada', label: 'Canada', emoji: '🇨🇦' },
  { value: 'Australia', label: 'Australia', emoji: '🇦🇺' },
  { value: 'Singapore', label: 'Singapore', emoji: '🇸🇬' },
  { value: 'Thailand', label: 'Thailand', emoji: '🇹🇭' },
  { value: 'Vietnam', label: 'Vietnam', emoji: '🇻🇳' },
  { value: 'Italy', label: 'Italy', emoji: '🇮🇹' },
  { value: 'Spain', label: 'Spain', emoji: '🇪🇸' },
  { value: 'Brazil', label: 'Brazil', emoji: '🇧🇷' },
  { value: 'Mexico', label: 'Mexico', emoji: '🇲🇽' },
  { value: 'India', label: 'India', emoji: '🇮🇳' },
  { value: 'Indonesia', label: 'Indonesia', emoji: '🇮🇩' },
  { value: 'Malaysia', label: 'Malaysia', emoji: '🇲🇾' },
  { value: 'Philippines', label: 'Philippines', emoji: '🇵🇭' },
  { value: 'Netherlands', label: 'Netherlands', emoji: '🇳🇱' },
  { value: 'Switzerland', label: 'Switzerland', emoji: '🇨🇭' },
  { value: 'Sweden', label: 'Sweden', emoji: '🇸🇪' },
  { value: 'Norway', label: 'Norway', emoji: '🇳🇴' },
  { value: 'Denmark', label: 'Denmark', emoji: '🇩🇰' },
  { value: 'Turkey', label: 'Turkey', emoji: '🇹🇷' },
  { value: 'UAE', label: 'UAE', emoji: '🇦🇪' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia', emoji: '🇸🇦' },
];

const LANGUAGE_OPTIONS = [
  'Korean',
  'English',
  'Japanese',
  'Chinese',
  'Spanish',
  'French',
];

export default function SignupPage() {
  const router = useRouter();

  const [type, setType] = useState<'TRAVELER' | 'LOCAL'>('TRAVELER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCountries = COUNTRY_OPTIONS.filter((item) =>
    `${item.label} ${item.value}`
      .toLowerCase()
      .includes(countrySearch.toLowerCase().trim()),
  );

  const filteredLanguages = LANGUAGE_OPTIONS.filter((item) =>
    item.toLowerCase().includes(languageSearch.toLowerCase().trim()),
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !password || !nickname) {
      alert('Email, password, and nickname are required.');
      return;
    }

    if (languages.length === 0) {
      alert('Please select at least one language.');
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/signup', {
        email,
        password,
        nickname,
        type,
        country: country || undefined,
        languages,
        bio: bio || undefined,
      });

      const loginRes = await api.post('/auth/login', {
        email,
        password,
      });

      const data = loginRes.data?.data ?? loginRes.data;

      if (!data?.accessToken) {
        alert('Signup succeeded but login failed. Please sign in again.');
        router.push('/login');
        return;
      }

      token.set(data.accessToken);

      alert('Signup completed successfully.');
      router.push('/');
    } catch (e: any) {
      console.error(e);

      const msg =
        e?.response?.data?.message
          ? Array.isArray(e.response.data.message)
            ? e.response.data.message.join(', ')
            : e.response.data.message
          : 'Signup failed.';

      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-10">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Sign up</h1>
            <p className="mt-2 text-sm text-slate-500">
              Create your TravelMate account.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Account type
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { value: 'TRAVELER', label: 'Traveler' },
                  { value: 'LOCAL', label: 'Local' },
                ].map((option) => {
                  const selected = type === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setType(option.value as 'TRAVELER' | 'LOCAL')
                      }
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        selected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border px-4 py-3"
            />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border px-4 py-3"
            />

            <input
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-2xl border px-4 py-3"
            />

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Country
                </label>
                <span className="text-xs text-slate-400">Search and select one</span>
              </div>
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search countries"
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
              <div className="mt-2 grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                {filteredCountries.map((item) => {
                  const selected = country === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCountry(item.value)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        selected
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="text-lg">{item.emoji}</div>
                      <div className="mt-1 font-medium">{item.label}</div>
                    </button>
                  );
                })}
                {filteredCountries.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
                    No countries found.
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Languages
                </label>
                <span className="text-xs text-slate-400">Search and select multiple</span>
              </div>
              <input
                type="text"
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                placeholder="Search languages"
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
              <div className="mt-2 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {filteredLanguages.map((item) => {
                  const selected = languages.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setLanguages((prev) =>
                          prev.includes(item)
                            ? prev.filter((lang) => lang !== item)
                            : [...prev, item],
                        );
                      }}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                        selected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
                {filteredLanguages.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-2 text-sm text-slate-400">
                    No languages found.
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                You can select multiple languages.
              </p>
            </div>

            <textarea
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border px-4 py-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-3 text-white"
            >
              {loading ? 'Signing up...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}