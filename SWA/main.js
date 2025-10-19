// <script type="module">
const $ = id => document.getElementById(id);
const [authBtn, authStatus, userDetails, userRolesList, rows, statusEl] =
  ["auth-btn", "auth-status", "user-details", "user-roles-list", "rows", "status"].map($);

const DATA_URL = "/data-api/rest/TestSalesByPrincipal";
const BUDGET_MS = 250000, START_WAIT = 5000, MAX_WAIT = 60000, FETCH_TIMEOUT = 20000;

const sleep = ms => new Promise(r => setTimeout(r, ms));

const authorize = async () => {
  try {
    const response = await fetch("/.auth/me", { cache: "no-store", credentials: "include" }); // Ask SWA auth endpoint for the current user
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`); // Treat non-2xx as hard failures so we surface them
    const user = (await response.json())?.clientPrincipal ?? null; // Pull the clientPrincipal record if available
    authBtn.href = user ? "/.auth/logout" : "/.auth/login/aad"; // Point button to login or logout depending on auth state
    authStatus.textContent = authStatus.style.color = ""; // Clear any stale status message from previous attempts
    if (!user) return null; // No user means we stop early and leave the table in the signed-out state
    [userDetails.textContent, userRolesList.textContent] = [user.userDetails || '', (user.userRoles || []).join(", ")]; // Show friendly name and role list in the header
    return user; // Hand the caller the resolved user object
  } catch (e) {
    authStatus.textContent = `Unable to read auth context: ${e.message || e}`; // Surface auth issues to the page so the user knows what failed
    authStatus.style.color = "red"; return null; // Highlight the message and signal back that auth did not succeed
  }
};

const fetchDataWithRetry = async principalName => {
  const deadline = Date.now() + BUDGET_MS; let wait = START_WAIT, tries = 0; // Track when we must stop, current wait, and attempt count
  while (true) { // Loop until we either succeed or time constraints fail us
    const now = Date.now();
    if (now >= deadline) { statusEl.textContent = `Error retrieving data: timeout`; statusEl.style.color = "red"; return null; } // Bail if we ran out of budget
    try {
      const c = new AbortController(), id = setTimeout(() => c.abort(), FETCH_TIMEOUT); // Guard the fetch with a timeout so a hung call aborts
      const requestInit = { method: "POST", credentials: "include",
        headers: {"Cache-Control": "no-store", "Content-Type": "application/json" }, // Prevent caching and ensure JSON body
        body: JSON.stringify({ PrincipalName: principalName ?? "" }), // Provide the principal name for the API filter
        signal: c.signal
      };
      let r; try { r = await fetch(DATA_URL, requestInit); } finally { clearTimeout(id); } // Always clear the timeout once fetch resolves
      if (r.ok) return await r.json(); // Success path: hand back the parsed payload
      if (!(r.status === 400 || r.status >= 500)) throw new Error(`${r.status} ${r.statusText}`); // Non-transient errors bubble out immediately
      throw new Error("transient"); // Anything else we retry
    } catch (e) {
      if (now + wait >= deadline) { statusEl.textContent = `Error retrieving data: ${e.message || e}`; statusEl.style.color = "red"; return null; } // Stop retrying if next wait would exceed budget
      tries++; statusEl.textContent = `Waking database… (try ${tries}) in ${Math.ceil(wait / 1000)}s`; statusEl.style.color = ""; // Let the user know we are backing off
      await sleep(wait); wait = Math.min(Math.floor(wait * 1.8), MAX_WAIT); // Exponential backoff until capped at MAX_WAIT
    }
  }
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
  const data = await fetchDataWithRetry(user.userDetails || user.userId || "");
  renderData(data);
};

main();
