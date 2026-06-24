import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { createNotification } from "@/lib/dermifyApi";

export default function CreateNotificationPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dataText, setDataText] = useState("");
  const [topic, setTopic] = useState("");
  const [tokensText, setTokensText] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sendNow, setSendNow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title wajib diisi");
      return;
    }

    let data: Record<string, any> | null = null;
    if (dataText.trim()) {
      try {
        data = JSON.parse(dataText);
      } catch {
        setError("Field Data harus berupa JSON yang valid.");
        return;
      }
    }

    const tokens = tokensText
      .split(/[\n,]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      body: body.trim() || undefined,
      data: data || undefined,
      topic: topic.trim() || undefined,
      tokens: tokens.length ? tokens : undefined,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      send_now: Boolean(sendNow),
    };

    // debug: show payload in console
    // eslint-disable-next-line no-console
    console.log("CreateNotification payload:", payload);

    setSaving(true);
    try {
      // eslint-disable-next-line no-console
      console.log("Calling createNotification...");
      await createNotification(payload as any);
      // eslint-disable-next-line no-console
      console.log("createNotification success");
      router.push("/admin/notifications");
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("createNotification error:", err);
      setError(err?.message || "Gagal membuat notifikasi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Buat Notifikasi</h1>
        <Link href="/admin/notifications" className="text-slate-600">Kembali</Link>
      </div>

      {error ? (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">{error}</div>
      ) : null}

      <form id="create-notification-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Body</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Data (JSON)</label>
          <textarea value={dataText} onChange={(e) => setDataText(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Topic</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Tokens (comma or newline separated)</label>
          <textarea value={tokensText} onChange={(e) => setTokensText(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Scheduled at</label>
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div className="flex items-center gap-3">
          <input id="sendNow" type="checkbox" checked={sendNow} onChange={(e) => setSendNow(e.target.checked)} />
          <label htmlFor="sendNow" className="text-sm">Send now</label>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={(e) => {
              // eslint-disable-next-line no-console
              console.log("submit-button clicked");
              // Call handler directly with the click event (has preventDefault)
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handleSubmit(e as any);
              } catch (err) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                // eslint-disable-next-line no-console
                console.error("direct submit error", err);
              }
            }}
            className="rounded bg-emerald-600 px-3 py-1 text-white"
          >
            {saving ? "Menyimpan..." : "Buat"}
          </button>
          <Link href="/admin/notifications" className="rounded border px-3 py-1">Batal</Link>
        </div>
      </form>
    </div>
  );
}
