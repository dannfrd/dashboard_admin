import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getProduct, updateProduct } from "@/lib/dermifyApi";
import {
  AdminCard,
  AdminPageHeader,
  AdminPageShell,
  AlertBanner,
  FieldLabel,
  FormActions,
  inputClassName,
  LoadingPanel,
} from "@/components/admin/ui";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const productId = Number(id);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    setIsLoading(true);
    setError(null);
    getProduct(productId)
      .then((product) => {
        setName(product.name || "");
        setBrand(product.brand || "");
        setCategory(product.category || "");
        setBarcode(product.barcode || "");
      })
      .catch((err: any) => {
        setError(err?.message || "Gagal memuat detail produk");
      })
      .finally(() => setIsLoading(false));
  }, [productId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!productId) return;

    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await updateProduct(productId, {
        name: name.trim(),
        brand: brand.trim() || null,
        category: category.trim() || null,
        barcode: barcode.trim() || null,
      });
      router.push("/admin/products");
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan perubahan produk");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminPageShell maxWidth="max-w-2xl">
        <LoadingPanel label="Memuat detail produk..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell maxWidth="max-w-2xl">
      <AdminPageHeader
        title={`Edit Produk #${productId}`}
        description="Perbarui nama, brand, kategori, atau barcode produk."
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
            submitLabel="Simpan Perubahan"
            isSaving={isSaving}
          />
        </form>
      </AdminCard>
    </AdminPageShell>
  );
}
