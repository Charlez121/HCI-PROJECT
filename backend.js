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
