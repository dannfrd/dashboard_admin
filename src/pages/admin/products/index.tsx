import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getDermifyDashboardData, DermifyProduct, deleteProduct } from "@/lib/dermifyApi";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<DermifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const load = React.useCallback(() => {
    setIsLoading(true);
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
    if (!confirm("Delete this product permanently from the database?")) return;

    try {
      await deleteProduct(id);
      load();
    } catch (err: any) {
      alert(err?.message || "Failed to delete product");
    }
  }

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
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

  // Calculate statistics
  const stats = useMemo(() => {
    const total = products.length;
    const totalScans = products.reduce((sum, p) => sum + (p.scan_count || 0), 0);
    const uniqueCategories = new Set(products.map((p) => p.category).filter(Boolean)).size;
    const averageScans = total > 0 ? (totalScans / total).toFixed(1) : "0";

    return { total, totalScans, uniqueCategories, averageScans };
  }, [products]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            Product Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage skincare product database, monitor scan statistics, and update product barcode data.
          </p>
        </div>
        <Link
          href="/admin/products/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Products</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</h3>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500" />
        </div>

        {/* Total Scans */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Scans</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.totalScans}</h3>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500" />
        </div>

        {/* Unique Categories */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.uniqueCategories}</h3>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-purple-500" />
        </div>

        {/* Average Scans */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Scans</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.averageScans}</h3>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-amber-500" />
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, brand, or category..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-white text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error loading products: {error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/50 bg-white p-20 shadow-sm text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-500 font-medium">Loading product data...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Total Scans</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                      {searchQuery ? "Tidak menemukan hasil produk yang cocok." : "Belum ada data produk."}
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p, index) => (
                    <tr key={p.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{p.name || "-"}</div>
                        {p.barcode && <div className="text-xs text-slate-400 font-mono mt-0.5">Barcode: {p.barcode}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{p.brand || "-"}</td>
                      <td className="px-6 py-4">
                        {p.category ? (
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 border border-slate-200/50">
                            {p.category}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Not categorized</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-700">
                        {p.scan_count ?? 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredProducts.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">
              {Math.min(currentPage * pageSize, filteredProducts.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-900">{filteredProducts.length}</span> products
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
