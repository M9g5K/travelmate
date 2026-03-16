'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import TopNav from '@/components/top-nav';
import { useRouter } from 'next/navigation';

type Me = {
  nickname?: string;
  country?: string;
  languages?: string[];
  bio?: string;
  profileImageUrl?: string | null;
};

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [nickname, setNickname] = useState('');
  const [country, setCountry] = useState('');
  const [languages, setLanguages] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMe();
  }, []);

  async function loadMe() {
    try {
      const res = await api.get('/me');
      const me: Me = res.data ?? {};

      setNickname(me.nickname ?? '');
      setCountry(me.country ?? '');
      setLanguages((me.languages ?? []).join(', '));
      setBio(me.bio ?? '');
      setProfileImageUrl(me.profileImageUrl ?? '');
    } catch (e) {
      console.error(e);
      alert('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function uploadImage() {
    if (!selectedFile) {
      alert('Please choose an image first');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.post('/me/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updated = res.data?.data ?? {};
      setProfileImageUrl(updated.profileImageUrl ?? '');
      setSelectedFile(null);
      alert('Profile image uploaded!');
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message
          ? JSON.stringify(e.response.data.message)
          : 'Failed to upload image';
      alert(msg);
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile() {
    try {
      setSaving(true);

      await api.put('/me/profile', {
        nickname,
        country,
        languages: languages
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        bio,
        profileImageUrl: profileImageUrl || null,
      });

      alert('Profile updated!');
      router.push('/me');
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message
          ? JSON.stringify(e.response.data.message)
          : 'Failed to update profile';
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <TopNav />
        <div className="p-10 text-center text-sm text-slate-500">
          Loading profile...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <TopNav />

      <div className="mx-auto max-w-2xl px-6 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Edit Profile</h1>
          <p className="text-sm text-slate-500">
            Update your public profile information
          </p>
        </header>

        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Current Profile Image
            </label>

            <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="shrink-0">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="profile"
                    className="h-24 w-24 rounded-full object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white">
                    {nickname?.slice(0, 1).toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-left transition hover:border-slate-400 hover:bg-slate-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-slate-200">
                      🖼️
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">
                        Choose a profile image
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Click this box to select an image from your computer.
                      </p>
                      <p className="mt-3 text-xs text-slate-400">
                        JPG, PNG, WEBP up to 5MB
                      </p>
                    </div>
                  </div>
                </button>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
                    {selectedFile ? selectedFile.name : 'No file selected'}
                  </span>

                  <button
                    type="button"
                    onClick={uploadImage}
                    disabled={uploading}
                    className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Nickname</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your nickname"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="KR / US / JP"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Languages</label>
            <input
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="ko, en"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
            <p className="mt-2 text-xs text-slate-500">
              Separate languages with commas.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a little about yourself..."
              rows={5}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/me')}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}