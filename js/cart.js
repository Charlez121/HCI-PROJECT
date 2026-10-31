// Read and save the cart in this browser.
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cartItems) {
  localStorage.setItem("cart", JSON.stringify(cartItems));
  updateCartCount();
}


// ---------- Cart icon count ----------
const cartLink = document.querySelector(
  'a[href="cart.html"], a[href="pages/cart.html"]'
);
let cartCountBadge = null;

function updateCartCount() {
  if (!cartLink) return;

  if (!cartCountBadge) {
    cartCountBadge = document.createElement("span");
    cartCountBadge.className = "cart-count";
    cartLink.append(cartCountBadge);
  }

  const itemCount = getCart().reduce((total, item) => total + item.qty, 0);
  cartCountBadge.textContent = itemCount;
  cartCountBadge.style.display = itemCount > 0 ? "flex" : "none";
}

updateCartCount();


// ---------- Add products to the cart ----------
const productCards = Array.from(document.querySelectorAll(".product"));

document.querySelectorAll(".add-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const productCard = button.closest(".product");
    const productImage = productCard.querySelector(".product-image img");
    const product = {
      id: Number(productCard.dataset.productId ?? productCards.indexOf(productCard)),
      name: productCard.querySelector(".product-name").textContent,
      price: Number(
        productCard.querySelector(".product-price").textContent.replace(/[^0-9.]/g, "")
      ),
      image: productImage ? productImage.src : "",
      size: button.dataset.size || "",
      qty: Number(button.dataset.quantity) || 1
    };

    const cartItems = getCart();
    const existingItem = cartItems.find(
      (item) => item.id === product.id && (item.size || "") === product.size
    );

    if (existingItem) {
      existingItem.qty += product.qty;
    } else {
      cartItems.push(product);
    }

    saveCart(cartItems);
    showToast("Added to cart");
  });
});


// ---------- "Added to cart" message ----------
const toast = document.createElement("div");
toast.className = "toast";
document.body.append(toast);

let toastTimer;

function showToast(message) {
  const cartPageLink = document.createElement("a");
  cartPageLink.href = window.location.pathname.includes("/pages/")
    ? "cart.html"
    : "pages/cart.html";
  cartPageLink.textContent = "View cart";

  toast.replaceChildren(message, cartPageLink);
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}


// ---------- Cart page ----------
const cartList = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartMessage = document.getElementById("cart-message");

function createElement(tagName, className = "", text = "") {
  const element = document.createElement(tagName);

  if (className) element.className = className;
  if (text !== "") element.textContent = text;

  return element;
}

function getCartImageUrl(imagePath) {
  return new URL(imagePath, new URL("../", document.baseURI)).href;
}

function createCartButton(label, productId, quantityChange) {
  const button = createElement("button", "", label);
  button.dataset.id = productId;

  if (quantityChange) {
    button.dataset.change = quantityChange;
  }

  return button;
}

function renderCart() {
  const cartItems = getCart();
  cartList.replaceChildren();

  if (cartItems.length === 0) {
    cartList.append(createElement("p", "cart-empty", "Your cart is empty."));
    cartTotal.textContent = "₱ 0.00";
    return;
  }

  cartItems.forEach((item) => {
    const row = createElement("div", "cart-item");
    const imageContainer = createElement("div", "cart-image");

    if (item.image) {
      const image = document.createElement("img");
      image.src = getCartImageUrl(item.image);
      image.alt = "";
      imageContainer.append(image);
    }

    const productDetails = createElement("div", "cart-info");
    productDetails.append(
      createElement("p", "cart-name", item.name),
      createElement("p", "cart-price", `₱ ${item.price.toFixed(2)}`)
    );
    if (item.size) {
      productDetails.append(createElement("p", "cart-size", `Size: ${item.size}`));
    }

    const quantityControls = createElement("div", "cart-qty");
    const decreaseButton = createCartButton("−", item.id, -1);
    const increaseButton = createCartButton("+", item.id, 1);
    decreaseButton.setAttribute("aria-label", "Less");
    increaseButton.setAttribute("aria-label", "More");
    quantityControls.append(
      decreaseButton,
      createElement("span", "", item.qty),
      increaseButton
    );

    const removeButton = createCartButton("Remove", item.id);
    removeButton.className = "cart-remove";

    row.append(imageContainer, productDetails, quantityControls, removeButton);
    cartList.append(row);
  });

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
  cartTotal.textContent = `₱ ${totalPrice.toFixed(2)}`;
}

if (cartList) {
  renderCart();

  // Handle quantity changes and remove buttons from the same click listener.
  cartList.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const productId = Number(button.dataset.id);
    let cartItems = getCart();

    if (button.dataset.change) {
      const item = cartItems.find((cartItem) => cartItem.id === productId);
      item.qty += Number(button.dataset.change);
      cartItems = cartItems.filter((cartItem) => cartItem.qty > 0);
    } else {
      cartItems = cartItems.filter((item) => item.id !== productId);
    }

    cartMessage.textContent = "";
    saveCart(cartItems);
    renderCart();
  });

  // Finish checkout after requiring the visitor to log in.
  const checkoutButton = document.getElementById("checkout");
  checkoutButton.addEventListener("click", async () => {
    if (getCart().length === 0) {
      cartMessage.textContent = "Your cart is empty.";
      return;
    }

    if (!localStorage.getItem("currentUser")) {
      window.location.href = "account.html?next=cart.html";
      return;
    }
    const cartItems = getCart();
    const order = {
      id: Date.now(),
      email: localStorage.getItem("currentUser"),
      placedAt: new Date().toISOString(),
      items: cartItems.map((item) => ({ ...item })),
      total: cartItems.reduce((total, item) => total + item.price * item.qty, 0)
    };

    const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
    const customer = savedUsers.find((user) => user.email === order.email);
    const orderData = {
      order_number: order.id.toString(),
      customer_name: [customer?.firstName, customer?.lastName].filter(Boolean).join(" ") || "Customer",
      customer_email: order.email,
      customer_phone: customer?.phone || "",
      product_name: cartItems.map((item) => `${item.name} × ${item.qty}`).join(", "),
      quantity: cartItems.reduce((sum, item) => sum + item.qty, 0),
      total_price: order.total
    };

    checkoutButton.disabled = true;
    cartMessage.textContent = "Saving your order...";

    try {
      const response = await fetch("http://localhost:3000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Server returned ${response.status}`);
      }

      saveCart([]);
      renderCart();
      cartMessage.textContent = `Order #${order.id} placed! Thank you for shopping at URBN.`;
    } catch (error) {
      console.error("Failed to save order to the backend:", error);
      cartMessage.textContent =
        "We couldn't save your order. Please check that the backend and database are running, then try again. Your cart has not been cleared.";
    } finally {
      checkoutButton.disabled = false;
    }
  });
}