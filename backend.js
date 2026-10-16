// ---------- Search suggestions ----------
const keywords = [
  "T-shirt", "Shirt", "Polo", "Tank top", "Crop top", "Long sleeves",
  "Hoodie", "Sweatshirt", "Sweater", "Jacket", "Bomber jacket",
  "Denim jacket", "Windbreaker", "Vest", "Cardigan",
  "Pants", "Jeans", "Cargo pants", "Joggers", "Sweatpants",
  "Shorts", "Cargo shorts", "Skirt", "Leggings"
];

const searchBox = document.querySelector(".search");
const searchInput = document.querySelector(".search-input");
const suggestions = document.querySelector(".suggestions");

function showSuggestions(matches) {
  suggestions.replaceChildren(
    ...matches.map((word) => {
      const item = document.createElement("li");
      item.textContent = word;
      return item;
    })
  );
  suggestions.hidden = matches.length === 0;
}

// Show matching keywords while typing
searchInput.addEventListener("input", () => {
  const text = searchInput.value.trim().toLowerCase();
  const matches = text
    ? keywords.filter((word) => word.toLowerCase().includes(text))
    : [];

  showSuggestions(matches);
});

// Click a suggestion to put it in the search bar
suggestions.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) return;

  searchInput.value = item.textContent;
  suggestions.hidden = true;
});

// Click anywhere else to close the suggestions
document.addEventListener("click", (event) => {
  if (!searchBox.contains(event.target)) suggestions.hidden = true;
});


// ---------- Moving underline in the nav ----------
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav-link");

// Each nav link with the section it points to
const navSections = Array.from(navLinks).map((link) => ({
  link: link,
  section: document.getElementById(link.hash.slice(1))
}));

function setActiveNavLink(activeLink) {
  navLinks.forEach((link) => {
    const isActive = link === activeLink;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  // Move the underline under the active link
  const navBox = nav.getBoundingClientRect();
  const linkBox = activeLink.getBoundingClientRect();
  nav.style.setProperty("--active-nav-left", `${linkBox.left - navBox.left}px`);
  nav.style.setProperty("--active-nav-width", `${linkBox.width}px`);
}

// Find the section on screen and underline its link
function updateActiveNavLink() {
  const header = document.querySelector(".header");
  const line = window.scrollY + header.offsetHeight + Math.min(120, window.innerHeight * 0.25);
  let current = navSections[0];

  navSections.forEach((entry) => {
    const top = entry.section.getBoundingClientRect().top + window.scrollY;
    if (top <= line) current = entry;
  });

  // At the very bottom of the page, use the last link (About)
  const atBottom =
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  if (atBottom) current = navSections[navSections.length - 1];

  setActiveNavLink(current.link);
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveNavLink(link));
});

window.addEventListener("scroll", updateActiveNavLink, { passive: true });
window.addEventListener("resize", updateActiveNavLink);
window.addEventListener("load", updateActiveNavLink);
updateActiveNavLink();


// ---------- Hero slider ----------
const slides = document.querySelectorAll(".hero .slide");
const dots = document.querySelectorAll(".hero .dot");
let current = 0;

function showSlide(i) {
  slides[current].classList.remove("active");
  dots[current].classList.remove("active");
  current = i;
  slides[current].classList.add("active");
  dots[current].classList.add("active");
}

dots.forEach((dot, i) => dot.addEventListener("click", () => showSlide(i)));


// ---------- Scroll reveal ----------
// Products, cards, and the story panel slide up one after another
const revealItems = document.querySelectorAll(".product, .cards .card, .story-panel");
revealItems.forEach((item) => item.classList.add("reveal"));

// Section titles fade in (they are hidden by default in style.css)
const titles = document.querySelectorAll(".section-title");

const revealObserver = new IntersectionObserver((entries) => {
  let n = 0; // position in this group, used for the left to right delay

  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.style.setProperty("--delay", `${n * 0.1}s`); // gap between items
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target); // only animate once
    n++;
  });
}, {
  threshold: 0.15,                 // how much must show before it animates
  rootMargin: "0px 0px -60px 0px"  // waits a little past the screen edge
});

revealItems.forEach((item) => revealObserver.observe(item));
titles.forEach((title) => revealObserver.observe(title));

// Clicking a nav link plays that section's title animation again
document.querySelectorAll('.nav-link:not([href="#home"])').forEach((link) => {
  link.addEventListener("click", () => {
    const title = document.querySelector(`${link.hash} .section-title`);
    title.classList.remove("is-visible");
    revealObserver.observe(title);
  });
});