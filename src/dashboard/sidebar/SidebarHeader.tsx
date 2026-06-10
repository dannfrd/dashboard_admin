import Image from "next/image";

export function SidebarHeader() {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-100">
          <Image
            src="/images/logo3_home.png"
            width={36}
            height={36}
            alt="Dermify logo"
            className="h-9 w-9 object-contain"
            priority
          />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-950">Dermify</p>
          <p className="text-xs font-medium text-slate-400">
            Admin Workspace
          </p>
        </div>
      </div>
    </div>
  );
}
