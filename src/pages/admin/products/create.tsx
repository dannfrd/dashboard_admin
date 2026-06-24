import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createProduct } from "@/lib/dermifyApi";

export default function CreateProductPage() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [barcode, setBarcode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama produk wajib diisi");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        brand: brand.trim() || null,
        category: category.trim() || null,
        barcode: barcode.trim() || null,
      };
      await createProduct(payload as any);
      router.push(`/admin/products`);
    } catch (err: any) {
      setError(err?.message || "Gagal membuat produk");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buat Produk Baru</h1>
          <p className="text-xs text-slate-500 mt-0.5">Tambahkan produk skincare baru ke dalam database master Dermify.</p>
        </div>
        <Link 
          href="/admin/products" 
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-950 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Batal
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700 flex items-center gap-2.5">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-800">Nama Produk <span className="text-rose-500">*</span></label>
          <input 
            type="text"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Contoh: Hydrating Cleanser"
            className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800">Merek (Brand)</label>
            <input 
              type="text"
              value={brand} 
              onChange={(e) => setBrand(e.target.value)} 
              placeholder="Contoh: Dermify Lab"
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-800">Kategori</label>
            <input 
              type="text"
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              placeholder="Contoh: Cleanser, Serum, Toner"
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800">Kode Barcode (Opsional)</label>
          <input 
            type="text"
            value={barcode} 
            onChange={(e) => setBarcode(e.target.value)} 
            placeholder="Contoh: 899000000001"
            className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder:text-slate-400 font-mono"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 mt-6">
          <Link 
            href="/admin/products" 
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Membuat...
              </>
            ) : (
              "Buat Produk"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
