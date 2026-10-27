const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const welcomePanel = document.getElementById("welcome");

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
  const savedUser = getSavedUsers().find((user) => user.email === email);
  const welcomeName = document.getElementById("welcome-name");

  loginForm.hidden = true;
  signupForm.hidden = true;
  welcomePanel.hidden = false;
  welcomeName.textContent = savedUser
    ? `Logged in as ${savedUser.firstName} ${savedUser.lastName}`
    : `Logged in as ${email}`;
}

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