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

// 🗣️ Traduccions
const translations = {
  ca: {
    startButton: "Entesos! Comencem",
    explanationTitle: "📘 Explicació gramatical",
    introMessage: "🔄 Cada vegada l'exercici és diferent.",
    finalScore: "Puntuació final",
    correct: "✓ Correcte!",
    incorrect: "✗ Incorrecte. Resposta:",
    score: "Puntuació",
    restart: "🔁 Reinicia"
  },
  en: {
    startButton: "Got it! Let's start",
    explanationTitle: "📘 Explanation",
    introMessage: "🔄 Each time the exercise is different.",
    finalScore: "Final score",
    correct: "✓ Correct!",
    incorrect: "✗ Incorrect. Answer:",
    score: "Score",
    restart: "🔁 Restart"
  }
};

let sentences = [], current = null;
let y = 0, speed = 0.4, active = false, paused = false, canAdvance = true;
let score = 0, total = 0, incorrectSentences = [];
let animationFrameId;

function renderModal() {
  const t = translations[config.lang];
  modalOverlay.innerHTML = `
    <h2>🎯 ${config.title}</h2>
    <p>${config.objective}</p>
    <hr style="margin: 20px 0; width: 80%;" />
    <h3>${t.explanationTitle}</h3>
    ${config.explanation.map(p => `<p>${p}</p>`).join('')}
    <hr style="margin: 20px 0; width: 80%;" />
    <p>${t.introMessage}</p>
    <button id="startButton">${t.startButton}</button>
  `;
  document.getElementById('startButton').addEventListener('click', () => {
    modalOverlay.style.display = 'none';
    createInputUI();
    initGame();
  });
}

function createInputUI() {
  buttonContainer.innerHTML = '';

  if (config.mode === 'botons') {
    config.buttons.forEach(option => {
      const btn = document.createElement('button');
      btn.textContent = option;
      btn.onclick = () => handleClick(option, btn);
      buttonContainer.appendChild(btn);
    });
  } else if (config.mode === 'text') {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Escriu la resposta...';
    input.style.fontSize = '18px';
    input.style.padding = '10px';
    input.style.borderRadius = '8px';
    input.style.border = '1px solid #ccc';
    input.style.minWidth = '200px';

    const submitBtn = document.createElement('button');
    submitBtn.textContent = '✅ Envia';
    submitBtn.onclick = () => handleClick(input.value.trim(), submitBtn);

    buttonContainer.appendChild(input);
    buttonContainer.appendChild(submitBtn);
  }
}


function initGame() {
  cancelAnimationFrame(animationFrameId);
  sentences = [...config.questions].sort(() => 0.5 - Math.random()).slice(0, 10);
  current = null;
  y = 0;
  active = true;
  paused = false;
  canAdvance = true;
  score = 0;
  total = 0;
  incorrectSentences = [];
  restartButton.style.display = 'none';
  restartButton.textContent = translations[config.lang].restart;
  updateScore();
  nextSentence();
  draw();
}

function updateScore() {
  scoreDisplay.textContent = `${translations[config.lang].score}: ${score} / 10`;
}

function showFeedback(message, className) {
  feedback.textContent = message;
  feedback.className = className;
  feedback.style.display = 'block';
  setTimeout(() => {
    feedback.style.display = 'none';
  }, 2000);
}

function nextSentence() {
  if (sentences.length === 0) {
    showFeedback(`${translations[config.lang].finalScore}: ${score} / 10`, 'correct');
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
      showFeedback(`${translations[config.lang].incorrect} ${current.answer}`, 'incorrect');
      total++;
      updateScore();
      speakSentence(current.sentence.replace('___', current.answer));
      setTimeout(nextSentence, 1500);
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
  const t = translations[config.lang];
  const fullSentence = current.sentence.replace('___', userAnswer);

  if (current && userAnswer === current.answer) {
    showFeedback(t.correct, 'correct');
    canAdvance = false;
    score++;
    total++;
    updateScore();
    speakSentence(fullSentence);
    setTimeout(nextSentence, 1500);
  } else {
    showFeedback(`${t.incorrect} ${current.answer}`, 'incorrect');
    canAdvance = false;
    incorrectSentences.push({ ...current, userAnswer });
    total++;
    updateScore();
    speakSentence(current.sentence.replace('___', current.answer));
    setTimeout(nextSentence, 1500);
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
  
  const input = buttonContainer.querySelector('input');
  if (input) input.disabled = !enabled;
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

// 🔊 Lectura en veu alta
function speakSentence(sentence) {
  if (!config.audio || typeof speechSynthesis === 'undefined') return;

  const utterance = new SpeechSynthesisUtterance(sentence);
  utterance.lang = config.lang === "ca" ? "ca-ES" : "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1;

  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.startsWith(config.lang)) || null;
  if (voice) utterance.voice = voice;

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

renderModal();
