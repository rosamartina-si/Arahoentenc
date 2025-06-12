// codi.js - Lògica general del joc

// Elements del DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const restartButton = document.getElementById('restartButton');
const feedback = document.getElementById('feedback');
const buttonContainer = document.getElementById('buttonContainer');
const modalOverlay = document.getElementById('modalOverlay');

// Variables del joc
let currentLang, useAudio;
let sentences = [], current = null;
let y = 0, speed = 0.4, active = false, paused = false, canAdvance = true;
let score = 0, total = 0, incorrectSentences = [];
let animationFrameId;

// Funció per renderitzar el modal inicial
function renderModal(config) {
  const { title, objective, explanation } = config;
  modalOverlay.innerHTML = `
    <h2>🎯 ${title}</h2>
    <p>${objective}</p>
    <hr style="margin: 20px 0; width: 80%;" />
    <h3>📘 Explicació gramatical</h3>
    ${explanation.map(p => `<p>${p}</p>`).join('')}
    <hr style="margin: 20px 0; width: 80%;" />
    <p>🔄 Cada vegada l'exercici és diferent.</p>
    <button id="startButton">Entesos! Comencem</button>
  `;
  document.getElementById('startButton').addEventListener('click', () => {
    modalOverlay.style.display = 'none';
    initGame(config);
  });
}

// Funció per crear els botons d'opció
function createButtons(buttons) {
  buttonContainer.innerHTML = '';
  buttons.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.onclick = () => handleClick(option, btn);
    buttonContainer.appendChild(btn);
  });
}

// Funció per actualitzar la puntuació
function updateScore() {
  scoreDisplay.textContent = `Puntuació: ${score} / 10`;
}

// Funció per mostrar feedback
function showFeedback(message, className) {
  feedback.textContent = message;
  feedback.className = className;
  feedback.style.display = 'block';
  setTimeout(() => {
    feedback.style.display = 'none';
  }, 2000);
}

// Funció per passar a la següent frase
function nextSentence() {
  if (sentences.length === 0) {
    showFeedback(`Puntuació final: ${score} / 10`, 'correct');
    active = false;
    restartButton.style.display = 'block';
    restartButton.onclick = () => initGame(config);
    return;
  }
  current = sentences.shift();
  y = 0;
  canAdvance = true;
  setAnswerButtonsEnabled(true);
}

// Funció principal de dibuix
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
      total++;
      updateScore();
      nextSentence();
    }
  }

  animationFrameId = requestAnimationFrame(draw);
}

// Funció per gestionar clics als botons
function handleClick(userAnswer, button) {
  setAnswerButtonsEnabled(false);
  animateButtonClick(button);
  checkAnswer(userAnswer);
}

// Funció per comprovar respostes
function checkAnswer(userAnswer) {
  if (current && userAnswer === current.answer) {
    showFeedback('✓ Correcte!', 'correct');
    canAdvance = false;
    score++;
    total++;
    updateScore();
    setTimeout(nextSentence, 1500);
  } else {
    showFeedback(`✗ Incorrecte. Resposta: ${current.answer}`, 'incorrect');
    canAdvance = false;
    incorrectSentences.push({ ...current, userAnswer });
    total++;
    updateScore();
    setTimeout(nextSentence, 1500);
  }
}

// Funció per animar els botons
function animateButtonClick(button) {
  button.style.transition = 'transform 0.1s, background-color 0.3s';
  button.style.transform = 'scale(0.95)';
  button.style.backgroundColor = '#ffc107';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
    button.style.backgroundColor = '';
  }, 150);
}

// Funció per habilitar/deshabilitar botons
function setAnswerButtonsEnabled(enabled) {
  const buttons = buttonContainer.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = !enabled);
}

// Funció per ajustar el text al canvas
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

// Funció d'inicialització del joc
function initGame(config) {
  // Configura les variables globals
  currentLang = config.lang || 'ca';
  useAudio = config.audio !== false;
  
  // Configura el canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Inicialitza l'estat del joc
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
  
  // Mostra el modal inicial
  renderModal(config);
  createButtons(config.buttons);
  updateScore();
  
  // Inicia el bucle del joc
  draw();
}

// Exporta la funció initGame
window.initGame = initGame;

// Gestió de redimensionament
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
