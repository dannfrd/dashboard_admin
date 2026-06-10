import { useRouter } from "next/router";
import React from "react";
import { useAuth } from "./AuthContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isReady } = useAuth();

  React.useEffect(() => {
    if (isReady && !user) {
      void router.replace("/login");
    }
  }, [isReady, router, user]);

  if (!isReady || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f8f6]">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          Menyiapkan Dermify Workspace
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
