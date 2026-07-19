import React from "react";
import Link from "next/link";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const inputClassName =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export const textareaClassName = cx(inputClassName, "resize-y leading-6");

export const primaryButtonClassName =
  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClassName =
  "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

export const dangerIconButtonClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-100 bg-white text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60";

export const neutralIconButtonClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

export const positiveIconButtonClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-100 bg-white text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60";

export function resolveAdminImageSrc(src?: string | null) {
  const normalized = String(src || "").trim();
  if (!normalized) return "";
  if (/^(https?:|data:|blob:)/i.test(normalized)) return normalized;
  if (normalized.startsWith("/uploads/")) return `/api/dermify${normalized}`;
  return normalized;
}

export function AdminImagePreview({
  src,
  alt,
  className,
  compact = false,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  compact?: boolean;
}) {
  const [failed, setFailed] = React.useState(false);
  const resolvedSrc = resolveAdminImageSrc(src);
  const showImage = Boolean(resolvedSrc) && !failed;

  React.useEffect(() => {
    setFailed(false);
  }, [resolvedSrc]);

  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50",
        compact ? "h-12 w-12" : "h-48 w-full",
        className,
      )}
    >
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="px-2 text-center text-xs font-medium text-slate-400">
          Tidak ada gambar
        </span>
      )}
    </div>
  );
}

type IconProps = { className?: string };

function Svg({
  children,
  className = "h-4 w-4",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M12 8v5m0 4h.01M10.2 4.4 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.8 4.4a2 2 0 0 0-3.6 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20ZM13 6.5 17.5 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </Svg>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="m22 2-7 20-4-9-9-4 20-7ZM11 13l5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BackIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M19 12H5m6 7-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BoxIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="m21 8-9-5-9 5 9 5 9-5ZM3 8v8l9 5 9-5V8M12 13v8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FlaskIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M9 3h6M10 3v5l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V3M7 16h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M15 17H9m9 0H6l1.2-1.6c.5-.7.8-1.6.8-2.5V10a4 4 0 1 1 8 0v2.9c0 .9.3 1.8.8 2.5L18 17ZM14 19a2 2 0 0 1-4 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M4 19V5M8 17v-6M13 17V7M18 17v-3M4 19h17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function Spinner({ className = "h-4 w-4" }: IconProps) {
  return (
    <span
      className={cx(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function AdminPageShell({
  children,
  maxWidth = "max-w-6xl",
}: {
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return <div className={cx("mx-auto w-full space-y-6 pb-12", maxWidth)}>{children}</div>;
}

export function AdminPageHeader({
  title,
  description,
  action,
  backHref,
  backLabel = "Kembali",
  meta,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
          {meta}
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {backHref && (
          <Link href={backHref} className={secondaryButtonClassName}>
            <BackIcon />
            {backLabel}
          </Link>
        )}
        {action}
      </div>
    </div>
  );
}

export function AdminLinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={variant === "primary" ? primaryButtonClassName : secondaryButtonClassName}
    >
      {children}
    </Link>
  );
}

export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-lg border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
};

export type AdminTone = keyof typeof toneClass;

export function StatCard({
  label,
  value,
  icon,
  tone = "emerald",
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tone?: AdminTone;
}) {
  return (
    <AdminCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className={cx("rounded-lg p-2.5 ring-1", toneClass[tone])}>
          {icon}
        </div>
      </div>
    </AdminCard>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (_value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:max-w-md">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
        <SearchIcon className="h-5 w-5" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cx(inputClassName, "mt-0 pl-10")}
      />
    </div>
  );
}

export function AlertBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function LoadingPanel({ label }: { label: string }) {
  return (
    <AdminCard className="flex flex-col items-center justify-center p-16 text-center">
      <Spinner className="h-10 w-10 text-emerald-600" />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </AdminCard>
  );
}

export function EmptyTableRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-500">
        {children}
      </td>
    </tr>
  );
}

export function AdminTable({
  headers,
  children,
}: {
  headers: Array<{ label: string; align?: "left" | "center" | "right" }>;
  children: React.ReactNode;
}) {
  return (
    <AdminCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.label}
                  className={cx(
                    "whitespace-nowrap px-4 py-3",
                    header.align === "center" && "text-center",
                    header.align === "right" && "text-right",
                  )}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {children}
          </tbody>
        </table>
      </div>
    </AdminCard>
  );
}

export function PaginationBar({
  label,
  currentPage,
  totalPages,
  startItem,
  endItem,
  totalItems,
  onPrevious,
  onNext,
}: {
  label: string;
  currentPage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (!totalItems) return null;

  return (
    <AdminCard className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Menampilkan <span className="font-semibold text-slate-900">{startItem}</span> sampai{" "}
        <span className="font-semibold text-slate-900">{endItem}</span> dari{" "}
        <span className="font-semibold text-slate-900">{totalItems}</span> {label}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className={secondaryButtonClassName}
        >
          Sebelumnya
        </button>
        <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={secondaryButtonClassName}
        >
          Berikutnya
        </button>
      </div>
    </AdminCard>
  );
}

export function StatusBadge({
  value,
  tone,
}: {
  value?: string | null;
  tone?: AdminTone;
}) {
  const normalized = (value || "draft").toLowerCase();
  const inferredTone =
    tone ||
    (normalized === "sent" || normalized === "completed"
      ? "emerald"
      : normalized === "scheduled"
      ? "sky"
      : normalized === "failed" || normalized === "high"
      ? "rose"
      : normalized === "pending" || normalized === "medium"
      ? "amber"
      : "slate");

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
        toneClass[inferredTone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {(value || "draft").toUpperCase()}
    </span>
  );
}

export function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-800">
      {children} {required && <span className="text-rose-500">*</span>}
    </label>
  );
}

