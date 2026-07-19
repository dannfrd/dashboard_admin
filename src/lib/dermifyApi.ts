
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
  fcm_token?: string | null;
  device_token?: string | null;
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
  image_url?: string | null;
  scan_count: number;
  analysis_count: number;
  created_at?: string | null;
};

export type DermifyIngredient = {
  id: number;
  name?: string | null;
  description?: string | null;
  function?: string | null;
  risk_level?: string | null;
  usage_count: number;
  created_at?: string | null;
};

export type DermifyAnalysis = {
  id: number;
  scan_id?: number | null;
  image_url?: string | null;
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
  image_url?: string | null;
  viewed_at?: string | null;
  created_at?: string | null;
  product_name?: string | null;
  product_brand?: string | null;
  summary?: string | null;
  recommendation?: string | null;
  raw_text?: string | null;
  matched_ingredient_count?: number | null;
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

export type DermifyDashboardView =
  | "overview"
  | "analyses"
  | "users"
  | "products"
  | "ingredients"
  | "histories";

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

  // If no admin token, still allow X-Api-Key from public env (optional)
  try {
    const publicKey = process.env.NEXT_PUBLIC_MONITORING_API_KEY;
    if (publicKey) {
      return { "X-Api-Key": String(publicKey) };
    }
  } catch {}

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

export type UserCreateRequest = {
  name?: string | null;
  email: string;
  password?: string | null;
  role?: string | null;
};

export type UserUpdateRequest = {
  name?: string | null;
  email?: string | null;
  password?: string | null;
  role?: string | null;
};

export async function listUsers(): Promise<DermifyUser[]> {
  return getJson<DermifyUser[]>("/metrics/users?limit=1000");
}

export async function createUser(payload: UserCreateRequest) {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getHeaders() || {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "Gagal membuat user");
  }

  return data as { id: number };
}

export async function getUser(userId: number): Promise<DermifyUser> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    headers: getHeaders(),
  });

  const text = await response.text();
  let payload: any;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const detail = payload && payload.detail ? payload.detail : text || `Status ${response.status}`;
    throw new Error(String(detail));
  }

  return payload as DermifyUser;
}

export async function updateUser(userId: number, payload: UserUpdateRequest) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(getHeaders() || {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "Gagal memperbarui user");
  }

  return data;
}

export async function deleteUser(userId: number) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "Gagal menghapus user");
  }

  return data;
}

export type ProductCreateRequest = {
  name: string;
  brand?: string | null;
  category?: string | null;
  barcode?: string | null;
  image_url?: string | null;
};

export type ProductUpdateRequest = {
  name?: string | null;
  brand?: string | null;
  category?: string | null;
  barcode?: string | null;
  image_url?: string | null;
};

export async function createProduct(payload: ProductCreateRequest) {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getHeaders() || {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error((data && data.detail) || "Gagal membuat produk");
  }

  return data as { id: number };
}

export async function getProduct(productId: number): Promise<DermifyProduct> {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    headers: getHeaders(),
  });

  const text = await response.text();
  let payload: any;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const detail = payload && payload.detail ? payload.detail : text || `Status ${response.status}`;
    throw new Error(String(detail));
  }

  return payload as DermifyProduct;
}

export async function updateProduct(
  productId: number,
  payload: ProductUpdateRequest,
) {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(getHeaders() || {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "Gagal memperbarui produk");
  }

  return data;
}

export async function deleteProduct(productId: number) {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "Failed to delete product");
  }

  return data;
}

export type IngredientCreateRequest = {
  name: string;
  description?: string | null;
  function?: string | null;
  risk_level?: string | null;
};

export type IngredientUpdateRequest = {
  name?: string | null;
  description?: string | null;
  function?: string | null;
  risk_level?: string | null;
};

