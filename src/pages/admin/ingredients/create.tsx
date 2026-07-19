import React, { useState } from "react";
import { useRouter } from "next/router";
import { createIngredient } from "@/lib/dermifyApi";
import {
  AdminCard,
  AdminPageHeader,
  AdminPageShell,
  AlertBanner,
  FieldLabel,
  FormActions,
  inputClassName,
  textareaClassName,
} from "@/components/admin/ui";

export default function CreateIngredientPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fn, setFn] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!window.confirm("Buat ingredient baru ini?")) return;
    if (!name.trim()) {
      setError("Nama ingredient wajib diisi.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await createIngredient({
        name: name.trim(),
        description: description.trim() || null,
        function: fn.trim() || null,
      });
      router.push("/admin/ingredients");
    } catch (err: any) {
      setError(err?.message || "Gagal membuat ingredient");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminPageShell maxWidth="max-w-2xl">
      <AdminPageHeader
        title="Tambah Ingredient"
        description="Tambahkan ingredient skincare baru ke kamus master Dermify."
        backHref="/admin/ingredients"
        backLabel="Daftar Ingredient"
      />

      {error && <AlertBanner>{error}</AlertBanner>}

      <AdminCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <FieldLabel required>Nama Ingredient</FieldLabel>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: SALICYLIC ACID"
              className={`${inputClassName} font-semibold`}
              required
            />
          </div>

          <div>
            <FieldLabel>Deskripsi / Efek</FieldLabel>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tulis manfaat atau potensi efek samping ingredient ini..."
              rows={4}
              className={textareaClassName}
            />
          </div>

          <div>
            <FieldLabel>Fungsi Utama</FieldLabel>
            <input
              type="text"
              value={fn}
              onChange={(event) => setFn(event.target.value)}
              placeholder="Contoh: Exfoliant, Solvent"
              className={inputClassName}
            />
          </div>

          <FormActions
            cancelHref="/admin/ingredients"
            submitLabel="Simpan Ingredient"
            isSaving={isSaving}
          />
        </form>
      </AdminCard>
    </AdminPageShell>
  );
}
