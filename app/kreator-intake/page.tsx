"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const VERSION_TYPES = [
  "master",
  "demo",
  "instro",
  "piano-vocal",
  "stripped",
  "stem",
  "lyrics",
  "artwork",
  "voice-note",
  "metadata",
  "legal-credit-document",
  "other",
];

function normalizeTitle(raw: string) {
  return raw
    .replace(/\.(mp3|wav|m4a|aif|aiff|flac|txt|pdf|docx|png|jpg|jpeg)$/i, "")
    .replace(/^\s*\d{1,4}\s*[-–—]\s*/u, "")
    .replace(/^\s*(KLEIGH|KLE\$IGH|Music Maykers|Lloyd G Miller|Lloyd Miller|Elle Christine|G Putnam Music|Michael Clay)\s*[-–—]\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function KreatorIntakePage() {
  const [kreatorName, setKreatorName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [versionType, setVersionType] = useState("master");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<string>("");
  const [sending, setSending] = useState(false);

  const cleanTitle = useMemo(() => normalizeTitle(songTitle), [songTitle]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!files || files.length === 0) {
      setStatus("Please choose at least one file.");
      return;
    }

    setSending(true);
    setStatus("Submitting intake package…");

    const form = new FormData();
    form.set("kreator_name", kreatorName);
    form.set("email", email);
    form.set("role", role);
    form.set("song_title_raw", songTitle);
    form.set("song_title_clean", cleanTitle);
    form.set("version_type", versionType);
    form.set("notes", notes);

    Array.from(files).forEach((file) => {
      form.append("files", file);
    });

    try {
      const res = await fetch("/api/kreator-intake", {
        method: "POST",
        body: form,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Upload failed.");
      }

      setStatus(`Received. Intake ID: ${json.intake_id}. Files: ${json.files?.length || 0}. Admin review required before anything becomes public.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#160d08] text-[#F5e6c8]">
      <Header />

      <section className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm font-black uppercase tracking-[0.28em] text-[#FFD54F]">
          Intake Portal
        </p>

        <h1 className="mt-4 text-4xl font-black sm:text-5xl">
          GPM Artist & Kreator Intake
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#E8CFA8]">
          Submit songs, demos, stems, lyrics, artwork, credits, notes, and reference files for G Putnam Music review.
          Everything enters intake first. Nothing becomes public until it is reviewed.
        </p>

        <div className="mt-8 rounded-3xl border border-[#FFD54F]/30 bg-[#24180f] p-6">
          <h2 className="text-xl font-black text-[#FFD54F]">Title rule</h2>
          <p className="mt-2 text-[#E8CFA8]">
            The song title field should contain the song title only. No artist prefix, no track number, no raw filename.
          </p>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
              <p className="font-black text-green-200">Correct</p>
              <p>Thank You</p>
              <p>God Only Knows</p>
              <p>Down Baby - Instrumental</p>
            </div>
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="font-black text-red-200">Do not use</p>
              <p>KLEIGH - Thank You</p>
              <p>003 - Artist - Song Title</p>
              <p>G Putnam Music - Song Title</p>
            </div>
          </div>
        </div>


        <div className="mt-8 rounded-3xl border border-[#D4A017]/25 bg-[#1A1207] p-6">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#FFD54F]">
            Fair review policy
          </p>
          <p className="mt-3 text-[#E8CFA8] leading-relaxed">
            Initial interest is free. If a work is selected for deeper review, GPM may offer a paid review path.
            Review fees cover real intake labor and do not guarantee acceptance, public release, sales, licensing,
            placement, or use.
          </p>
          <p className="mt-3 text-sm text-[#C8A882] leading-relaxed">
            GPM may waive or reduce fees for invited artists, legacy collaborators, hardship cases, strategic partners,
            or works with exceptional fit. Major artists, labels, publishers, estates, and catalog owners should request
            a direct review call for a custom proposal.
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-5 rounded-3xl border border-[#5C3A1E]/70 bg-[#2A1506] p-6 shadow-2xl">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-[#FFD54F]">Kreator name</span>
              <input
                value={kreatorName}
                onChange={(e) => setKreatorName(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-[#5C3A1E] bg-[#160d08] px-4 py-3 text-[#F5e6c8]"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-[#FFD54F]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border border-[#5C3A1E] bg-[#160d08] px-4 py-3 text-[#F5e6c8]"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-[#FFD54F]">Role</span>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="vocalist, songwriter, producer, engineer, musician, artist, other"
              className="mt-2 w-full rounded-xl border border-[#5C3A1E] bg-[#160d08] px-4 py-3 text-[#F5e6c8]"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-[#FFD54F]">Song / work title</span>
              <input
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                required
                placeholder="Title only"
                className="mt-2 w-full rounded-xl border border-[#5C3A1E] bg-[#160d08] px-4 py-3 text-[#F5e6c8]"
              />
              <p className="mt-2 text-xs text-[#C8A882]">Normalized preview: {cleanTitle || "—"}</p>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-[#FFD54F]">Upload type / version</span>
              <select
                value={versionType}
                onChange={(e) => setVersionType(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[#5C3A1E] bg-[#160d08] px-4 py-3 text-[#F5e6c8]"
              >
                {VERSION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-[#FFD54F]">Files</span>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="mt-2 w-full rounded-xl border border-[#5C3A1E] bg-[#160d08] px-4 py-3 text-[#F5e6c8]"
            />
            <p className="mt-2 text-xs text-[#C8A882]">
              Choose files from your computer. Multiple files are allowed. Submissions enter review before any public use.
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-[#FFD54F]">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Credits, lyrics notes, version notes, project context, or anything GPM should know."
              className="mt-2 w-full rounded-xl border border-[#5C3A1E] bg-[#160d08] px-4 py-3 text-[#F5e6c8]"
            />
          </label>

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full bg-[#FFD54F] px-6 py-4 text-sm font-black uppercase tracking-wider text-[#2A1506] hover:bg-[#FFE082] disabled:opacity-60"
          >
            {sending ? "Submitting…" : "Submit Catalog for Review"}
          </button>

          {status && (
            <p className="rounded-2xl border border-[#FFD54F]/30 bg-[#160d08] p-4 text-sm text-[#F5e6c8]">
              {status}
            </p>
          )}
        </form>
      </section>

      <Footer />
    </main>
  );
}
