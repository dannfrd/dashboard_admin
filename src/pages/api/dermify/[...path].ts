import type { NextApiRequest, NextApiResponse } from "next";

const PUBLIC_ROUTES = new Set(["auth/admin/login"]);
const ADMIN_ROUTES = new Set([
  "metrics/summary",
  "metrics/users",
  "metrics/products",
  "metrics/ingredients",
  "metrics/analyses",
  "metrics/user-histories",
]);

function getUpstreamUrl() {
  const configuredUrl =
    process.env.DERMIFY_API_URL ||
    process.env.NEXT_PUBLIC_DERMIFY_API_URL;

  if (!configuredUrl) {
    throw new Error("DERMIFY_API_URL belum dikonfigurasi.");
  }

  return configuredUrl.replace(/\/$/, "");
}

function buildQueryString(query: NextApiRequest["query"]) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (key === "path" || value === undefined) {
      continue;
    }

    for (const item of Array.isArray(value) ? value : [value]) {
      searchParams.append(key, item);
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (
    request.method !== "GET" &&
    request.method !== "POST" &&
    request.method !== "PUT" &&
    request.method !== "DELETE"
  ) {
    response.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return response.status(405).json({ detail: "Method tidak diizinkan." });
  }

  const pathSegments = request.query.path;
  const path = Array.isArray(pathSegments)
    ? pathSegments.join("/")
    : pathSegments;

  if (!path) {
    return response.status(404).json({ detail: "Endpoint tidak ditemukan." });
  }

  // Allow admin product CRUD paths like "admin/products" and "admin/products/123"
  const isAdminProductRoute = path.startsWith("admin/products");
  const isAdminIngredientRoute = path.startsWith("admin/ingredients");
  const isAdminNotificationRoute = path.startsWith("admin/notifications");
  const isAdminRoute =
    ADMIN_ROUTES.has(path) ||
    isAdminProductRoute ||
    isAdminIngredientRoute ||
    isAdminNotificationRoute;
  if (!PUBLIC_ROUTES.has(path) && !isAdminRoute) {
    return response.status(404).json({ detail: "Endpoint tidak ditemukan." });
  }

  const authorization = request.headers.authorization;
  if (isAdminRoute && !authorization?.startsWith("Bearer ")) {
    return response.status(401).json({ detail: "Login admin diperlukan." });
  }

    try {
    // Debug: log request body for non-GET methods to help trace missing-body issues
    if (request.method === "PUT" || request.method === "POST") {
      try {
        // Avoid logging large bodies in production
        // eslint-disable-next-line no-console
        console.log("Dermify proxy body for", path, JSON.stringify(request.body));
      } catch {}
    }
      // Debug: log upstream URL and forwarded headers
      const upstreamUrl = `${getUpstreamUrl()}/${path}${buildQueryString(request.query)}`;
      // eslint-disable-next-line no-console
      console.log("Dermify proxy forwarding", request.method, upstreamUrl);
      // eslint-disable-next-line no-console
      console.log("Dermify proxy headers ->", JSON.stringify({
        authorization: request.headers.authorization,
        x_api_key: request.headers["x-api-key"],
        content_type: request.headers["content-type"],
      }));
    const upstreamResponse = await fetch(
      `${getUpstreamUrl()}/${path}${buildQueryString(request.query)}`,
      {
        method: request.method,
        headers: {
          Accept: "application/json",
          ...(request.method === "POST" || request.method === "PUT"
            ? { "Content-Type": "application/json" }
            : {}),
          ...(authorization ? { Authorization: authorization } : {}),
          // forward X-Api-Key if present from client
          ...(request.headers["x-api-key"] ? { "X-Api-Key": String(request.headers["x-api-key"]) } : {}),
        },
        body:
          request.method === "POST" || request.method === "PUT"
            ? JSON.stringify(request.body)
            : undefined,
      },
    );

    const contentType =
      upstreamResponse.headers.get("content-type") || "application/json";
    const payload = await upstreamResponse.text();

    // Debug: log upstream response status/body when not OK
    if (!upstreamResponse.ok) {
      try {
        // eslint-disable-next-line no-console
        console.log("Dermify upstream response", upstreamResponse.status, payload);
      } catch {}
    }

    response.setHeader("Content-Type", contentType);
    response.setHeader("Cache-Control", "no-store");
    return response.status(upstreamResponse.status).send(payload);
  } catch (error) {
    console.error("Dermify API proxy error:", error);
    return response.status(502).json({
      detail:
        "Dashboard tidak dapat terhubung ke FastAPI. Periksa DERMIFY_API_URL dan firewall VPS.",
    });
  }
}
