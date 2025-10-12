const $ = id => document.getElementById(id);

const loginBtn = $("login-btn");
const logoutBtn = $("logout-btn");
const authStatus = $("auth-status");
const userName = $("user-name");
const userRoles = $("user-roles");
const rows = $("rows");
const status = $("status");

const DATA_URL =
  "/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10";
const RETRY = { retries: 8, min: 1500, max: 15000, factor: 2 };

const signedOut = () => {
  loginBtn && (loginBtn.hidden = false);
  logoutBtn && (logoutBtn.hidden = true);
  userName && (userName.textContent = "");
  userRoles && (userRoles.textContent = "");
  rows && (rows.innerHTML = '<tr><td colspan="3">Sign in required.</td></tr>');
  if (status) status.textContent = status.style.color = "";
  if (authStatus) {
    if (!authStatus.textContent) authStatus.textContent = "Please sign in to view data.";
    authStatus.style.color = "";
  }
};

const signedIn = u => {
  loginBtn && (loginBtn.hidden = true);
  logoutBtn && (logoutBtn.hidden = false);
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

const getUser = async () => {
  try {
    const r = await fetch("/.auth/me", { cache: "no-store", credentials: "include" });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    const b = await r.json();
    return b?.clientPrincipal || b?.[0] || null;
  } catch (e) {
    if (authStatus) {
      authStatus.textContent = `Unable to read auth context: ${e.message || e}`;
      authStatus.style.color = "red";
    }
    return null;
  }
};

const render = res => {
  const items = Array.isArray(res) ? res : res?.value || res?.items || [];
  if (!rows) return;
  if (!items.length) {
    rows.innerHTML = '<tr><td colspan="3">(no rows)</td></tr>';
    if (status) status.textContent = "0 row(s)", (status.style.color = "");
    return;
  }
  rows.innerHTML = items
    .map(x => `<tr><td>${x?.SaleID ?? ""}</td><td>${x?.SalesRepID ?? ""}</td><td>${x?.Amount ?? ""}</td></tr>`)
    .join("");
  if (status) status.textContent = `${items.length} row(s)`, (status.style.color = "");
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

const classify = (code, detail = "") => {
  const t = detail.toLowerCase();
  const warm = !t || /database|warming|initializ|resume|idle|cold start|paused/i.test(t);
  if (code === 429) return { ok: true, why: "throttle" };
  if (code >= 500) return { ok: true, why: warm ? "warm" : "server" };
  if (code === 400) return { ok: true, why: "client" }; // DAB/SWA may 400 during warm-up
  return { ok: false, why: "" };
};

const netErr = e => e?.name === "TypeError" || e?.message === "Failed to fetch";

const fetchRetry = async (url, opt = {}) => {
  const { retries, min, max, factor } = RETRY;
  let last = null, why = "";
  for (let a = 0; a <= retries; a++) {
    try {
      const r = await fetch(url, opt);
      if (r.ok) return r;
      const detail = await r.text();
      const msg = `${r.status} ${r.statusText}${detail ? `\n${detail}` : ""}`;
      const c = classify(r.status, detail);
      if (!c.ok || a === retries) throw new Error(msg);
      why = c.why;
      last = Object.assign(new Error(msg), {
        retryable: true,
        retryReason: c.why,
        minDelay: c.why === "warm" ? 4000 : 0
      });
      throw last;
    } catch (e) {
      last = e;
      const ok = e?.retryable || netErr(e);
      why = e?.retryReason || (netErr(e) ? "network" : why);
      if (!ok || a === retries) break;
    }
    const base = Math.min(Math.floor(min * factor ** a), max);
    const jitter = 0.6 + Math.random() * 0.8;
    const delay = Math.min(Math.max(Math.floor(base * jitter), last?.minDelay || 0), max);
    if (status) {
      const n = a + 1;
      const map = {
        warm: "Waking database",
        throttle: "Throttled by service",
        server: "Transient server error",
        network: "Recovering network hiccup",
        client: "Retrying client error"
      };
      status.textContent = `${map[why] || "Retrying"}... (${n}/${retries}) in ${Math.ceil(delay / 1000)}s`;
      status.style.color = "";
    }
    await sleep(delay);
  }
  throw last || new Error("Request failed after retries");
};

const load = async () => {
  if (status) status.textContent = "Loading data...", (status.style.color = "");
  try {
    const r = await fetchRetry(DATA_URL, {
      credentials: "include",
      headers: { "Cache-Control": "no-store" }
    });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    render(await r.json());
  } catch (e) {
    rows && (rows.innerHTML = "");
    if (status) status.textContent = `Error retrieving data: ${e.message || e}`, (status.style.color = "red");
  }
};

(async () => {
  const u = await getUser();
  if (!u) return signedOut();
  signedIn(u);
  await load();
})();
