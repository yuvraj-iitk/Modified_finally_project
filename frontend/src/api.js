import { keycloak } from "./keycloak";
const baseUrl = import.meta.env.VITE_API_URL || "/api";
export async function api(
  path,
  { method = "GET", body, protectedRequest = true } = {},
) {
  const headers = {};
  if (protectedRequest) {
    if (!keycloak.authenticated) throw new Error("Please log in to continue.");
    try {
      await keycloak.updateToken(30);
    } catch {
      throw new Error("Your session has expired. Please log in again.");
    }
    headers.Authorization = `Bearer ${keycloak.token}`;
  }
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Cannot connect to the backend. Check that it is running on port 8000.",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail
          .map((item) => `${item.loc?.slice(1).join(".")}: ${item.msg}`)
          .join("; ")
      : detail;
    throw new Error(message || `Request failed (${response.status}).`);
  }
  return data;
}
