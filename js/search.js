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

if (searchForm && searchInput && suggestionList) {
  function renderSearchSuggestions(matches) {
    const suggestionItems = matches.map((keyword) => {
      const item = document.createElement("li");
      item.textContent = keyword;
      return item;
    });

    suggestionList.replaceChildren(...suggestionItems);
    suggestionList.hidden = matches.length === 0;
  }

  searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.trim().toLowerCase();
    const matches = searchText
      ? searchKeywords.filter((keyword) => keyword.toLowerCase().includes(searchText))
      : [];

    renderSearchSuggestions(matches);
  });

  suggestionList.addEventListener("click", (event) => {
    const selectedItem = event.target.closest("li");
    if (!selectedItem) return;

    searchInput.value = selectedItem.textContent;
    suggestionList.hidden = true;
    searchInput.focus();
  });

  document.addEventListener("click", (event) => {
    if (!searchForm.contains(event.target)) {
      suggestionList.hidden = true;
    }
  });
}
