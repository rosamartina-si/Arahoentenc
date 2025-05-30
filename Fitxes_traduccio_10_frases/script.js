// script.js - Comú per totes les fitxes

/**
 * Barreja un array amb l’algorisme Fisher–Yates
 */
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Genera l’exercici a partir de l’array de frases
 */
function generaExercici(frases) {
  const contenidor = document.getElementById('exercici');
  contenidor.innerHTML = '';  // Neteja contingut anterior

  frases.forEach((f, i) => {
    const bloc = document.createElement('div');
    bloc.className = 'phrase-block';
    bloc.innerHTML = `
      <p>${i + 1}. ${f[0]}</p>
      <input type="text"
             data-index="${i}"
             data-state="unchecked"
             data-correct="${JSON.stringify(f[1])
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#39;')}"
      >
      <button>Comprova</button>
      <div class="correction"></div>
    `;
    contenidor.appendChild(bloc);

    const btn = bloc.querySelector('button');
    btn.addEventListener('click', () => comprovaIndividual(btn));

    const input = bloc.querySelector('input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        comprovaIndividual(btn);
      }
    });
  });

  // Controls generals
  const controls = document.getElementById('controls');
  controls.innerHTML = `
    <button onclick="comprovaTotes()">Comprova-ho tot</button>
    <button onclick="reinicia()">Esborra-ho tot</button>
    <button onclick="reiniciaAleatori()">🔁 Frases noves</button>
    <div id="resultat"></div>
  `;
}

/**
 * Normalitza un text per comparar
 */
function normalitza(text) {
  return text.trim().toLowerCase().replace(/[.,!?']/g, '');
}

/**
 * Text-to-speech
 */
function parla(text) {
  const synth = window.speechSynthesis;
  if (synth) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-GB';
    synth.speak(utter);
  }
}

/**
 * Comprova una frase individual
 */
function comprovaIndividual(button) {
  const bloc      = button.closest('.phrase-block');
  const input     = bloc.querySelector('input');
  const correctes = JSON.parse(input.dataset.correct);
  const resposta  = normalitza(input.value);
  const prevState = input.dataset.state;
  const correccio = bloc.querySelector('.correction');

  const correctNormalized = correctes.map(c => normalitza(c));
  const isCorrect = correctNormalized.includes(resposta);

  if (isCorrect) {
    if (prevState === 'incorrect' || prevState === 'corrected') {
      input.classList.remove('incorrect','correct');
      input.classList.add('corrected');
      correccio.innerHTML = '<span style="color:orange;">✓ Ara ja és correcte</span>';
      input.dataset.state = 'corrected';
    } else {
      input.classList.remove('incorrect','corrected');
      input.classList.add('correct');
      correccio.innerHTML = '<span style="color:green;">✓ Correcte!</span>';
      input.dataset.state = 'correct';
    }
    parla(correctes[0]);
  } else {
    input.classList.remove('correct','corrected');
    input.classList.add('incorrect');
    correccio.innerHTML = `<span style="color:red;">❌ Resposta correcta: ${correctes[0]}</span>`;
    input.dataset.state = 'incorrect';
    parla(correctes[0]);
  }
}

/**
 * Comprova totes les frases i mostra el total d’encerts
 */
function comprovaTotes() {
  let encerts = 0;
  document.querySelectorAll('.phrase-block').forEach(bloc => {
    const inp    = bloc.querySelector('input');
    const btn    = bloc.querySelector('button');
    comprovaIndividual(btn);
    if (inp.classList.contains('correct')) encerts++;
  });
  document.getElementById('resultat').textContent = `Has encertat ${encerts} de 10.`;
}

/**
 * Neteja tots els camps i missatges
 */
function reinicia() {
  document.querySelectorAll('.phrase-block').forEach(bloc => {
    const inp = bloc.querySelector('input');
    inp.value = '';
    inp.classList.remove('correct','incorrect','corrected');
    inp.dataset.state = 'unchecked';
    bloc.querySelector('.correction').textContent = '';
  });
  document.getElementById('resultat').textContent = '';
}

/**
 * Reinicia l’exercici amb 10 frases noves aleatòriament
 */
function reiniciaAleatori() {
  reinicia();
  const noves = shuffle(frases).slice(0, 10);
  generaExercici(noves);
}

// Al carregar la pàgina, barregem i mostrem 10 frases
document.addEventListener('DOMContentLoaded', () => {
  if (typeof frases !== 'undefined') {
    const inicial = shuffle(frases).slice(0, 10);
    generaExercici(inicial);
  }
});
