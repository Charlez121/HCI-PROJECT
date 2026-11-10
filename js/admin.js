// This demo password is client-side only and is not suitable for real security.
const ADMIN_PASSWORD = "admin123";
const LOW_STOCK_LIMIT = 5;

const loginSection = document.getElementById("admin-login");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const dashboard = document.getElementById("admin-dashboard");
const message = document.getElementById("admin-message");

let salesChart = null;
let bestChart = null;

function createElement(tagName, className = "", text = "") {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== "") element.textContent = text;
  return element;
}

function peso(amount) {
  return `₱ ${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function showMessage(text) {
  message.textContent = text;
  setTimeout(() => {
    if (message.textContent === text) message.textContent = "";
  }, 4000);
}

function openDashboard() {
  loginSection.hidden = true;
  dashboard.hidden = false;
  renderDashboard();
}

function logOut() {
  sessionStorage.removeItem("adminAuthenticated");
  dashboard.hidden = true;
  loginSection.hidden = false;
  loginForm.reset();
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginError.textContent = "";

  if (document.getElementById("admin-key").value !== ADMIN_PASSWORD) {
    loginError.textContent = "Incorrect password.";
    return;
  }

  sessionStorage.setItem("adminAuthenticated", "true");
  openDashboard();
});

document.getElementById("admin-logout").addEventListener("click", logOut);

function getOrderItems(order) {
  return Array.isArray(order.items) ? order.items : [];
}

function getOrderDateKey(order) {
  return typeof order.date === "string" ? order.date.slice(0, 10) : "";
}

function getRecentDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - (count - index - 1));
    return date.toISOString().slice(0, 10);
  });
}

function renderDashboard() {
  const orders = getOrders();
  const products = getProducts();
  renderSummary(orders, products);
  renderSalesChart(orders);
  renderBestSellers(orders);
  renderOrders(orders);
  renderStockTable(products);
  renderArchiveTable(products);
}

function renderSummary(orders, products) {
  document.getElementById("total-sales").textContent = peso(
    orders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  );
  document.getElementById("total-orders").textContent = orders.length;
  document.getElementById("items-sold").textContent = orders.reduce(
    (sum, order) => sum + getOrderItems(order).reduce((itemSum, item) => itemSum + Number(item.qty || 0), 0),
    0
  );

  const lowProducts = products.filter(
    (product) => !product.archived && product.stock <= LOW_STOCK_LIMIT
  );
  document.getElementById("low-stock-count").textContent = lowProducts.length;
  const alertBox = document.getElementById("low-stock-alert");
  alertBox.hidden = lowProducts.length === 0;
  alertBox.textContent = lowProducts.length
    ? `Restock soon: ${lowProducts.map((product) => `${product.name} (${product.stock} left)`).join(", ")}`
    : "";
}

function renderSalesChart(orders) {
  const days = getRecentDays(30);
  const salesByDay = new Map(days.map((day) => [day, 0]));
  orders.forEach((order) => {
    const day = getOrderDateKey(order);
    if (salesByDay.has(day)) {
      salesByDay.set(day, salesByDay.get(day) + Number(order.total || 0));
    }
  });

  if (salesChart) salesChart.destroy();
  salesChart = new Chart(document.getElementById("sales-chart"), {
    type: "line",
    data: {
      labels: days.map((day) => day.slice(5)),
      datasets: [{
        label: "Sales (₱)",
        data: days.map((day) => salesByDay.get(day)),
        borderColor: "#111111",
        backgroundColor: "rgba(17, 17, 17, 0.08)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function renderBestSellers(orders) {
  const salesByProduct = new Map();
  orders.forEach((order) => {
    getOrderItems(order).forEach((item) => {
      const key = String(item.id);
      const existing = salesByProduct.get(key) || { name: item.name, sold: 0 };
      existing.sold += Number(item.qty || 0);
      salesByProduct.set(key, existing);
    });
  });

  const products = Array.from(salesByProduct.values()).sort((left, right) => right.sold - left.sold);
  document.getElementById("best-seller-name").textContent =
    products.length ? products[0].name : "No sales yet";
  document.getElementById("best-empty").hidden = products.length > 0;

  if (bestChart) bestChart.destroy();
  bestChart = new Chart(document.getElementById("best-chart"), {
    type: "bar",
    data: {
      labels: products.map((product) => product.name),
      datasets: [{
        label: "Units sold",
        data: products.map((product) => product.sold),
        backgroundColor: "#111111"
      }]
    },
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

function emptyRow(text, columns) {
  const row = createElement("tr");
  const cell = createElement("td", "", text);
  cell.colSpan = columns;
  row.append(cell);
  return row;
}

function renderOrders(orders) {
  const tableBody = document.getElementById("orders-body");
  tableBody.replaceChildren();

  const newestFirst = [...orders].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
  );
  if (newestFirst.length === 0) {
    tableBody.append(emptyRow("No orders yet.", 7));
    return;
  }

  newestFirst.forEach((order) => {
    const items = getOrderItems(order);
    const customerCell = createElement("td", "admin-wrap-cell");
    customerCell.append(
      createElement("div", "", order.customerName || "Customer"),
      createElement("div", "admin-sub", order.email || "")
    );
    const itemsCell = createElement(
      "td",
      "admin-wrap-cell",
      items.map((item) => `${item.name} × ${item.qty}`).join(", ")
    );
    const date = new Date(order.date);
    const dateText = Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
    const actionCell = createElement("td");
    if (order.status === "Pending") {
      const completeButton = createElement("button", "admin-btn", "Mark completed");
      completeButton.addEventListener("click", () => completeOrder(order.id));
      actionCell.append(completeButton);
    } else {
      actionCell.textContent = "—";
    }

    const row = createElement("tr");
    row.append(
      createElement("td", "", `#${order.id}`),
      createElement("td", "", dateText),
      customerCell,
      itemsCell,
      createElement("td", "", peso(order.total)),
      createElement("td", "", order.status || "Pending"),
      actionCell
    );
    tableBody.append(row);
  });
}

