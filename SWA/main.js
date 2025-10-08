const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const authStatus = document.getElementById("auth-status");
const userNameElem = document.getElementById("user-name");
const userRolesElem = document.getElementById("user-roles");

loginBtn.addEventListener("click", () => {
  window.location.href = "/.auth/login/aad";
});

logoutBtn.addEventListener("click", () => {
  window.location.href = "/.auth/logout";
});

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
    retries = 5,
    factor = 1.7,
    minTimeout = 1000,
    maxTimeout = 8000,
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
      const detail = await response.text();
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

    const delay = Math.min(Math.floor(minTimeout * Math.pow(factor, attempt)), maxTimeout);
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

async function loadData() {
  try {
    const response = await fetchWithRetry(
      "/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10",
      {
        headers: { "Cache-Control": "no-store" },
        credentials: "include"
      },
      {
        // A few quick retries usually cover SQL Serverless resume
        retries: 5,
        minTimeout: 2000,
        maxTimeout: 9999,
        factor: 1.8
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
      return;
    }
    tbody.innerHTML = rows
      .map(r => `<tr><td>${r?.SaleID ?? ""}</td><td>${r?.SalesRepID ?? ""}</td><td>${r?.Amount ?? ""}</td></tr>`)
      .join("");
    statusElem.textContent = `${rows.length} row(s)`;
    statusElem.style.color = "";
  } catch (error) {
    document.getElementById("rows").innerHTML = "";
    const statusElem = document.getElementById("status");
    statusElem.textContent = `Error retrieving data: ${error.message ?? error}`;
    statusElem.style.color = "red";
  }
}

async function init() {
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
  userNameElem.textContent = displayName ? `Signed in as ${displayName}` : "Signed in";
  const roles = (user.userRoles || []).filter(role => role !== "anonymous");
  userRolesElem.textContent = roles.length ? `(roles: ${roles.join(", ")})` : "";
  authStatus.textContent = "";
  authStatus.style.color = "";

  await loadData();
}

init();
