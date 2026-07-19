import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteUser,
  DermifyUser,
  listUsers,
} from "@/lib/dermifyApi";
import {
  AdminLinkButton,
  AdminPageHeader,
  AdminPageShell,
  AdminTable,
  AlertBanner,
  ChartIcon,
  dangerIconButtonClassName,
  EditIcon,
  EmptyTableRow,
  LoadingPanel,
  neutralIconButtonClassName,
  PaginationBar,
  PlusIcon,
  SearchField,
  StatCard,
  TrashIcon,
  UserIcon,
} from "@/components/admin/ui";

const pageSize = 10;

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DermifyUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const load = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
    listUsers()
      .then((data) => setUsers(data || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id?: number) {
    if (!id) return;
    if (!confirm("Hapus user ini secara permanen dari database?")) return;

    try {
      await deleteUser(id);
      load();
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus user");
    }
  }

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query) ||
        user.provider?.toLowerCase().includes(query),
    );
  }, [searchQuery, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredUsers]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((user) => user.role === "admin").length;
    const googleUsers = users.filter((user) => user.provider === "google").length;
    const totalAnalyses = users.reduce(
      (sum, user) => sum + (user.analysis_count || 0),
      0,
    );

    return { total, admins, googleUsers, totalAnalyses };
  }, [users]);

  const startItem = filteredUsers.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, filteredUsers.length);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Manajemen User"
        description="Kelola akun pengguna, role, provider login, dan aktivitas analisis."
        action={
          <AdminLinkButton href="/admin/users/create">
            <PlusIcon />
            Tambah User
          </AdminLinkButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total User"
          value={stats.total.toLocaleString("id-ID")}
          icon={<UserIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Admin"
          value={stats.admins.toLocaleString("id-ID")}
          icon={<UserIcon className="h-5 w-5" />}
          tone="slate"
        />
        <StatCard
          label="Google Login"
          value={stats.googleUsers.toLocaleString("id-ID")}
          icon={<UserIcon className="h-5 w-5" />}
          tone="sky"
        />
        <StatCard
          label="Total Analisis"
          value={stats.totalAnalyses.toLocaleString("id-ID")}
          icon={<ChartIcon className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Cari nama, email, role, atau provider..."
      />

      {error && <AlertBanner>Gagal memuat user: {error}</AlertBanner>}

      {isLoading ? (
        <LoadingPanel label="Memuat data user..." />
      ) : (
        <AdminTable
          headers={[
            { label: "No" },
            { label: "User" },
            { label: "Provider" },
            { label: "Role" },
            { label: "Analisis", align: "center" },
            { label: "Bergabung" },
            { label: "Aksi", align: "center" },
          ]}
        >
          {paginatedUsers.length === 0 ? (
            <EmptyTableRow colSpan={7}>
              {searchQuery
                ? "Tidak ada user yang sesuai dengan pencarian."
                : "Belum ada data user."}
            </EmptyTableRow>
          ) : (
            paginatedUsers.map((user, index) => (
              <tr key={user.id} className="transition-colors hover:bg-emerald-50/30">
                <td className="whitespace-nowrap p-4 font-mono text-xs text-slate-400">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="max-w-xs p-4">
                  <p className="truncate font-semibold text-slate-950">
                    {user.name || "Tanpa nama"}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {user.email || "-"}
                  </p>
                </td>
                <td className="whitespace-nowrap p-4 text-slate-600">
                  {user.provider || "-"}
                </td>
                <td className="whitespace-nowrap p-4">
                  <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    {user.role || "user"}
                  </span>
                </td>
                <td className="whitespace-nowrap p-4 text-center font-semibold text-slate-700">
                  {(user.analysis_count || 0).toLocaleString("id-ID")}
                </td>
                <td className="whitespace-nowrap p-4 text-slate-600">
                  {formatDate(user.created_at)}
                </td>
                <td className="whitespace-nowrap p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className={neutralIconButtonClassName}
                      title="Edit user"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      className={dangerIconButtonClassName}
                      title="Hapus user"
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
        label="user"
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalItems={filteredUsers.length}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
    </AdminPageShell>
  );
}
