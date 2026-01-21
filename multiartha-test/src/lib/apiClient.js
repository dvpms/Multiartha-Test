export async function apiRequest(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.ok) {
    const issues = data?.error?.issues;
    const firstIssue = Array.isArray(issues) ? issues[0] : null;

    const issuePath =
      firstIssue?.path && Array.isArray(firstIssue.path) && firstIssue.path.length
        ? firstIssue.path.join(".")
        : null;

    const message =
      (issuePath && firstIssue?.message
        ? `${issuePath}: ${firstIssue.message}`
        : firstIssue?.message) ||
      data?.error?.message ||
      `Request failed (${res.status})`;

    const error = new Error(message);
    error.status = res.status;
    error.code = data?.error?.code;
    error.issues = issues;
    throw error;
  }

  return data.data;
}
