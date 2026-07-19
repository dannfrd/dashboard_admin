import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteIngredient,
  DermifyIngredient,
  getMetricsIngredients,
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
  FlaskIcon,
  LoadingPanel,
  neutralIconButtonClassName,
  PaginationBar,
  PlusIcon,
  SearchField,
  StatCard,
  TrashIcon,
} from "@/components/admin/ui";

const pageSize = 10;

export default function AdminIngredientsPage() {
  const [items, setItems] = useState<DermifyIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const load = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
    getMetricsIngredients()
      .then((data) => setItems(data || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id?: number) {
    if (!id) return;
    if (!confirm("Hapus ingredient ini secara permanen dari database?")) return;

    try {
      await deleteIngredient(id);
      load();
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus ingredient");
    }
  }

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;

    return items.filter(
      (item) =>
        item.name?.toLowerCase().includes(query) ||
        item.function?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query),
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
    const total = items.length;
    const withDescription = items.filter((item) => item.description?.trim()).length;
    const withFunction = items.filter((item) => item.function?.trim()).length;
    const totalUsage = items.reduce((sum, item) => sum + (item.usage_count || 0), 0);

    return { total, withDescription, withFunction, totalUsage };
  }, [items]);

  const startItem = filteredItems.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, filteredItems.length);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Manajemen Ingredient"
        description="Kelola kamus ingredient skincare, fungsi utama, deskripsi, dan pemakaian pada produk."
        action={
          <AdminLinkButton href="/admin/ingredients/create">
            <PlusIcon />
            Tambah Ingredient
          </AdminLinkButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Ingredient"
          value={stats.total.toLocaleString("id-ID")}
          icon={<FlaskIcon className="h-5 w-5" />}
          tone="slate"
        />
        <StatCard
          label="Punya Deskripsi"
          value={stats.withDescription.toLocaleString("id-ID")}
          icon={<FlaskIcon className="h-5 w-5" />}
          tone="sky"
        />
        <StatCard
          label="Punya Fungsi"
          value={stats.withFunction.toLocaleString("id-ID")}
          icon={<FlaskIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Total Pemakaian"
          value={stats.totalUsage.toLocaleString("id-ID")}
          icon={<ChartIcon className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Cari nama, fungsi, atau deskripsi..."
      />

      {error && <AlertBanner>Gagal memuat ingredient: {error}</AlertBanner>}

      {isLoading ? (
        <LoadingPanel label="Memuat data ingredient..." />
      ) : (
        <AdminTable
          headers={[
            { label: "No" },
            { label: "Ingredient" },
            { label: "Fungsi" },
            { label: "Deskripsi" },
            { label: "Pemakaian", align: "center" },
            { label: "Aksi", align: "center" },
          ]}
        >
          {paginatedItems.length === 0 ? (
            <EmptyTableRow colSpan={6}>
              {searchQuery
                ? "Tidak ada ingredient yang sesuai dengan pencarian."
                : "Belum ada data ingredient."}
            </EmptyTableRow>
          ) : (
            paginatedItems.map((item, index) => (
              <tr key={item.id} className="transition-colors hover:bg-emerald-50/30">
                <td className="whitespace-nowrap p-4 font-mono text-xs text-slate-400">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="max-w-xs p-4">
                  <p className="truncate font-semibold text-slate-950">
                    {item.name || "-"}
                  </p>
                </td>
                <td className="whitespace-nowrap p-4 text-slate-600">
                  {item.function || "-"}
                </td>
                <td className="max-w-sm p-4 text-slate-600">
                  <span className="block truncate" title={item.description || ""}>
                    {item.description || "-"}
                  </span>
                </td>
                <td className="whitespace-nowrap p-4 text-center font-semibold text-slate-700">
                  {(item.usage_count || 0).toLocaleString("id-ID")}
                </td>
                <td className="whitespace-nowrap p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/ingredients/${item.id}/edit`}
                      className={neutralIconButtonClassName}
                      title="Edit ingredient"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className={dangerIconButtonClassName}
                      title="Hapus ingredient"
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
        label="ingredient"
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalItems={filteredItems.length}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
    </AdminPageShell>
  );
}
