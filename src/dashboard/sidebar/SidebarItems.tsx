import Link from "next/link";
import { useRouter } from "next/router";
import { data } from "./data";

export function SidebarItems() {
  const { pathname } = useRouter();

  return (
    <nav className="flex min-h-[calc(100vh-93px)] flex-col px-4 py-5">
      <p className="mb-3 px-3 text-xs font-semibold uppercase text-slate-400">
        Workspace
      </p>
      <ul className="space-y-1">
        {data.map((item) => {
          const isActive = item.link === pathname;

          return (
            <li key={item.title}>
              <Link
                href={item.link}
                className={`flex items-center gap-3 rounded-lg p-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
                <span>{item.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <p className="text-sm font-bold text-slate-950">Platform online</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Data operasional Dermify tersinkron dengan layanan analisis.
        </p>
      </div>
    </nav>
  );
}
