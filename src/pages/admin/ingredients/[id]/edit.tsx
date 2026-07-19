import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getIngredient, updateIngredient } from "@/lib/dermifyApi";
import {
  AdminCard,
  AdminPageHeader,
  AdminPageShell,
  AlertBanner,
  FieldLabel,
  FormActions,
  inputClassName,
  LoadingPanel,
  textareaClassName,
} from "@/components/admin/ui";

export default function EditIngredientPage() {
  const router = useRouter();
  const { id } = router.query;
  const ingredientId = Number(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fn, setFn] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ingredientId) return;

    setIsLoading(true);
    setError(null);
    getIngredient(ingredientId)
      .then((ingredient) => {
        setName(ingredient.name || "");
        setDescription(ingredient.description || "");
        setFn(ingredient.function || "");
      })
      .catch((err: any) => {
        setError(err?.message || "Gagal memuat detail ingredient");
      })
      .finally(() => setIsLoading(false));
  }, [ingredientId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!ingredientId) return;

    if (!name.trim()) {
      setError("Nama ingredient wajib diisi.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await updateIngredient(ingredientId, {
        name: name.trim(),
        description: description.trim() || null,
        function: fn.trim() || null,
      });
      router.push("/admin/ingredients");
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan perubahan ingredient");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminPageShell maxWidth="max-w-2xl">
        <LoadingPanel label="Memuat detail ingredient..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell maxWidth="max-w-2xl">
      <AdminPageHeader
        title={`Edit Ingredient #${ingredientId}`}
        description="Perbarui nama, deskripsi, atau fungsi utama ingredient."
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
            submitLabel="Simpan Perubahan"
            isSaving={isSaving}
          />
        </form>
      </AdminCard>
    </AdminPageShell>
  );
}
