
import { AdminUser, getStoredAdminToken } from "@/auth/AuthContext";

export type MetricsSummary = {
  analysis: {
    total?: number;
    pending?: number;
    completed?: number;
    failed?: number;
    last_24h?: number;
    last_7d?: number;
    average_per_day?: number;
    last_created_at?: string | null;
  };
  ingredients: {
    total?: number;
    low_risk?: number;
    medium_risk?: number;
    high_risk?: number;
    unknown_risk?: number;
    high_comedogenic?: number;
    last_updated_at?: string | null;
    by_risk_level?: Record<string, number>;
  };
  entities: Record<string, number>;
  generated_at?: string;
};

export type DermifyUser = {
  id: number;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  provider?: string | null;
  analysis_count: number;
  last_analysis_at?: string | null;
  created_at?: string | null;
};

export type DermifyProduct = {
  id: number;
  name?: string | null;
  brand?: string | null;
  category?: string | null;
  barcode?: string | null;
  scan_count: number;
  analysis_count: number;
  created_at?: string | null;
};

export type DermifyIngredient = {
  id: number;
  name?: string | null;
  function?: string | null;
  risk_level?: string | null;
  usage_count: number;
  created_at?: string | null;
};

export type DermifyAnalysis = {
  id: number;
  scan_id?: number | null;
  raw_text?: string | null;
  summary?: string | null;
  recommendation?: string | null;
  status?: string | null;
  matched_ingredient_count?: number | null;
  matched_ingredients?: string[] | null;
  detail_count?: number | null;
  user?: {
    id?: number | null;
    name?: string | null;
    email?: string | null;
  } | null;
  product?: {
    id?: number | null;
    name?: string | null;
    brand?: string | null;
    category?: string | null;
  } | null;
  created_at?: string | null;
};

export type DermifyHistory = {
  id: number;
  user_id?: number | null;
  user_name?: string | null;
  user_email?: string | null;
  analysis_id?: number | null;
  analysis_status?: string | null;
  analysis_created_at?: string | null;
  viewed_at?: string | null;
};

export type DermifyDashboardData = {
  summary: MetricsSummary;
  users: DermifyUser[];
  products: DermifyProduct[];
  ingredients: DermifyIngredient[];
  analyses: DermifyAnalysis[];
  histories: DermifyHistory[];
  source: "api" | "sample" | "unavailable";
};

const API_BASE_URL = "/api/dermify";

export type AdminLoginResponse = {
  token: string;
  user: AdminUser;
};

