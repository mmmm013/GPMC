'use client';

/**
 * /creator/[brand]
 *
 * Brand-scoped Creator Portal.
 * Auth: WebAuthn biometric via gpmc_creator_session cookie.
 * Each creator sees only their own assets, scoped to their brand.
 *
 * KLEIGH:  Audio · Image · Lyrics
 * MSJ:     Audio · PDF · KEZ Campaign assets (+ Awesome Squad badge w/ ZG)
 * ZG:      Lyrics · Vocal Demos           (+ Awesome Squad badge w/ MSJ)
 * LGM:     Visual Art · Studio Photos
 * PIXIE:   Two tabs — HERB BLOG (rich-text) + PLAYLIST (drag-sort 2hr GPM FP)
 */

import { useEffect, useState, useCallback, useRef , type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  startAuthentication,
} from '@simplewebauthn/browser';
import { getCreatorBySlug, CREATORS, type Creator, type CreatorScope } from '@/config/creators';
import Link from 'next/link';
import { Upload, Trash2, Eye, EyeOff, Music, Image as Img, FileText, Video } from 'lucide-react';
import GpmBot from '@/components/GpmBot';
import { createClient } from '@supabase/supabase-js';
import SchererFlyBy from '@/components/SchererFlyBy';

// GD-BOT journey steps for all creators
// Creators only bio-access + upload — 4PE-MSC handles ingestion automatically.
const CREATOR_JOURNEY = [
  { title: 'Identity verified ✓', hint: 'Biometric access confirmed. You are securely inside your brand portal.' },
  { title: 'Choose your content type', hint: 'Select the scope that matches what you are uploading (Audio, Image, Blog post, etc.).' },
  { title: 'Upload your file', hint: 'Drag & drop or tap "Upload" to add your media. That\'s all you need to do.' },
  { title: '4PE-MSC ingests automatically', hint: 'The G Putnam Music Engine processes, tags, and stores your file. No action needed.' },
  { title: 'Review & publish', hint: 'See your assets below. Toggle the eye icon to publish or unpublish at any time.' },
];

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
interface Asset {
  id: string;
  brand: string;
  file_url: string;
  file_type: string;
  scope: CreatorScope;
  label: string;
  meta: Record<string, string>;
  is_published: boolean;
  uploaded_at: string;
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function scopeIcon(scope: CreatorScope) {
  if (scope === 'AUDIO' || scope === 'VOCAL_DEMO') return <Music className="w-4 h-4" />;
  if (scope === 'IMAGE' || scope === 'VISUAL_ART' || scope === 'STUDIO_PHOTO') return <Img className="w-4 h-4" />;
  if (scope === 'HERB_BLOG') return <FileText className="w-4 h-4" />;
  if (scope === 'KEZ_CAMPAIGN') return <Video className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}

function humanScope(scope: CreatorScope): string {
  return scope.replace(/_/g, ' ');
}

// ----------------------------------------------------------------
// Portal shell
// ----------------------------------------------------------------
export default function CreatorPortalPage() {
  const { brand } = useParams<{ brand: string }>();
  const router    = useRouter();
  const creator   = getCreatorBySlug(brand ?? '');

  const [authed,  setAuthed]  = useState(false);
  const [authMsg, setAuthMsg] = useState('');
  const [classicUserId, setClassicUserId] = useState('');
  const [classicPassword, setClassicPassword] = useState('');
  const [classicBusy, setClassicBusy] = useState(false);
  const [assets,  setAssets]  = useState<Asset[]>([]);
  const [activeScope, setActiveScope] = useState<CreatorScope | 'ALL'>('ALL');
  const [activeTab, setActiveTab]     = useState<'HERB_BLOG' | 'GPM_FP_PLAYLIST'>('HERB_BLOG');
  const [uploading, setUploading]     = useState(false);
  const [uploadMsg, setUploadMsg]     = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // PIXIE blog editor state
  const [blogTitle,   setBlogTitle]   = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [savingBlog,  setSavingBlog]  = useState(false);
  const [blogMsg,     setBlogMsg]     = useState('');

  // ----------------------------------------------------------------
  // Auth: biometric login
  // ----------------------------------------------------------------
  async function handleBiometricLogin() {
    if (!creator) return;
    setAuthMsg('Requesting authentication options…');
    try {
      const optRes = await fetch('/api/creator/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: creator.brand, phase: 'options' }),
      });
      if (!optRes.ok) {
        const err = await optRes.json();
        throw new Error(err.error ?? 'Failed to get auth options');
      }
      const options = await optRes.json();

      setAuthMsg('Complete biometric verification…');
      const credential = await startAuthentication({ optionsJSON: options });

      const verRes = await fetch('/api/creator/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: creator.brand, phase: 'verify', credential }),
      });
      if (!verRes.ok) {
        const err = await verRes.json();
        throw new Error(err.error ?? 'Auth failed');
      }
      setAuthed(true);
      setAuthMsg('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthMsg(`❌ ${msg}`);
    }
  }

