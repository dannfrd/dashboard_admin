import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getNotification, sendStoredNotification } from "@/lib/dermifyApi";

export default function ViewNotificationPage() {
  const router = useRouter();
  const { id } = router.query;
  const noteId = Number(id);

  const [note, setNote] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!noteId) return;
    setLoading(true);
    getNotification(noteId)
      .then((n) => setNote(n))
      .catch((err: any) => alert(err?.message || "Gagal memuat notifikasi"))
      .finally(() => setLoading(false));
  }, [noteId]);

  async function handleSend() {
    if (!noteId) return;
    if (!confirm("Kirim notifikasi ini sekarang?")) return;
    try {
      await sendStoredNotification(noteId);
      alert("Dikirim");
      // refresh
      const n = await getNotification(noteId);
      setNote(n);
    } catch (err: any) {
      alert(err?.message || "Gagal mengirim notifikasi");
    }
  }

  if (loading) return <div className="p-6">Memuat...</div>;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifikasi #{note?.id}</h1>
        <Link href="/admin/notifications" className="text-slate-600">Kembali</Link>
      </div>

      <div className="space-y-2">
        <p className="font-semibold">Title</p>
        <p>{note?.title}</p>

        <p className="font-semibold">Body</p>
        <p>{note?.body}</p>

        <p className="font-semibold">Data</p>
        <pre className="rounded bg-slate-50 p-3">{JSON.stringify(note?.data || {}, null, 2)}</pre>

        <p className="font-semibold">Topic</p>
        <p>{note?.topic || "-"}</p>

        <p className="font-semibold">Tokens</p>
        <pre className="rounded bg-slate-50 p-3">{JSON.stringify(note?.tokens || [], null, 2)}</pre>

        <p className="font-semibold">Status</p>
        <p>{note?.status}</p>

        <div className="flex gap-2">
          <button onClick={handleSend} className="rounded bg-emerald-600 px-3 py-1 text-white">Send Now</button>
        </div>
      </div>
    </div>
  );
}
