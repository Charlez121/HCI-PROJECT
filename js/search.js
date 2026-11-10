const searchForm = document.querySelector(".search");
const searchInput = document.querySelector(".search-input");
const suggestionList = document.querySelector(".suggestions");
const searchableProducts = document.querySelectorAll(".product");
const searchStatus = document.querySelector(".search-status");

if (searchForm && searchInput && suggestionList) {
  function filterProducts(text) {
    const search = text.trim().toLowerCase();
    const matchedProducts = [];

    searchableProducts.forEach((card) => {
      const productName = card.querySelector(".product-name");
      const productImage = card.querySelector(".product-image img");
      const info = [
        productName?.textContent || "",
        card.dataset.category || "",
        card.dataset.tags || "",
        productImage?.alt || ""
      ].join(" ").toLowerCase();

      const isMatch = !search || info.includes(search);
      card.hidden = !isMatch;
      if (isMatch) matchedProducts.push(card);
    });

    if (searchStatus) {
      searchStatus.hidden = !search;
      searchStatus.textContent = !search
        ? ""
        : matchedProducts.length
          ? `${matchedProducts.length} ${matchedProducts.length === 1 ? "product" : "products"} found for "${text.trim()}".`
          : `No products found for "${text.trim()}".`;
    }

    return matchedProducts;
  }

  function renderSearchSuggestions(products) {
    const suggestionItems = products.slice(0, 6).map((product) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      const image = product.querySelector(".product-image img");
      const name = product.querySelector(".product-name");
      const price = product.querySelector(".product-price");

      button.type = "button";
      button.className = "suggestion-item";
      button.dataset.productIndex = String(Array.prototype.indexOf.call(searchableProducts, product));

      if (image) {
        const thumbnail = image.cloneNode();
        thumbnail.alt = "";
        button.append(thumbnail);
      }

      const details = document.createElement("span");
      details.className = "suggestion-details";
      const productName = document.createElement("span");
      productName.className = "suggestion-name";
      productName.textContent = name?.textContent || "Product";
      details.append(productName);

      if (price) {
        const productPrice = document.createElement("span");
        productPrice.className = "suggestion-price";
        productPrice.textContent = price.textContent;
        details.append(productPrice);
      }

      button.append(details);
      item.append(button);
      return item;
    });

    suggestionList.replaceChildren(...suggestionItems);
    suggestionList.hidden = suggestionItems.length === 0;
  }

  searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.trim().toLowerCase();
    const matches = searchText ? filterProducts(searchText) : [];
    renderSearchSuggestions(matches);
    if (!searchText) filterProducts("");
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const matches = filterProducts(searchInput.value);
    renderSearchSuggestions(matches);

    if (matches.length === 1) {
      suggestionList.hidden = true;
      openProductModal(matches[0]);
    }
  });

  suggestionList.addEventListener("click", (event) => {
    const selectedButton = event.target instanceof Element
      ? event.target.closest(".suggestion-item")
      : null;
    if (!selectedButton) return;

    const selectedProduct = searchableProducts[Number(selectedButton.dataset.productIndex)];
    if (!selectedProduct) return;

    const productName = selectedProduct.querySelector(".product-name")?.textContent || "";
    searchInput.value = productName;
    filterProducts(productName);
    suggestionList.hidden = true;
    openProductModal(selectedProduct);
  });

  document.addEventListener("click", (event) => {
    if (!searchForm.contains(event.target)) {
      suggestionList.hidden = true;
    }
  });

  const initialSearch = new URLSearchParams(window.location.search).get("q") || "";
  searchInput.value = initialSearch;
  filterProducts(initialSearch);
}