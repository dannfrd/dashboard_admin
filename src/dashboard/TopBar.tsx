import React from "react";
import { useAuth } from "@/auth/AuthContext";
import { useDashboardContext } from "./Provider";

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "Admin";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function TopBar() {
  const { openSidebar } = useDashboardContext();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function closeProfile(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", closeProfile);
    return () => document.removeEventListener("mousedown", closeProfile);
  }, []);

  return (
    <header className="relative z-20 h-20 border-b border-slate-200/70 bg-white">
      <div className="mx-auto flex h-full items-center gap-4 px-4 md:px-8">
        <button
          type="button"
          aria-expanded="false"
          aria-label="Buka navigasi"
          onClick={openSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-950">
            Dermify Operations
          </p>
          <p className="truncate text-xs text-slate-500">
            Skincare intelligence and platform activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            API Connected
          </span>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              aria-expanded={profileOpen}
              className="flex h-12 items-center gap-3 rounded-md border border-slate-200 bg-white px-2.5 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-xs font-bold text-white">
                {initials(user?.name, user?.email)}
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-[150px] truncate text-sm font-bold text-slate-900">
                  {user?.name || "Dermify Admin"}
                </span>
                <span className="block text-xs font-medium text-slate-500">
                  Administrator
                </span>
              </span>
              <svg
                className="hidden h-4 w-4 text-slate-400 sm:block"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="m7 10 5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 p-4">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {user?.name || "Dermify Admin"}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {user?.email}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Logout admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
