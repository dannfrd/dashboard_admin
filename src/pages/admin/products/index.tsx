import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteProduct,
  DermifyProduct,
  getDermifyDashboardData,
} from "@/lib/dermifyApi";
import {
  AdminLinkButton,
  AdminPageHeader,
  AdminPageShell,
  AdminTable,
  AlertBanner,
  BoxIcon,
  ChartIcon,
  EditIcon,
  EmptyTableRow,
  LoadingPanel,
  neutralIconButtonClassName,
  PaginationBar,
  PlusIcon,
  SearchField,
  StatCard,
  TrashIcon,
  dangerIconButtonClassName,
  useConfirm,
} from "@/components/admin/ui";

const pageSize = 10;

export default function AdminProductsPage() {
  const { confirm, ConfirmDialog } = useConfirm();
  const [products, setProducts] = useState<DermifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const load = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
    getDermifyDashboardData("products")
      .then((data) => setProducts(data.products || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id?: number) {
    if (!id) return;
    const ok = await confirm("Hapus produk ini secara permanen dari database?");
    if (!ok) return;

    try {
      await deleteProduct(id);
      load();
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus produk");
    }
  }

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;

    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredProducts]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const stats = useMemo(() => {
    const total = products.length;
    const totalScans = products.reduce(
      (sum, product) => sum + (product.scan_count || 0),
      0,
    );
    const categories = new Set(
      products.map((product) => product.category).filter(Boolean),
    ).size;
    const averageScans = total > 0 ? (totalScans / total).toFixed(1) : "0";

    return { total, totalScans, categories, averageScans };
  }, [products]);

  const startItem = filteredProducts.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, filteredProducts.length);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Manajemen Produk"
        description="Kelola database produk skincare, barcode, kategori, dan statistik pemindaian."
        action={
          <AdminLinkButton href="/admin/products/create">
            <PlusIcon />
            Tambah Produk
          </AdminLinkButton>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Produk"
          value={stats.total.toLocaleString("id-ID")}
          icon={<BoxIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Total Scan"
          value={stats.totalScans.toLocaleString("id-ID")}
          icon={<ChartIcon className="h-5 w-5" />}
          tone="sky"
        />
        <StatCard
          label="Kategori"
          value={stats.categories.toLocaleString("id-ID")}
          icon={<BoxIcon className="h-5 w-5" />}
          tone="slate"
        />
        <StatCard
          label="Rata-rata Scan"
          value={stats.averageScans}
          icon={<ChartIcon className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Cari nama, brand, atau kategori..."
      />

      {error && <AlertBanner>Gagal memuat produk: {error}</AlertBanner>}

      {isLoading ? (
        <LoadingPanel label="Memuat data produk..." />
      ) : (
        <AdminTable
          headers={[
            { label: "No" },
            { label: "Brand" },
            { label: "Kategori" },
            { label: "Scan", align: "center" },
            { label: "Aksi", align: "center" },
          ]}
        >
          {paginatedProducts.length === 0 ? (
            <EmptyTableRow colSpan={5}>
              {searchQuery
                ? "Tidak ada produk yang sesuai dengan pencarian."
                : "Belum ada data produk."}
            </EmptyTableRow>
          ) : (
            paginatedProducts.map((product, index) => (
              <tr key={product.id} className="transition-colors hover:bg-emerald-50/30">
                <td className="whitespace-nowrap p-4 font-mono text-xs text-slate-400">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="whitespace-nowrap p-4 text-slate-600">
                  {product.brand || "-"}
                </td>
                <td className="whitespace-nowrap p-4">
                  {product.category ? (
                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {product.category}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Belum dikategorikan</span>
                  )}
                </td>
                <td className="whitespace-nowrap p-4 text-center font-semibold text-slate-700">
                  {(product.scan_count || 0).toLocaleString("id-ID")}
                </td>
                <td className="whitespace-nowrap p-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className={neutralIconButtonClassName}
                      title="Edit produk"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product.id)}
                      className={dangerIconButtonClassName}
                      title="Hapus produk"
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
        label="produk"
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalItems={filteredProducts.length}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
      <ConfirmDialog />
    </AdminPageShell>
  );
}
