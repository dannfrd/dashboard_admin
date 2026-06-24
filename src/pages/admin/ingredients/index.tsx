import React from "react";
import Link from "next/link";
import { getDermifyDashboardData, DermifyIngredient, deleteIngredient } from "@/lib/dermifyApi";

export default function AdminIngredientsPage() {
  const [items, setItems] = React.useState<DermifyIngredient[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
    if (!confirm("Hapus ingredient ini?")) return;

    try {
      await deleteIngredient(id);
      load();
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus ingredient");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Ingredients</h1>
        <Link href="/admin/ingredients/create" className="rounded bg-emerald-500 px-3 py-1 text-white">Buat Ingredient</Link>
      </div>

      {error && <div className="text-rose-600">{error}</div>}

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Memuat...</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200/70 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Function</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-emerald-50/40">
                    <td className="p-4">#{it.id}</td>
                    <td className="p-4">{it.name || "-"}</td>
                    <td className="p-4">{it.function || "-"}</td>
                    <td className="p-4">{it.risk_level || "-"}</td>
                    <td className="p-4">{it.usage_count ?? 0}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/ingredients/${it.id}/edit`} className="text-emerald-600">Edit</Link>
                        <button onClick={() => handleDelete(it.id)} className="text-rose-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
