// Product keywords used for search suggestions.
const searchKeywords = [
  "T-shirt", "Shirt", "Polo", "Tank top", "Crop top", "Long sleeves",
  "Hoodie", "Sweatshirt", "Sweater", "Jacket", "Bomber jacket",
  "Denim jacket", "Windbreaker", "Vest", "Cardigan",
  "Pants", "Jeans", "Cargo pants", "Joggers", "Sweatpants",
  "Shorts", "Cargo shorts", "Skirt", "Leggings"
];

const searchForm = document.querySelector(".search");
const searchInput = document.querySelector(".search-input");
const suggestionList = document.querySelector(".suggestions");

function renderSearchSuggestions(matches) {
  const suggestionItems = matches.map((keyword) => {
    const item = document.createElement("li");
    item.textContent = keyword;
    return item;
  });

  suggestionList.replaceChildren(...suggestionItems);
  suggestionList.hidden = matches.length === 0;
}

// Update suggestions as the visitor types.
searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.trim().toLowerCase();
  const matches = searchText
    ? searchKeywords.filter((keyword) => keyword.toLowerCase().includes(searchText))
    : [];

  renderSearchSuggestions(matches);
});

// Put a selected suggestion into the search field.
suggestionList.addEventListener("click", (event) => {
  const selectedItem = event.target.closest("li");
  if (!selectedItem) return;

  searchInput.value = selectedItem.textContent;
  suggestionList.hidden = true;
});

// Close suggestions when the visitor clicks outside the search form.
document.addEventListener("click", (event) => {
  if (!searchForm.contains(event.target)) {
    suggestionList.hidden = true;
  }
});


// ---------- Navigation underline ----------
const navigation = document.querySelector(".nav");
const navigationLinks = document.querySelectorAll(".nav-link");

const navigationSections = Array.from(navigationLinks).map((link) => ({
  link,
  section: document.getElementById(link.hash.slice(1))
}));

function setActiveNavigationLink(activeLink) {
  navigationLinks.forEach((link) => {
    const isActive = link === activeLink;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const navigationBounds = navigation.getBoundingClientRect();
  const activeLinkBounds = activeLink.getBoundingClientRect();

  navigation.style.setProperty(
    "--active-nav-left",
    `${activeLinkBounds.left - navigationBounds.left}px`
  );
  navigation.style.setProperty("--active-nav-width", `${activeLinkBounds.width}px`);
}

function updateActiveNavigationLink() {
  const header = document.querySelector(".header");
  const activeLine =
    window.scrollY + header.offsetHeight + Math.min(120, window.innerHeight * 0.25);
  let currentSection = navigationSections[0];

  navigationSections.forEach((entry) => {
    const sectionTop = entry.section.getBoundingClientRect().top + window.scrollY;
    if (sectionTop <= activeLine) currentSection = entry;
  });

  const isAtPageBottom =
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  if (isAtPageBottom) {
    currentSection = navigationSections[navigationSections.length - 1];
  }

  setActiveNavigationLink(currentSection.link);
}

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveNavigationLink(link));
});

window.addEventListener("scroll", updateActiveNavigationLink, { passive: true });
window.addEventListener("resize", updateActiveNavigationLink);
window.addEventListener("load", updateActiveNavigationLink);
updateActiveNavigationLink();


// ---------- Hero slider ----------
const heroSlides = document.querySelectorAll(".hero .slide");
const heroDots = document.querySelectorAll(".hero .dot");
let activeSlideIndex = 0;

function showHeroSlide(nextSlideIndex) {
  heroSlides[activeSlideIndex].classList.remove("active");
  heroDots[activeSlideIndex].classList.remove("active");

  activeSlideIndex = nextSlideIndex;

  heroSlides[activeSlideIndex].classList.add("active");
  heroDots[activeSlideIndex].classList.add("active");
}

heroDots.forEach((dot, index) => {
  dot.addEventListener("click", () => showHeroSlide(index));
});


// ---------- Scroll reveal ----------
const revealElements = document.querySelectorAll(
  ".product, .cards .card, .story-panel"
);
const sectionTitles = document.querySelectorAll(".section-title");