export async function createIngredient(payload: IngredientCreateRequest) {
  const response = await fetch(`${API_BASE_URL}/admin/ingredients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getHeaders() || {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "Gagal membuat ingredient");
  }

  return data as { id: number };
}

export async function getIngredient(ingredientId: number) {
  const response = await fetch(`${API_BASE_URL}/admin/ingredients/${ingredientId}`, {
    headers: getHeaders(),
  });

  const text = await response.text();
  let payload: any;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const detail = payload && payload.detail ? payload.detail : text || `Status ${response.status}`;
    throw new Error(String(detail));
  }

  return payload;
}

export async function updateIngredient(ingredientId: number, payload: IngredientUpdateRequest) {
  const response = await fetch(`${API_BASE_URL}/admin/ingredients/${ingredientId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(getHeaders() || {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "Gagal memperbarui ingredient");
  }

  return data;
}

export async function deleteIngredient(ingredientId: number) {
  const response = await fetch(`${API_BASE_URL}/admin/ingredients/${ingredientId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "Gagal menghapus ingredient");
  }

  return data;
}

// --- Notifications ---
export type NotificationItem = {
  id: number;
  title: string;
  body?: string | null;
  data?: Record<string, any> | null;
  topic?: string | null;
  user_id?: number | null;
  target_user_id?: number | null;
  user?: {
    id?: number | null;
    name?: string | null;
    email?: string | null;
  } | null;
  tokens?: string[] | null;
  status: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  sent_by?: number | null;
  created_at?: string | null;
};

export type NotificationCreateRequest = {
  title: string;
  body?: string | null;
  data?: Record<string, any> | null;
  topic?: string | null;
  user_id?: number | null;
  target_user_id?: number | null;
  tokens?: string[] | null;
  scheduled_at?: string | null; // ISO
  send_now?: boolean;
};

export async function createNotification(payload: NotificationCreateRequest) {
  // Normalize payload: allow `data` and `tokens` to be provided as
  // JSON-encoded strings (some callers supply serialized values).
  let normalizedData: Record<string, any> | undefined = undefined;
  let normalizedTokens: string[] | undefined = undefined;

  // Handle `data` if it's a string (JSON) or an object
  if (payload.data) {
    if (typeof payload.data === "string") {
      try {
        normalizedData = JSON.parse(payload.data as string);
      } catch {
        // Fallback: send object with raw string under `value`
        try {
          normalizedData = { value: String(payload.data) };
        } catch {
          normalizedData = {};
        }
      }
    } else {
      normalizedData = payload.data;
    }
  }

  // Handle `tokens` if it's a string (JSON array) or an array
  if (payload.tokens) {
    if (typeof payload.tokens === "string") {
      try {
        const parsed = JSON.parse(payload.tokens as string);
        if (Array.isArray(parsed)) normalizedTokens = parsed.map((t) => String(t));
        else normalizedTokens = [String(parsed)];
      } catch {
        // Fallback: try splitting by commas/newlines
        normalizedTokens = String(payload.tokens)
          .split(/[,\n]+/)
          .map((t) => t.trim())
          .filter(Boolean);
      }
    } else if (Array.isArray(payload.tokens)) {
      normalizedTokens = payload.tokens.map((t) => String(t));
    }
  }

  // Ensure all values in `data` are strings (Firebase messaging requires string-only data)
  const coercedData = normalizedData
    ? Object.fromEntries(
        Object.entries(normalizedData).map(([k, v]) => {
          if (v === null || v === undefined) return [k, ""];
          if (typeof v === "string") return [k, v];
          try {
            return [k, String(v)];
          } catch {
            return [k, JSON.stringify(v)];
          }
        }),
      )
    : undefined;

  const outgoing = {
    ...payload,
    data: coercedData,
    tokens: normalizedTokens || undefined,
  } as NotificationCreateRequest;

  const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(getHeaders() || {}),
    },
    body: JSON.stringify(outgoing),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "failed to create notification");
  }

  return data as { id: number; sent?: boolean; response?: any };
}

export async function listNotifications(limit = 50, offset = 0) {
  const response = await fetch(`${API_BASE_URL}/admin/notifications?limit=${limit}&offset=${offset}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to list notifications: ${response.status}`);
  }

  return (await response.json()) as { items: NotificationItem[] };
}

export async function getNotification(notificationId: number) {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}`, {
    headers: getHeaders(),
  });

  const text = await response.text();
  let payload: any;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const detail = payload && payload.detail ? payload.detail : text || `Status ${response.status}`;
    throw new Error(String(detail));
  }

  return payload as NotificationItem;
}

export async function sendStoredNotification(notificationId: number) {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}/send`, {
    method: "POST",
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "Failed to send notification");
  }

  return data;
}

export async function updateNotification(notificationId: number, payload: NotificationCreateRequest) {
  let normalizedData: Record<string, any> | undefined = undefined;
  let normalizedTokens: string[] | undefined = undefined;

  if (payload.data) {
    if (typeof payload.data === "string") {
      try {
        normalizedData = JSON.parse(payload.data as string);
      } catch {
        try {
          normalizedData = { value: String(payload.data) };
        } catch {
          normalizedData = {};
        }
      }
    } else {
      normalizedData = payload.data;
    }
  }

  if (payload.tokens) {
    if (typeof payload.tokens === "string") {
      try {
        const parsed = JSON.parse(payload.tokens as string);
        if (Array.isArray(parsed)) normalizedTokens = parsed.map((t) => String(t));
        else normalizedTokens = [String(parsed)];
      } catch {
        normalizedTokens = String(payload.tokens)
          .split(/[,\n]+/)
          .map((t) => t.trim())
          .filter(Boolean);
      }
    } else if (Array.isArray(payload.tokens)) {
      normalizedTokens = payload.tokens.map((t) => String(t));
    }
  }

  const coercedData = normalizedData
    ? Object.fromEntries(
        Object.entries(normalizedData).map(([k, v]) => {
          if (v === null || v === undefined) return [k, ""];
          if (typeof v === "string") return [k, v];
          try {
            return [k, String(v)];
          } catch {
            return [k, JSON.stringify(v)];
          }
        }),
      )
    : undefined;

  const outgoing = {
    ...payload,
    data: coercedData,
    tokens: normalizedTokens || undefined,
  } as NotificationCreateRequest;

  const response = await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(getHeaders() || {}),
    },
    body: JSON.stringify(outgoing),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "Failed to update notification");
  }

  return data as { id: number; sent?: boolean; response?: any };
}

export async function deleteNotification(notificationId: number) {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/${notificationId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.detail) || "Failed to delete notification");
  }

  return data;
}

export async function getDermifyDashboardData(
  view: DermifyDashboardView,
): Promise<DermifyDashboardData> {
  const data: DermifyDashboardData = {
    ...emptyDermifyDashboardData,
    source: "api",
  };

  if (view === "overview") {
    const [summary, analyses, ingredients] = await Promise.all([
      getJson<MetricsSummary>("/metrics/summary"),
      getJson<DermifyAnalysis[]>("/metrics/analyses?limit=4"),
      getJson<DermifyIngredient[]>("/metrics/ingredients?limit=50"),
    ]);

    return { ...data, summary, analyses, ingredients };
  }

  if (view === "analyses") {
    return {
      ...data,
      analyses: await getJson<DermifyAnalysis[]>("/metrics/analyses?limit=1000"),
    };
  }

  if (view === "users") {
    return {
      ...data,
      users: await getJson<DermifyUser[]>("/metrics/users?limit=1000"),
    };
  }

  if (view === "products") {
    return {
      ...data,
      products: await getJson<DermifyProduct[]>("/metrics/products?limit=1000"),
    };
  }

  if (view === "ingredients") {
    return {
      ...data,
      ingredients: await getJson<DermifyIngredient[]>(
        "/metrics/ingredients?limit=1000",
      ),
    };
  }

  const [histories, analyses] = await Promise.all([
    getJson<DermifyHistory[]>("/metrics/user-histories?limit=1000"),
    getJson<DermifyAnalysis[]>("/metrics/analyses?limit=1000"),
  ]);

  return {
    ...data,
    histories,
    analyses,
  };
}

export async function getMetricsIngredients(): Promise<DermifyIngredient[]> {
  return getJson<DermifyIngredient[]>("/metrics/ingredients?limit=1000");
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
