import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { createIngredient } from "@/lib/dermifyApi";

export default function CreateIngredientPage() {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [fn, setFn] = React.useState("");
  const [risk, setRisk] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert("Nama ingredient wajib diisi");
      return;
    }

    setIsSaving(true);
    try {
      await createIngredient({ name: name.trim(), description: description.trim() || null, function: fn.trim() || null, risk_level: risk.trim() || null } as any);
      router.push("/admin/ingredients");
    } catch (err: any) {
      alert(err?.message || "Gagal membuat ingredient");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Buat Ingredient Baru</h1>
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
          <button type="submit" disabled={isSaving} className="rounded bg-emerald-600 px-3 py-1 text-white">{isSaving ? "Menyimpan..." : "Buat"}</button>
          <Link href="/admin/ingredients" className="rounded border px-3 py-1">Batal</Link>
        </div>
      </form>
    </div>
  );
}
