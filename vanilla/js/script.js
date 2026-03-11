let result = document.getElementById("result");
let searchBtn = document.getElementById("search-btn");
let url = "https://thecocktaildb.com/api/json/v1/1/search.php?s=";

// Função de tradução simples
const traduzirInglesParaPortugues = (termoEmIngles) => {
  // Adicione mais traduções conforme necessário
  const traducoes = {
    strDrink: "Nome da Bebida",
    strDrinkThumb: "Imagem da Bebida",
    strInstructions: "Instruções",
    strIngredient: "Ingrediente",
    strMeasure: "Medida",
    // Adicione mais termos conforme necessário
  };

  return traducoes[termoEmIngles] || termoEmIngles;
};

let getInfo = () => {
  let userInp = document.getElementById("user-inp").value;
  if (userInp.length == 0) {
    result.innerHTML = `<h3 class="msg">campo de entrada vazio</h3>`;
  } else {
    fetch(url + userInp)
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("user-inp").value = "";
        console.log(data);
        console.log(data.drinks[0]);
        let myDrink = data.drinks[0];
        console.log(myDrink.strDrink);
        console.log(myDrink.strDrinkThumb);
        console.log(myDrink.strInstructions);
        let count = 1;
        let ingredients = [];
        for (let i in myDrink) {
          let ingredient = "";
          let measure = "";
          if (i.startsWith("strIngredient") && myDrink[i]) {
            ingredient = myDrink[i];
            if (myDrink[`strMeasure` + count]) {
              measure = myDrink[`strMeasure` + count];
            } else {
              measure = "";
            }
            count += 1;
            ingredients.push(`${measure} ${ingredient}`);
          }
        }
        console.log(ingredients);
        result.innerHTML = `
      <img src=${myDrink.strDrinkThumb}>
      <h2>${traduzirInglesParaPortugues(myDrink.strDrink)}</h2>
      <h3>${traduzirInglesParaPortugues("Ingredientes")}:</h3>
      <ul class="ingredients"></ul>
      <h3>${traduzirInglesParaPortugues("Instruções")}:</h3>
      <p>${myDrink.strInstructions}</p>
      `;
        let ingredientsCon = document.querySelector(".ingredients");
        ingredients.forEach((item) => {
          let listItem = document.createElement("li");
          listItem.innerText = traduzirInglesParaPortugues(item);
          ingredientsCon.appendChild(listItem);
        });
      })
      .catch(() => {
        result.innerHTML = `<h3 class="msg">Por favor, insira uma entrada válida</h3>`;
      });
  }
};

window.addEventListener("load", getInfo);
searchBtn.addEventListener("click", getInfo);
