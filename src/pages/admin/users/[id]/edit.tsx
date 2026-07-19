import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getUser, updateUser } from "@/lib/dermifyApi";
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

export default function EditUserPage() {
  const router = useRouter();
  const { id } = router.query;
  const userId = Number(id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    getUser(userId)
      .then((user) => {
        setName(user.name || "");
        setEmail(user.email || "");
        setRole(user.role || "user");
      })
      .catch((err: any) => {
        setError(err?.message || "Gagal memuat detail user");
      })
      .finally(() => setIsLoading(false));
  }, [userId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;

    if (!email.trim()) {
      setError("Email user wajib diisi.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await updateUser(userId, {
        name: name.trim() || null,
        email: email.trim(),
        password: password.trim() || null,
        role,
      });
      router.push("/admin/users");
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan perubahan user");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AdminPageShell maxWidth="max-w-2xl">
        <LoadingPanel label="Memuat detail user..." />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell maxWidth="max-w-2xl">
      <AdminPageHeader
        title={`Edit User #${userId}`}
        description="Perbarui nama, email, role, atau reset password user."
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
              <FieldLabel>Password Baru</FieldLabel>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Kosongkan jika tidak diganti"
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
            submitLabel="Simpan Perubahan"
            isSaving={isSaving}
          />
        </form>
      </AdminCard>
    </AdminPageShell>
  );
}
