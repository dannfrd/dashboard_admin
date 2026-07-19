import React, { useState } from "react";
import { useRouter } from "next/router";
import { createProduct } from "@/lib/dermifyApi";
import {
  AdminCard,
  AdminImagePreview,
  AdminPageHeader,
  AdminPageShell,
  AlertBanner,
  FieldLabel,
  FormActions,
  inputClassName,
  useConfirm,
} from "@/components/admin/ui";

export default function CreateProductPage() {
  const { confirm, ConfirmDialog } = useConfirm();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [barcode, setBarcode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const ok = await confirm("Buat produk baru ini?");
    if (!ok) return;
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
        image_url: imageUrl.trim() || null,
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
            submitLabel="Simpan Produk"
            isSaving={isSaving}
          />
        </form>
      </AdminCard>
      <ConfirmDialog />
    </AdminPageShell>
  );
}
