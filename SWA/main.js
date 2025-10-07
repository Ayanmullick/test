fetch("/data-api/rest/TestSales?$select=SaleID,SalesRepID,Amount&$orderby=SaleID&$first=10")
  .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(r.status + " " + r.statusText + "\n" + t); }))
  .then(j => {
    const rows = Array.isArray(j) ? j : (j.value || j.items || []);
    const tbody = document.getElementById("rows");
    const statusElem = document.getElementById("status");
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="3">(no rows)</td></tr>';
      statusElem.textContent = "0 row(s)";
      return;
    }
    tbody.innerHTML = rows.map(r => `<tr><td>${r?.SaleID ?? ""}</td><td>${r?.SalesRepID ?? ""}</td><td>${r?.Amount ?? ""}</td></tr>` ).join("");
    statusElem.textContent = rows.length + " row(s)";
  })
  .catch(e => {
    document.getElementById("rows").innerHTML = "";
    const statusElem = document.getElementById("status");
    statusElem.textContent = "Error: " + (e?.message || e);
    statusElem.style.color = "red";
  });