function getHeaders(): Record<string, string> | undefined {
  const token = getStoredAdminToken();

  if (token) {
    return { Authorization: `Bearer ${token}` };
  }

  return undefined;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`FastAPI ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function loginAdmin(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const payload = (await response.json()) as
    | AdminLoginResponse
    | { detail?: string };

  if (!response.ok || !("token" in payload)) {
    throw new Error(
      "detail" in payload && payload.detail
        ? payload.detail
        : "Login admin gagal",
    );
  }

  return payload;
}

export async function getDermifyDashboardData(): Promise<DermifyDashboardData> {
  const [summary, users, products, ingredients, analyses, histories] =
    await Promise.all([
      getJson<MetricsSummary>("/metrics/summary"),
      getJson<DermifyUser[]>("/metrics/users?limit=200"),
      getJson<DermifyProduct[]>("/metrics/products?limit=200"),
      getJson<DermifyIngredient[]>("/metrics/ingredients?limit=200"),
      getJson<DermifyAnalysis[]>("/metrics/analyses?limit=200"),
      getJson<DermifyHistory[]>("/metrics/user-histories?limit=200"),
    ]);

  return {
    summary,
    users,
    products,
    ingredients,
    analyses,
    histories,
    source: "api",
  };
}

export const sampleDermifyDashboardData: DermifyDashboardData = {
  source: "sample",
  summary: {
    analysis: {
      total: 128,
      completed: 119,
      pending: 5,
      failed: 4,
      last_24h: 12,
      last_7d: 46,
      average_per_day: 6.8,
      last_created_at: "2026-06-07T14:30:00",
    },
    ingredients: {
      total: 10482,
      low_risk: 8120,
      medium_risk: 1540,
      high_risk: 237,
      unknown_risk: 585,
      high_comedogenic: 237,
      last_updated_at: "2026-06-06T09:10:00",
      by_risk_level: {
        low: 8120,
        medium: 1540,
        high: 237,
        unknown: 585,
      },
    },
    entities: {
      users: 42,
      products: 88,
      ingredients: 10482,
      scans: 156,
      analyses: 128,
      analysis_details: 1960,
      scan_ingredients: 2214,
      user_histories: 74,
      total_records: 15144,
    },
  },
  users: [
    {
      id: 1,
      name: "Admin Dermify",
      email: "admin@dermify.local",
      role: "admin",
      provider: "manual",
      analysis_count: 35,
      last_analysis_at: "2026-06-07T14:30:00",
      created_at: "2026-05-21T10:15:00",
    },
    {
      id: 2,
      name: "Pengguna Mobile",
      email: "user@dermify.local",
      role: "user",
      provider: "google",
      analysis_count: 12,
      last_analysis_at: "2026-06-06T19:12:00",
      created_at: "2026-05-25T08:00:00",
    },
  ],
  products: [
    {
      id: 1,
      name: "Hydrating Cleanser",
      brand: "Dermify Sample",
      category: "Cleanser",
      barcode: "899000000001",
      scan_count: 22,
      analysis_count: 22,
      created_at: "2026-06-06T10:45:00",
    },
    {
      id: 2,
      name: "Daily Barrier Serum",
      brand: "Skin Lab",
      category: "Serum",
      barcode: null,
      scan_count: 17,
      analysis_count: 15,
      created_at: "2026-06-05T15:20:00",
    },
  ],
  ingredients: [
    {
      id: 1,
      name: "AQUA",
      function: "Solvent",
      risk_level: "low",
      usage_count: 91,
      created_at: "2026-05-30T12:00:00",
    },
    {
      id: 2,
      name: "FRAGRANCE",
      function: "Perfuming",
      risk_level: "medium",
      usage_count: 31,
      created_at: "2026-05-30T12:10:00",
    },
    {
      id: 3,
      name: "HYDROQUINONE",
      function: "Skin lightening",
      risk_level: "high",
      usage_count: 4,
      created_at: "2026-06-01T09:00:00",
    },
  ],
  analyses: [
    {
      id: 101,
      scan_id: 88,
      summary: "Bahan dikenali: 18. Belum dikenali: 1.",
      recommendation:
        "Formula cukup aman, tetapi tetap lakukan patch test sebelum pemakaian rutin.",
      status: "completed",
      matched_ingredient_count: 18,
      matched_ingredients: ["AQUA", "GLYCERIN", "NIACINAMIDE"],
      detail_count: 18,
      user: {
        id: 2,
        name: "Pengguna Mobile",
        email: "user@dermify.local",
      },
      product: {
        id: 1,
        name: "Hydrating Cleanser",
        brand: "Dermify Sample",
        category: "Cleanser",
      },
      created_at: "2026-06-07T14:30:00",
    },
    {
      id: 100,
      scan_id: 87,
      summary: "Bahan dikenali: 12. Belum dikenali: 3.",
      recommendation:
        "Ada bahan yang belum dikenali. Lengkapi master ingredients agar analisis lebih akurat.",
      status: "completed",
      matched_ingredient_count: 12,
      matched_ingredients: ["AQUA", "FRAGRANCE"],
      detail_count: 12,
      user: {
        id: 1,
        name: "Admin Dermify",
        email: "admin@dermify.local",
      },
      product: {
        id: 2,
        name: "Daily Barrier Serum",
        brand: "Skin Lab",
        category: "Serum",
      },
      created_at: "2026-06-06T19:12:00",
    },
  ],
  histories: [
    {
      id: 1,
      user_id: 2,
      user_name: "Pengguna Mobile",
      user_email: "user@dermify.local",
      analysis_id: 101,
      analysis_status: "completed",
      analysis_created_at: "2026-06-07T14:30:00",
      viewed_at: "2026-06-07T14:36:00",
    },
  ],
};

export const emptyDermifyDashboardData: DermifyDashboardData = {
  source: "unavailable",
  summary: {
    analysis: {},
    ingredients: {},
    entities: {},
  },
  users: [],
  products: [],
  ingredients: [],
  analyses: [],
  histories: [],
};
