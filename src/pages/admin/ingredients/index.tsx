import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getDermifyDashboardData, DermifyIngredient, deleteIngredient } from "@/lib/dermifyApi";

export default function AdminIngredientsPage() {
  const [items, setItems] = useState<DermifyIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const load = React.useCallback(() => {
    setIsLoading(true);
    getDermifyDashboardData("ingredients")
      .then((data) => setItems(data.ingredients || []))
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id?: number) {
    if (!id) return;
    if (!confirm("Delete this ingredient permanently from the database?")) return;

    try {
      await deleteIngredient(id);
      load();
    } catch (err: any) {
      alert(err?.message || "Failed to delete ingredient");
    }
  }

  // Filter ingredients based on search query (name or function only, removing risk)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (it) =>
        (it.name && it.name.toLowerCase().includes(query)) ||
        (it.function && it.function.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  // Calculate statistics (removing risk metrics, replacing with usage counters)
  const stats = useMemo(() => {
    const total = items.length;
    const totalUsage = items.reduce((sum, it) => sum + (it.usage_count || 0), 0);
    const averageUsage = total > 0 ? (totalUsage / total).toFixed(1) : "0";
    const activeCount = items.filter((it) => (it.usage_count || 0) > 0).length;
    const inactiveCount = total - activeCount;

    return { total, averageUsage, activeCount, inactiveCount };
  }, [items]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            Ingredient Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the cosmetic/skincare ingredient database and monitor their usage frequency in products.
          </p>
        </div>
        <Link
          href="/admin/ingredients/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Ingredients
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingredients */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Ingredients</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</h3>
            </div>
            <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-400" />
        </div>

        {/* Average Usage */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Usage</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.averageUsage}</h3>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-２a２ ２ ０ ０１－２ －２z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-500" />
        </div>

        {/* Active Ingredients */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Ingredients</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.activeCount}</h3>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-500" />
        </div>

        {/* Inactive Ingredients */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inactive Ingredients</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{stats.inactiveCount}</h3>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
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
            placeholder="Search by name or function..."
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
          <span>Error loading ingredients: {error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/50 bg-white p-20 shadow-sm text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-slate-500 font-medium">Loading ingredient data...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Ingredient Name</th>
                  <th className="px-6 py-4">Main Function</th>
                  <th className="px-6 py-4 text-center">Usage Frequency</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                      {searchQuery ? "Didn't find any matching results." : "No ingredient data available."}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((it) => {
                    return (
                      <tr key={it.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">#{it.id}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{it.name || "-"}</td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{it.function || "-"}</td>
                        <td className="px-6 py-4 text-center font-semibold text-slate-700">
                          {it.usage_count ?? 0} times
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-4">
                            <Link
                              href={`/admin/ingredients/${it.id}/edit`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDelete(it.id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
