const $ = id => document.getElementById(id);
const loginBtn = $("login-btn"), logoutBtn = $("logout-btn"), authStatus = $("auth-status"),
  userName = $("user-name"), userRoles = $("user-roles"), rows = $("rows"), status = $("status");

const DATA_URL = "/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10";
const RETRY_OPTS = { retries: 8, min: 1500, max: 15000, factor: 2 };

const setHidden = (node, hidden) => node && (node.hidden = hidden);
const setHTML = (node, html) => node && (node.innerHTML = html);
const setText = (node, text = "", color = "") => {
  if (!node) return;
  node.textContent = text;
  node.style.color = color;
};
const paintStatus = (text, color = "") => setText(status, text, color);

const showSignedOutState = () => {
  setHidden(loginBtn, false);
  setHidden(logoutBtn, true);
  setText(userName);
  setText(userRoles);
  setHTML(rows, '<tr><td colspan="3">Sign in required.</td></tr>');
  paintStatus();
  if (!authStatus) return;
  if (!authStatus.textContent) authStatus.textContent = "Please sign in to view data.";
  authStatus.style.color = "";
};

const showSignedInState = user => {
  setHidden(loginBtn, true);
  setHidden(logoutBtn, false);
  setText(authStatus);
  const display = user.userDetails || user.identityProvider || user.userId || "";
  setText(userName, display ? `👤:${display}` : "");
  const roles = (user.userRoles || []).filter(role => role !== "anonymous");
  setText(userRoles, roles.length ? `🔑:${roles.join(", ")}` : "");
};

const fetchUser = async () => {
  try {
    const response = await fetch("/.auth/me", { cache: "no-store", credentials: "include" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const body = await response.json();
    return body?.clientPrincipal || body?.[0] || null;
  } catch (error) {
    setText(authStatus, `Unable to read auth context: ${error.message || error}`, "red");
    return null;
  }
};

const renderRows = result => {
  const items = Array.isArray(result) ? result : result?.value || result?.items || [];
  if (!items.length) {
    setHTML(rows, '<tr><td colspan="3">(no rows)</td></tr>');
    paintStatus("0 row(s)");
    return;
  }
  const markup = items.map(item => {
    const sale = item?.SaleID ?? "", rep = item?.SalesRepID ?? "", amount = item?.Amount ?? "";
    return `<tr><td>${sale}</td><td>${rep}</td><td>${amount}</td></tr>`;
  }).join("");
  setHTML(rows, markup);
  paintStatus(`${items.length} row(s)`);
};

const sleep = ms => new Promise(res => setTimeout(res, ms));

const classifyRetry = (code, detailText = "") => {
  const detail = detailText.toLowerCase();
  const warm = !detail || /database|warming|initializ|resume|idle|cold start|paused/i.test(detail);
  if (code === 429) return { shouldRetry: true, reason: "throttle" };
  if (code >= 500 && code <= 599) return { shouldRetry: true, reason: warm ? "warm" : "server" };
  if (code === 400 && warm) return { shouldRetry: true, reason: "warm" };
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

const retryLabels = {
  warm: "Waking database",
  throttle: "Throttled by service",
  server: "Transient server error",
  network: "Recovering network hiccup"
};

const formatDelayMessage = (reason, retryNum, retries, delayMs) => {
  const label = retryLabels[reason] || "Retrying";
  return `${label}... retrying (${retryNum}/${retries}) in ${Math.ceil(delayMs / 1000)}s`;
};

const fetchWithRetry = async (url, options = {}) => {
  const { retries, min, max, factor } = RETRY_OPTS;
  let attempt = 0;
  let lastError = null;
  while (attempt <= retries) {
    let reason = "";
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      const detail = await res.text();
      const msg = `${res.status} ${res.statusText}${detail ? `\n${detail}` : ""}`;
      const meta = classifyRetry(res.status, detail);
      if (!meta.shouldRetry || attempt === retries) throw new Error(msg);
      reason = meta.reason;
      lastError = createRetryableError(msg, reason, reason === "warm" ? 4000 : 0);
      throw lastError;
    } catch (error) {
      lastError = error;
      const retryable = error.retryable || isNetworkError(error);
      reason = error.retryReason || (isNetworkError(error) ? "network" : reason);
      if (!retryable || attempt === retries) break;
    }
    const base = Math.min(Math.floor(min * factor ** attempt), max);
    const jitter = 0.6 + Math.random() * 0.8;
    const wait = Math.min(Math.max(Math.floor(base * jitter), lastError?.minDelay || 0), max);
    paintStatus(formatDelayMessage(reason, attempt + 1, retries, wait));
    await sleep(wait);
    attempt += 1;
  }
  throw lastError || new Error("Request failed after retries");
};

const loadData = async () => {
  paintStatus("Loading data...");
  try {
    const res = await fetchWithRetry(
      DATA_URL,
      { credentials: "include", headers: { "Cache-Control": "no-store" } }
    );
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    renderRows(await res.json());
  } catch (error) {
    setHTML(rows, "");
    paintStatus(`Error retrieving data: ${error.message || error}`, "red");
  }
};

const init = async () => {
  const user = await fetchUser();
  if (!user) return showSignedOutState();
  showSignedInState(user);
  await loadData();
};

init();
