import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getNotification, sendStoredNotification } from "@/lib/dermifyApi";

export default function ViewNotificationPage() {
  const router = useRouter();
  const { id } = router.query;
  const noteId = Number(id);

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Time formatting for phone mockup
  const [currentTimeStr, setCurrentTimeStr] = useState("10:00");
  useEffect(() => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    setCurrentTimeStr(`${hrs}:${mins}`);
  }, []);

  const fetchNotification = React.useCallback(() => {
    if (!noteId) return;
    setLoading(true);
    getNotification(noteId)
      .then((n) => setNote(n))
      .catch((err: any) => alert(err?.message || "Gagal memuat notifikasi"))
      .finally(() => setLoading(false));
  }, [noteId]);

  useEffect(() => {
    fetchNotification();
  }, [fetchNotification]);

  async function handleSend() {
    if (!noteId) return;
    if (!confirm("Kirim notifikasi ini sekarang ke target user?")) return;
    setSending(true);
    try {
      await sendStoredNotification(noteId);
      // reload
      const n = await getNotification(noteId);
      setNote(n);
    } catch (err: any) {
      alert(err?.message || "Gagal mengirim notifikasi");
    } finally {
      setSending(false);
    }
  }

  function formatDate(dateString?: string | null) {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return dateString;
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Memuat rincian notifikasi...</p>
      </div>
    );
  }

  const statusClass = 
    note?.status === "sent" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
    note?.status === "scheduled" ? "bg-blue-50 text-blue-700 border-blue-100" :
    note?.status === "failed" ? "bg-rose-50 text-rose-700 border-rose-100" :
    "bg-slate-100 text-slate-700 border-slate-200";

  const statusDot = 
    note?.status === "sent" ? "bg-emerald-500 animate-pulse" :
    note?.status === "scheduled" ? "bg-blue-500 animate-pulse" :
    note?.status === "failed" ? "bg-rose-500" :
    "bg-slate-400";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Rincian Notifikasi #{note?.id}</h1>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${statusClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
            {note?.status?.toUpperCase()}
          </span>
        </div>
        <Link 
          href="/admin/notifications" 
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-950 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </Link>
      </div>

      {/* Grid Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Detail Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-6">
            
            {/* Title & Body Card */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Judul Pesan</span>
                <p className="text-base font-semibold text-slate-900 mt-0.5">{note?.title}</p>
              </div>
              
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Isi Pesan (Body)</span>
                <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">{note?.body || <span className="text-slate-400 italic">Tidak ada isi pesan</span>}</p>
              </div>
            </div>

            {/* Target & Scheduling Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-5">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Target Penerima</span>
                <div className="mt-1.5">
                  {note?.topic ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 border border-teal-100/50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16" />
                      </svg>
                      Topic: {note.topic}
                    </span>
                  ) : note?.tokens && note.tokens.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {note.tokens.length} Devices
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500">Semua User (Global)</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Waktu Dibuat</span>
                <p className="text-sm font-medium text-slate-700 mt-1">{formatDate(note?.created_at)}</p>
              </div>

              {note?.scheduled_at && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Waktu Dijadwalkan</span>
                  <p className="text-sm font-medium text-slate-700 mt-1">{formatDate(note.scheduled_at)}</p>
                </div>
              )}

              {note?.sent_at && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Waktu Terkirim</span>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">{formatDate(note.sent_at)}</p>
                </div>
              )}
            </div>

            {/* Custom Data Payload JSON Inspector */}
            <div className="border-t border-slate-100 pt-5 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Custom Payload Data (JSON)</span>
              {note?.data && Object.keys(note.data).length > 0 ? (
                <div className="relative group">
                  <pre className="rounded-xl bg-slate-950 p-4 text-xs text-slate-200 overflow-x-auto font-mono max-h-48">
                    {JSON.stringify(note.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Tidak ada data tambahan yang disematkan.</p>
              )}
            </div>

            {/* Tokens list block */}
            {note?.tokens && note.tokens.length > 0 && (
              <div className="border-t border-slate-100 pt-5 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">List Target Tokens</span>
                <pre className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-600 overflow-x-auto font-mono max-h-40">
                  {JSON.stringify(note.tokens, null, 2)}
                </pre>
              </div>
            )}

            {/* Actions Panel */}
            {note?.status !== "sent" && (
              <div className="border-t border-slate-100 pt-5 flex justify-end">
                <button 
                  onClick={handleSend} 
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-indigo-500 hover:to-indigo-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Kirim Notifikasi Sekarang
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mock Preview Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Tampilan Notifikasi di Handphone</h3>

            {/* Phone Frame */}
            <div className="relative mx-auto max-w-[300px] aspect-[9/18.5] rounded-[38px] border-[6px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden ring-4 ring-slate-900/5">
              {/* Speaker & camera notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-slate-850 rounded-b-xl z-20 flex items-center justify-center gap-1.5 px-3">
                <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-slate-800 border border-slate-700 rounded-full"></div>
              </div>

              {/* Wallpaper */}
              <div className="w-full h-full bg-gradient-to-b from-[#1b1c30] via-[#3a3b5a] to-[#121323] p-4 flex flex-col justify-between relative">
                {/* Lock screen status bar */}
                <div className="flex justify-between items-center text-[10px] text-white/80 font-medium px-2 pt-1.5">
                  <span>{currentTimeStr}</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.22 19.58 10.57 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                    </svg>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 5H3a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z"/>
                    </svg>
                  </div>
                </div>

                {/* Clock */}
                <div className="text-center mt-6 select-none">
                  <h2 className="text-4xl font-light text-white/90 tracking-wide">{currentTimeStr}</h2>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest mt-1 font-semibold">
                    {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>

                {/* Notification bubble */}
                <div className="absolute top-[32%] left-3 right-3 z-10">
                  <div className="rounded-2xl bg-white/85 backdrop-blur-lg border border-white/20 p-3.5 shadow-xl text-slate-800 shadow-slate-950/20">
                    <div className="flex items-center justify-between border-b border-slate-700/10 pb-1.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        {/* Mock App Icon */}
                        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                          D
                        </div>
                        <span className="text-[10px] font-bold tracking-wide uppercase text-slate-600">Dermify</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-medium">Baru saja</span>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900 break-words leading-tight">{note?.title}</h4>
                      <p className="text-[10px] text-slate-600 break-words leading-snug">{note?.body || <span className="text-slate-400 italic">Tidak ada isi pesan</span>}</p>
                    </div>
                  </div>
                </div>

                {/* Swipe indicator */}
                <div className="flex flex-col items-center gap-1.5 pb-2">
                  <div className="w-4 h-4 text-white/50 animate-bounce">
                    <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/>
                    </svg>
                  </div>
                  <div className="w-24 h-1 bg-white/70 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

