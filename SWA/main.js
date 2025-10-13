// <script type="module">
const $ = id => document.getElementById(id);
const loginBtn = $("login-btn"), logoutBtn = $("logout-btn");
const authStatus = $("auth-status"), userName = $("user-name"), userRoles = $("user-roles");
const rows = $("rows"), statusEl = $("status");

const DATA_URL =
  "/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10";
// Backoff tuned for serverless resume; total ~1 min. Adjust to taste.
const DELAYS = [4000, 8000, 12000, 16000, 20000];

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

const sleep = ms => new Promise(r => setTimeout(r, ms));

const authAndLoad = async () => {
  // Auth + UI
  try {
    const me = await fetch("/.auth/me", { cache: "no-store", credentials: "include" });
    if (!me.ok) throw new Error(`${me.status} ${me.statusText}`);
    const u = (await me.json())?.clientPrincipal ?? null;
    if (!u) return paintSignedOut();
    paintSignedIn(u);
  } catch (e) {
    if (authStatus) authStatus.textContent = `Unable to read auth context: ${e.message || e}`,
                    authStatus.style.color = "red";
    return;
  }

  // Data load with spaced retries on 400/500 (serverless warm-up via DAB/SWA)
  statusEl && (statusEl.textContent = "Loading data...", (statusEl.style.color = ""));
  for (let i = 0; i <= DELAYS.length; i++) {
    try {
      const r = await fetch(DATA_URL, {
        credentials: "include", headers: { "Cache-Control": "no-store" }
      });
      if (r.ok) {
        const b = await r.json();
        const items = Array.isArray(b) ? b : b?.value || b?.items || [];
        if (!rows) return;
        rows.innerHTML = items.length
          ? items.map(x => `<tr><td>${x?.SaleID ?? ""}</td><td>${x?.SalesRepID ?? ""}</td><td>${x?.Amount ?? ""}</td></tr>`).join("")
          : '<tr><td colspan="3">(no rows)</td></tr>';
        statusEl && (statusEl.textContent = `${items.length} row(s)`, (statusEl.style.color = ""));
        return;
      }
      // TRANSIENT branch: throw so catch-path sleeps
      if (r.status === 400 || r.status >= 500) {
        if (i === DELAYS.length) throw new Error(`${r.status} ${r.statusText}`);
        throw new Error("transient");
      }
      // Non-transient: surface immediately
      throw new Error(`${r.status} ${r.statusText}`);
    } catch (e) {
      if (i === DELAYS.length) {
        rows && (rows.innerHTML = "");
        statusEl && (statusEl.textContent = `Error retrieving data: ${e.message || e}`,
                     (statusEl.style.color = "red"));
        return;
      }
      const wait = DELAYS[i];
      statusEl && (statusEl.textContent =
        `Waking database… (${i + 1}/${DELAYS.length}) in ${Math.ceil(wait / 1000)}s`,
        statusEl.style.color = "");
      await sleep(wait);
    }
  }
};

authAndLoad();