  async function handlePasswordLogin() {
    if (!creator) return;
    if (!classicUserId.trim() || !classicPassword) {
      setAuthMsg('Please enter user ID and password.');
      return;
    }

    setClassicBusy(true);
    setAuthMsg('Verifying credentials…');

    try {
      const res = await fetch('/api/creator/password-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: creator.brand,
          userId: classicUserId.trim(),
          password: classicPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Classic login failed');
      }

      setAuthed(true);
      setClassicPassword('');
      setAuthMsg('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthMsg(`❌ ${msg}`);
    } finally {
      setClassicBusy(false);
    }
  }

  // ----------------------------------------------------------------
  // Load assets
  // ----------------------------------------------------------------
  const loadAssets = useCallback(async () => {
    const res = await fetch('/api/creator/assets', { credentials: 'include' });
    if (res.ok) {
      const json = await res.json();
      setAssets(json.assets ?? []);
    }
  }, []);

  useEffect(() => {
    if (authed) loadAssets();
  }, [authed, loadAssets]);

  // ----------------------------------------------------------------
  // Upload handler
  // ----------------------------------------------------------------
  async function handleUpload(scope: CreatorScope, file: File, label: string) {
    setUploading(true);
    setUploadMsg('Uploading…');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('scope', scope);
    fd.append('label', label);
    const res = await fetch('/api/creator/upload', { method: 'POST', body: fd, credentials: 'include' });
    if (res.ok) {
      setUploadMsg('✅ Uploaded');
      await loadAssets();
    } else {
      const err = await res.json();
      setUploadMsg(`❌ ${err.error}`);
    }
    setUploading(false);
  }

  // ----------------------------------------------------------------
  // Delete handler
  // ----------------------------------------------------------------
  async function handleDelete(id: string) {
    if (!confirm('Delete this asset?')) return;
    await fetch(`/api/creator/assets?id=${id}`, { method: 'DELETE', credentials: 'include' });
    setAssets((a) => a.filter((x) => x.id !== id));
  }

  // ----------------------------------------------------------------
  // Toggle published
  // ----------------------------------------------------------------
  async function handleTogglePublish(asset: Asset) {
    await fetch('/api/creator/assets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: asset.id, is_published: !asset.is_published }),
    });
    setAssets((prev) =>
      prev.map((a) => a.id === asset.id ? { ...a, is_published: !a.is_published } : a)
    );
  }

  // ----------------------------------------------------------------
  // Save herb-blog post
  // ----------------------------------------------------------------
  async function handleSaveBlog() {
    if (!blogTitle.trim() || !blogContent.trim()) {
      setBlogMsg('Title and content are required.');
      return;
    }
    setSavingBlog(true);
    setBlogMsg('Saving post…');
    const blob  = new Blob([JSON.stringify({ title: blogTitle, content: blogContent })], { type: 'text/plain' });
    const file  = new File([blob], `${Date.now()}-blog.txt`, { type: 'text/plain' });
    await handleUpload('HERB_BLOG', file, blogTitle);
    setBlogTitle('');
    setBlogContent('');
    setBlogMsg('✅ Post saved');
    setSavingBlog(false);
  }

