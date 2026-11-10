// Sort and filter the category cards while keeping their existing event handlers.
const productList = document.getElementById("category-products");
const sortSelect = document.getElementById("sort-select");
const priceSelect = document.getElementById("price-select");
const inStockOnly = document.getElementById("in-stock-only");
const resetButton = document.getElementById("reset-filters");
const filterMessage = document.getElementById("filter-message");
const allCards = Array.from(productList.querySelectorAll(".product"));

function priceOf(card) {
  return Number(card.querySelector(".product-price").textContent.replace(/[^0-9.]/g, ""));
}

function nameOf(card) {
  return card.querySelector(".product-name").textContent;
}

function stockOf(card) {
  const product = getProducts().find((saved) => saved.id === Number(card.dataset.productId));
  return product ? product.stock : Infinity;
}

function matchesPrice(price) {
  const range = priceSelect.value;
  if (range === "under-1000") return price < 1000;
  if (range === "1000-1499") return price >= 1000 && price < 1500;
  if (range === "1500-up") return price >= 1500;
  return true;
}

function applySortAndFilter() {
  const sortedCards = allCards.slice();
  if (sortSelect.value === "price-low") sortedCards.sort((left, right) => priceOf(left) - priceOf(right));
  if (sortSelect.value === "price-high") sortedCards.sort((left, right) => priceOf(right) - priceOf(left));
  if (sortSelect.value === "name") sortedCards.sort((left, right) => nameOf(left).localeCompare(nameOf(right)));

  sortedCards.forEach((card) => productList.append(card));

  let shownCount = 0;
  sortedCards.forEach((card) => {
    const isShown = matchesPrice(priceOf(card)) && (!inStockOnly.checked || stockOf(card) > 0);
    card.hidden = !isShown;
    if (isShown) shownCount++;
  });

  filterMessage.hidden = shownCount > 0 || allCards.length === 0;
}

sortSelect.addEventListener("change", applySortAndFilter);
priceSelect.addEventListener("change", applySortAndFilter);
inStockOnly.addEventListener("change", applySortAndFilter);

resetButton.addEventListener("click", () => {
  sortSelect.value = "featured";
  priceSelect.value = "all";
  inStockOnly.checked = false;
  applySortAndFilter();
});
