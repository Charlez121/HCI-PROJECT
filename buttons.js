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

searchInput.onkeyup = function(){
    let result =[];
    let input = searchInput.value;
    if(input.length){
     result = availKeywords.filter((keyword) => {
      return keyword.toLocaleLowerCase().includes(input.toLocaleLowerCase());
      });
      console.log(result);
    }
}    