import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { useAuth } from "@/auth/AuthContext";
import { loginAdmin } from "@/lib/dermifyApi";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isReady } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isReady && user) {
      void router.replace("/");
    }
  }, [isReady, router, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await loginAdmin(email.trim(), password);
      if (result.user.role?.toLowerCase() !== "admin") {
        throw new Error("Akun ini tidak memiliki akses admin.");
      }

      login(result.token, result.user);
      void router.replace("/");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Login admin gagal.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f7f5] p-3 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1440px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:min-h-[calc(100vh-48px)] lg:grid-cols-[minmax(440px,0.82fr)_1.18fr]">
        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-[430px]">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
                <Image
                  src="/images/logo3_home.png"
                  width={34}
                  height={34}
                  alt="Dermify logo"
                  priority
                />
              </span>
              <div>
                <p className="text-xl font-bold text-slate-950">Dermify</p>
                <p className="text-xs font-semibold text-slate-400">
                  Skincare Intelligence Platform
                </p>
              </div>
            </div>

            <div className="mt-12">
              <p className="text-sm font-bold text-emerald-600">
                Admin Workspace
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-950">
                Selamat datang kembali
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
                Masuk untuk mengelola analisis, pengguna, produk, dan ingredient
                database Dermify.
              </p>
            </div>

            <form className="mt-9 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Email
                </span>
                <span className="relative mt-2 block">
                  <svg
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="m4 6 8 6 8-6M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    placeholder="dermify@gmail.com"
                    autoComplete="email"
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">
                  Password
                </span>
                <span className="relative mt-2 block">
                  <svg
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12a2 2 0 0 1 2 2v7H4v-7a2 2 0 0 1 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                    title={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      {showPassword ? (
                        <path
                          d="m4 4 16 16M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a16.4 16.4 0 0 1-2.1 3.1M6.6 6.6C4.2 8.2 3 12 3 12s3.5 7 9 7c1.3 0 2.5-.4 3.6-1"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : (
                        <path
                          d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Zm9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>
                  </button>
                </span>
              </label>

              {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Memverifikasi
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path
                        d="m9 18 6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Akses terbatas untuk administrator Dermify.
            </p>
          </div>
        </section>

        <section className="relative hidden min-h-full overflow-hidden bg-slate-950 lg:block">
          <Image
            src="/images/scanproduct.png"
            alt="Dermify skincare product analysis"
            fill
            className="object-cover"
            sizes="60vw"
            priority
          />
          <div className="absolute inset-0 bg-slate-950/70" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Dermify Operations
            </div>

            <div className="max-w-xl text-white">
              <p className="text-sm font-semibold text-emerald-200">
                Smart skincare management
              </p>
              <h2 className="mt-4 text-5xl font-bold leading-tight">
                Keputusan yang lebih baik dimulai dari data yang jelas.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-7 text-white opacity-75">
                Pantau aktivitas analisis dan jaga kualitas data skincare
                Dermify dari satu ruang kerja yang aman.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
