const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const welcomePanel = document.getElementById("welcome");
const profileForm = document.getElementById("profile-form");
const profileDetails = document.getElementById("profile-details");
const profileMessage = document.getElementById("profile-message");

// Switch between the login and signup forms.
document.getElementById("show-signup").addEventListener("click", (event) => {
  event.preventDefault();
  loginForm.hidden = true;
  signupForm.hidden = false;
});

document.getElementById("show-login").addEventListener("click", (event) => {
  event.preventDefault();
  signupForm.hidden = true;
  loginForm.hidden = false;
});

// Accounts are stored in this browser.
function getSavedUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function getCurrentUser() {
  const email = localStorage.getItem("currentUser");
  return getSavedUsers().find((user) => user.email === email);
}

async function hashPassword(password) {
  const passwordBytes = new TextEncoder().encode(password);
  const passwordHash = await crypto.subtle.digest("SHA-256", passwordBytes);

  return Array.from(new Uint8Array(passwordHash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function logInUser(email) {
  localStorage.setItem("currentUser", email);

  const nextPage = new URLSearchParams(window.location.search).get("next");
  window.location.href = nextPage || "../HCIPROJECT.html";
}

function showWelcomePanel() {
  const email = localStorage.getItem("currentUser");
  const savedUser = getCurrentUser();
  const welcomeName = document.getElementById("welcome-name");
  const firstName = savedUser?.firstName || "";
  const fullName = [firstName, savedUser?.lastName].filter(Boolean).join(" ");

  loginForm.hidden = true;
  signupForm.hidden = true;
  welcomePanel.hidden = false;
  document.getElementById("welcome-title").textContent = firstName
    ? `WELCOME, ${firstName.toUpperCase()}`
    : "WELCOME";
  welcomeName.textContent = "Manage your profile and keep track of your orders.";
  document.getElementById("profile-name").textContent = fullName || "URBN customer";
  document.getElementById("profile-email").textContent = email;
  document.getElementById("profile-phone").textContent = savedUser?.phone || "No phone number added";
  document.getElementById("profile-first").value = savedUser?.firstName || "";
  document.getElementById("profile-last").value = savedUser?.lastName || "";
  document.getElementById("profile-phone-input").value = savedUser?.phone || "";
  document.getElementById("edit-profile").disabled = !savedUser;
  renderOrderHistory(email);
}

async function renderOrderHistory(email) {
  const orderList = document.getElementById("order-list");
  const orderCount = document.getElementById("order-count");
  orderCount.textContent = "Loading...";
  orderList.replaceChildren();

  try {
    const response = await fetch(
      `http://localhost:3000/api/orders?customer_email=${encodeURIComponent(email)}`
    );
    const orders = await response.json();

    if (!response.ok || !Array.isArray(orders)) {
      throw new Error(orders?.error || `Server returned ${response.status}`);
    }

    orderCount.textContent = `${orders.length} ${orders.length === 1 ? "order" : "orders"}`;

    if (orders.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "order-empty";
      emptyMessage.textContent = "No orders yet. Your next favorite is waiting.";
      orderList.append(emptyMessage);
      return;
    }

    orders.forEach((order) => {
      const row = document.createElement("article");
      row.className = "order-row";

      const orderInfo = document.createElement("div");
      orderInfo.className = "order-info";
      const orderHeading = document.createElement("h3");
      orderHeading.textContent = `Order #${order.order_number}`;
      const orderDate = document.createElement("p");
      const placedAt = new Date(order.order_date);
      orderDate.textContent = Number.isNaN(placedAt.getTime())
        ? order.order_date
        : placedAt.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
      const itemSummary = document.createElement("p");
      itemSummary.textContent = order.product_name;

      const orderTotal = document.createElement("strong");
      orderTotal.className = "order-total";
      orderTotal.textContent = `₱ ${Number(order.total_price).toFixed(2)}`;

      orderInfo.append(orderHeading, orderDate, itemSummary);
      row.append(orderInfo, orderTotal);
      orderList.append(row);
    });
  } catch (error) {
    console.error("Failed to load orders from the backend:", error);
    orderCount.textContent = "Unavailable";
    const errorMessage = document.createElement("p");
    errorMessage.className = "order-empty";
    errorMessage.textContent =
      "We couldn't load your orders. Check that the backend and database are running, then refresh this page.";
    orderList.append(errorMessage);
  }
}

document.getElementById("edit-profile").addEventListener("click", () => {
  profileMessage.textContent = "";
  profileDetails.hidden = true;
  profileForm.hidden = false;
});

document.getElementById("cancel-profile").addEventListener("click", () => {
  profileForm.hidden = true;
  profileDetails.hidden = false;
  profileMessage.textContent = "";
  showWelcomePanel();
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = localStorage.getItem("currentUser");
  const savedUsers = getSavedUsers();
  const userIndex = savedUsers.findIndex((user) => user.email === email);

  if (userIndex === -1) {
    profileMessage.textContent = "We couldn't find your account details. Please log in again.";
    return;
  }

  savedUsers[userIndex] = {
    ...savedUsers[userIndex],
    firstName: document.getElementById("profile-first").value.trim(),
    lastName: document.getElementById("profile-last").value.trim(),
    phone: document.getElementById("profile-phone-input").value.trim()
  };
  localStorage.setItem("users", JSON.stringify(savedUsers));
  profileForm.hidden = true;
  profileDetails.hidden = false;
  showWelcomePanel();
  profileMessage.textContent = "Your profile has been updated.";
});

// Create a new browser-stored account.
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("signup-email").value.trim().toLowerCase();
  const savedUsers = getSavedUsers();

  if (savedUsers.some((user) => user.email === email)) {
    alert("This email already has an account. Please log in.");
    return;
  }

  const newUser = {
    firstName: document.getElementById("signup-first").value.trim(),
    lastName: document.getElementById("signup-last").value.trim(),
    email,
    phone: document.getElementById("signup-phone").value.trim(),
    password: await hashPassword(document.getElementById("signup-password").value)
  };

  savedUsers.push(newUser);
  localStorage.setItem("users", JSON.stringify(savedUsers));
  logInUser(email);
});

// Check the saved account details and log in.
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim().toLowerCase();
  const password = await hashPassword(document.getElementById("login-password").value);
  const matchingUser = getSavedUsers().find(
    (user) => user.email === email && user.password === password
  );

  if (!matchingUser) {
    alert("Wrong email or password.");
    return;
  }

  logInUser(email);
});

// Log out and return to the login form.
document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  welcomePanel.hidden = true;
  loginForm.hidden = false;
});

if (localStorage.getItem("currentUser")) {
  showWelcomePanel();
}