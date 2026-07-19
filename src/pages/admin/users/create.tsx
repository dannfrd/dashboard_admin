import React, { useState } from "react";
import { useRouter } from "next/router";
import { createUser } from "@/lib/dermifyApi";
import {
  AdminCard,
  AdminPageHeader,
  AdminPageShell,
  AlertBanner,
  FieldLabel,
  FormActions,
  inputClassName,
} from "@/components/admin/ui";

export default function CreateUserPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!window.confirm("Buat user baru ini?")) return;

    if (!email.trim()) {
      setError("Email user wajib diisi.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await createUser({
        name: name.trim() || null,
        email: email.trim(),
        password: password.trim() || null,
        role,
      });
      router.push("/admin/users");
    } catch (err: any) {
      setError(err?.message || "Gagal membuat user");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminPageShell maxWidth="max-w-2xl">
      <AdminPageHeader
        title="Tambah User"
        description="Tambahkan akun user baru untuk aplikasi Dermify."
        backHref="/admin/users"
        backLabel="Daftar User"
      />

      {error && <AlertBanner>{error}</AlertBanner>}

      <AdminCard className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <FieldLabel>Nama</FieldLabel>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama user"
              className={inputClassName}
            />
          </div>

          <div>
            <FieldLabel required>Email</FieldLabel>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@email.com"
              className={inputClassName}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <FieldLabel>Password</FieldLabel>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Isi jika akun login manual"
                className={inputClassName}
              />
            </div>
            <div>
              <FieldLabel>Role</FieldLabel>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className={inputClassName}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <FormActions
            cancelHref="/admin/users"
            submitLabel="Simpan User"
            isSaving={isSaving}
          />
        </form>
      </AdminCard>
    </AdminPageShell>
  );
}
