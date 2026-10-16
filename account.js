// Switch between the login and sign up forms
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

document.getElementById("show-signup").addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.hidden = true;
  signupForm.hidden = false;
});

document.getElementById("show-login").addEventListener("click", (e) => {
  e.preventDefault();
  signupForm.hidden = true;
  loginForm.hidden = false;
});

// Demo only: no real login yet, so these just show a message
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Logged in (demo)");
});

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Account created (demo)");
});