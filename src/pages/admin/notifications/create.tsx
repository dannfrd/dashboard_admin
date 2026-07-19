import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  createNotification,
  DermifyUser,
  listUsers,
} from "@/lib/dermifyApi";
import {
  AdminCard,
  AdminPageHeader,
  AdminPageShell,
  AlertBanner,
  cx,
  FieldLabel,
  FormActions,
  inputClassName,
  PhoneNotificationPreview,
  secondaryButtonClassName,
  textareaClassName,
  useConfirm,
} from "@/components/admin/ui";

type TargetType = "all" | "user";
type SchedulingType = "now" | "schedule";
type OpenAction = "" | "history" | "scan" | "tips_skincare";

function SegmentedButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-md px-3 py-2 text-xs font-semibold transition",
        active
          ? "bg-white text-emerald-700 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
          : "text-slate-600 hover:text-slate-950",
      )}
    >
      {children}
    </button>
  );
}

export default function CreateNotificationPage() {
  const { confirm, ConfirmDialog } = useConfirm();

  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [openAction, setOpenAction] = useState<OpenAction>("");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState<DermifyUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [schedulingType, setSchedulingType] = useState<SchedulingType>("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (targetType !== "user" || users.length) return;

    setIsLoadingUsers(true);
    listUsers()
      .then((data) => setUsers(data || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoadingUsers(false));
  }, [targetType, users.length]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const ok = await confirm("Apakah Anda yakin ingin membuat dan memproses notifikasi ini?");
    if (!ok) {
      return;
    }

    if (!title.trim()) {
      setError("Judul notifikasi wajib diisi.");
      return;
    }

    const data: Record<string, string> = {};
    if (openAction) data.screen = openAction;

    const finalTopic = targetType === "all" ? "all" : undefined;

    const userId = selectedUserId ? Number(selectedUserId) : undefined;
    if (targetType === "user" && !userId) {
      setError("Pilih user tujuan terlebih dahulu.");
      return;
    }

    setSaving(true);
    try {
      await createNotification({
        title: title.trim(),
        body: body.trim() || undefined,
        data: Object.keys(data).length ? data : undefined,
        topic: finalTopic || undefined,
        user_id: userId,
        target_user_id: userId,
        scheduled_at:
          schedulingType === "schedule" && scheduledAt
            ? new Date(scheduledAt).toISOString()
            : undefined,
        send_now: schedulingType === "now",
      });
      router.push("/admin/notifications");
    } catch (err: any) {
      setError(err?.message || "Gagal membuat notifikasi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Tambah Notifikasi"
        description="Susun push notification, pilih target penerima, lalu kirim sekarang atau jadwalkan."
        backHref="/admin/notifications"
        backLabel="Daftar Notifikasi"
      />

      {error && <AlertBanner>{error}</AlertBanner>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <AdminCard className="p-6 lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <FieldLabel required>Judul</FieldLabel>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Masukkan judul notifikasi..."
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <FieldLabel>Isi Pesan</FieldLabel>
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Masukkan pesan notifikasi..."
                  rows={3}
                  className={textareaClassName}
                />
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-5">
              <FieldLabel>Target Penerima</FieldLabel>
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1">
                <SegmentedButton
                  active={targetType === "all"}
                  onClick={() => setTargetType("all")}
                >
                  Semua User
                </SegmentedButton>
                <SegmentedButton
                  active={targetType === "user"}
                  onClick={() => setTargetType("user")}
                >
                  Per User
                </SegmentedButton>
              </div>

              {targetType === "all" && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Notifikasi akan dikirim ke topic default <strong>all</strong>.
                </div>
              )}

              {targetType === "user" && (
                <div>
                  <FieldLabel>Pilih User</FieldLabel>
                  <select
                    value={selectedUserId}
                    onChange={(event) => setSelectedUserId(event.target.value)}
                    className={inputClassName}
                    disabled={isLoadingUsers}
                  >
                    <option value="">
                      {isLoadingUsers ? "Memuat user..." : "Pilih user tujuan"}
                    </option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email || `User #${user.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-5">
              <FieldLabel>Waktu Pengiriman</FieldLabel>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingType("now")}
                  className={cx(
                    secondaryButtonClassName,
                    schedulingType === "now" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                  )}
                >
                  Kirim Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setSchedulingType("schedule")}
                  className={cx(
                    secondaryButtonClassName,
                    schedulingType === "schedule" &&
                      "border-emerald-200 bg-emerald-50 text-emerald-700",
                  )}
                >
                  Jadwalkan
                </button>
              </div>

              {schedulingType === "schedule" && (
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  className={inputClassName}
                  required
                />
              )}
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-5">
              <FieldLabel>Aksi Saat Dibuka</FieldLabel>
              <select
                value={openAction}
                onChange={(event) => setOpenAction(event.target.value as OpenAction)}
                className={inputClassName}
              >
                <option value="">Tidak membuka halaman khusus</option>
                <option value="history">Buka riwayat analisis</option>
                <option value="scan">Buka halaman scan</option>
                <option value="tips_skincare">Buka tips skincare</option>
              </select>
              <p className="text-xs text-slate-500">
                Kosongkan jika notifikasi hanya berisi pesan.
              </p>
            </div>

            <FormActions
              cancelHref="/admin/notifications"
              submitLabel={
                schedulingType === "now"
                  ? "Simpan & Kirim Sekarang"
                  : "Simpan Jadwal"
              }
              savingLabel="Menyimpan..."
              isSaving={saving}
            />
          </form>
        </AdminCard>

        <div className="lg:col-span-5">
          <PhoneNotificationPreview title={title} body={body.trim() || null} />
        </div>
      </div>
      <ConfirmDialog />
    </AdminPageShell>
  );
}
