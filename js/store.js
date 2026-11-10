// The shop's "database" for now. Everything is saved in this browser (localStorage),
// so no MySQL and no Node server are needed.
// Load this file BEFORE the other scripts on every page.

// Starting products. CHANGE names, prices and stock here.
// "id" must match data-product-id in your HTML.
// Your bottoms are still placeholders, so add them here (ids 5 to 9) when they have real names.
const defaultProducts = [
  { id: 0, name: "Stay Gold Oversized Tee", category: "tops", price: 1299, stock: 10, archived: false },
  { id: 1, name: "Urban Graffiti Crop Tee", category: "tops", price: 899, stock: 8, archived: false },
  { id: 2, name: "Acid Wash Graphic Top", category: "tops", price: 1099, stock: 5, archived: false },
  { id: 3, name: "Street Style Boxy Tee", category: "tops", price: 1499, stock: 12, archived: false },
  { id: 4, name: "Faded Black Logo Tee", category: "tops", price: 999, stock: 3, archived: false }
];

const STOCK_BADGE_LIMIT = 5;

// ---------- Products (stock + archive) ----------
function getProducts() {
  const savedProducts = JSON.parse(localStorage.getItem("products"));
  if (savedProducts) return savedProducts;

  const startingProducts = JSON.parse(JSON.stringify(defaultProducts));
  localStorage.setItem("products", JSON.stringify(startingProducts));
  return startingProducts;
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

// ---------- Orders ----------
function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}

function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// ---------- Wishlist ----------
function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function saveWishlist(wishlist) {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistCount();
}

function updateWishlistCount() {
  const wishlistLink = document.querySelector('a[href$="wishlist.html"]');
  if (!wishlistLink) return;

  let badge = wishlistLink.querySelector(".cart-count");
  if (!badge) {
    badge = document.createElement("span");
    badge.className = "cart-count";
    wishlistLink.append(badge);
  }

  const count = getWishlist().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}

function drawHeart(button, isSaved) {
  button.textContent = isSaved ? "♥" : "♡";
  button.classList.toggle("is-saved", isSaved);
  button.setAttribute("aria-pressed", String(isSaved));
  button.setAttribute("aria-label", isSaved ? "Remove from wishlist" : "Save to wishlist");
}

function toggleWishlist(card, heartButton) {
  const productId = Number(card.dataset.productId);
  let wishlist = getWishlist();

  if (wishlist.some((item) => item.id === productId)) {
    wishlist = wishlist.filter((item) => item.id !== productId);
  } else {
    const image = card.querySelector(".product-image img");
    wishlist.push({
      id: productId,
      name: card.querySelector(".product-name").textContent,
      price: Number(card.querySelector(".product-price").textContent.replace(/[^0-9.]/g, "")),
      image: image ? image.src : ""
    });
  }

  saveWishlist(wishlist);
  drawHeart(heartButton, wishlist.some((item) => item.id === productId));
}

function addStockBadge(imageBox, text, cssClass) {
  const badge = document.createElement("span");
  badge.className = `stock-badge ${cssClass}`;
  badge.textContent = text;
  imageBox.append(badge);
}

function setupProductCards() {
  const products = getProducts();
  const wishlist = getWishlist();

  document.querySelectorAll(".product").forEach((card) => {
    const productId = Number(card.dataset.productId);
    const imageBox = card.querySelector(".product-image");
    const product = products.find((savedProduct) => savedProduct.id === productId);

    imageBox.querySelectorAll(".stock-badge, .wish-btn").forEach((element) => element.remove());

    const heartButton = document.createElement("button");
    heartButton.type = "button";
    heartButton.className = "wish-btn";
    drawHeart(heartButton, wishlist.some((item) => item.id === productId));
    heartButton.addEventListener("click", () => toggleWishlist(card, heartButton));
    imageBox.append(heartButton);

    if (!product) return;
    card.classList.toggle("is-sold-out", product.stock === 0);

    if (product.stock === 0) {
      addStockBadge(imageBox, "Sold out", "stock-badge-out");
    } else if (product.stock <= STOCK_BADGE_LIMIT) {
      addStockBadge(imageBox, `Only ${product.stock} left`, "stock-badge-low");
    }
  });
}

// ---------- Hide archived products on the home page ----------
getProducts()
  .filter((product) => product.archived)
  .forEach((product) => {
    const card = document.querySelector(`.product[data-product-id="${product.id}"]`);
    if (card) card.remove();
  });

setupProductCards();
updateWishlistCount();
