export async function apiRequest(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    const message = data?.error?.message || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.code = data?.error?.code;
    throw error;
  }

  return data.data;
}
