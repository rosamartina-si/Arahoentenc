// script.js modularitzat amb suport per fitxes i modal

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const scoreDisplay = document.getElementById('scoreDisplay');
const restartButton = document.getElementById('restartButton');
const feedback = document.getElementById('feedback');
const buttonContainer = document.getElementById('buttonContainer');
const modalOverlay = document.getElementById('modalOverlay');
const startButton = document.getElementById('startButton');

let config = null;
let currentLang = 'en';   // 'en' per defecte
let useAudio    = true;   // true per defecte
let sentences = [], current = null;
let y = 0, speed = 0.4, active = false, paused = false, canAdvance = true;
let score = 0, total = 0, incorrectSentences = [];
let animationFrameId;

function getParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    tipus: urlParams.get('tipus') || 'fitxes_pluja_botons',
    fitxa: urlParams.get('fitxa') || 'anywhere-nowhere-everywhere'
  };
}

async function loadConfig() {
  const { tipus, fitxa } = getParams();
  try {
    const response = await fetch(`${tipus}/${fitxa}.json`);
    if (!response.ok) throw new Error("❌ No s'ha pogut carregar el fitxer JSON.");

    config = await response.json();

    // Validació bàsica del contingut del JSON
    if (!config.questions || !Array.isArray(config.questions)) {
      throw new Error("⚠️ El fitxer JSON no conté cap llista vàlida de preguntes.");
    }

    currentLang = config.lang  || 'en';
    useAudio    = config.audio !== false;

    renderModal();

  } catch (err) {
    modalOverlay.innerHTML = `
      <h2 style="color: red;">⚠️ Error carregant la fitxa</h2>
      <p>${err.message}</p>
      <p>Comprova que la URL sigui correcta i que el fitxer JSON existeixi i tingui el format adequat.</p>
    `;
    modalOverlay.style.display = 'flex';
  }
}


function renderModal() {
  const { title, objective, explanation } = config;
  modalOverlay.innerHTML = `
    <h2>🎯 ${title}</h2>
    <p>${objective}</p>
    <hr style="margin: 20px 0; width: 80%;" />
    <h3>📘 Explicació gramatical</h3>
    ${explanation.map(p => `<p>${p}</p>`).join('')}
    <hr style="margin: 20px 0; width: 80%;" />
    <p>🔄 Cada vegada l’exercici és diferent.</p>
    <button id="startButton">Entesos! Comencem</button>
  `;
  document.getElementById('startButton').addEventListener('click', () => {
    modalOverlay.style.display = 'none';
    createButtons();
    initGame();
  });
}

function createButtons() {
  buttonContainer.innerHTML = '';
  config.buttons.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.onclick = () => handleClick(option, btn);
    buttonContainer.appendChild(btn);
  });
}

function initGame() {
  cancelAnimationFrame(animationFrameId);
  sentences = config.questions.sort(() => 0.5 - Math.random()).slice(0, 10);
  current = null;
  y = 0;
  active = true;
  paused = false;
  canAdvance = true;
  score = 0;
  total = 0;
  incorrectSentences = [];
  restartButton.style.display = 'none';
  updateScore();
  nextSentence();
  draw();
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score} / 10`;
}

function showFeedback(message, className) {
  feedback.textContent = message;
  feedback.className = className;
  feedback.style.display = 'block';
  setTimeout(() => {
    feedback.style.display = 'none';
  }, 2000);
}

function speak(text, callback) {
  if (!useAudio) {          // veu desactivada per a aquesta fitxa
     if (callback) callback();
     return;
   }
   const utterance = new SpeechSynthesisUtterance(text);
   utterance.lang  = currentLang === 'ca' ? 'ca-ES' : 'en-US';
   utterance.onend = () => callback && callback();
   speechSynthesis.speak(utterance);
}

function nextSentence() {
  if (sentences.length === 0) {
    showFeedback(`Puntuació final: ${score} / 10`, 'correct');
    active = false;
    restartButton.style.display = 'block';
    restartButton.onclick = () => initGame();
    return;
  }
  current = sentences.shift();
  y = 0;
  canAdvance = true;
  setAnswerButtonsEnabled(true);
}

function draw() {
  if (!active || paused) {
    animationFrameId = requestAnimationFrame(draw);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (current) {
    if (canAdvance) y += speed;
    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    wrapText(ctx, current.sentence, y, canvas.width * 0.8, 30);

    if (y > canvas.height && canAdvance) {
      canAdvance = false;
      showFeedback(`Resposta: ${current.answer}`, 'incorrect');
      const fullSentence = current.sentence.replace("___", current.answer);
      speak("The correct answer is " + current.answer + ".", () => {
        speak(fullSentence, () => {
          total++;
          updateScore();
          nextSentence();
        });
      });
    }
  }

  animationFrameId = requestAnimationFrame(draw);
}

function handleClick(userAnswer, button) {
  setAnswerButtonsEnabled(false);
  animateButtonClick(button);
  checkAnswer(userAnswer);
}

function checkAnswer(userAnswer) {
  // Llegeix la paraula triada (si l’àudio està activat)
  speak(userAnswer);

  const fullSentenceOk = current.sentence.replace('___', userAnswer);
  const fullSentenceKo = current.sentence.replace('___', current.answer);

  if (current && userAnswer === current.answer) {
    /* ✓ Correcte */
    showFeedback(
      currentLang === 'ca' ? '✓ Correcte!' : '✓ Correct!',
      'correct'
    );
    canAdvance = false;

    const afterSpeak = () => {
      score++;
      total++;
      updateScore();
      nextSentence();
    };

    // Llegeix la frase completa si useAudio = true
    speak(fullSentenceOk, afterSpeak);

  } else {
    /* ✗ Incorrecte */
    const wrongTxt = currentLang === 'ca'
        ? `✗ Incorrecte. Resposta: ${current.answer}`
        : `✗ Incorrect. Answer: ${current.answer}`;
    showFeedback(wrongTxt, 'incorrect');
    canAdvance = false;
    incorrectSentences.push({ ...current, userAnswer });

    const afterSpeak = () => {
      total++;
      updateScore();
      nextSentence();
    };

    const intro = currentLang === 'ca'
        ? 'La resposta correcta és'
        : 'The correct answer is';

    speak(`${intro} ${current.answer}. ${fullSentenceKo}`, afterSpeak);
  }
}



function animateButtonClick(button) {
  button.style.transition = 'transform 0.1s, background-color 0.3s';
  button.style.transform = 'scale(0.95)';
  button.style.backgroundColor = '#ffc107';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
    button.style.backgroundColor = '';
  }, 150);
}

function setAnswerButtonsEnabled(enabled) {
  const buttons = buttonContainer.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = !enabled);
}

function wrapText(context, text, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const testWidth = context.measureText(testLine).width;
    if (testWidth > maxWidth && n > 0) {
      const lineX = (canvas.width - context.measureText(line).width) / 2;
      context.fillText(line, lineX, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  const lineX = (canvas.width - context.measureText(line).width) / 2;
  context.fillText(line, lineX, y);
}

loadConfig();