export function FormActions({
  cancelHref,
  submitLabel,
  savingLabel = "Menyimpan...",
  isSaving,
}: {
  cancelHref: string;
  submitLabel: string;
  savingLabel?: string;
  isSaving: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
      <Link href={cancelHref} className={secondaryButtonClassName}>
        Batal
      </Link>
      <button type="submit" disabled={isSaving} className={primaryButtonClassName}>
        {isSaving && <Spinner />}
        {isSaving ? savingLabel : submitLabel}
      </button>
    </div>
  );
}

export function PhoneNotificationPreview({
  title,
  body,
  label = "Preview Notifikasi",
}: {
  title?: string | null;
  body?: React.ReactNode;
  label?: string;
}) {
  const [currentTimeStr, setCurrentTimeStr] = React.useState("10:00");

  React.useEffect(() => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");
    setCurrentTimeStr(`${hrs}:${mins}`);
  }, []);

  return (
    <div className="sticky top-6">
      <h3 className="mb-3 text-sm font-semibold uppercase text-slate-500">
        {label}
      </h3>
      <div className="relative mx-auto aspect-[9/18.5] w-full max-w-[300px] overflow-hidden rounded-[38px] border-[6px] border-slate-800 bg-slate-950 shadow-xl ring-4 ring-slate-900/5">
        <div className="absolute left-1/2 top-0 z-20 flex h-5 w-24 -translate-x-1/2 items-center justify-center gap-1.5 rounded-b-lg bg-slate-900 px-3">
          <div className="h-1 w-8 rounded-full bg-slate-700" />
          <div className="h-2.5 w-2.5 rounded-full border border-slate-700 bg-slate-800" />
        </div>
        <div className="relative flex h-full w-full flex-col justify-between bg-slate-900 p-4">
          <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] font-medium text-white/80">
            <span>{currentTimeStr}</span>
            <span className="text-white/70">LTE 78%</span>
          </div>
          <div className="mt-6 select-none text-center">
            <h2 className="text-4xl font-light text-white/90">{currentTimeStr}</h2>
            <p className="mt-1 text-[10px] font-semibold uppercase text-white/60">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="absolute inset-x-3 top-[32%] z-10">
            <div className="rounded-lg border border-white/20 bg-white/90 p-3.5 text-slate-800 shadow-xl backdrop-blur">
              <div className="mb-2 flex items-center justify-between border-b border-slate-700/10 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-[10px] font-bold text-white">
                    D
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-600">
                    Dermify
                  </span>
                </div>
                <span className="text-[9px] font-medium text-slate-500">Baru</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="break-words text-xs font-bold leading-tight text-slate-900">
                  {title?.trim() || "Judul notifikasi"}
                </h4>
                <p className="break-words text-[10px] leading-snug text-slate-600">
                  {body || "Isi pesan akan terlihat di sini."}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 pb-2">
            <div className="h-1 w-24 rounded-full bg-white/70" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const [promise, setPromise] = React.useState<{
    resolve: (value: boolean) => void;
    message: string;
  } | null>(null);

  const confirm = (message: string) => {
    return new Promise<boolean>((resolve) => {
      setPromise({ resolve, message });
    });
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    setPromise(null);
  };

  const handleCancel = () => {
    promise?.resolve(false);
    setPromise(null);
  };

  const ConfirmDialog = () => {
    if (!promise) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-opacity">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Konfirmasi</h3>
          <div className="mt-2 text-sm text-slate-600">{promise.message}</div>
          <div className="mt-6 flex flex-row-reverse gap-3">
            <button
              onClick={handleConfirm}
              className={cx(primaryButtonClassName, "min-w-[80px]")}
            >
              Oke
            </button>
            <button
              onClick={handleCancel}
              className={cx(secondaryButtonClassName, "min-w-[80px]")}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { confirm, ConfirmDialog };
}
