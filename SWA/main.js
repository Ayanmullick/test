// <script type="module"> recommended to avoid globals
const $ = id => document.getElementById(id);
const loginBtn = $("login-btn"), logoutBtn = $("logout-btn");
const authStatus = $("auth-status"), userName = $("user-name"), userRoles = $("user-roles");
const rows = $("rows"), statusEl = $("status");

const DATA_URL =
  "/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10";
const DELAYS = [1500, 3000, 6000, 12000, 15000, 15000, 15000, 15000]; // compact backoff

const paintSignedOut = () => {
  loginBtn && (loginBtn.hidden = false); logoutBtn && (logoutBtn.hidden = true);
  userName && (userName.textContent = ""); userRoles && (userRoles.textContent = "");
  rows && (rows.innerHTML = '<tr><td colspan="3">Sign in required.</td></tr>');
  if (authStatus && !authStatus.textContent) authStatus.textContent = "Please sign in to view data.";
  if (statusEl) statusEl.textContent = statusEl.style.color = "";
};

const paintSignedIn = u => {
  loginBtn && (loginBtn.hidden = true); logoutBtn && (logoutBtn.hidden = false);
  if (authStatus) authStatus.textContent = authStatus.style.color = "";
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
  try {
    const me = await fetch("/.auth/me", { cache: "no-store", credentials: "include" });
    if (!me.ok) throw new Error(`${me.status} ${me.statusText}`);
    const u = (await me.json())?.clientPrincipal ?? null;
    if (!u) return paintSignedOut();
    paintSignedIn(u);
  } catch (e) {
    if (authStatus) authStatus.textContent = `Unable to read auth context: ${e.message || e}`, authStatus.style.color="red";
    return;
  }

  statusEl && (statusEl.textContent = "Loading data...", (statusEl.style.color = ""));
  for (let i = 0; i <= DELAYS.length; i++) {
    try {
      const r = await fetch(DATA_URL, { credentials: "include", headers: { "Cache-Control": "no-store" } });
      if (r.ok) {
        const b = await r.json();
        const items = Array.isArray(b) ? b : b?.value || b?.items || [];
        if (!rows) return;
        rows.innerHTML = items.length
          ? items.map(x => `<tr><td>${x?.SaleID ?? ""}</td><td>${x?.SalesRepID ?? ""}</td><td>${x?.Amount ?? ""}</td></tr>`).join("")
          : '<tr><td colspan="3">(no rows)</td></tr>';
        if (statusEl) statusEl.textContent = `${items.length} row(s)`, (statusEl.style.color = "");
        return;
      }
      // Only treat 400/500 during warm-up as transient; otherwise surface immediately
      if (!(r.status === 400 || r.status >= 500)) throw new Error(`${r.status} ${r.statusText}`);
      if (i === DELAYS.length) throw new Error(`${r.status} ${r.statusText}`);
    } catch (e) {
      if (i === DELAYS.length) {
        rows && (rows.innerHTML = "");
        if (statusEl) statusEl.textContent = `Error retrieving data: ${e.message || e}`, (statusEl.style.color = "red");
        return;
      }
      const wait = DELAYS[i];
      if (statusEl) {
        statusEl.textContent = `Waking database... (${i + 1}/${DELAYS.length}) in ${Math.ceil(wait / 1000)}s`;
        statusEl.style.color = "";
      }
      await new Promise(r => setTimeout(r, wait));
    }
  }
};

authAndLoad();
