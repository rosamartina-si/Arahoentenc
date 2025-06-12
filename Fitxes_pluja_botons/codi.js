// codi.js - Versió corregida

// Elements del DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const restartButton = document.getElementById('restartButton');
const feedback = document.getElementById('feedback');
const buttonContainer = document.getElementById('buttonContainer');
const modalOverlay = document.getElementById('modalOverlay');

// Variables del joc
let currentLang, useAudio, config;
let sentences = [], current = null;
let y = 0, speed = 0.4, active = false, paused = false, canAdvance = true;
let score = 0, total = 0, incorrectSentences = [];
let animationFrameId;

// Funció per renderitzar el modal inicial
function renderModal() {
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
    startGame();
  });
}

function startGame() {
  // Reinicia les variables del joc
  sentences = [...config.questions].sort(() => 0.5 - Math.random()).slice(0, 10);
  current = null;
  y = 0;
  active = true;
  score = 0;
  total = 0;
  
  // Configura elements UI
  restartButton.style.display = 'none';
  updateScore();
  createButtons(config.buttons);
  
  // Inicia el bucle del joc
  nextSentence();
  draw();
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
    endGame();
    return;
  }
  current = sentences.shift();
  y = 0;
  canAdvance = true;
  setAnswerButtonsEnabled(true);
}

function endGame() {
  showFeedback(`Puntuació final: ${score} / 10`, 'correct');
  active = false;
  restartButton.style.display = 'block';
  restartButton.onclick = startGame;
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
    wrapText(current.sentence, y);
  }

  animationFrameId = requestAnimationFrame(draw);
}

// Versió simplificada de wrapText
function wrapText(text, yPos) {
  const x = canvas.width / 2;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, yPos);
}

// Funció per gestionar clics als botons
function handleClick(userAnswer, button) {
  setAnswerButtonsEnabled(false);
  animateButtonClick(button);
  checkAnswer(userAnswer);
}

// Funció per comprovar respostes
function checkAnswer(userAnswer) {
  if (userAnswer === current.answer) {
    showFeedback('✓ Correcte!', 'correct');
    score++;
  } else {
    showFeedback(`✗ Incorrecte. Resposta: ${current.answer}`, 'incorrect');
    incorrectSentences.push({ ...current, userAnswer });
  }
  
  total++;
  updateScore();
  canAdvance = false;
  setTimeout(nextSentence, 1500);
}

// Funció per animar els botons
function animateButtonClick(button) {
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

// Funció d'inicialització del joc
function initGame(cfg) {
  config = cfg;
  currentLang = config.lang || 'ca';
  useAudio = config.audio !== false;
  
  // Configura el canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Inicia el joc
  renderModal();
}

// Exporta la funció initGame
window.initGame = initGame;

// Gestió de redimensionament
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
