/**
 * Barreja un array amb l'algorisme Fisher–Yates
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
 * Genera l'exercici a partir de l'array de frases
 */
function generaExercici(frases) {
  const contenidor = document.getElementById('exercici');
  contenidor.innerHTML = '';

  frases.forEach((f, i) => {
    const bloc = document.createElement('div');
    bloc.className = 'phrase-block';
    bloc.innerHTML = `
      <p>${i + 1}. ${f[0]}</p>
      <input type="text"
             data-index="${i}"
             data-state="unchecked"
             data-correct="${JSON.stringify(f[1]).replace(/"/g, '&quot;').replace(/'/g, '&#39;')}">
      <button>Comprova</button>
      <div class="correction"></div>
    `;
    contenidor.appendChild(bloc);

    const btn = bloc.querySelector('button');
    btn.addEventListener('click', () => comprovaIndividual(bloc));

    const input = bloc.querySelector('input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        comprovaIndividual(bloc);
      }
    });
  });

  document.getElementById('controls').innerHTML = `
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
 * Pronunciar text en l'idioma especificat
 */
function pronunciarText(text, lang) {
  if (!window.habilitaAudio || !window.speechSynthesis) return;
  
  // Aturar pronunciacions previess
  window.speechSynthesis.cancel();
  
  // Esperar un moment per evitar solapaments
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Verificar que l'idioma estigui disponible
    const veus = window.speechSynthesis.getVoices();
    const veuDisponible = veus.some(veu => veu.lang === lang);
    
    if (veuDisponible) {
      utterance.voice = veus.find(veu => veu.lang === lang);
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn(`No s'ha trobat una veu per l'idioma ${lang}`);
      // Intentar-ho igualment
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  }, 100);
}

/**
 * Comprova una frase individual
 */
function comprovaIndividual(bloc) {
  const input = bloc.querySelector('input');
  const correctes = JSON.parse(input.dataset.correct);
  const resposta = normalitza(input.value);
  const prevState = input.dataset.state;
  const correccio = bloc.querySelector('.correction');

  const correctNormalized = correctes.map(c => normalitza(c));
  const isCorrect = correctNormalized.includes(resposta);

  // Actualitzar estat visual
  if (isCorrect) {
    if (prevState === 'incorrect' || prevState === 'corrected') {
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
  } else {
    input.classList.remove('correct', 'corrected');
    input.classList.add('incorrect');
    correccio.innerHTML = `<span style="color:red;">❌ Resposta correcta: ${correctes[0]}</span>`;
    input.dataset.state = 'incorrect';
  }

  // Pronunciar el text segons configuració
  const target = window.textToSpeechTarget || 'resposta';
  let textParlat, lang;

  if (target === 'entrada') {
    textParlat = bloc.querySelector('p').textContent.replace(/^\d+\.\s*/, '');
    lang = window.textToSpeechLangs?.entrada || 'pl-PL';
  } else {
    textParlat = correctes[0];
    lang = window.textToSpeechLangs?.resposta || 'ca-ES';
  }

  // Esperar a que estigui disponible l'API de veu
  if (!window.speechSynthesis) {
    console.warn("L'API de síntesi de veu no està disponible");
    return;
  }

  // Esperar a que es carreguin les veus si cal
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      pronunciarText(textParlat, lang);
    };
  } else {
    pronunciarText(textParlat, lang);
  }
}

/**
 * Comprova totes les frases
 */
function comprovaTotes() {
  let encerts = 0;
  const blocs = document.querySelectorAll('.phrase-block');
  
  blocs.forEach(bloc => {
    const input = bloc.querySelector('input');
    comprovaIndividual(bloc);
    if (input.classList.contains('correct')) encerts++;
  });
  
  document.getElementById('resultat').textContent = `Has encertat ${encerts} de ${blocs.length}.`;
}

/**
 * Reinicia l'exercici
 */
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

/**
 * Genera un nou exercici aleatori
 */
function reiniciaAleatori() {
  reinicia();
  const novesFrases = shuffle(frases).slice(0, 10);
  generaExercici(novesFrases);
}

// Inicialització
document.addEventListener('DOMContentLoaded', () => {
  // Esperar a que estigui disponible l'API de veu
  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.onvoiceschanged = () => {
      console.log("Veus disponibles:", speechSynthesis.getVoices());
    };
  }

  // Generar l'exercici inicial
  if (typeof frases !== 'undefined') {
    const frasesInicials = shuffle(frases).slice(0, 10);
    generaExercici(frasesInicials);
  }
});
