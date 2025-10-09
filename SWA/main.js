const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const themeToggleBtn = document.getElementById("theme-toggle");
const authStatus = document.getElementById("auth-status");
const userNameElem = document.getElementById("user-name");
const userRolesElem = document.getElementById("user-roles");

loginBtn.addEventListener("click", () => {
  window.location.href = "/.auth/login/aad";
});

logoutBtn.addEventListener("click", () => {
  window.location.href = "/.auth/logout";
});

const THEME_KEY = "swa_theme";
let currentTheme = "dark";
const applyTheme = theme => {
  const dark = theme === "dark";
  document.body.style.backgroundColor = dark ? "#000" : "#fff";
  document.body.style.color = dark ? "#fff" : "#000";
  currentTheme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
};
const initTheme = () => {
  let stored = "dark";
  try { stored = localStorage.getItem(THEME_KEY) || "dark"; } catch {}
  applyTheme(stored === "light" ? "light" : "dark");
};
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

async function getCurrentUser() {
  try {
    const response = await fetch("/.auth/me", {
      cache: "no-store",
      credentials: "include"
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const payload = await response.json();
    if (!payload) {
      return null;
    }
    if (payload.clientPrincipal) {
      return payload.clientPrincipal;
    }
    return Array.isArray(payload) ? payload[0] : null;
  } catch (error) {
    authStatus.textContent = `Unable to read auth context: ${error.message ?? error}`;
    authStatus.style.color = "red";
    return null;
  }
}

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function fetchWithRetry(url, options = {}, retryOpts = {}) {
  const {
    retries = 8,
    factor = 2.0,
    minTimeout = 1500,
    maxTimeout = 15000,
  } = retryOpts;

  let attempt = 0;
  let lastError;
  while (attempt <= retries) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }

      // For 5xx/429, backoff and retry. For others, throw immediately.
      const status = response.status;
      let detail = await response.text();
      try {
        const maybeJson = JSON.parse(detail);
        if (maybeJson && maybeJson.ActivityId) {
          console.warn(`Data API error ActivityId: ${maybeJson.ActivityId}`);
          detail = JSON.stringify(maybeJson);
        }
      } catch { /* body not JSON */ }
      const error = new Error(`${status} ${response.statusText}${detail ? `\n${detail}` : ""}`);
      if ((status >= 500 && status <= 599) || status === 429) {
        lastError = error;
      } else {
        throw error;
      }
    } catch (err) {
      // Network/cold-start errors
      lastError = err;
    }

    if (attempt === retries) break;

    const baseDelay = Math.min(Math.floor(minTimeout * Math.pow(factor, attempt)), maxTimeout);
    const delay = Math.floor(baseDelay * (0.7 + Math.random() * 0.6));
    const statusElem = document.getElementById("status");
    if (statusElem) {
      statusElem.textContent = `Waiting for database… retrying (${attempt + 1}/${retries}) in ${Math.ceil(delay / 1000)}s`;
      statusElem.style.color = "";
    }
    await sleep(delay);
    attempt++;
  }

  throw lastError ?? new Error("Request failed after retries");
}

async function loadDataOnce() {
  try {
    const response = await fetchWithRetry(
      "/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10",
      {
        headers: { "Cache-Control": "no-store" },
        credentials: "include"
      },
      {
        // Wider window for SQL Serverless cold-resume
        retries: 8,
        minTimeout: 1500,
        maxTimeout: 15000,
        factor: 2.0
      }
    );
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`${response.status} ${response.statusText}${detail ? `\n${detail}` : ""}`);
    }
    const json = await response.json();
    const rows = Array.isArray(json) ? json : (json.value || json.items || []);
    const tbody = document.getElementById("rows");
    const statusElem = document.getElementById("status");
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="3">(no rows)</td></tr>';
      statusElem.textContent = "0 row(s)";
      statusElem.style.color = "";
      return true;
    }
    tbody.innerHTML = rows
      .map(r => `<tr><td>${r?.SaleID ?? ""}</td><td>${r?.SalesRepID ?? ""}</td><td>${r?.Amount ?? ""}</td></tr>`)
      .join("");
    statusElem.textContent = `${rows.length} row(s)`;
    statusElem.style.color = "";
    return true;
  } catch (error) {
    document.getElementById("rows").innerHTML = "";
    const statusElem = document.getElementById("status");
    statusElem.textContent = `Error retrieving data: ${error.message ?? error}`;
    statusElem.style.color = "red";
    return false;
  }
}

async function loadDataUntilSuccess({ timeoutMs = 120000, minWaitMs = 3000, maxWaitMs = 10000 } = {}) {
  const statusElem = document.getElementById("status");
  const start = Date.now();
  let attempt = 0;
  while (Date.now() - start < timeoutMs) {
    const ok = await loadDataOnce();
    if (ok) return;
    attempt++;
    const backoff = Math.min(maxWaitMs, Math.floor(minWaitMs * Math.pow(1.5, attempt)));
    if (statusElem && statusElem.style.color !== "") {
      // Don’t show the red error color while we auto-retry
      statusElem.style.color = "";
    }
    if (statusElem) {
      statusElem.textContent = `Waking database… retrying in ${Math.ceil(backoff / 1000)}s`;
    }
    await sleep(backoff);
  }
}

async function init() {
  // Apply saved theme first
  initTheme();
  const user = await getCurrentUser();
  if (!user) {
    loginBtn.hidden = false;
    logoutBtn.hidden = true;
    userNameElem.textContent = "";
    userRolesElem.textContent = "";
    if (!authStatus.textContent) {
      authStatus.textContent = "Please sign in to view data.";
      authStatus.style.color = "";
    }
    document.getElementById("rows").innerHTML = '<tr><td colspan="3">Sign in required.</td></tr>';
    const statusElem = document.getElementById("status");
    statusElem.textContent = "";
    statusElem.style.color = "";
    return;
  }

  loginBtn.hidden = true;
  logoutBtn.hidden = false;

  const displayName = user.userDetails || user.identityProvider || user.userId;
  userNameElem.textContent = displayName ? `👤:${displayName}` : "👤";
  const roles = (user.userRoles || []).filter(role => role !== "anonymous");
  userRolesElem.textContent = roles.length ? `🔑:${roles.join(", ")}` : "";
  authStatus.textContent = "";
  authStatus.style.color = "";

  await loadDataUntilSuccess();
}

init();
