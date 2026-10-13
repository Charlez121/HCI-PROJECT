const availableKeywords = [
  "T-shirt", "Shirt", "Polo", "Tank top", "Crop top", "Long sleeves",
  "Hoodie", "Sweatshirt", "Sweater", "Jacket", "Bomber jacket",
  "Denim jacket", "Windbreaker", "Vest", "Cardigan",
  "Pants", "Jeans", "Cargo pants", "Joggers", "Sweatpants",
  "Shorts", "Cargo shorts", "Skirt", "Leggings"
];

const searchForm = document.querySelector(".search");
const searchInput = document.querySelector(".search-input");
const suggestions = document.querySelector(".suggestions");

const navLinks = document.querySelectorAll(".nav a.nav-link[href^='#']");

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((navLink) => {
      navLink.classList.remove("active");
      navLink.removeAttribute("aria-current");
    });

    link.classList.add("active");
    link.setAttribute("aria-current", "location");
  });
});

const sectionNavLinks = document.querySelectorAll(
  '.nav a[href="#new-arrivals"], .nav a[href="#clothing"], .nav a[href="#our-story"]'
);

sectionNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const heading = document.querySelector(`${link.hash} .section-title`);
    if (!heading) return;

    heading.classList.remove("is-visible");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heading.classList.add("is-visible");
      return;
    }

    let previousScrollY = window.scrollY;
    let stillFrames = 0;

    const animateHeadingAfterScroll = () => {
      if (window.scrollY === previousScrollY) {
        stillFrames += 1;
      } else {
        previousScrollY = window.scrollY;
        stillFrames = 0;
      }

      if (stillFrames < 8) {
        window.requestAnimationFrame(animateHeadingAfterScroll);
        return;
      }

      const animation = heading.animate(
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "translateY(0)" }
        ],
        { duration: 650, easing: "ease-in", fill: "forwards" }
      );

      animation.addEventListener("finish", () => {
        heading.classList.add("is-visible");
        animation.cancel();
      }, { once: true });
    };

    window.requestAnimationFrame(animateHeadingAfterScroll);
  });
});

if (searchForm && searchInput && suggestions) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const matches = query
      ? availableKeywords.filter((keyword) =>
          keyword.toLowerCase().includes(query)
        )
      : [];

    showSuggestions(matches);
  });

  suggestions.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;

    const item = event.target.closest("li[data-keyword]");
    if (!item) return;

    searchInput.value = item.dataset.keyword;
    suggestions.replaceChildren();
    suggestions.hidden = true;
  });

  document.addEventListener("click", (event) => {
    if (!searchForm.contains(event.target)) {
      suggestions.hidden = true;
    }
  });
}

function showSuggestions(keywords) {
  suggestions.replaceChildren(
    ...keywords.map((keyword) => {
      const item = document.createElement("li");
      item.textContent = keyword;
      item.dataset.keyword = keyword;
      return item;
    })
  );
  suggestions.hidden = keywords.length === 0;
}