  // ----------------------------------------------------------------
  // Guard: unknown brand
  // ----------------------------------------------------------------
  if (!creator) {
    return (
      <main className="min-h-screen bg-[#1a1207] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Unknown creator brand: <code>{brand}</code></p>
          <Link href="/creator/enroll" className="text-[#FFD54F] text-sm hover:underline">→ Enroll a creator</Link>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------------
  // Auth gate
  // ----------------------------------------------------------------
  if (!authed) {
    const isPixie = creator.brand === 'PIXIE';
    return (
      <main className="min-h-screen bg-[#1a1207] text-white flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold tracking-widest mb-1">
            <span className="text-[#FFD54F]">{creator.displayName}</span>
          </h1>
          <p className="text-white/40 text-sm mb-2">{creator.role}</p>
          <p className="text-white/30 text-xs mb-6">{creator.tagline}</p>
          {creator.brand === 'MSJ' && <SchererFlyBy />}

          {/* PIXIE-BOT guided walk-through */}
          {isPixie && (
            <div className="mb-6 rounded-2xl p-4 text-left bg-[#a8cc7f]/5 border border-[#a8cc7f]/20">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-[#a8cc7f]">🤖 PIXIE-BOT · How to get in</p>
              <ol className="space-y-2 text-xs text-white/60">
                <li className="flex gap-2">
                  <span className="text-[#FFD54F] font-bold shrink-0">①</span>
                  <span><strong className="text-white/80">First time only:</strong> Ask admin to open{' '}
                    <code className="text-[#FFD54F] text-[0.7rem]">gputnammusic.com/creator/enroll?brand=PIXIE</code>{' '}
                    on <em>this device</em>, then tap <strong>Enroll PIXIE</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#FFD54F] font-bold shrink-0">②</span>
                  <span>Once enrolled, tap <strong className="text-white/80">Biometric Login</strong> below and use Face ID or Touch ID.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#FFD54F] font-bold shrink-0">③</span>
                  <span>You&apos;re in! Write posts in <strong className="text-[#a8cc7f]">🌱 Herb Blog</strong> or upload your curated playlist.</span>
                </li>
              </ol>
              <p className="mt-3 text-xs text-white/30">Session stays active 4 hours. Biometric is preferred, with classic login available if enabled.</p>
            </div>
          )}

          <button
            onClick={handleBiometricLogin}
            className="w-full py-3 rounded-xl font-bold tracking-widest text-sm bg-[#FFD54F] text-black hover:bg-yellow-300 transition-all"
          >
            🔐 Biometric Login
          </button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-white/35">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40 mb-2">Classic Login</p>
            <input
              type="text"
              value={classicUserId}
              onChange={(e) => setClassicUserId(e.target.value)}
              placeholder="User ID"
              autoComplete="username"
              className="w-full rounded-md bg-black/20 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFD54F]/50 mb-2"
            />
            <input
              type="password"
              value={classicPassword}
              onChange={(e) => setClassicPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handlePasswordLogin();
                }
              }}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full rounded-md bg-black/20 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFD54F]/50 mb-2"
            />
            <button
              onClick={() => { void handlePasswordLogin(); }}
              disabled={classicBusy}
              className="w-full py-2 rounded-md font-bold tracking-wider text-xs bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
            >
              {classicBusy ? 'Authenticating…' : 'Use User ID + Password'}
            </button>
          </div>

          {authMsg && (
            <p className="mt-4 text-sm text-white/50">{authMsg}</p>
          )}

          <p className="mt-6 text-white/20 text-xs">
            Not enrolled? Contact admin to run{' '}
            <Link href={`/creator/enroll?brand=${creator.brand}`} className="text-[#FFD54F]/60 hover:underline">
              enrollment
            </Link>.
          </p>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------------
  // Filtered assets
  // ----------------------------------------------------------------
  const filtered = assets.filter((a) =>
    activeScope === 'ALL' || a.scope === activeScope
  );

  // ----------------------------------------------------------------
  // PIXIE portal: two-tab layout
  // ----------------------------------------------------------------
  if (creator.brand === 'PIXIE') {
    const blogPosts = assets.filter((a) => a.scope === 'HERB_BLOG');
    const playlists = assets.filter((a) => a.scope === 'GPM_FP_PLAYLIST');

    return (
      <main className="min-h-screen bg-[#1a1207] text-white">
        <PortalHeader creator={creator} onLogout={() => { setAuthed(false); router.push('/flagship.go'); }} />

        {/* GD-BOT: creator journey guide */}
        <div className="max-w-3xl mx-auto px-4 pt-4 flex justify-end">
          <GpmBot
            bot="GD-BOT"
            steps={CREATOR_JOURNEY}
            startCollapsed={true}
            className="max-w-xs w-full"
          />
        </div>

        {/* Tab switcher */}
        <div className="max-w-3xl mx-auto px-4 pt-2">
          <div className="flex gap-2 mb-6">
            {(['HERB_BLOG', 'GPM_FP_PLAYLIST'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-[#FFD54F] text-black'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {tab === 'HERB_BLOG' ? "🌿 HERB BLOG" : "🎵 GPM FP PLAYLIST"}
              </button>
            ))}
          </div>

          {/* HERB BLOG tab */}
          {activeTab === 'HERB_BLOG' && (
            <div>
              <h2 className="text-lg font-bold text-[#FFD54F] mb-1">PIXIE&apos;s PIX — New Post</h2>
              <p className="text-white/30 text-xs mb-4">Write freely, Jane — your voice is the heart of this page. 🌿</p>

              {/* AI writing prompt chips */}
              <div className="mb-3">
                <p className="text-white/30 text-xs mb-2 uppercase tracking-widest">Prompt ideas</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "What I found growing this week…",
                    "An herb I've been thinking about…",
                    "A memory tied to a plant…",
                    "Seasonal foraging notes",
                    "A remedy I trust",
                    "The garden right now…",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setBlogContent((c) => c ? c + '\n\n' + prompt : prompt)}
                      className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-white/50 hover:bg-[#a8cc7f]/10 hover:border-[#a8cc7f]/30 hover:text-[#a8cc7f] transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Post title…"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white mb-3 focus:outline-none focus:border-[#FFD54F]/50"
              />
              <textarea
                placeholder="Write about herbal gardening, nature, or anything from PIXIE's world…"
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                rows={10}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white mb-3 focus:outline-none focus:border-[#FFD54F]/50 resize-y"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveBlog}
                  disabled={savingBlog}
                  className="px-6 py-2 rounded-lg bg-[#FFD54F] text-black font-bold text-sm hover:bg-yellow-300 disabled:opacity-40"
                >
                  {savingBlog ? 'Saving…' : 'Save Post'}
                </button>
                {blogMsg && <p className="text-sm text-white/50">{blogMsg}</p>}
              </div>

              <AssetList assets={blogPosts} onDelete={handleDelete} onTogglePublish={handleTogglePublish} />
            </div>
          )}

          {/* GPM FP PLAYLIST tab */}
          {activeTab === 'GPM_FP_PLAYLIST' && (
            <PixiePlaylistEditor
              assets={playlists}
              onUpload={handleUpload}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          )}
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------------
  // Standard portal (all other creators)
  // ----------------------------------------------------------------
  return (
    <main className="min-h-screen bg-[#1a1207] text-white">
      <PortalHeader creator={creator} onLogout={() => { setAuthed(false); }} />

      <div className="max-w-3xl mx-auto px-4 pt-4">
        {/* GD-BOT: creator journey guide — bio-access + upload, that's it */}
        <div className="flex justify-end mb-4">
          <GpmBot
            bot="GD-BOT"
            steps={CREATOR_JOURNEY}
            startCollapsed={true}
            className="max-w-xs w-full"
          />
        </div>

        {/* Awesome Squad badge for MSJ + ZG */}
        {(creator.brand === 'MSJ' || creator.brand === 'ZG') && (
          <div className="mb-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-[#FFD54F] text-sm font-bold">⚡ The Awesome Squad</span>
            {creator.pairedWith && (
              <span className="text-white/40 text-xs">
                — paired with {CREATORS.find((c) => c.brand === creator.pairedWith)?.displayName}
              </span>
            )}
          </div>
        )}

        {creator.brand === 'MSJ' && <SchererFlyBy />}

        {/* Scope filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <ScopeTab active={activeScope === 'ALL'} onClick={() => setActiveScope('ALL')} label="All" />
          {creator.scope.map((s) => (
            <ScopeTab key={s} active={activeScope === s} onClick={() => setActiveScope(s)} label={humanScope(s)} />
          ))}
        </div>

        {/* Upload zone */}
        <UploadZone
          creator={creator}
          activeScope={activeScope === 'ALL' ? creator.scope[0] : activeScope}
          uploading={uploading}
          uploadMsg={uploadMsg}
          fileInputRef={fileInputRef}
          onUpload={handleUpload}
        />

        {/* Asset list */}
        <AssetList assets={filtered} onDelete={handleDelete} onTogglePublish={handleTogglePublish} />
      </div>
    </main>
  );
}

// ----------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------

function PortalHeader({ creator, onLogout }: { creator: Creator; onLogout: () => void }) {
  return (
    <div className="border-b border-white/10 px-4 py-4 flex items-center justify-between max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-widest">
          <span className="text-[#FFD54F]">{creator.displayName}</span>
          <span className="text-white/40 text-sm ml-2 font-normal">Creator Portal</span>
        </h1>
        <p className="text-white/30 text-xs">{creator.tagline}</p>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/herb-blog" className="text-white/30 text-xs hover:text-white/60">Public Page</Link>
        <button onClick={onLogout} className="text-white/30 text-xs hover:text-white/60">Log out</button>
        <Link href="/flagship.go" className="text-white/20 text-xs hover:text-white/40">← GPM</Link>
      </div>
    </div>
  );
}

function ScopeTab({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all ${
        active ? 'bg-[#FFD54F] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}

function UploadZone({
  creator, activeScope, uploading, uploadMsg, fileInputRef, onUpload,
}: {
  creator: Creator;
  activeScope: CreatorScope;
  uploading: boolean;
  uploadMsg: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (scope: CreatorScope, file: File, label: string) => void;
}) {
  const [label, setLabel] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setPendingFile(f);
    if (f && !label) setLabel(f.name.replace(/\.[^.]+$/, ''));
  }

  async function handleSubmit() {
    if (!pendingFile) return;
    await onUpload(activeScope, pendingFile, label);
    setPendingFile(null);
    setLabel('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="mb-6 bg-white/5 border border-dashed border-white/20 rounded-xl p-5">
      <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
        Upload — <span className="text-[#FFD54F]">{humanScope(activeScope)}</span>
      </p>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-white/50 mb-3
          file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0
          file:text-xs file:font-bold file:bg-[#FFD54F]/20 file:text-[#FFD54F]
          hover:file:bg-[#FFD54F]/30"
      />
      {pendingFile && (
        <>
          <input
            type="text"
            placeholder="Label / title…"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-3 focus:outline-none focus:border-[#FFD54F]/50"
          />
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#FFD54F] text-black font-bold text-sm hover:bg-yellow-300 disabled:opacity-40"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Submit to GPM 4PE-MSC'}
          </button>
        </>
      )}
      {uploadMsg && <p className="mt-2 text-sm text-white/50">{uploadMsg}</p>}
    </div>
  );
}

function AssetList({
  assets, onDelete, onTogglePublish,
}: {
  assets: Asset[];
  onDelete: (id: string) => void;
  onTogglePublish: (asset: Asset) => void;
}) {
  if (assets.length === 0) {
    return <p className="text-white/20 text-sm text-center py-8">No assets yet.</p>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs text-white/30 uppercase tracking-widest">Submitted Assets</h3>
      {assets.map((asset) => (
        <div key={asset.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-white/30 mt-0.5">{scopeIcon(asset.scope)}</span>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{asset.label || asset.file_type}</p>
              <p className="text-white/30 text-xs mt-0.5">{humanScope(asset.scope)} · {new Date(asset.uploaded_at).toLocaleDateString()}</p>
              <a href={asset.file_url} target="_blank" rel="noopener noreferrer" className="text-[#FFD54F]/60 text-xs hover:underline">View file ↗</a>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onTogglePublish(asset)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/70 transition-all"
              title={asset.is_published ? 'Unpublish' : 'Publish'}
            >
              {asset.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onDelete(asset.id)}
              className="p-1.5 rounded-lg hover:bg-red-900/40 text-white/20 hover:text-red-400 transition-all"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------
// PIXIE: drag-sort playlist editor (2hr GPM FP curation)
// Fetches from the GPM tracks table — same source as HomeFP.
// KLEIGH_LIBRARY / K-KUTs are NOT used here (unrelated to PIXIE).
// ----------------------------------------------------------------

interface FPCatalogTrack {
  id: string | number;
  title: string;
  artist?: string;
  durationSeconds?: number;
}

function PixiePlaylistEditor({
  assets, onUpload, onDelete, onTogglePublish,
}: {
  assets: Asset[];
  onUpload: (scope: CreatorScope, file: File, label: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (asset: Asset) => void;
}) {
  const [catalog, setCatalog]   = useState<FPCatalogTrack[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selected, setSelected] = useState<FPCatalogTrack[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');
  const [search, setSearch] = useState('');

  // Load GPM FP catalog from Supabase on mount
  useEffect(() => {
    async function loadCatalog() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) { setCatalogLoading(false); return; }
      const sb = createClient(url, key);
      const { data } = await sb
        .from('tracks')
        .select('id, title, artist')
        .not('url', 'is', null)
        .neq('url', '')
        .order('title', { ascending: true })
        .limit(500);
      if (data && data.length > 0) {
        setCatalog(data.map((r) => ({ id: String(r.id), title: r.title ?? 'Unknown', artist: r.artist })));
      } else {
        // fallback to gpm_tracks table
        const { data: alt } = await sb
          .from('gpm_tracks')
          .select('id, title, artist')
          .not('audio_url', 'is', null)
          .neq('audio_url', '')
          .order('title', { ascending: true })
          .limit(500);
        if (alt) {
          setCatalog(alt.map((r) => ({ id: String(r.id), title: r.title ?? 'Unknown', artist: r.artist })));
        }
      }
      setCatalogLoading(false);
    }
    loadCatalog();
  }, []);

  function addTrack(track: FPCatalogTrack) {
    if (selected.find((t) => t.id === track.id)) return;
    setSelected((prev) => [...prev, track]);
  }

  function removeTrack(id: string | number) {
    setSelected((prev) => prev.filter((t) => t.id !== id));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setSelected((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  }

  function moveDown(index: number) {
    setSelected((prev) => {
      if (index >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  }

  const totalMinutes = selected.reduce((acc, t) => acc + (t.durationSeconds ?? 240) / 60, 0);

  const filteredCatalog = search.trim()
    ? catalog.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || (t.artist ?? '').toLowerCase().includes(search.toLowerCase()))
    : catalog;

  async function savePlaylist() {
    if (selected.length === 0) { setMsg('Add at least one track.'); return; }
    setSaving(true);
    setMsg('Saving playlist…');
    const playlistJson = JSON.stringify({
      curator: 'PIXIE',
      created: new Date().toISOString(),
      targetMinutes: 120,
      tracks: selected.map((t) => ({ id: t.id, title: t.title, durationSeconds: t.durationSeconds ?? 240 })),
    });
    const blob = new Blob([playlistJson], { type: 'application/json' });
    const file = new File([blob], `pixie-fp-playlist-${Date.now()}.json`, { type: 'application/json' });
    await onUpload('GPM_FP_PLAYLIST', file, `PIXIE FP Playlist — ${new Date().toLocaleDateString()}`);
    setMsg('✅ Playlist saved');
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#FFD54F]">GPM FP Playlist Curation</h2>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          totalMinutes >= 115 && totalMinutes <= 125
            ? 'bg-green-900/40 text-green-300'
            : 'bg-white/5 text-white/40'
        }`}>
          {Math.round(totalMinutes)} / 120 min
        </span>
      </div>
      <p className="text-white/30 text-xs mb-4">Select GPM tracks to include. Reorder with ↑↓. Target: 2 hours (120 min).</p>

      {/* Track catalog search + list */}
      <div className="mb-4 bg-white/3 rounded-xl p-3 border border-white/10">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-2">GPM Catalog</p>
        <input
          type="text"
          placeholder="Search tracks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs mb-2 focus:outline-none focus:border-[#FFD54F]/40"
        />
        <div className="max-h-44 overflow-y-auto space-y-1">
          {catalogLoading ? (
            <p className="text-white/30 text-xs py-2 animate-pulse">Loading catalog…</p>
          ) : filteredCatalog.length === 0 ? (
            <p className="text-white/20 text-xs py-2">No tracks found.</p>
          ) : filteredCatalog.map((t) => (
            <button
              key={t.id}
              onClick={() => addTrack(t)}
              disabled={!!selected.find((s) => s.id === t.id)}
              className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {t.title}
              {t.artist && <span className="text-white/30 ml-2 text-xs">{t.artist}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Selected playlist */}
      <div className="space-y-1 mb-4">
        {selected.length === 0 && (
          <p className="text-white/20 text-sm text-center py-4">No tracks selected yet.</p>
        )}
        {selected.map((t, i) => (
          <div key={t.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <span className="text-white/30 text-xs w-5 text-right">{i + 1}</span>
            <span className="flex-1 text-sm text-white truncate">{t.title}</span>
            {t.artist && <span className="text-white/30 text-xs shrink-0">{t.artist}</span>}
            {t.durationSeconds && <span className="text-white/30 text-xs shrink-0">{Math.round(t.durationSeconds / 60)}m</span>}
            <div className="flex gap-1">
              <button onClick={() => moveUp(i)}   className="text-white/30 hover:text-white px-1">↑</button>
              <button onClick={() => moveDown(i)} className="text-white/30 hover:text-white px-1">↓</button>
              <button onClick={() => removeTrack(t.id)} className="text-red-400/50 hover:text-red-400 px-1">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={savePlaylist}
          disabled={saving}
          className="px-6 py-2 rounded-lg bg-[#FFD54F] text-black font-bold text-sm hover:bg-yellow-300 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Submit Playlist'}
        </button>
        {msg && <p className="text-sm text-white/50">{msg}</p>}
      </div>

      {/* Saved playlists */}
      <AssetList assets={assets} onDelete={onDelete} onTogglePublish={onTogglePublish} />
    </div>
  );
}
