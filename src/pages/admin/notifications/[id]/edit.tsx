import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getNotification, updateNotification } from "@/lib/dermifyApi";

export default function EditNotificationPage() {
  const router = useRouter();
  const { id } = router.query;
  const noteId = Number(id);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dataText, setDataText] = useState("");
  const [targetType, setTargetType] = useState<"all" | "topic" | "tokens">("all");
  const [topic, setTopic] = useState("");
  const [tokensText, setTokensText] = useState("");
  const [schedulingType, setSchedulingType] = useState<"now" | "schedule">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clock time for preview mockup
  const [currentTimeStr, setCurrentTimeStr] = useState("10:00");
  useEffect(() => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    setCurrentTimeStr(`${hrs}:${mins}`);
  }, []);

  function formatDatetimeLocal(isoString?: string | null): string {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      const hh = pad(d.getHours());
      const min = pad(d.getMinutes());
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } catch {
      return "";
    }
  }

  // Load existing notification details
  useEffect(() => {
    if (!noteId) return;
    setIsLoading(true);
    getNotification(noteId)
      .then((n) => {
        if (n.status === "sent") {
          router.push("/admin/notifications");
          alert("Notifications that have been sent cannot be edited.");
          return;
        }

        setTitle(n.title || "");
        setBody(n.body || "");
        
        if (n.data) {
          setDataText(JSON.stringify(n.data, null, 2));
        }

        // Deduce targeting targetType
        if (n.topic) {
          if (n.topic === "all") {
            setTargetType("all");
          } else {
            setTargetType("topic");
            setTopic(n.topic);
          }
        } else if (n.tokens && n.tokens.length > 0) {
          setTargetType("tokens");
          setTokensText(JSON.stringify(n.tokens));
        } else {
          setTargetType("all");
        }

        // Deduce schedulingType
        if (n.scheduled_at) {
          setSchedulingType("schedule");
          setScheduledAt(formatDatetimeLocal(n.scheduled_at));
        } else {
          setSchedulingType("now");
        }
      })
      .catch((err: any) => {
        setError(err?.message || "Failed to load notification details");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [noteId, router]);

  function tryFormatDataString(text?: string): string | null {
    if (!text) return null;
    const t = text.trim();
    if (!t) return null;
    try {
      let parsed: any = JSON.parse(t);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return null;
    }
  }

  function formatTokensString(text?: string): string | null {
    if (!text) return null;
    const t = text.trim();
    if (!t) return null;
    try {
      let parsed: any = JSON.parse(t);
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
      setError("Title is required");
      return;
    }

    const formattedDataText = tryFormatDataString(dataText?.trim());
    if (formattedDataText !== null) setDataText(formattedDataText);
    const formattedTokensText = formatTokensString(tokensText?.trim());
    if (formattedTokensText !== null) setTokensText(formattedTokensText);

    let data: Record<string, any> | null = null;
    if (dataText.trim()) {
      try {
        let parsed = JSON.parse(dataText.trim());
        if (parsed === null || typeof parsed !== "object") {
          setError("Field Data must be a valid JSON object.");
          return;
        }
        data = parsed as Record<string, any>;
      } catch {
        setError("Field Data must be a valid JSON object.");
        return;
      }
    }

    let tokens: string[] = [];
    if (targetType === "tokens" && tokensText.trim()) {
      const txt = tokensText.trim();
      let parsedTokens: any = null;
      try {
        parsedTokens = JSON.parse(txt);
      } catch {
        parsedTokens = null;
      }

      if (Array.isArray(parsedTokens)) {
        tokens = parsedTokens.map((t) => String(t));
      } else {
        tokens = txt.split(/[\n,]+/).map((t) => t.trim()).filter(Boolean);
      }

      if (tokens.length === 0) {
        setError("Token device cannot be empty if selecting a specific target");
        return;
      }
    }

    const finalTopic = targetType === "all" ? "all" : (targetType === "topic" ? topic.trim() : undefined);
    if (targetType === "topic" && !finalTopic) {
      setError("Topic is required if selecting a topic target");
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
      await updateNotification(noteId, payload as any);
      router.push("/admin/notifications");
    } catch (err: any) {
      setError(err?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium">Loading notification data...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Notification #{noteId}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Edit draft push notification or change its scheduling.</p>
        </div>
        <Link 
          href="/admin/notifications" 
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-950 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Cancel
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

      {/* Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6 bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
          {/* Title & Body */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800">Title <span className="text-rose-500">*</span></label>
              <input 
                type="text"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter notification title..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800">Main Message (Body)</label>
              <textarea 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                placeholder="Enter notification detail message..."
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>

          {/* Targeting Tab Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-800">Target Recipients</label>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200/20">
              <button
                type="button"
                onClick={() => setTargetType("all")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  targetType === "all" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Users
              </button>
              <button
                type="button"
                onClick={() => setTargetType("topic")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  targetType === "topic" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Topic Segment
              </button>
              <button
                type="button"
                onClick={() => setTargetType("tokens")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  targetType === "tokens" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Specific Device
              </button>
            </div>

            {/* Target Fields */}
            {targetType === "all" && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Delivery Category: Mass (Global)
                </div>
                <p>Notification will be sent to the default topic <strong>&apos;all&apos;</strong>. All mobile app installations registered on Firebase will receive this message.</p>
              </div>
            )}

            {targetType === "topic" && (
              <div className="space-y-1.5 animate-slide-down">
                <label className="block text-xs font-semibold text-slate-500">Firebase Topic Name</label>
                <input 
                  type="text"
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)} 
                  placeholder="Example: promo_juni, tips_skincare"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            )}

            {targetType === "tokens" && (
              <div className="space-y-1.5 animate-slide-down">
                <label className="block text-xs font-semibold text-slate-500">Device Tokens (Separate with comma or new line)</label>
                <textarea
                  value={tokensText}
                  onChange={(e) => setTokensText(e.target.value)}
                  placeholder="fcm_token_device_1,&#10;fcm_token_device_2"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 font-mono text-xs"
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
            <label className="block text-sm font-semibold text-slate-800">Additional Data / JSON Payload (Optional)</label>
            <textarea
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              placeholder='{&#10;  "screen": "promo_page",&#10;  "discount_code": "BEAUTY20"&#10;}'
              rows={4}
              className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 font-mono text-xs"
              onBlur={() => {
                const f = tryFormatDataString(dataText);
                if (f !== null) setDataText(f);
              }}
            />
            <p className="text-[11px] text-slate-400">Payload custom data for internal app navigation (in key-value string format).</p>
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
                schedulingType === "now" ? "Save & Send Now" : "Save Changes"
              )}
            </button>
          </div>
        </form>

        {/* Live Mockup Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Preview Notification Real-time</h3>
            
            {/* Phone Frame */}
            <div className="relative mx-auto max-w-[300px] aspect-[9/18.5] rounded-[38px] border-[6px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden ring-4 ring-slate-900/5">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-5 w-24 bg-slate-850 rounded-b-xl z-20 flex items-center justify-center gap-1.5 px-3">
                <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-slate-800 border border-slate-700 rounded-full"></div>
              </div>

              {/* Wallpaper */}
              <div className="w-full h-full bg-gradient-to-b from-[#1b1c30] via-[#3a3b5a] to-[#121323] p-4 flex flex-col justify-between relative">
                {/* Status Bar */}
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

                {/* Notification Bubble */}
                <div className="absolute top-[32%] left-3 right-3 z-10">
                  <div className="rounded-2xl bg-white/85 backdrop-blur-lg border border-white/20 p-3.5 shadow-xl text-slate-800 shadow-slate-950/20">
                    <div className="flex items-center justify-between border-b border-slate-700/10 pb-1.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        {/* Icon */}
                        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                          D
                        </div>
                        <span className="text-[10px] font-bold tracking-wide uppercase text-slate-600">Dermify</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-medium">Baru saja</span>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900 break-words leading-tight">
                        {title.trim() || "💡 Notification Title"}
                      </h4>
                      <p className="text-[10px] text-slate-600 break-words leading-snug">
                        {body.trim() || "Enter the notification body or message in the form to see the live preview here..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Swipe Indicator */}
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
