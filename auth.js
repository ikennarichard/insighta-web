// auth.js

function getCsrf() {
  const row = document.cookie
    .split("; ")
    .find((r) => r.startsWith("csrf_token="));
  return row;
}

async function apiFetch(url, opts = {}) {
  return fetch(url, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-API-Version": "1",
      ...(opts.headers || {}),
    },
  });
}

async function tryRefresh() {
  try {
    const res = await apiFetch(`${CONFIG.API_URL}/auth/refresh`, {
      method: "POST",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function requireAuth() {
  let res = await apiFetch(`${CONFIG.API_URL}/api/v1/me`);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await apiFetch("/api/v1/me"); // retry after refresh
    }
  }

  if (!res.ok) {
    if (!window.location.pathname.includes("index")) {
      window.location.href = "/index.html";
    }
    return null;
  }

  const data = await res.json();
  return data.data;
}

async function logout() {
  await apiFetch(`${CONFIG.API_URL}/auth/logout`, { method: "POST" });
  sessionStorage.setItem("logged_out", "true");
  window.location.href = "/index.html";
}
