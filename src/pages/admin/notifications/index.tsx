import React from "react";
import Link from "next/link";
import { listNotifications, NotificationItem, sendStoredNotification } from "@/lib/dermifyApi";

export default function AdminNotificationsPage() {
  const [items, setItems] = React.useState<NotificationItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    listNotifications()
      .then((res) => setItems(res.items || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleSend(id: number) {
    if (!confirm("Kirim notifikasi sekarang?")) return;
    try {
      await sendStoredNotification(id);
      alert("Dikirim");
      load();
    } catch (err: any) {
      alert(err?.message || "Gagal mengirim");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifikasi</h1>
        <Link href="/admin/notifications/create" className="rounded bg-emerald-500 px-3 py-1 text-white">Buat Notifikasi</Link>
      </div>

      {error && <div className="text-rose-600">{error}</div>}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Memuat...</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200/70 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Scheduled</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-emerald-50/40">
                    <td className="p-4">#{it.id}</td>
                    <td className="p-4">{it.title}</td>
                    <td className="p-4">{it.status}</td>
                    <td className="p-4">{it.scheduled_at || "-"}</td>
                    <td className="p-4">{it.created_at || "-"}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/notifications/${it.id}`} className="text-emerald-600">View</Link>
                        <button onClick={() => handleSend(it.id)} className="text-emerald-700">Send</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
