// script.js - Comú per totes les fitxes

function generaExercici(frases) {
  const contenidor = document.getElementById('exercici');

  frases.forEach((f, i) => {
    const bloc = document.createElement('div');
    bloc.className = 'phrase-block';
    bloc.innerHTML = `
      <p>${i + 1}. ${f[0]}</p>
      <input type="text" data-index="${i}" data-state="unchecked" data-correct='${JSON.stringify(f[1]).replace(/"/g, '&quot;')}'>
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
    <button onclick="reiniciaAleatori()">🔁 Reinicia amb noves frases</button>
    <div id="resultat"></div>
  `;
}

function normalitza(text) {
  return text.trim().toLowerCase().replace(/[.,!?']/g, '');
}

function parla(text) {
  const synth = window.speechSynthesis;
  if (synth) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-GB';
    synth.speak(utter);
  }
}

function comprovaIndividual(button) {
  const bloc = button.closest('.phrase-block');
  const input = bloc.querySelector('input');
  const correctes = JSON.parse(input.dataset.correct);
  const resposta = normalitza(input.value);
  const previousState = input.dataset.state;
  const correccio = bloc.querySelector('.correction');

  const correctNormalized = correctes.map(c => normalitza(c));
  let isCorrect = correctNormalized.includes(resposta);

  if (isCorrect) {
    if (previousState === 'incorrect' || previousState === 'corrected') {
      input.classList.remove('incorrect', 'correct');
      input.classList.add('corrected');
      correccio.innerHTML = '<span style="color:orange;">✓ Ara ja és correcte</span>';
      input.dataset.state = 'corrected';
    } else {
      input.classList.remove('incorrect', 'corrected');
      input.classList.add('correct');
      correccio.innerHTML = '<span style="color:green;">✓ Correcte!</span>';
      input.dataset.state = 'correct';
    }
    parla(correctes[0]);
  } else {
    input.classList.remove('correct', 'corrected');
    input.classList.add('incorrect');
    correccio.innerHTML = `<span style="color:red;">&#x274C; Resposta correcta: ${correctes[0]}</span>`;
    input.dataset.state = 'incorrect';
    parla(correctes[0]);
  }
}

function comprovaTotes() {
  let encerts = 0;
  document.querySelectorAll('.phrase-block').forEach(bloc => {
    const input = bloc.querySelector('input');
    const button = bloc.querySelector('button');
    comprovaIndividual(button);
    if (input.classList.contains('correct')) {
      encerts++;
    }
  });
  document.getElementById('resultat').textContent = `Has encertat ${encerts} de 10.`;
}

function reinicia() {
  document.querySelectorAll('.phrase-block').forEach(bloc => {
    const input = bloc.querySelector('input');
    input.value = '';
    input.classList.remove('correct', 'incorrect', 'corrected');
    input.dataset.state = 'unchecked';
    bloc.querySelector('.correction').textContent = '';
  });
  document.getElementById('resultat').textContent = '';
}

// Executa només si la variable frases existeix
document.addEventListener('DOMContentLoaded', () => {
  if (typeof frases !== 'undefined') {
    generaExercici(frases);
  }
});
