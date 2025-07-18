// Llegim les dades des del DOM
const frasesData = document.getElementById('frases-data');
const totesLesFrases = JSON.parse(frasesData.textContent);

let encerts = 0;
let total = 10;
let selectedPol = null;
let frasesUsades = [];
let incorrectPairs = {};

function barreja(array) {
  return array.slice().sort(() => Math.random() - 0.5);
}

function speakPolish(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pl-PL";
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function actualitzaPuntuacio() {
  document.getElementById("score").textContent = `Encerts: ${encerts} / ${total}`;
  if (encerts === total) {
    setTimeout(() => alert("🎉 Has completat totes les parelles!"), 100);
  }
}

function novaRonda() {
  const restants = totesLesFrases.filter(f => !frasesUsades.includes(f.id));
  let ronda = restants.length >= total ? barreja(restants).slice(0, total) : barreja(totesLesFrases).slice(0, total);
  frasesUsades.push(...ronda.map(f => f.id));
  incorrectPairs = {};
  generaExercici(ronda);
}

function generaExercici(frases) {
  const polContainer = document.getElementById("polones");
  const catContainer = document.getElementById("catala");
  polContainer.innerHTML = "";
  catContainer.innerHTML = "";
  encerts = 0;
  selectedPol = null;
  actualitzaPuntuacio();

  const polFrases = barreja(frases);
  const catFrases = barreja(frases);

  polFrases.forEach(f => {
    const div = document.createElement("div");
    div.className = "item";
    div.dataset.id = f.id;
    div.textContent = f.pol;
    div.addEventListener("click", () => {
      if (div.classList.contains("matched") || div.classList.contains("fixed-pol")) return;
      document.querySelectorAll("#polones .item").forEach(el => el.classList.remove("selected"));
      div.classList.add("selected");
      selectedPol = div;
      speakPolish(f.pol);
    });
    polContainer.appendChild(div);
  });

  catFrases.forEach(f => {
    const div = document.createElement("div");
    div.className = "item";
    div.dataset.id = f.id;
    div.textContent = f.cat;
    div.addEventListener("click", () => {
      if (!selectedPol) return;

      // 🧽 Elimina reset-cat per fer-la reutilitzable
      div.classList.remove("reset-cat");

      const polId = selectedPol.dataset.id;
      const catId = div.dataset.id;

      if (polId === catId) {
        if (selectedPol.classList.contains("incorrect-pol")) {
          // CORRECCIÓ
          selectedPol.classList.remove("incorrect-pol");
          selectedPol.classList.add("fixed-pol");

          if (incorrectPairs[polId]) {
            const prevIncorrectCat = document.querySelector(`#catala .item[data-id="${incorrectPairs[polId]}"]`);
            if (prevIncorrectCat) {
              prevIncorrectCat.classList.remove("incorrect-cat");
              prevIncorrectCat.classList.add("reset-cat");
            }
          }

          div.classList.remove("incorrect-cat");
          div.classList.add("fixed-cat");

        } else if (!div.classList.contains("fixed-cat")) {
          selectedPol.classList.add("matched");
          div.classList.add("matched");
          encerts++;
          actualitzaPuntuacio();
        }
      } else {
        selectedPol.classList.add("incorrect-pol");
        div.classList.add("incorrect-cat");
        incorrectPairs[polId] = catId;
      }

      selectedPol.classList.remove("selected");
      selectedPol = null;
    });
    catContainer.appendChild(div);
  });
}

window.onload = novaRonda;
