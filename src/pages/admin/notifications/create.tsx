import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { createNotification } from "@/lib/dermifyApi";

export default function CreateNotificationPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dataText, setDataText] = useState("");
  const [targetType, setTargetType] = useState<"all" | "topic" | "tokens">("all");
  const [topic, setTopic] = useState("");
  const [tokensText, setTokensText] = useState("");
  const [schedulingType, setSchedulingType] = useState<"now" | "schedule">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format date helper for the mockup preview
  const [currentTimeStr, setCurrentTimeStr] = useState("10:00");
  useEffect(() => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    setCurrentTimeStr(`${hrs}:${mins}`);
  }, []);

  function tryFormatDataString(text?: string): string | null {
    if (!text) return null;
    const t = text.trim();
    if (!t) return null;
    try {
      let parsed: any = JSON.parse(t);
      if (typeof parsed === "string") {
        const inner = parsed.trim();
        if ((inner.startsWith("{") && inner.endsWith("}")) || (inner.startsWith("[") && inner.endsWith("]"))) {
          try {
            parsed = JSON.parse(inner);
          } catch {}
        }
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      try {
        const first = JSON.parse(t);
        if (typeof first === "string") {
          const second = JSON.parse(first);
          return JSON.stringify(second, null, 2);
        }
      } catch {}
      return null;
    }
  }

  function formatTokensString(text?: string): string | null {
    if (!text) return null;
    const t = text.trim();
    if (!t) return null;
    try {
      let parsed: any = JSON.parse(t);
      if (typeof parsed === "string") {
        try {
          const inner = JSON.parse(parsed);
          if (Array.isArray(inner)) parsed = inner;
        } catch {}
      }
      if (Array.isArray(parsed)) return JSON.stringify(parsed);
      return JSON.stringify([String(parsed)]);
    } catch {
      const arr = t.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      return JSON.stringify(arr);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title wajib diisi");
      return;
    }

    // Auto-format data and tokens before processing
    const formattedDataText = tryFormatDataString(dataText?.trim());
    if (formattedDataText !== null) setDataText(formattedDataText);
    const formattedTokensText = formatTokensString(tokensText?.trim());
    if (formattedTokensText !== null) setTokensText(formattedTokensText);

    let data: Record<string, any> | null = null;
    if (dataText.trim()) {
      try {
        let parsed = JSON.parse(dataText.trim());
        if (typeof parsed === "string") {
          const inner = parsed.trim();
          if ((inner.startsWith("{") && inner.endsWith("}")) || (inner.startsWith("[") && inner.endsWith("]"))) {
            try {
              parsed = JSON.parse(inner);
            } catch {}
          }
        }
        if (parsed === null || typeof parsed !== "object") {
          setError("Field Data harus berupa JSON object yang valid.");
          return;
        }
        data = parsed as Record<string, any>;
      } catch {
        setError("Field Data harus berupa JSON object yang valid.");
        return;
      }
    }

    let tokens: string[] = [];
    if (targetType === "tokens" && tokensText.trim()) {
      const txt = tokensText.trim();
      let parsedTokens: any = null;
      try {
        parsedTokens = JSON.parse(txt);
        if (typeof parsedTokens === "string") {
          const inner = parsedTokens.trim();
          try {
            const p2 = JSON.parse(inner);
            if (Array.isArray(p2)) parsedTokens = p2;
          } catch {}
        }
      } catch {
        parsedTokens = null;
      }

      if (Array.isArray(parsedTokens)) {
        tokens = parsedTokens.map((t) => String(t));
      } else if (typeof parsedTokens === "string") {
        tokens = [parsedTokens];
      } else {
        tokens = txt.split(/[\n,]+/).map((t) => t.trim()).filter(Boolean);
      }

      if (tokens.length === 0) {
        setError("Token device tidak boleh kosong jika memilih target spesifik");
        return;
      }
    }

    const finalTopic = targetType === "all" ? "all" : (targetType === "topic" ? topic.trim() : undefined);
    if (targetType === "topic" && !finalTopic) {
      setError("Topic wajib diisi jika memilih target topik");
      return;
    }

    const payload = {
      title: title.trim(),
      body: body.trim() || undefined,
      data: data || undefined,
      topic: finalTopic || undefined,
      tokens: tokens.length ? tokens : undefined,
      scheduled_at: schedulingType === "schedule" && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      send_now: schedulingType === "now",
    };

    setSaving(true);
    try {
      await createNotification(payload as any);
      router.push("/admin/notifications");
    } catch (err: any) {
      setError(err?.message || "Gagal membuat notifikasi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buat Notifikasi Baru</h1>
          <p className="text-xs text-slate-500 mt-0.5">Rancang push notification kampanye Anda dan kirimkan secara instan atau dijadwalkan.</p>
        </div>
        <Link 
          href="/admin/notifications" 
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-950 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Daftar
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700 flex items-center gap-2.5">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
          {/* Title & Body */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800">Judul Kampanye <span className="text-rose-500">*</span></label>
              <input 
                type="text"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Masukkan judul notifikasi..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800">Pesan Utama (Body)</label>
              <textarea 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                placeholder="Masukkan isi pesan detail notifikasi..."
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>

          {/* Targeting Tab Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-800">Target Penerima</label>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200/20">
              <button
                type="button"
                onClick={() => setTargetType("all")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  targetType === "all" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua User
              </button>
              <button
                type="button"
                onClick={() => setTargetType("topic")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  targetType === "topic" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Topik Segmen
              </button>
              <button
                type="button"
                onClick={() => setTargetType("tokens")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  targetType === "tokens" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Spesifik Device
              </button>
            </div>

            {/* Target Fields */}
            {targetType === "all" && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Kategori Pengiriman: Massal (Global)
                </div>
                <p>Notifikasi akan dikirimkan ke topik default <strong>&apos;all&apos;</strong>. Semua instalasi aplikasi mobile yang terdaftar pada Firebase akan menerima pesan ini.</p>
              </div>
            )}

            {targetType === "topic" && (
              <div className="space-y-1.5 animate-slide-down">
                <label className="block text-xs font-semibold text-slate-500">Nama Topik Firebase</label>
                <input 
                  type="text"
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)} 
                  placeholder="Contoh: promo_juni, tips_skincare"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            )}

            {targetType === "tokens" && (
              <div className="space-y-1.5 animate-slide-down">
                <label className="block text-xs font-semibold text-slate-500">Device Tokens (Pisahkan dengan koma atau baris baru)</label>
                <textarea
                  value={tokensText}
                  onChange={(e) => setTokensText(e.target.value)}
                  placeholder="fcm_token_device_1,&#10;fcm_token_device_2"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 font-mono text-xs"
                  onBlur={() => {
                    const f = formatTokensString(tokensText);
                    if (f !== null) setTokensText(f);
                  }}
                />
                <p className="text-[11px] text-slate-400">Masukkan daftar token FCM atau format array JSON `[&quot;token1&quot;,&quot;token2&quot;]`.</p>
              </div>
            )}
          </div>

          {/* Scheduling Section */}
          <div className="space-y-3 border-t border-slate-100 pt-5">
            <label className="block text-sm font-semibold text-slate-800">Waktu Pengiriman</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input 
                  type="radio" 
                  checked={schedulingType === "now"} 
                  onChange={() => setSchedulingType("now")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Kirim Sekarang</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input 
                  type="radio" 
                  checked={schedulingType === "schedule"} 
                  onChange={() => setSchedulingType("schedule")}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span>Jadwalkan Pengiriman</span>
              </label>
            </div>

            {schedulingType === "schedule" && (
              <div className="animate-slide-down">
                <input 
                  type="datetime-local" 
                  value={scheduledAt} 
                  onChange={(e) => setScheduledAt(e.target.value)} 
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all text-slate-700"
                  required
                />
              </div>
            )}
          </div>

          {/* Custom Metadata JSON Payload */}
          <div className="space-y-2 border-t border-slate-100 pt-5">
            <label className="block text-sm font-semibold text-slate-800">Data Tambahan / JSON Payload (Opsional)</label>
            <textarea
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              placeholder='{&#10;  "screen": "promo_page",&#10;  "discount_code": "BEAUTY20"&#10;}'
              rows={4}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 font-mono text-xs"
              onBlur={() => {
                const f = tryFormatDataString(dataText);
                if (f !== null) setDataText(f);
              }}
            />
            <p className="text-[11px] text-slate-400">Payload custom data untuk navigasi internal aplikasi mobile (dalam bentuk key-value string).</p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <Link 
              href="/admin/notifications" 
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                schedulingType === "now" ? "Buat & Kirim Sekarang" : "Buat & Jadwalkan"
              )}
            </button>
          </div>
        </form>

        {/* Live Mockup Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Preview Notifikasi Real-time</h3>
            
            {/* Phone Frame */}
            <div className="relative mx-auto max-w-[300px] aspect-[9/18.5] rounded-[38px] border-[6px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden ring-4 ring-slate-900/5">
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-slate-850 rounded-b-xl z-20 flex items-center justify-center gap-1.5 px-3">
                <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-slate-800 border border-slate-700 rounded-full"></div>
              </div>

              {/* Wallpaper/Screen Content */}
              <div className="w-full h-full bg-gradient-to-b from-[#1b1c30] via-[#3a3b5a] to-[#121323] p-4 flex flex-col justify-between relative">
                {/* Lock Screen Status bar */}
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

                {/* Clock Display */}
                <div className="text-center mt-6 select-none">
                  <h2 className="text-4xl font-light text-white/90 tracking-wide">{currentTimeStr}</h2>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest mt-1 font-semibold">
                    {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>

                {/* Notification Bubble Mockup */}
                <div className="absolute top-[32%] left-3 right-3 z-10 animate-pulse-slow">
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
                    
                    {/* Live Preview Text */}
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900 break-words leading-tight">
                        {title.trim() || "💡 Judul Notifikasi Anda"}
                      </h4>
                      <p className="text-[10px] text-slate-600 break-words leading-snug">
                        {body.trim() || "Masukkan body atau isi pesan notifikasi pada form untuk melihat live preview-nya di sini..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Swipe Indicator */}
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

            {/* Informational Hint */}
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-[11px] text-slate-500 mt-5 leading-relaxed">
              <h5 className="font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0118 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Catatan Desain & UX
              </h5>
              Push notification dikirimkan menggunakan FCM Legacy/V1 API. Pastikan aplikasi mobile (Flutter/Native) Anda mendengarkan payload yang dikirimkan sesuai dengan key-value pada field custom data untuk meluncurkan router tujuan di sisi client.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

