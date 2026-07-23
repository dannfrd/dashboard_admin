import React from "react";
import Link from "next/link";
import {
  DermifyAnalysis,
  DermifyDashboardData,
  DermifyDashboardView,
  DermifyIngredient,
  DermifyProduct,
  DermifyUser,
  emptyDermifyDashboardData,
  getDermifyDashboardData,
  deleteProduct,
  deleteIngredient,
} from "@/lib/dermifyApi";
import { Spinner } from "@/components/admin/ui";

export type DashboardView = DermifyDashboardView;

interface ContentProps {
  initialView?: DashboardView;
  title?: string;
}

const viewLabels: Record<DashboardView, string> = {
  overview: "Overview",
  analyses: "Analysis",
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

function PaginationBar({
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
  if (!totalItems) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200/70 bg-white px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-900">{startItem}</span> to{" "}
        <span className="font-semibold text-slate-900">{endItem}</span> of{" "}
        <span className="font-semibold text-slate-900">{formatNumber(totalItems)}</span> {label}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function usePagedItems<T>(items: T[], pageSize = 10) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginatedItems = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [currentPage, items, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startItem = items.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, items.length);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    startItem,
    endItem,
    setCurrentPage,
  };
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

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <section className="h-full rounded-lg border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
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
  const latestAnalyses = data.analyses.slice(0, 4);
  const popularIngredients = [...data.ingredients]
    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/analyses" className="block">
          <StatCard
            label="Total Analysis"
            value={formatNumber(analysis.total)}
            detail={`${formatNumber(analysis.last_24h)} scans entered in the last 24 hours`}
          />
        </Link>
        <Link href="/users" className="block">
          <StatCard
            label="Users"
            value={formatNumber(entities.users)}
            detail="Total accounts stored in the platform"
          />
        </Link>
        <Link href="/ingredients" className="block">
          <StatCard
            label="Ingredient DB"
            value={formatNumber(ingredients.total || entities.ingredients)}
            detail={`${formatNumber(ingredients.high_risk)} high risk ingredient`}
          />
        </Link>
        <Link href="/products" className="block">
          <StatCard
            label="Products"
            value={formatNumber(entities.products)}
            detail={`${formatNumber(entities.scans)} scans from the mobile app`}
          />
        </Link>
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
            <EmptyState label="No recent analysis results available." />
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
  const pageSize = 10;
  const {
    currentPage,
    totalPages,
    paginatedItems,
    startItem,
    endItem,
    setCurrentPage,
  } = usePagedItems(items, pageSize);

  if (!items.length) {
    return <EmptyState label="Tidak ada data analysis." />;
  }

  return (
    <div className="space-y-4">
      <Table
        headers={["No", "Product", "User", "Ingredients", "Status", "Created"]}
        rows={paginatedItems.map((item, index) => [
          String((currentPage - 1) * pageSize + index + 1),
          item.product?.name || "-",
          item.user?.name || item.user?.email || "-",
          formatNumber(item.matched_ingredient_count),
          <Badge key="status" value={item.status} />,
          formatDate(item.created_at),
        ])}
      />
      <PaginationBar
        label="analyses"
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalItems={items.length}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
    </div>
  );
}

function UsersTable({ items }: { items: DermifyUser[] }) {
  const pageSize = 10;
  const {
    currentPage,
    totalPages,
    paginatedItems,
    startItem,
    endItem,
    setCurrentPage,
  } = usePagedItems(items, pageSize);

  if (!items.length) {
    return <EmptyState label="Tidak ada data user." />;
  }

  return (
    <div className="space-y-4">
      <Table
        headers={["No", "Name", "Email", "Provider", "Role", "Analyses", "Joined"]}
        rows={paginatedItems.map((item, index) => [
          String((currentPage - 1) * pageSize + index + 1),
          item.name || "-",
          item.email || "-",
          item.provider || "-",
          item.role || "-",
          formatNumber(item.analysis_count),
          formatDate(item.created_at),
        ])}
      />
      <PaginationBar
        label="users"
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalItems={items.length}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
    </div>
  );
}

function ProductsTable({ items, onDelete }: { items: DermifyProduct[]; onDelete?: (_id: number) => Promise<void> }) {
  const pageSize = 10;
  const {
    currentPage,
    totalPages,
    paginatedItems,
    startItem,
    endItem,
    setCurrentPage,
  } = usePagedItems(items, pageSize);

  if (!items.length) {
    return <EmptyState label="Tidak ada data product." />;
  }

  const headers = ["No", "Brand", "Category", "Scans", "Analyses"];
  if (onDelete) headers.push("Actions");

  const rows = paginatedItems.map((item, index) => {
    const base = [
      String((currentPage - 1) * pageSize + index + 1),
      item.brand || "-",
      item.category || "-",
      formatNumber(item.scan_count),
      formatNumber(item.analysis_count),
    ] as React.ReactNode[];

    if (onDelete) {
      base.push(
        <div className="flex gap-3">
          <Link key="edit" href={`/admin/products/${item.id}/edit`} className="text-emerald-600">Edit</Link>
          <button
            key="del"
            onClick={async () => {
              if (!confirm("Delete this product?")) return;
              try {
                await onDelete(item.id);
              } catch (err: any) {
                alert(err?.message || "Failed to delete product");
              }
            }}
            className="text-rose-600"
          >
            Delete
          </button>
        </div>,
      );
    }

    return base;
  });

  return (
    <div className="space-y-4">
      <Table headers={["No", "Brand", "Category", "Scans", "Analyses", ...(onDelete ? ["Actions"] : [])]} rows={rows} />
      <PaginationBar
        label="products"
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalItems={items.length}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
    </div>
  );
}

function IngredientsTable({ items, onDelete }: { items: DermifyIngredient[]; onDelete?: (_id: number) => Promise<void> }) {
  if (!items.length) {
    return <EmptyState label="Tidak ada data ingredient." />;
  }

  const headers = ["ID", "Ingredient", "Function", "Risk", "Usage", "Created"];
  if (onDelete) headers.push("Actions");

  const rows = items.map((item) => {
    const base: React.ReactNode[] = [
      `#${item.id}`,
      item.name || "-",
      item.function || "-",
      <Badge key="risk" value={item.risk_level} />,
      formatNumber(item.usage_count),
      formatDate(item.created_at),
    ];

    if (onDelete) {
      base.push(
        <div className="flex gap-3">
          <Link key="edit" href={`/admin/ingredients/${item.id}/edit`} className="text-emerald-600">
            Edit
          </Link>
          <button
            key="del"
            onClick={async () => {
              if (!confirm("Delete this ingredient?")) return;
              try {
                await onDelete(item.id);
              } catch (err: any) {
                alert(err?.message || "Failed to delete ingredient");
              }
            }}
            className="text-rose-600"
          >
            Delete
          </button>
        </div>,
      );
    }

    return base;
  });

  return <Table headers={headers} rows={rows} />;
}

type HistoryActivity = {
  key: string;
  user: string;
  product: string;
  detail: string;
  status?: string | null;
  date?: string | null;
};

function HistoriesTable({ data }: { data: DermifyDashboardData }) {
  const items = React.useMemo<HistoryActivity[]>(() => {
    const historyItems = data.histories.map((item) => ({
      key: `history-${item.id}`,
      user: item.user_name || item.user_email || "-",
      product:
        item.product_name || item.product_brand
          ? [item.product_brand, item.product_name].filter(Boolean).join(" - ")
          : "-",
      detail:
        item.summary ||
        item.recommendation ||
        item.raw_text ||
        "User membuka riwayat analisis.",
      status: item.analysis_status,
      date: item.viewed_at || item.analysis_created_at || item.created_at,
    }));

    const analysisItems = data.analyses.map((item) => ({
      key: `analysis-${item.id}`,
      user: item.user?.name || item.user?.email || "-",
      product:
        item.product?.name || item.product?.brand
          ? [item.product?.brand, item.product?.name].filter(Boolean).join(" - ")
          : "-",
      detail:
        item.summary ||
        item.recommendation ||
        item.raw_text ||
        `${formatNumber(item.matched_ingredient_count)} matched ingredient`,
      status: item.status,
      date: item.created_at,
    }));

    return [...historyItems, ...analysisItems].sort((first, second) => {
      const firstTime = first.date ? new Date(first.date).getTime() : 0;
      const secondTime = second.date ? new Date(second.date).getTime() : 0;
      return secondTime - firstTime;
    });
  }, [data.analyses, data.histories]);

  const pageSize = 10;
  const {
    currentPage,
    totalPages,
    paginatedItems,
    startItem,
    endItem,
    setCurrentPage,
  } = usePagedItems(items, pageSize);

  if (!items.length) {
    return <EmptyState label="No history data available." />;
  }

  return (
    <div className="space-y-4">
      <PaginationBar
        label="history records"
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalItems={items.length}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
      <Table
        headers={["No", "User", "Product", "Detail", "Status", "Time"]}
        rows={paginatedItems.map((item, index) => [
          String((currentPage - 1) * pageSize + index + 1),
          item.user,
          (
            <span key="product" className="font-semibold text-slate-900">
              {item.product}
            </span>
          ),
          item.detail,
          <Badge key="history-status" value={item.status} />,
          formatDate(item.date),
        ])}
      />
      <PaginationBar
        label="history records"
        currentPage={currentPage}
        totalPages={totalPages}
        startItem={startItem}
        endItem={endItem}
        totalItems={items.length}
        onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
      />
    </div>
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">Manage and review Dermify operational data.</p>
        </div>
        {activeView === "products" && (
          <div>
            <Link href="/admin/products/create" className="rounded bg-emerald-500 px-3 py-1 text-white">
              Create Product
            </Link>
          </div>
        )}
      </div>
      {activeView === "analyses" && <AnalysesTable items={data.analyses} />}
      {activeView === "users" && <UsersTable items={data.users} />}
      {activeView === "products" && <ProductsTable items={data.products} onDelete={async (id: number) => {
        // default delete handler uses API client and reloads data via full page refresh as fallback
        try {
          await deleteProduct(id);
          // After delete, refresh page to fetch new data
          location.reload();
        } catch (err: any) {
          alert(err?.message || "Failed to delete product");
        }
      }} />}
      {activeView === "ingredients" && <IngredientsTable items={data.ingredients} onDelete={async (id: number) => {
        try {
          await deleteIngredient(id);
          location.reload();
        } catch (err: any) {
          alert(err?.message || "Failed to delete ingredient");
        }
      }} />}
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

    getDermifyDashboardData(initialView)
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
  }, [initialView]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Platform Summary
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Monitor user activities, analysis results, and ingredient database developments.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Platform data could not be loaded. Please ensure the Dermify service is active,
          then reload the page.
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          <Spinner className="mx-auto h-10 w-10 text-emerald-600" />
          <p className="mt-4 font-medium">Loading platform data...</p>
          <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="h-3 animate-pulse rounded-full bg-slate-100" />
            <div className="h-3 animate-pulse rounded-full bg-slate-100" />
            <div className="h-3 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ) : (
        <DataView activeView={initialView} data={data} />
      )}
    </div>
  );
}
