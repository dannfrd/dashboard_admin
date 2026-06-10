import Image from "next/image";
import React from "react";
import {
  DermifyAnalysis,
  DermifyDashboardData,
  DermifyIngredient,
  DermifyProduct,
  DermifyUser,
  emptyDermifyDashboardData,
  getDermifyDashboardData,
} from "@/lib/dermifyApi";

export type DashboardView =
  | "overview"
  | "analyses"
  | "users"
  | "products"
  | "ingredients"
  | "histories";

interface ContentProps {
  initialView?: DashboardView;
  title?: string;
}

const viewLabels: Record<DashboardView, string> = {
  overview: "Overview",
  analyses: "Analyses",
  users: "Users",
  products: "Products",
  ingredients: "Ingredients",
  histories: "History",
};

const statusColor: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  high: "bg-rose-50 text-rose-700 ring-rose-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  unknown: "bg-slate-50 text-slate-600 ring-slate-200",
};

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function Badge({ value }: { value?: string | null }) {
  const normalized = (value || "unknown").toLowerCase();
  const className = statusColor[normalized] || statusColor.unknown;

  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}
    >
      {value || "unknown"}
    </span>
  );
}

function Icon({
  children,
  tone = "mint",
}: {
  children: React.ReactNode;
  tone?: "mint" | "navy" | "amber" | "rose";
}) {
  const tones = {
    mint: "bg-emerald-50 text-emerald-500",
    navy: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-500",
    rose: "bg-rose-50 text-rose-500",
  };

  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone?: "mint" | "navy" | "amber" | "rose";
}) {
  return (
    <section className="rounded-lg border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <Icon tone={tone}>{icon}</Icon>
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

function Overview({ data }: { data: DermifyDashboardData }) {
  const analysis = data.summary.analysis || {};
  const ingredients = data.summary.ingredients || {};
  const entities = data.summary.entities || {};
  const completedRate =
    analysis.total && analysis.completed
      ? Math.round((analysis.completed / analysis.total) * 100)
      : 0;
  const riskTotal =
    (ingredients.low_risk || 0) +
    (ingredients.medium_risk || 0) +
    (ingredients.high_risk || 0) +
    (ingredients.unknown_risk || 0);
  const highRiskWidth = riskTotal
    ? Math.max(4, Math.round(((ingredients.high_risk || 0) / riskTotal) * 100))
    : 0;
  const latestAnalyses = data.analyses.slice(0, 4);
  const popularIngredients = [...data.ingredients]
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total analyses"
          value={formatNumber(analysis.total)}
          detail={`${formatNumber(analysis.last_24h)} scan masuk 24 jam terakhir`}
          tone="mint"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 3h10v4H7V3Zm-2 8h14M5 16h14M7 21h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <StatCard
          label="Users"
          value={formatNumber(entities.users)}
          detail={`${formatNumber(data.users.length)} user ditampilkan dari API`}
          tone="navy"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM21 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <StatCard
          label="Ingredient DB"
          value={formatNumber(ingredients.total || entities.ingredients)}
          detail={`${formatNumber(ingredients.high_risk)} high risk ingredient`}
          tone="amber"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 3v5l-5 9a3 3 0 0 0 2.6 4.5h10.8A3 3 0 0 0 20 17l-5-9V3M8 3h8M7 15h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        <StatCard
          label="Products"
          value={formatNumber(entities.products)}
          detail={`${formatNumber(entities.scans)} scan dari aplikasi mobile`}
          tone="rose"
          icon={
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 2h12l2 5v15H4V7l2-5ZM4 7h16M9 11h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          }
        />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="overflow-hidden rounded-lg border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_280px]">
            <div className="p-6">
              <p className="text-sm font-semibold text-emerald-600">
                Platform overview
              </p>
              <h1 className="mt-3 max-w-2xl text-3xl font-bold text-slate-950">
                Pantau performa analisis skincare dalam satu ruang kerja.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                Lihat aktivitas pengguna, kualitas hasil scan, dan perkembangan
                ingredient database yang digunakan oleh aplikasi Dermify.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniMetric label="Completed" value={`${completedRate}%`} />
                <MiniMetric
                  label="Last 7 days"
                  value={formatNumber(analysis.last_7d)}
                />
                <MiniMetric
                  label="Details"
                  value={formatNumber(entities.analysis_details)}
                />
                <MiniMetric
                  label="Records"
                  value={formatNumber(entities.total_records)}
                />
              </div>
            </div>
            <div className="relative min-h-[220px] bg-[#f0fbf4]">
              <Image
                src="/images/scanproduct.png"
                alt="Dermify product scan"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 280px"
                priority
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Risk distribution
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {formatNumber(riskTotal)}
              </p>
            </div>
            <Badge value="ingredients" />
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded bg-slate-100">
            <div
              className="h-full bg-rose-400"
              style={{ width: `${highRiskWidth}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <RiskLine label="Low" value={ingredients.low_risk} tone="emerald" />
            <RiskLine label="Medium" value={ingredients.medium_risk} tone="amber" />
            <RiskLine label="High" value={ingredients.high_risk} tone="rose" />
            <RiskLine
              label="Unknown"
              value={ingredients.unknown_risk}
              tone="slate"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <Panel title="Recent analysis">
          {latestAnalyses.length ? (
            <div className="divide-y divide-slate-100">
              {latestAnalyses.map((item) => (
                <AnalysisRow key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState label="Belum ada hasil analisis terbaru." />
          )}
        </Panel>
        <Panel title="Top ingredients">
          {popularIngredients.length ? (
            <div className="space-y-3">
              {popularIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {ingredient.name || "-"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {ingredient.function || "Unknown function"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge value={ingredient.risk_level} />
                    <p className="mt-1 text-xs text-slate-500">
                      {formatNumber(ingredient.usage_count)} use
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label="Ingredient belum tersedia." />
          )}
        </Panel>
      </section>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-white/80 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
  );
}

function RiskLine({
  label,
  value,
  tone,
}: {
  label: string;
  value?: number;
  tone: "emerald" | "amber" | "rose" | "slate";
}) {
  const dot = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    slate: "bg-slate-400",
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <span className="flex items-center gap-2 text-slate-600">
        <span className={`h-2.5 w-2.5 rounded-full ${dot[tone]}`} />
        {label}
      </span>
      <span className="font-semibold text-slate-900">{formatNumber(value)}</span>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AnalysisRow({ item }: { item: DermifyAnalysis }) {
  return (
    <div className="grid gap-3 py-4 md:grid-cols-[1fr_160px_120px] md:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">
          {item.product?.name || `Analysis #${item.id}`}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {item.summary || item.recommendation || "No summary"}
        </p>
      </div>
      <div className="text-sm text-slate-500">
        <p>{item.user?.name || item.user?.email || "Unknown user"}</p>
        <p className="text-xs">{formatDate(item.created_at)}</p>
      </div>
      <div className="flex md:justify-end">
        <Badge value={item.status} />
      </div>
    </div>
  );
}

function AnalysesTable({ items }: { items: DermifyAnalysis[] }) {
  if (!items.length) {
    return <EmptyState label="Tidak ada data analysis." />;
  }

  return (
    <Table
      headers={["ID", "Product", "User", "Ingredients", "Status", "Created"]}
      rows={items.map((item) => [
        `#${item.id}`,
        item.product?.name || "-",
        item.user?.name || item.user?.email || "-",
        formatNumber(item.matched_ingredient_count),
        <Badge key="status" value={item.status} />,
        formatDate(item.created_at),
      ])}
    />
  );
}

function UsersTable({ items }: { items: DermifyUser[] }) {
  if (!items.length) {
    return <EmptyState label="Tidak ada data user." />;
  }

  return (
    <Table
      headers={["ID", "Name", "Email", "Provider", "Role", "Analyses", "Joined"]}
      rows={items.map((item) => [
        `#${item.id}`,
        item.name || "-",
        item.email || "-",
        item.provider || "-",
        item.role || "-",
        formatNumber(item.analysis_count),
        formatDate(item.created_at),
      ])}
    />
  );
}

function ProductsTable({ items }: { items: DermifyProduct[] }) {
  if (!items.length) {
    return <EmptyState label="Tidak ada data product." />;
  }

  return (
    <Table
      headers={["ID", "Product", "Brand", "Category", "Scans", "Analyses"]}
      rows={items.map((item) => [
        `#${item.id}`,
        item.name || "-",
        item.brand || "-",
        item.category || "-",
        formatNumber(item.scan_count),
        formatNumber(item.analysis_count),
      ])}
    />
  );
}

function IngredientsTable({ items }: { items: DermifyIngredient[] }) {
  if (!items.length) {
    return <EmptyState label="Tidak ada data ingredient." />;
  }

  return (
    <Table
      headers={["ID", "Ingredient", "Function", "Risk", "Usage", "Created"]}
      rows={items.map((item) => [
        `#${item.id}`,
        item.name || "-",
        item.function || "-",
        <Badge key="risk" value={item.risk_level} />,
        formatNumber(item.usage_count),
        formatDate(item.created_at),
      ])}
    />
  );
}

function HistoriesTable({ data }: { data: DermifyDashboardData }) {
  if (!data.histories.length) {
    return <EmptyState label="Tidak ada data history tersimpan." />;
  }

  return (
    <Table
      headers={["ID", "User", "Analysis", "Status", "Viewed"]}
      rows={data.histories.map((item) => [
        `#${item.id}`,
        item.user_name || item.user_email || "-",
        item.analysis_id ? `#${item.analysis_id}` : "-",
        <Badge key="history-status" value={item.analysis_status} />,
        formatDate(item.viewed_at),
      ])}
    />
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              {headers.map((header) => (
                <th key={header} className="whitespace-nowrap px-4 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-emerald-50/40">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${index}-${cellIndex}`}
                    className="max-w-[300px] whitespace-nowrap p-4"
                  >
                    <span className="block truncate">{cell}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataView({
  activeView,
  data,
}: {
  activeView: DashboardView;
  data: DermifyDashboardData;
}) {
  const title = viewLabels[activeView];

  if (activeView === "overview") {
    return <Overview data={data} />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Kelola dan tinjau data operasional Dermify.
        </p>
      </div>
      {activeView === "analyses" && <AnalysesTable items={data.analyses} />}
      {activeView === "users" && <UsersTable items={data.users} />}
      {activeView === "products" && <ProductsTable items={data.products} />}
      {activeView === "ingredients" && (
        <IngredientsTable items={data.ingredients} />
      )}
      {activeView === "histories" && <HistoriesTable data={data} />}
    </div>
  );
}

export function Content({ initialView = "overview" }: ContentProps) {
  const [data, setData] = React.useState<DermifyDashboardData>(
    emptyDermifyDashboardData,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    getDermifyDashboardData()
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setData(result);
        setError(null);
      })
      .catch((caughtError: Error) => {
        if (!isMounted) {
          return;
        }

        setData(emptyDermifyDashboardData);
        setError(caughtError.message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            Dermify Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Ringkasan platform
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Pantau pengguna, produk, ingredient database, hasil analisis, dan
            histori aktivitas aplikasi Dermify.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
            {isLoading
              ? "Memuat data"
              : data.source === "api"
                ? "Data terbaru"
                : "Data tidak tersedia"}
          </span>
          <span className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-white">
            Dermify
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Data platform belum dapat dimuat. Pastikan layanan Dermify aktif,
          kemudian muat ulang halaman.
        </div>
      )}

      <DataView activeView={initialView} data={data} />
    </div>
  );
}
