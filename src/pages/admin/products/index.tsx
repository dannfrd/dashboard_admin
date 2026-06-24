import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getDermifyDashboardData, DermifyProduct, deleteProduct } from "@/lib/dermifyApi";

export default function AdminProductsPage() {
  const [products, setProducts] = React.useState<DermifyProduct[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

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
    if (!confirm("Hapus produk ini?")) return;

    try {
      await deleteProduct(id);
      load();
    } catch (err: any) {
      alert(err?.message || "Gagal menghapus produk");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kelola Produk</h1>
        <Link href="/admin/products/create" className="rounded bg-emerald-500 px-3 py-1 text-white">
          Buat Produk
        </Link>
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
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Scans</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-emerald-50/40">
                    <td className="p-4">#{p.id}</td>
                    <td className="p-4">{p.name || "-"}</td>
                    <td className="p-4">{p.brand || "-"}</td>
                    <td className="p-4">{p.category || "-"}</td>
                    <td className="p-4">{p.scan_count ?? 0}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link href={`/admin/products/${p.id}/edit`} className="text-emerald-600">Edit</Link>
                        <button onClick={() => handleDelete(p.id)} className="text-rose-600">Delete</button>
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
