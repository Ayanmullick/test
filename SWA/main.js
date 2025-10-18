// <script type="module">
const $ = id => document.getElementById(id);
const [authBtn, authStatus, userDetails, userRolesList, rows, statusEl] =
  ["auth-btn", "auth-status", "user-details", "user-roles-list", "rows", "status"].map($);

const DATA_URL = "/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10";
const BUDGET_MS = 250000, START_WAIT = 5000, MAX_WAIT = 60000, FETCH_TIMEOUT = 20000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const authorize = async () => {
  try {
    const response = await fetch("/.auth/me", { cache: "no-store", credentials: "include" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const user = (await response.json())?.clientPrincipal ?? null;
    authBtn.href = user ? "/.auth/logout" : "/.auth/login/aad";
    authStatus.textContent = authStatus.style.color = "";
    if (!user) return null;
    [userDetails.textContent, userRolesList.textContent] = [user.userDetails || '', (user.userRoles || []).join(", ")];
    return user;
  } catch (e) {
    authStatus.textContent = `Unable to read auth context: ${e.message || e}`;
    authStatus.style.color = "red"; return null;
  }
};

const fetchDataWithRetry = async () => {
  const deadline = Date.now() + BUDGET_MS; let wait = START_WAIT, tries = 0;
  while (Date.now() < deadline) {
    try {
      const c = new AbortController(), id = setTimeout(() => c.abort(), FETCH_TIMEOUT);
      let r;
      try { r = await fetch(DATA_URL, { credentials: "include", headers: { "Cache-Control": "no-store" }, signal: c.signal }); } finally { clearTimeout(id); }
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
  if (!data) return;
  const items = Array.isArray(data) ? data : data?.value || data?.items || [];
  rows.innerHTML = items.length ? items.map(x => `<tr><td>${x?.SaleID ?? ""}</td><td>${x?.SalesRepID ?? ""}</td><td>${x?.Amount ?? ""}</td></tr>`).join("") : '<tr><td colspan="3">(no rows)</td></tr>';
  statusEl.textContent = `${items.length} row(s)`; statusEl.style.color = "";
};

const main = async () => {
  const user = await authorize(); if (!user) return;
  rows.innerHTML = '<tr><td colspan="3">Loading data...</td></tr>';
  const data = await fetchDataWithRetry(); renderData(data);
};

main();