revealElements.forEach((element) => element.classList.add("reveal"));

const revealObserver = new IntersectionObserver((entries) => {
  let visibleElementIndex = 0;

  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    entry.target.style.setProperty("--delay", `${visibleElementIndex * 0.1}s`);
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
    visibleElementIndex++;
  });
}, {
  threshold: 0.15,
  rootMargin: "0px 0px -60px 0px"
});

revealElements.forEach((element) => revealObserver.observe(element));
sectionTitles.forEach((title) => revealObserver.observe(title));

// Replay a section title's reveal animation after its navigation link is clicked.
document.querySelectorAll('.nav-link:not([href="#home"])').forEach((link) => {
  link.addEventListener("click", () => {
    const sectionTitle = document.querySelector(`${link.hash} .section-title`);
    sectionTitle.classList.remove("is-visible");
    revealObserver.observe(sectionTitle);
  });
});

// ---------- Product details pop-up ----------
const productModal = document.getElementById("product-modal");
const modalImage = document.getElementById("modal-image");
const modalName = document.getElementById("modal-name");
const modalPrice = document.getElementById("modal-price");
const modalQuantity = document.getElementById("modal-quantity");
const modalAddButton = document.getElementById("modal-add");
const modalCloseButton = productModal.querySelector(".modal-close");
const modalSizeButtons = productModal.querySelectorAll(".modal-size");
let selectedProductCard = null;
let selectedProductSize = "M";

function openProductModal(productCard) {
  const productImage = productCard.querySelector(".product-image img");
  selectedProductCard = productCard;

  modalImage.src = productImage ? productImage.src : "";
  modalImage.alt = productImage ? productImage.alt : "";
  modalImage.hidden = !productImage;
  modalName.textContent = productCard.querySelector(".product-name").textContent;
  modalPrice.textContent = productCard.querySelector(".product-price").textContent;
  modalQuantity.value = "1";
  modalQuantity.textContent = "1";
  selectedProductSize = "M";

  modalSizeButtons.forEach((button) => {
    const isSelected = button.textContent.trim() === selectedProductSize;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  productModal.hidden = false;
  document.body.style.overflow = "hidden";
  modalCloseButton.focus();
}

function closeProductModal() {
  productModal.hidden = true;
  document.body.style.overflow = "";
  selectedProductCard?.focus();
}

document.querySelectorAll(".product").forEach((productCard) => {
  productCard.tabIndex = 0;
  productCard.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    openProductModal(productCard);
  });

  productCard.addEventListener("keydown", (event) => {
    if (event.target !== productCard || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    openProductModal(productCard);
  });
});

modalSizeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedProductSize = button.textContent.trim();

    modalSizeButtons.forEach((sizeButton) => {
      const isSelected = sizeButton === button;
      sizeButton.classList.toggle("is-selected", isSelected);
      sizeButton.setAttribute("aria-pressed", String(isSelected));
    });
  });
});

document.getElementById("modal-quantity-down").addEventListener("click", () => {
  const quantity = Math.max(1, Number(modalQuantity.textContent) - 1);
  modalQuantity.value = String(quantity);
  modalQuantity.textContent = String(quantity);
});

document.getElementById("modal-quantity-up").addEventListener("click", () => {
  const quantity = Number(modalQuantity.textContent) + 1;
  modalQuantity.value = String(quantity);
  modalQuantity.textContent = String(quantity);
});

modalAddButton.addEventListener("click", () => {
  if (!selectedProductCard) return;

  const addToCartButton = selectedProductCard.querySelector(".add-cart");
  addToCartButton.dataset.quantity = modalQuantity.textContent;
  addToCartButton.dataset.size = selectedProductSize;
  addToCartButton.click();
  delete addToCartButton.dataset.quantity;
  delete addToCartButton.dataset.size;
  closeProductModal();
});

modalCloseButton.addEventListener("click", closeProductModal);
productModal.querySelector("[data-close-modal]").addEventListener("click", closeProductModal);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !productModal.hidden) {
    closeProductModal();
  }
});
