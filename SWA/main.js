// <script type="module">
const $ = id => document.getElementById(id);
const [authBtn, authStatus, userName, userRoles, rows, statusEl] =
  ["auth-btn", "auth-status", "user-name", "user-roles", "rows", "status"].map($);

const DATA_URL = "/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10";
const BUDGET_MS = 250000, START_WAIT = 5000, MAX_WAIT = 60000, FETCH_TIMEOUT = 20000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const fetchT = async (u, o, t = FETCH_TIMEOUT) => {
  const c = new AbortController(), id = setTimeout(() => c.abort(), t);
  try { return await fetch(u, { ...o, signal: c.signal }); } finally { clearTimeout(id); }
};

const updateAuthUI = u => {
  authBtn.href = u ? "/.auth/logout" : "/.auth/login/aad";
  authStatus.textContent = authStatus.style.color = "";
  userName.textContent = userRoles.textContent = "";
  if (!u) {
    rows.innerHTML = '<tr><td colspan="3">Sign in required.</td></tr>';
    if (!authStatus.textContent) authStatus.textContent = "Please sign in to view data.";
    statusEl.textContent = statusEl.style.color = "";
    return;
  }
  const d = u.userDetails || u.identityProvider || u.userId || "";
  userName.textContent = d ? `👤:${d}` : "";
  const r = (u.userRoles || []).filter(x => x !== "anonymous");
  userRoles.textContent = r.length ? `🔑:${r.join(", ")}` : "";
};

const authorize = async () => {
  try {
    const me = await fetchT("/.auth/me", { cache: "no-store", credentials: "include" });
    if (!me.ok) throw new Error(`${me.status} ${me.statusText}`);
    const u = (await me.json())?.clientPrincipal ?? null;
    updateAuthUI(u); return u;
  } catch (e) {
    authStatus.textContent = `Unable to read auth context: ${e.message || e}`;
    authStatus.style.color = "red"; return null;
  }
};

const fetchDataWithRetry = async () => {
  statusEl.textContent = "Loading data..."; statusEl.style.color = "";
  const deadline = Date.now() + BUDGET_MS; let wait = START_WAIT, tries = 0;
  while (Date.now() < deadline) {
    try {
      const r = await fetchT(DATA_URL, { credentials: "include", headers: { "Cache-Control": "no-store" } });
      if (r.ok) return await r.json();
      if (!(r.status === 400 || r.status >= 500)) throw new Error(`${r.status} ${r.statusText}`);
      throw new Error("transient");
    } catch (e) {
      if (Date.now() + wait >= deadline) {
        statusEl.textContent = `Error retrieving data: ${e.message || e}`; statusEl.style.color = "red"; return null;
      }
      tries++; statusEl.textContent = `Waking database… (try ${tries}) in ${Math.ceil(wait / 1000)}s`; statusEl.style.color = "";
      await sleep(wait); wait = Math.min(Math.floor(wait * 1.8), MAX_WAIT);
    }
  } return null;
};

const renderData = data => {
  if (!data) { rows.innerHTML = ""; return; }
  const items = Array.isArray(data) ? data : data?.value || data?.items || [];
  rows.innerHTML = items.length ? items.map(x => `<tr><td>${x?.SaleID ?? ""}</td><td>${x?.SalesRepID ?? ""}</td><td>${x?.Amount ?? ""}</td></tr>`).join("") : '<tr><td colspan="3">(no rows)</td></tr>';
  statusEl.textContent = `${items.length} row(s)`; statusEl.style.color = "";
};

const main = async () => {
  const user = await authorize(); if (!user) return;
  const data = await fetchDataWithRetry(); renderData(data);
};

main();
