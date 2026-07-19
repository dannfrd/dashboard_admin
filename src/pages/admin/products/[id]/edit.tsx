import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getProduct, updateProduct } from "@/lib/dermifyApi";
import {
  AdminCard,
  AdminImagePreview,
  AdminPageHeader,
  AdminPageShell,
  AlertBanner,
  FieldLabel,
  FormActions,
  inputClassName,
  LoadingPanel,
  useConfirm,
} from "@/components/admin/ui";

export default function EditProductPage() {
  const { confirm, ConfirmDialog } = useConfirm();

  const router = useRouter();
  const { id } = router.query;
  const productId = Number(id);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [barcode, setBarcode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
        setImageUrl(product.image_url || "");
      })
      .catch((err: any) => {
        setError(err?.message || "Gagal memuat detail produk");
      })
      .finally(() => setIsLoading(false));
  }, [productId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const ok = await confirm("Simpan perubahan data produk ini?");
    if (!ok) return;
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
        image_url: imageUrl.trim() || null,
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
        <ConfirmDialog />
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
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClassName}
              >
                <option value="">-- Pilih Kategori --</option>
                <optgroup label="🧴 Cleanser">
                  <option value="Cleanser">Cleanser</option>
                  <option value="Micellar Water">Micellar Water</option>
                  <option value="Cleansing Oil/Balm">Cleansing Oil / Balm</option>
                </optgroup>
                <optgroup label="💧 Basic Treatment">
                  <option value="Toner">Toner</option>
                  <option value="Essence">Essence</option>
                </optgroup>
                <optgroup label="🔬 Active Treatment">
                  <option value="Serum">Serum</option>
                  <option value="Ampoule">Ampoule</option>
                  <option value="Spot Treatment">Spot Treatment</option>
                  <option value="Retinol">Retinol</option>
                </optgroup>
                <optgroup label="🌿 Moisturizer">
                  <option value="Moisturizer">Moisturizer</option>
                  <option value="Night Cream">Night Cream</option>
                </optgroup>
                <optgroup label="👁️ Eye &amp; Lip">
                  <option value="Eye Care">Eye Care</option>
                  <option value="Lip Care">Lip Care</option>
                </optgroup>
                <optgroup label="☀️ Sunscreen">
                  <option value="Sunscreen">Sunscreen</option>
                </optgroup>
                <optgroup label="✨ Periodic Care">
                  <option value="Exfoliator">Exfoliator</option>
                  <option value="Face Mask">Face Mask</option>
                  <option value="Sheet Mask">Sheet Mask</option>
                  <option value="Facial Mist">Facial Mist</option>
                </optgroup>
                <optgroup label="🫧 Minyak Wajah">
                  <option value="Facial Oil">Facial Oil (Minyak Wajah)</option>
                </optgroup>
              </select>
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

          <div>
            <FieldLabel>URL Gambar Produk</FieldLabel>
            <input
              type="text"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://... atau /uploads/nama-file.jpg"
              className={inputClassName}
            />
            <AdminImagePreview
              src={imageUrl}
              alt={name || "Preview gambar produk"}
              className="mt-3"
            />
          </div>

          <FormActions
            cancelHref="/admin/products"
            submitLabel="Simpan Perubahan"
            isSaving={isSaving}
          />
        </form>
      </AdminCard>
      <ConfirmDialog />
    </AdminPageShell>
  );
}
