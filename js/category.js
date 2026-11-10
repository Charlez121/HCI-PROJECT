const categoryCatalog = {
  tops: {
    title: "TOPS",
    products: [
      { image: "t1.jpg", name: "Stay Gold Oversized Tee", price: 1299 },
      { image: "t2.jpg", name: "Urban Graffiti Crop Tee", price: 899 },
      { image: "t3.jpg", name: "Acid Wash Graphic Top", price: 1099 },
      { image: "t4.jpg", name: "Street Style Boxy Tee", price: 1499 },
      { image: "t5.jpg", name: "Faded Black Logo Tee", price: 999 }
    ].map((product, index) => ({
      ...product,
      id: index,
      image: `assets/images/products/tshirts/${product.image}`,
      alt: "T-shirt"
    }))
  },
  bottoms: {
    title: "BOTTOMS",
    products: ["p1.jpg", "p2.jpg", "p3.jpg", "p4.jpg", "p5.jpg"].map(
      (image, index) => ({
        id: index + 5,
        image: `assets/images/products/pants/${image}`,
        name: "Product Name",
        alt: "Pants"
      })
    )
  },
  outerwear: {
    title: "OUTERWEAR",
    products: []
  }
};

const requestedCategory = new URLSearchParams(window.location.search).get("category");
const category = Object.prototype.hasOwnProperty.call(categoryCatalog, requestedCategory)
  ? categoryCatalog[requestedCategory]
  : null;
const categoryTitle = document.getElementById("category-title");
const categoryProducts = document.getElementById("category-products");
const emptyProductsMessage = document.getElementById("empty-products");
const categoryScrollLabel = document.getElementById("category-scroll-label");
const navigationLinks = document.querySelectorAll(".category-page .nav-link");
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

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navigationLinks.forEach((navigationLink) => {
      const isActive = navigationLink === link;
      navigationLink.classList.toggle("active", isActive);
      if (isActive) {
        navigationLink.setAttribute("aria-current", "location");
      } else {
        navigationLink.removeAttribute("aria-current");
      }
    });
  });
});

function createCategoryProduct(product) {
  const card = document.createElement("article");
  card.className = "product";
  card.dataset.productId = String(product.id);

  const imageContainer = document.createElement("div");
  imageContainer.className = "product-image";

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.alt;
  imageContainer.append(image);

  const info = document.createElement("div");
  info.className = "product-info";

  const details = document.createElement("div");
  const name = document.createElement("p");
  name.className = "product-name";
  name.textContent = product.name;
  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = product.price === undefined
    ? "₱ 0.00"
    : `₱ ${product.price.toLocaleString("en-PH")}`;
  const colors = document.createElement("div");
  colors.className = "product-colors";
  colors.append(
    document.createElement("span"),
    document.createElement("span"),
    document.createElement("span")
  );
  details.append(name, price, colors);

  const addButton = document.createElement("button");
  addButton.className = "add-cart";
  addButton.setAttribute("aria-label", `Add ${product.name} to cart`);
  const cartIcon = document.createElement("img");
  cartIcon.src = "assets/icons/cart.svg";
  cartIcon.alt = "";
  addButton.append(cartIcon);

  info.append(details, addButton);
  card.append(imageContainer, info);
  return card;
}

function openProductModal(productCard) {
  const image = productCard.querySelector(".product-image img");
  selectedProductCard = productCard;
  modalImage.src = image.src;
  modalImage.alt = image.alt;
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

const productsOnSale = category ? category.products.filter((product) => {
  const saved = getProducts().find((savedProduct) => savedProduct.id === product.id);
  return !saved || !saved.archived;
}) : [];

if (category) {
  document.title = `URBN | ${category.title}`;
  categoryTitle.textContent = category.title;
  categoryScrollLabel.textContent = category.title;
  categoryProducts.replaceChildren(...productsOnSale.map(createCategoryProduct));
  setupProductCards();
  categoryProducts.querySelectorAll(".product").forEach((productCard) => {
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
  emptyProductsMessage.hidden = productsOnSale.length > 0;
  if (!productsOnSale.length) {
    emptyProductsMessage.textContent = "No outerwear products are available yet.";
  }
} else {
  document.title = "URBN | Clothing";
  categoryTitle.textContent = "CATEGORY NOT FOUND";
  categoryScrollLabel.textContent = "CATEGORY NOT FOUND";
  emptyProductsMessage.textContent = "This clothing category is unavailable.";
  emptyProductsMessage.hidden = false;
}

function updateCategoryScrollLabel() {
  const headingHasScrolledPastHeader =
    categoryTitle.getBoundingClientRect().bottom <= document.querySelector(".header").offsetHeight;
  categoryScrollLabel.hidden = !headingHasScrolledPastHeader;
}

window.addEventListener("scroll", updateCategoryScrollLabel, { passive: true });
window.addEventListener("resize", updateCategoryScrollLabel);
updateCategoryScrollLabel();

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
