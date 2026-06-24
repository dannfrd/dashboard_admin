import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { getIngredient, updateIngredient } from "@/lib/dermifyApi";

export default function EditIngredientPage() {
  const router = useRouter();
  const { id } = router.query;
  const ingredientId = Number(id);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [fn, setFn] = React.useState("");
  const [risk, setRisk] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!ingredientId) return;
    setIsLoading(true);
    getIngredient(ingredientId)
      .then((p) => {
        setName(p.name || "");
        setDescription(p.description || "");
        setFn(p.function || "");
        setRisk(p.risk_level || "");
      })
      .catch((err: any) => alert(err?.message || "Gagal memuat ingredient"))
      .finally(() => setIsLoading(false));
  }, [ingredientId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ingredientId) return;
    setIsSaving(true);
    try {
      await updateIngredient(ingredientId, { name: name || null, description: description || null, function: fn || null, risk_level: risk || null });
      router.push("/admin/ingredients");
    } catch (err: any) {
      alert(err?.message || "Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="p-6">Memuat...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Ingredient</h1>
        <Link href="/admin/ingredients" className="text-slate-600">Kembali</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nama</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Function</label>
          <input value={fn} onChange={(e) => setFn(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Risk level</label>
          <input value={risk} onChange={(e) => setRisk(e.target.value)} className="mt-1 w-full rounded border p-2" />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={isSaving} className="rounded bg-emerald-600 px-3 py-1 text-white">{isSaving ? "Menyimpan..." : "Simpan"}</button>
          <Link href="/admin/ingredients" className="rounded border px-3 py-1">Batal</Link>
        </div>
      </form>
    </div>
  );
}
