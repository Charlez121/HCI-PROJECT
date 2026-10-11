let availKeywords =

    //Tops
["T-shirt", "Shirt", "Polo", "Tank top", "Crop top", "Long sleeves",
    "Hoodie", "Sweatshirt", "Sweater", "Jacket", "Bomber jacket",
  "Denim jacket", "Windbreaker", "Vest", "Cardigan",

    //bottoms
   "Pants", "Jeans", "Cargo pants", "Joggers", "Sweatpants",
  "Shorts", "Cargo shorts", "Skirt", "Leggings",];

const searchForm  = document.querySelector(".search");        // the <form>
const searchInput = document.querySelector(".search-input");  // the <input>
const suggestionBox = document.querySelector(".suggestions");

suggestionBox.style.display = "none";

document.addEventListener("click", function(event){
    if(!searchForm.contains(event.target)){
        suggestionBox.style.display = "none";
    }
});

searchInput.onkeyup = function(){
    let result =[];
    let input = searchInput.value;
    if(input.length){
     result = availKeywords.filter((keyword) => {
      return keyword.toLocaleLowerCase().includes(input.toLocaleLowerCase());
      });
      console.log(result);
    }
    display(result);
}

function display(result){
    const content = result.map((list) => {
        return "<li onclick=selecInput(this)>" + list + "</li>";
    });
    suggestionBox.innerHTML = "<ul>" + content.join("") + "</ul>";
    suggestionBox.style.display = result.length ? "block" : "none";
}

function selecInput(list){
    searchInput.value = list.innerHTML;
    suggestionBox.innerHTML = '';
}
