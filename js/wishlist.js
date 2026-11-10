// The Wishlist page. Load it after store.js and cart.js.
const wishlistList = document.getElementById("wishlist-items");

function renderWishlist() {
  const items = getWishlist();
  wishlistList.replaceChildren();

  if (items.length === 0) {
    wishlistList.append(
      createElement("p", "cart-empty", "Your wishlist is empty. Tap the heart on a product to save it here.")
    );
    return;
  }

  items.forEach((item) => {
    const row = createElement("div", "cart-item");
    const imageContainer = createElement("div", "cart-image");
    if (item.image) {
      const image = document.createElement("img");
      image.src = getCartImageUrl(item.image);
      image.alt = "";
      imageContainer.append(image);
    }

    const details = createElement("div", "cart-info");
    details.append(
      createElement("p", "cart-name", item.name),
      createElement("p", "cart-price", `₱ ${item.price.toFixed(2)}`)
    );

    const addButton = createElement("button", "cart-remove", "Add to cart");
    addButton.addEventListener("click", () => addWishlistItemToCart(item));
    const removeButton = createElement("button", "cart-remove", "Remove");
    removeButton.addEventListener("click", () => removeFromWishlist(item.id));

    row.append(imageContainer, details, addButton, removeButton);
    wishlistList.append(row);
  });
}

function addWishlistItemToCart(item) {
  const cartItems = getCart();
  const product = getProducts().find((saved) => saved.id === item.id);
  const alreadyInCart = cartItems
    .filter((cartItem) => cartItem.id === item.id)
    .reduce((total, cartItem) => total + cartItem.qty, 0);

  if (product && alreadyInCart + 1 > product.stock) {
    showToast(product.stock === 0 ? "Sorry, this item is sold out" : `Only ${product.stock} left`);
    return;
  }

  const existingItem = cartItems.find(
    (cartItem) => cartItem.id === item.id && (cartItem.size || "") === ""
  );
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cartItems.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: "",
      qty: 1
    });
  }

  saveCart(cartItems);
  showToast("Added to cart");
}

function removeFromWishlist(productId) {
  saveWishlist(getWishlist().filter((item) => item.id !== productId));
  renderWishlist();
}

renderWishlist();