function stockStatus(stock) {
  if (stock === 0) return { label: "Out of stock", css: "status-out" };
  if (stock <= LOW_STOCK_LIMIT) return { label: "Low stock", css: "status-low" };
  return { label: "In stock", css: "status-ok" };
}

function renderStockTable(products) {
  const activeProducts = products.filter((product) => !product.archived);
  const tableBody = document.getElementById("stock-body");
  tableBody.replaceChildren();

  if (activeProducts.length === 0) {
    tableBody.append(emptyRow("No products on sale.", 6));
    return;
  }

  activeProducts.forEach((product) => {
    const status = stockStatus(product.stock);
    const statusCell = createElement("td");
    statusCell.append(createElement("span", `status ${status.css}`, status.label));

    const stockInput = createElement("input", "stock-input");
    stockInput.type = "number";
    stockInput.min = "0";
    stockInput.step = "1";
    stockInput.value = product.stock;
    stockInput.setAttribute("aria-label", `Stock for ${product.name}`);

    const saveButton = createElement("button", "admin-btn", "Save");
    saveButton.addEventListener("click", () => updateStock(product.id, stockInput.value));
    const archiveButton = createElement("button", "admin-btn admin-btn-danger", "Archive");
    archiveButton.addEventListener("click", () => archiveProduct(product));

    const actionsCell = createElement("td", "admin-actions");
    actionsCell.append(stockInput, saveButton, archiveButton);
    const row = createElement("tr");
    row.append(
      createElement("td", "", product.name),
      createElement("td", "", product.category),
      createElement("td", "", peso(product.price)),
      createElement("td", "", product.stock),
      statusCell,
      actionsCell
    );
    tableBody.append(row);
  });
}

function renderArchiveTable(products) {
  const archivedProducts = products.filter((product) => product.archived);
  const tableBody = document.getElementById("archive-body");
  tableBody.replaceChildren();

  if (archivedProducts.length === 0) {
    tableBody.append(emptyRow("Nothing archived yet.", 5));
    return;
  }

  archivedProducts.forEach((product) => {
    const restoreButton = createElement("button", "admin-btn", "Restore");
    restoreButton.addEventListener("click", () => restoreProduct(product.id));
    const actionsCell = createElement("td", "admin-actions");
    actionsCell.append(restoreButton);
    const archivedDate = product.archivedAt ? new Date(product.archivedAt).toLocaleDateString() : "—";
    const row = createElement("tr");
    row.append(
      createElement("td", "", product.name),
      createElement("td", "", product.category),
      createElement("td", "", peso(product.price)),
      createElement("td", "", archivedDate),
      actionsCell
    );
    tableBody.append(row);
  });
}

function updateStock(productId, newStock) {
  const stock = Number(newStock);
  if (!Number.isInteger(stock) || stock < 0) {
    showMessage("Stock must be a whole number greater than or equal to zero.");
    return;
  }

  const products = getProducts();
  const product = products.find((savedProduct) => savedProduct.id === productId);
  if (!product) {
    showMessage("That product could not be found.");
    return;
  }
  product.stock = stock;
  saveProducts(products);
  renderDashboard();
  showMessage("Stock updated.");
}

function archiveProduct(product) {
  if (!confirm(`Archive "${product.name}"? You can restore it later.`)) return;

  const products = getProducts();
  const savedProduct = products.find((item) => item.id === product.id);
  if (!savedProduct) {
    showMessage("That product could not be found.");
    return;
  }
  savedProduct.archived = true;
  savedProduct.archivedAt = new Date().toISOString();
  saveProducts(products);
  renderDashboard();
  showMessage(`${product.name} was archived.`);
}

function restoreProduct(productId) {
  const products = getProducts();
  const product = products.find((savedProduct) => savedProduct.id === productId);
  if (!product) {
    showMessage("That product could not be found.");
    return;
  }
  product.archived = false;
  delete product.archivedAt;
  saveProducts(products);
  renderDashboard();
  showMessage(`${product.name} was restored.`);
}

function completeOrder(orderId) {
  const orders = getOrders();
  const order = orders.find((savedOrder) => String(savedOrder.id) === String(orderId));
  if (!order) {
    showMessage("That order could not be found.");
    return;
  }
  order.status = "Completed";
  saveOrders(orders);
  renderDashboard();
  showMessage(`Order #${order.id} marked completed.`);
}

if (sessionStorage.getItem("adminAuthenticated") === "true") {
  openDashboard();
}
