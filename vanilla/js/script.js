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
        }); // ← FECHA FOREACH AQUI!

        // ===== BOTÃO FAVORITAR (ÚNICO) =====
        let favBtn = document.createElement("button");
        favBtn.innerText = "❤️ Favoritar";
        favBtn.style.cssText = `
          display: block !important;
          margin: 25px auto 0;
          padding: 15px 35px;
          font-size: 18px;
          font-weight: bold;
          background: linear-gradient(45deg, #8cb479, #6aa360);
          color: white;
          border: none;
          border-radius: 30px;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(140,180,121,0.4);
          transition: all 0.3s;
        `;
        favBtn.onmouseover = () => {
          favBtn.style.transform = "scale(1.05)";
          favBtn.style.boxShadow = "0 8px 25px rgba(140,180,121,0.6)";
        };
        favBtn.onclick = async () => {
          favBtn.disabled = true;
          favBtn.innerText = "Salvando...";

          try {
            const res = await fetch("http://localhost:8000/favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                drink_id: myDrink.idDrink,
                name: myDrink.strDrink,
                thumb: myDrink.strDrinkThumb,
                instructions: myDrink.strInstructions,
              }),
            });

            let data;
            try {
              data = await res.json();
            } catch (jsonErr) {
              throw new Error(
                `Resposta inválida: ${res.status} ${res.statusText}`,
              );
            }

            if (!res.ok) {
              console.log("Erro PHP completo:", data); // ← VEJA AQUI!
              throw new Error(data.error || `Erro ${res.status}`);
            }

            favBtn.innerText = "⭐ Salvo! (ID: " + data.id + ")";
            favBtn.style.background = "#95bd88";
            alert(`✅ ${myDrink.strDrink} salvo! ID: ${data.id}`);
          } catch (err) {
            console.error("Erro detalhado:", err);
            favBtn.disabled = false;

            if (err.message.includes("já está nos favoritos")) {
              favBtn.innerText = "💚 Já é favorito!";
              favBtn.style.background = "#95bd88";
            } else {
              favBtn.innerText = "❤️ Tentar novamente";
              alert("❌ " + err.message);
            }
          }
        };

        result.appendChild(favBtn); 
      });
  }
};

window.addEventListener("load", getInfo);
searchBtn.addEventListener("click", getInfo);
