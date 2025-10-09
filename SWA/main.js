const $ = id => document.getElementById(id);
const loginBtn = $("login-btn");
const logoutBtn = $("logout-btn");
const themeToggleBtn = $("theme-toggle");
const authStatus = $("auth-status");
const userName = $("user-name");
const userRoles = $("user-roles");
const rows = $("rows");
const status = $("status");

const THEME_KEY = "swa_theme";
const DATA_URL =
  "/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10";
const RETRY_OPTS = { retries: 8, min: 1500, max: 15000, factor: 2 };
let currentTheme = "dark";

const applyTheme = theme => {
  const light = theme === "light";
  document.body.style.backgroundColor = light ? "white" : "black";
  document.body.style.color = light ? "black" : "white";
  currentTheme = light ? "light" : "dark";
  try { localStorage.setItem(THEME_KEY, currentTheme); } catch {}
};

const initTheme = () => {
  let stored = "dark";
  try { stored = localStorage.getItem(THEME_KEY) || "dark"; } catch {}
  applyTheme(stored === "light" ? "light" : "dark");
};

const showSignedOutState = () => {
  if (loginBtn) loginBtn.hidden = false;
  if (logoutBtn) logoutBtn.hidden = true;
  if (userName) userName.textContent = "";
  if (userRoles) userRoles.textContent = "";
  if (rows) rows.innerHTML = '<tr><td colspan="3">Sign in required.</td></tr>';
  if (status) {
    status.textContent = "";
    status.style.color = "";
  }
  if (!authStatus) return;
  if (!authStatus.textContent) authStatus.textContent = "Please sign in to view data.";
  authStatus.style.color = "";
};

const showSignedInState = user => {
  if (loginBtn) loginBtn.hidden = true;
  if (logoutBtn) logoutBtn.hidden = false;
  if (authStatus) {
    authStatus.textContent = "";
    authStatus.style.color = "";
  }
  if (userName) {
    const display = user.userDetails || user.identityProvider || user.userId || "";
    userName.textContent = display ? `👤:${display}` : "";
  }
  if (userRoles) {
    const roles = (user.userRoles || []).filter(role => role !== "anonymous");
    userRoles.textContent = roles.length ? `🔑:${roles.join(", ")}` : "";
  }
};

const fetchUser = async () => {
  try {
    const response = await fetch("/.auth/me", { cache: "no-store", credentials: "include" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const body = await response.json();
    return body?.clientPrincipal || body?.[0] || null;
  } catch (error) {
    if (!authStatus) return null;
    authStatus.textContent = `Unable to read auth context: ${error.message || error}`;
    authStatus.style.color = "red";
    return null;
  }
};

const renderRows = result => {
  const items = Array.isArray(result) ? result : result?.value || result?.items || [];
  if (!rows) return;
  if (!items.length) {
    rows.innerHTML = '<tr><td colspan="3">(no rows)</td></tr>';
    if (status) {
      status.textContent = "0 row(s)";
      status.style.color = "";
    }
    return;
  }
  rows.innerHTML = items.map(item => {
    const sale = item?.SaleID ?? "";
    const rep = item?.SalesRepID ?? "";
    const amount = item?.Amount ?? "";
    return `<tr><td>${sale}</td><td>${rep}</td><td>${amount}</td></tr>`;
  }).join("");
  if (status) {
    status.textContent = `${items.length} row(s)`;
    status.style.color = "";
  }
};

const sleep = ms => new Promise(res => setTimeout(res, ms));

const fetchWithRetry = async (url, options = {}) => {
  const { retries, min, max, factor } = RETRY_OPTS;
  let attempt = 0;
  let lastError = null;
  while (attempt <= retries) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      const statusCode = response.status;
      const retriable = statusCode === 429 || (statusCode >= 500 && statusCode <= 599);
      const detail = await response.text();
      const message = `${statusCode} ${response.statusText}${detail ? `\n${detail}` : ""}`;
      if (!retriable || attempt === retries) throw new Error(message);
      lastError = new Error(message);
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
    }
    const delay = Math.min(Math.floor(min * factor ** attempt), max);
    if (status) {
      const retryNum = attempt + 1;
      status.textContent = `Waking database... retrying (${retryNum}/${retries}) in ${Math.ceil(delay / 1000)}s`;
      status.style.color = "";
    }
    await sleep(delay);
    attempt += 1;
  }
  throw lastError || new Error("Request failed after retries");
};

const loadData = async () => {
  if (status) {
    status.textContent = "Loading data...";
    status.style.color = "";
  }
  try {
    const response = await fetchWithRetry(
      DATA_URL,
      { credentials: "include", headers: { "Cache-Control": "no-store" } }
    );
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const body = await response.json();
    renderRows(body);
  } catch (error) {
    if (rows) rows.innerHTML = "";
    if (!status) return;
    status.textContent = `Error retrieving data: ${error.message || error}`;
    status.style.color = "red";
  }
};

const init = async () => {
  initTheme();
  const user = await fetchUser();
  if (!user) {
    showSignedOutState();
    return;
  }
  showSignedInState(user);
  await loadData();
};

loginBtn?.addEventListener("click", () => { window.location.href = "/.auth/login/aad"; });
logoutBtn?.addEventListener("click", () => { window.location.href = "/.auth/logout"; });
themeToggleBtn?.addEventListener("click", () => {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

init();
