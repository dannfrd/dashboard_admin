import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createProduct } from "@/lib/dermifyApi";

export default function CreateProductPage() {
  const [name, setName] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [barcode, setBarcode] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert("Nama produk wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      const payload = { name: name.trim(), brand: brand.trim() || null, category: category.trim() || null, barcode: barcode.trim() || null };
      const res = await createProduct(payload as any);
      router.push(`/admin/products`);
    } catch (err: any) {
      alert(err?.message || "Gagal membuat produk");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Buat Produk Baru</h1>
        <Link href="/admin/products" className="text-slate-600">Kembali</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nama</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Brand</label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Barcode</label>
          <input value={barcode} onChange={(e) => setBarcode(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={isSaving} className="rounded bg-emerald-600 px-3 py-1 text-white">
            {isSaving ? "Menyimpan..." : "Buat"}
          </button>
          <Link href="/admin/products" className="rounded border px-3 py-1">Batal</Link>
        </div>
      </form>
    </div>
  );
}
