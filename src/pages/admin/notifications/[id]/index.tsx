import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  getNotification,
  NotificationItem,
  sendStoredNotification,
} from "@/lib/dermifyApi";
import {
  AdminCard,
  AdminPageHeader,
  AdminPageShell,
  AlertBanner,
  LoadingPanel,
  PhoneNotificationPreview,
  primaryButtonClassName,
  SendIcon,
  Spinner,
  StatusBadge,
} from "@/components/admin/ui";

function formatDate(dateString?: string | null) {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function targetLabel(note?: NotificationItem | null) {
  if (!note) return "-";
  const userId = note.user_id || note.target_user_id;
  if (userId) return note.user?.name || note.user?.email || `User #${userId}`;
  if (note.topic) return `Topic: ${note.topic}`;
  if (note.tokens?.length) return "Target khusus";
  return "Semua user";
}

function openActionLabel(note?: NotificationItem | null) {
  const screen = note?.data?.screen;
  const labels: Record<string, string> = {
    history: "Buka riwayat analisis",
    scan: "Buka halaman scan",
    tips_skincare: "Buka tips skincare",
  };

  return typeof screen === "string" && labels[screen]
    ? labels[screen]
    : "Tidak membuka halaman khusus";
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="block text-xs font-semibold uppercase text-slate-500">
        {label}
      </span>
      <div className="mt-1 text-sm font-medium text-slate-700">{children}</div>
    </div>
  );
}

export default function ViewNotificationPage() {
  const router = useRouter();
  const { id } = router.query;
  const noteId = Number(id);

  const [note, setNote] = useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotification = React.useCallback(() => {
    if (!noteId) return;

    setLoading(true);
    setError(null);
    getNotification(noteId)
      .then((notification) => setNote(notification))
      .catch((err: any) => setError(err?.message || "Gagal memuat detail notifikasi"))
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
      const notification = await getNotification(noteId);
      setNote(notification);
    } catch (err: any) {
      alert(err?.message || "Gagal mengirim notifikasi");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <AdminPageShell>
        <LoadingPanel label="Memuat detail notifikasi..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={`Detail Notifikasi #${note?.id || noteId}`}
        description="Lihat target, jadwal, status pengiriman, dan aksi notifikasi."
        backHref="/admin/notifications"
        backLabel="Daftar Notifikasi"
        meta={<StatusBadge value={note?.status} />}
      />

      {error && <AlertBanner>{error}</AlertBanner>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <AdminCard className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <DetailItem label="Judul">
                  <p className="text-base font-semibold text-slate-950">
                    {note?.title || "-"}
                  </p>
                </DetailItem>

                <DetailItem label="Isi Pesan">
                  <p className="whitespace-pre-wrap leading-6">
                    {note?.body || (
                      <span className="italic text-slate-400">Tidak ada isi pesan.</span>
                    )}
                  </p>
                </DetailItem>
              </div>

              <div className="grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 md:grid-cols-2">
                <DetailItem label="Target Penerima">{targetLabel(note)}</DetailItem>
                <DetailItem label="Dibuat">{formatDate(note?.created_at)}</DetailItem>
                {note?.scheduled_at && (
                  <DetailItem label="Terjadwal">
                    {formatDate(note.scheduled_at)}
                  </DetailItem>
                )}
                {note?.sent_at && (
                  <DetailItem label="Terkirim">
                    <span className="text-emerald-700">{formatDate(note.sent_at)}</span>
                  </DetailItem>
                )}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <DetailItem label="Aksi Saat Dibuka">
                  {openActionLabel(note)}
                </DetailItem>
              </div>

              {note?.status !== "sent" && (
                <div className="flex justify-end border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className={primaryButtonClassName}
                  >
                    {sending ? <Spinner /> : <SendIcon />}
                    {sending ? "Mengirim..." : "Kirim Sekarang"}
                  </button>
                </div>
              )}
            </div>
          </AdminCard>
        </div>

        <div className="lg:col-span-5">
          <PhoneNotificationPreview
            title={note?.title}
            body={
              note?.body || (
                <span className="italic text-slate-400">Tidak ada isi pesan.</span>
              )
            }
          />
        </div>
      </div>
    </AdminPageShell>
  );
}
