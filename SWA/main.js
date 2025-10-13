// <script type="module">
const $ = id => document.getElementById(id);
const loginBtn = $("login-btn"), logoutBtn = $("logout-btn");
const authStatus = $("auth-status"), userName = $("user-name"), userRoles = $("user-roles");
const rows = $("rows"), statusEl = $("status");

const DATA_URL = "/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10";

const BUDGET_MS = 210000, START_WAIT = 5000, MAX_WAIT = 60000, FETCH_TIMEOUT = 20000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const fetchT = async (u, o, t = FETCH_TIMEOUT) => {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), t);
  try { return await fetch(u, { ...o, signal: c.signal }); } finally { clearTimeout(id); }
};

const paintSignedOut = () => {
  if (loginBtn) loginBtn.hidden = false;
  if (logoutBtn) logoutBtn.hidden = true;
  if (userName) userName.textContent = "";
  if (userRoles) userRoles.textContent = "";
  if (rows) rows.innerHTML = '<tr><td colspan="3">Sign in required.</td></tr>';
  if (authStatus && !authStatus.textContent) authStatus.textContent = "Please sign in to view data.";
  if (statusEl) { statusEl.textContent = ""; statusEl.style.color = ""; }
};

const paintSignedIn = u => {
  if (loginBtn) loginBtn.hidden = true;
  if (logoutBtn) logoutBtn.hidden = false;
  if (authStatus) { authStatus.textContent = ""; authStatus.style.color = ""; }
  if (userName) {
    const d = u.userDetails || u.identityProvider || u.userId || "";
    userName.textContent = d ? `👤:${d}` : "";
  }
  if (userRoles) {
    const r = (u.userRoles || []).filter(x => x !== "anonymous");
    userRoles.textContent = r.length ? `🔑:${r.join(", ")}` : "";
  }
};

const authAndLoad = async () => {
  let u = null;
  try {
    const me = await fetchT("/.auth/me", { cache: "no-store", credentials: "include" });
    if (!me.ok) throw new Error(`${me.status} ${me.statusText}`);
    const json = await me.json();
    u = json?.clientPrincipal ?? null;
    if (!u) return paintSignedOut();
    paintSignedIn(u);
  } catch (e) {
    if (authStatus) {
      authStatus.textContent = `Unable to read auth context: ${e.message || e}`;
      authStatus.style.color = "red";
    }
    return;
  }

  if (statusEl) { statusEl.textContent = "Loading data..."; statusEl.style.color = ""; }
  const deadline = Date.now() + BUDGET_MS;
  let wait = START_WAIT, tries = 0;

  while (Date.now() < deadline) {
    try {
      const r = await fetchT(DATA_URL, { credentials: "include", headers: { "Cache-Control": "no-store" } });
      if (r.ok) {
        const b = await r.json();
        const items = Array.isArray(b) ? b : b?.value || b?.items || [];
        if (!rows) return;
        rows.innerHTML = items.length ? items.map(x => `<tr><td>${x?.SaleID ?? ""}</td><td>${x?.SalesRepID ?? ""}</td><td>${x?.Amount ?? ""}</td></tr>`).join("") : '<tr><td colspan="3">(no rows)</td></tr>';
        if (statusEl) { statusEl.textContent = `${items.length} row(s)`; statusEl.style.color = ""; }
        return;
      }
      if (!(r.status === 400 || r.status >= 500)) throw new Error(`${r.status} ${r.statusText}`);
      throw new Error("transient");
    } catch (e) {
      if (Date.now() + wait >= deadline) {
        if (rows) rows.innerHTML = "";
        if (statusEl) { statusEl.textContent = `Error retrieving data: ${e.message || e}`; statusEl.style.color = "red"; }
        return;
      }
      tries++;
      if (statusEl) {
        statusEl.textContent = `Waking database… (try ${tries}) in ${Math.ceil(wait / 1000)}s`;
        statusEl.style.color = "";
      }
      await sleep(wait);
      wait = Math.min(Math.floor(wait * 1.8), MAX_WAIT);
    }
  }
};

authAndLoad();
