const $ = id => document.getElementById(id);
const loginBtn = $("login-btn"), logoutBtn = $("logout-btn"), authStatus = $("auth-status"),
  userName = $("user-name"), userRoles = $("user-roles"), rows = $("rows");

const DATA_URL = "/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10";
const RETRY_OPTS = { retries: 8, min: 1500, max: 15000, factor: 2 };

const showSignedOutState = () => {
  if (loginBtn) loginBtn.hidden = false;
  if (logoutBtn) logoutBtn.hidden = true;
  if (userName) userName.textContent = "";
  if (userRoles) userRoles.textContent = "";
  if (rows) rows.innerHTML = '<tr><td colspan="3">Sign in required.</td></tr>';
  if (!authStatus) return;
  if (!authStatus.textContent) authStatus.textContent = "Please sign in to view data.";
  authStatus.style.color = "";
};

const showSignedInState = user => {
  if (loginBtn) loginBtn.hidden = true;
  if (logoutBtn) logoutBtn.hidden = false;
  if (authStatus) { authStatus.textContent = ""; authStatus.style.color = ""; }
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
    console.log("0 row(s)");
    return;
  }
  rows.innerHTML = items.map(item => {
    const sale = item?.SaleID ?? "", rep = item?.SalesRepID ?? "", amount = item?.Amount ?? "";
    return `<tr><td>${sale}</td><td>${rep}</td><td>${amount}</td></tr>`;
  }).join("");
  console.log(`${items.length} row(s)`);
};

const sleep = ms => new Promise(res => setTimeout(res, ms));

const classifyRetry = (statusCode, detailText = "") => {
  const detail = detailText.toLowerCase();
  const warmSignal = !detail || /database|warming|initializ|resume|idle|cold start|paused/i.test(detail);
  if (statusCode === 429) return { shouldRetry: true, reason: "throttle" };
  if (statusCode >= 500 && statusCode <= 599) {
    return { shouldRetry: true, reason: warmSignal ? "warm" : "server" };
  }
  if (statusCode === 400 && warmSignal) {
    return { shouldRetry: true, reason: "warm" };
  }
  return { shouldRetry: false, reason: "" };
};

const createRetryableError = (message, reason, minDelay = 0) => {
  const error = new Error(message);
  error.retryable = true;
  error.retryReason = reason;
  error.minDelay = minDelay;
  return error;
};

const isNetworkError = error => error?.name === "TypeError" || error?.message === "Failed to fetch";

const fetchWithRetry = async (url, options = {}) => {
  const { retries, min, max, factor } = RETRY_OPTS;
  let attempt = 0, lastError = null;
  while (attempt <= retries) {
    let retryReason = "";
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      const statusCode = response.status, detail = await response.text();
      const message = `${statusCode} ${response.statusText}${detail ? `\n${detail}` : ""}`;
      const { shouldRetry, reason } = classifyRetry(statusCode, detail);
      if (!shouldRetry) throw new Error(message);
      if (attempt === retries) throw new Error(message);
      retryReason = reason;
      lastError = createRetryableError(message, reason, reason === "warm" ? 4000 : 0);
      throw lastError;
    } catch (error) {
      lastError = error;
      const retryable = error?.retryable || isNetworkError(error);
      retryReason = error?.retryReason || (isNetworkError(error) ? "network" : retryReason);
      if (!retryable || attempt === retries) break;
    }
    const baseDelay = Math.min(Math.floor(min * factor ** attempt), max);
    const jitter = 0.6 + Math.random() * 0.8;
    const minDelay = lastError?.minDelay || 0;
    const delay = Math.min(Math.max(Math.floor(baseDelay * jitter), minDelay), max);
    const retryNum = attempt + 1;
    const reasonLabel = {
      warm: "Waking database", throttle: "Throttled by service",
      server: "Transient server error", network: "Recovering network hiccup"
    }[retryReason] || "Retrying";
    console.log(`${reasonLabel}... retrying (${retryNum}/${retries}) in ${Math.ceil(delay / 1000)}s`);
    await sleep(delay);
    attempt += 1;
  }
  throw lastError || new Error("Request failed after retries");
};

const loadData = async () => {
  console.log("Loading data...");
  try {
    const response = await fetchWithRetry(
      DATA_URL, { credentials: "include", headers: { "Cache-Control": "no-store" } }
    );
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const body = await response.json();
    renderRows(body);
  } catch (error) {
    if (rows) rows.innerHTML = "";
    console.error(`Error retrieving data: ${error.message || error}`);
  }
};

const init = async () => {
  const user = await fetchUser();
  if (!user) { showSignedOutState(); return; }
  showSignedInState(user);
  await loadData();
};

init();
