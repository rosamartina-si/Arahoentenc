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

let sentences = [], current = null;
let y = 0, speed = 0.4, active = false, paused = false, canAdvance = true;
let score = 0, total = 0, incorrectSentences = [];
let animationFrameId;

function renderModal() {
  const { title, objective, explanation } = config;
  modalOverlay.innerHTML = `
    <h2>🎯 ${title}</h2>
    <p>${objective}</p>
    <hr style="margin: 20px 0; width: 80%;" />
    <h3>📘 Explanation</h3>
    ${explanation.map(p => `<p>${p}</p>`).join('')}
    <hr style="margin: 20px 0; width: 80%;" />
    <p>🔄 Each time the exercise is different.</p>
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

function nextSentence() {
  if (sentences.length === 0) {
    showFeedback(`Final score: ${score} / 10`, 'correct');
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
      showFeedback(`Answer: ${current.answer}`, 'incorrect');
      total++;
      updateScore();
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
  const fullSentence = current.sentence.replace('___', userAnswer);

  if (current && userAnswer === current.answer) {
    showFeedback('✓ Correct!', 'correct');
    canAdvance = false;
    score++;
    total++;
    updateScore();
    speakSentence(fullSentence); // 🗣️ després de resposta correcta
    setTimeout(nextSentence, 1500);
  } else {
    showFeedback(`✗ Incorrect. Answer: ${current.answer}`, 'incorrect');
    canAdvance = false;
    incorrectSentences.push({ ...current, userAnswer });
    total++;
    updateScore();
    speakSentence(current.sentence.replace('___', current.answer)); // 🗣️ després d'error
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

// 🗣️ Parla un cop l'usuari respon
function speakSentence(sentence) {
  if (!config.audio || typeof speechSynthesis === 'undefined') return;

  const utterance = new SpeechSynthesisUtterance(sentence);
  utterance.lang = config.lang === "ca" ? "ca-ES" : "en-US";
  utterance.rate = 0.95;
  utterance.pitch = 1;
  speechSynthesis.cancel(); // Atura si hi ha una veu anterior
  speechSynthesis.speak(utterance);
}

renderModal();
