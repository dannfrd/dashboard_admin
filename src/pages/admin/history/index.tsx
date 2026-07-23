import React, { useMemo, useState } from "react";
import {
  DermifyAnalysis,
  getDermifyDashboardData,
} from "@/lib/dermifyApi";
import {
  AdminImagePreview,
  AdminPageHeader,
  AdminPageShell,
  AdminTable,
  AlertBanner,
  EmptyTableRow,
  LoadingPanel,
  PaginationBar,
  SearchField,
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

export default function AdminHistoryPage() {
  const [analyses, setAnalyses] = useState<DermifyAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const load = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
    getDermifyDashboardData("analyses")
      .then((data) => setAnalyses(data.analyses || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filteredAnalyses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return analyses;

    return analyses.filter(
      (a) =>
        a.product?.name?.toLowerCase().includes(query) ||
        a.product?.brand?.toLowerCase().includes(query) ||
        a.user?.name?.toLowerCase().includes(query) ||
        a.user?.email?.toLowerCase().includes(query)
    );
  }, [searchQuery, analyses]);

  const totalPages = Math.max(1, Math.ceil(filteredAnalyses.length / pageSize));
  const paginatedAnalyses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAnalyses.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredAnalyses]);

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredAnalyses.length);

  return (
    <AdminPageShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageHeader
          title="Riwayat Scan"
          description="Daftar seluruh riwayat scan produk oleh pengguna."
        />
      </div>

      <SearchField
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Cari produk atau email pengguna..."
      />

      {error && <AlertBanner>Gagal memuat riwayat: {error}</AlertBanner>}

      {isLoading ? (
        <LoadingPanel label="Memuat data riwayat..." />
      ) : (
        <AdminTable
          headers={[
            { label: "No" },
            { label: "Gambar" },
            { label: "Produk" },
            { label: "Pengguna" },
            { label: "Status" },
            { label: "Tanggal Scan" },
          ]}
        >
          {paginatedAnalyses.length === 0 ? (
            <EmptyTableRow colSpan={6}>
              {searchQuery
                ? "Tidak ada riwayat yang sesuai dengan pencarian."
                : "Belum ada riwayat scan."}
            </EmptyTableRow>
          ) : (
            paginatedAnalyses.map((item, index) => (
              <tr key={item.id} className="transition-colors hover:bg-emerald-50/30">
                <td className="whitespace-nowrap p-4 font-mono text-xs text-slate-400">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="whitespace-nowrap p-4">
                  <AdminImagePreview
                    src={item.image_url}
                    alt={item.product?.name || "Scan Result"}
                    compact
                  />
                </td>
                <td className="whitespace-nowrap p-4 text-slate-600">
                  {item.product?.name || item.product?.brand ? (
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{item.product?.name || "Produk"}</span>
                      <span className="text-xs text-slate-500">{item.product?.brand || "-"}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap p-4 text-slate-600">
                  {item.user?.name || item.user?.email ? (
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{item.user?.name || "Anonim"}</span>
                      <span className="text-xs text-slate-500">{item.user?.email || "-"}</span>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap p-4">
                  {item.status ? (
                    <span className="inline-flex rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                      {item.status}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap p-4 text-sm text-slate-500">
                  {formatDate(item.created_at)}
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      )}

      <PaginationBar
        label="riwayat"
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalItems={filteredAnalyses.length}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
    </AdminPageShell>
  );
}
