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
  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", ["GET", "POST"]);
    return response.status(405).json({ detail: "Method tidak diizinkan." });
  }

  const pathSegments = request.query.path;
  const path = Array.isArray(pathSegments)
    ? pathSegments.join("/")
    : pathSegments;

  if (!path || (!PUBLIC_ROUTES.has(path) && !ADMIN_ROUTES.has(path))) {
    return response.status(404).json({ detail: "Endpoint tidak ditemukan." });
  }

  const authorization = request.headers.authorization;
  if (ADMIN_ROUTES.has(path) && !authorization?.startsWith("Bearer ")) {
    return response.status(401).json({ detail: "Login admin diperlukan." });
  }

  try {
    const upstreamResponse = await fetch(
      `${getUpstreamUrl()}/${path}${buildQueryString(request.query)}`,
      {
        method: request.method,
        headers: {
          Accept: "application/json",
          ...(request.method === "POST"
            ? { "Content-Type": "application/json" }
            : {}),
          ...(authorization ? { Authorization: authorization } : {}),
        },
        body:
          request.method === "POST" ? JSON.stringify(request.body) : undefined,
      },
    );

    const contentType =
      upstreamResponse.headers.get("content-type") || "application/json";
    const payload = await upstreamResponse.text();

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
