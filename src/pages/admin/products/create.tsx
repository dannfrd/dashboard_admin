import React, { useState } from "react";
import { useRouter } from "next/router";
import { createProduct } from "@/lib/dermifyApi";
import {
  AdminCard,
  AdminPageHeader,
  AdminPageShell,
  AlertBanner,
  FieldLabel,
  FormActions,
  inputClassName,
} from "@/components/admin/ui";

export default function CreateProductPage() {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [barcode, setBarcode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await createProduct({
        name: name.trim(),
        brand: brand.trim() || null,
        category: category.trim() || null,
        barcode: barcode.trim() || null,
      });
      router.push("/admin/products");
    } catch (err: any) {
      setError(err?.message || "Gagal membuat produk");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminPageShell maxWidth="max-w-2xl">
      <AdminPageHeader
        title="Tambah Produk"
        description="Tambahkan produk skincare baru ke database master Dermify."
        backHref="/admin/products"
        backLabel="Daftar Produk"
      />

      {error && <AlertBanner>{error}</AlertBanner>}

      <AdminCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <FieldLabel required>Nama Produk</FieldLabel>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Hydrating Cleanser"
              className={inputClassName}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Brand</FieldLabel>
              <input
                type="text"
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                placeholder="Contoh: Dermify Lab"
                className={inputClassName}
              />
            </div>
            <div>
              <FieldLabel>Kategori</FieldLabel>
              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Contoh: Cleanser, Serum, Toner"
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Barcode Produk</FieldLabel>
            <input
              type="text"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              placeholder="Contoh: 899000000001"
              className={`${inputClassName} font-mono`}
            />
          </div>

          <FormActions
            cancelHref="/admin/products"
            submitLabel="Simpan Produk"
            isSaving={isSaving}
          />
        </form>
      </AdminCard>
    </AdminPageShell>
  );
}
