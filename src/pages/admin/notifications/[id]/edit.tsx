import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  DermifyUser,
  getNotification,
  listUsers,
  updateNotification,
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
  LoadingPanel,
  PhoneNotificationPreview,
  secondaryButtonClassName,
  textareaClassName,
  useConfirm,
} from "@/components/admin/ui";

type TargetType = "all" | "user";
type SchedulingType = "now" | "schedule";
type OpenAction = "" | "history" | "scan" | "tips_skincare";

function formatDatetimeLocal(isoString?: string | null) {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

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

export default function EditNotificationPage() {
  const { confirm, ConfirmDialog } = useConfirm();

  const router = useRouter();
  const { id } = router.query;
  const noteId = Number(id);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [openAction, setOpenAction] = useState<OpenAction>("");
  const [extraData, setExtraData] = useState<Record<string, any>>({});
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState<DermifyUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [schedulingType, setSchedulingType] = useState<SchedulingType>("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [repeatDaily, setRepeatDaily] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId) return;

    setIsLoading(true);
    setError(null);
    getNotification(noteId)
      .then((notification) => {
        if (notification.status === "sent") {
          alert("Notifikasi yang sudah terkirim tidak dapat diedit.");
          router.push("/admin/notifications");
          return;
        }

        setTitle(notification.title || "");
        setBody(notification.body || "");
        const notificationData = notification.data || {};
        const { screen, discount_code: _discountCode, ...remainingData } = notificationData;
        setOpenAction(
          typeof screen === "string" &&
            ["history", "scan", "tips_skincare"].includes(screen)
            ? (screen as OpenAction)
            : "",
        );
        setExtraData(remainingData);

        const targetUserId = notification.user_id || notification.target_user_id;
        if (targetUserId) {
          setTargetType("user");
          setSelectedUserId(String(targetUserId));
        } else {
          setTargetType("all");
        }

        if (notification.scheduled_at) {
          setSchedulingType("schedule");
          setScheduledAt(formatDatetimeLocal(notification.scheduled_at));
        } else {
          setSchedulingType("now");
        }
        setRepeatDaily(!!notification.repeat_daily);
      })
      .catch((err: any) => {
        setError(err?.message || "Gagal memuat detail notifikasi");
      })
      .finally(() => setIsLoading(false));
  }, [noteId, router]);

  useEffect(() => {
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

    const ok = await confirm("Apakah Anda yakin ingin menyimpan perubahan notifikasi ini?");
    if (!ok) {
      return;
    }

    if (!title.trim()) {
      setError("Judul notifikasi wajib diisi.");
      return;
    }

    const data: Record<string, any> = { ...extraData };
    if (openAction) data.screen = openAction;
    else delete data.screen;
    delete data.discount_code;

    const finalTopic = targetType === "all" ? "all" : undefined;

    const userId = selectedUserId ? Number(selectedUserId) : undefined;
    if (targetType === "user" && !userId) {
      setError("Pilih user tujuan terlebih dahulu.");
      return;
    }

    setSaving(true);
    try {
      await updateNotification(noteId, {
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
        repeat_daily: schedulingType === "schedule" ? repeatDaily : false,
      });
      router.push("/admin/notifications");
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan notifikasi");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminPageShell>
        <LoadingPanel label="Memuat detail notifikasi..." />
        <ConfirmDialog />
    </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={`Edit Notifikasi #${noteId}`}
        description="Perbarui draft notifikasi, target penerima, atau jadwal pengiriman."
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
                <div className="space-y-3">
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    className={inputClassName}
                    required
                  />
                  {/* Repeat every day option */}
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-emerald-50/50">
                    <input
                      type="checkbox"
                      checked={repeatDaily}
                      onChange={(e) => setRepeatDaily(e.target.checked)}
                      className="h-4 w-4 rounded accent-emerald-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Ulangi setiap hari</p>
                      <p className="text-xs text-slate-500">
                        Notifikasi dikirim otomatis setiap pagi pada jam yang sama secara berulang.
                      </p>
                    </div>
                  </label>
                </div>
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
                  : "Simpan Perubahan"
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
