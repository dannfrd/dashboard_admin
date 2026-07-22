import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteNotification,
  listNotifications,
  NotificationItem,
  sendStoredNotification,
} from "@/lib/dermifyApi";
import {
  AdminLinkButton,
  AdminPageHeader,
  AdminPageShell,
  AdminTable,
  AlertBanner,
  BellIcon,
  ClockIcon,
  dangerIconButtonClassName,
  EditIcon,
  EmptyTableRow,
  EyeIcon,
  LoadingPanel,
  neutralIconButtonClassName,
  PaginationBar,
  PlusIcon,
  positiveIconButtonClassName,
  SearchField,
  SendIcon,
  StatCard,
  StatusBadge,
  TrashIcon,
  useConfirm,
} from "@/components/admin/ui";

const pageSize = 10;

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
  });
}

function targetLabel(item: NotificationItem) {
  const userId = item.user_id || item.target_user_id;
  if (userId) {
    return item.user?.name || item.user?.email || `User #${userId}`;
  }
  if (item.topic) return `Topic: ${item.topic}`;
  if (item.tokens?.length) return "Target khusus";
  return "Semua user";
}

export default function AdminNotificationsPage() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    listNotifications()
      .then((res) => setItems(res.items || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleSend(id: number) {
    const ok = await confirm("Kirim notifikasi ini ke target user sekarang?");
    if (!ok) return;

    setSendingId(id);
    try {
      await sendStoredNotification(id);
      load();
    } catch (err: any) {
      alert(err?.message || "Gagal mengirim notifikasi");
    } finally {
      setSendingId(null);
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirm("Hapus notifikasi ini secara permanen dari sistem?");
    if (!ok) return;

    try {
      await deleteNotification(id);
      load();
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus notifikasi");
    }
  }

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;

    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.body?.toLowerCase().includes(query) ||
        item.topic?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredItems]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const counts = { sent: 0, scheduled: 0, draft: 0, failed: 0 };
    items.forEach((item) => {
      const status = (item.status || "draft").toLowerCase() as keyof typeof counts;
      if (status in counts) counts[status]++;
      else counts.draft++;
    });
    return counts;
  }, [items]);

  const startItem = filteredItems.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, filteredItems.length);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Manajemen Notifikasi"
        description="Buat, jadwalkan, kirim, dan pantau push notification untuk pengguna aplikasi."
        action={
          <AdminLinkButton href="/admin/notifications/create">
            <PlusIcon />
            Tambah Notifikasi
          </AdminLinkButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Terkirim"
          value={stats.sent.toLocaleString("id-ID")}
          icon={<BellIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Terjadwal"
          value={stats.scheduled.toLocaleString("id-ID")}
          icon={<ClockIcon className="h-5 w-5" />}
          tone="sky"
        />
        <StatCard
          label="Draft"
          value={stats.draft.toLocaleString("id-ID")}
          icon={<EditIcon className="h-5 w-5" />}
          tone="slate"
        />
        <StatCard
          label="Gagal"
          value={stats.failed.toLocaleString("id-ID")}
          icon={<BellIcon className="h-5 w-5" />}
          tone="rose"
        />
      </div>

      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Cari judul, pesan, topik, atau status..."
      />

      {error && <AlertBanner>Gagal memuat notifikasi: {error}</AlertBanner>}

      {loading ? (
        <LoadingPanel label="Memuat data notifikasi..." />
      ) : (
        <AdminTable
          headers={[
            { label: "No" },
            { label: "Notifikasi" },
            { label: "Target" },
            { label: "Status", align: "center" },
            { label: "Jadwal / Kirim" },
            { label: "Aksi", align: "center" },
          ]}
        >
          {paginatedItems.length === 0 ? (
            <EmptyTableRow colSpan={6}>
              {searchQuery
                ? "Tidak ada notifikasi yang sesuai dengan pencarian."
                : "Belum ada riwayat notifikasi."}
            </EmptyTableRow>
          ) : (
            paginatedItems.map((item, index) => (
              <tr key={item.id} className="transition-colors hover:bg-emerald-50/30">
                <td className="whitespace-nowrap p-4 font-mono text-xs text-slate-400">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="max-w-md p-4">
                  <p className="truncate font-semibold text-slate-950">{item.title}</p>
                  {item.body && (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {item.body}
                    </p>
                  )}
                </td>
                <td className="whitespace-nowrap p-4">
                  <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {targetLabel(item)}
                  </span>
                </td>
                <td className="whitespace-nowrap p-4 text-center">
                  <StatusBadge value={item.status} />
                </td>
                <td className="whitespace-nowrap p-4 text-xs text-slate-500">
                  {item.status === "sent" ? (
                    <>
                      <span className="block text-slate-400">Terkirim</span>
                      <span className="font-semibold text-slate-700">
                        {formatDate(item.sent_at)}
                      </span>
                    </>
                  ) : item.scheduled_at ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Terjadwal</span>
                        {item.repeat_daily && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                            ↻ Harian
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-slate-700">
                        {item.repeat_daily && item.repeat_time
                          ? `Setiap hari ${item.repeat_time} WIB`
                          : formatDate(item.scheduled_at)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block text-slate-400">Dibuat</span>
                      <span className="font-semibold text-slate-700">
                        {formatDate(item.created_at)}
                      </span>
                    </>
                  )}
                </td>
                <td className="whitespace-nowrap p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/notifications/${item.id}`}
                      className={neutralIconButtonClassName}
                      title="Lihat detail"
                    >
                      <EyeIcon />
                    </Link>
                    {item.status !== "sent" && (
                      <>
                        <Link
                          href={`/admin/notifications/${item.id}/edit`}
                          className={neutralIconButtonClassName}
                          title="Edit notifikasi"
                        >
                          <EditIcon />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleSend(item.id)}
                          disabled={sendingId === item.id}
                          className={positiveIconButtonClassName}
                          title="Kirim sekarang"
                        >
                          {sendingId === item.id ? <span className="text-xs">...</span> : <SendIcon />}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className={dangerIconButtonClassName}
                      title="Hapus notifikasi"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      )}

      <PaginationBar
        label="notifikasi"
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalItems={filteredItems.length}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
      <ConfirmDialog />
    </AdminPageShell>
  );
}
