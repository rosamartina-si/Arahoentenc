// script.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scoreDisplay = document.getElementById('scoreDisplay');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');
const feedback = document.getElementById('feedback');
const buttonContainer = document.getElementById('buttonContainer');
const explanationBox = document.getElementById('explanation');

let config = null;
let sentences, current, y, speed, active, paused, canAdvance, score, total, incorrectSentences, reviewMode = false;

function getParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    tipus: urlParams.get('tipus') || 'fitxes_pluja_botons',
    fitxa: urlParams.get('fitxa') || 'they-them-their'
  };
}

async function loadConfig() {
  const { tipus, fitxa } = getParams();
  const response = await fetch(`${tipus}/${fitxa}.json`);
  config = await response.json();
  explanationBox.innerHTML = config.explanation || '';
  createButtons(config.buttons);
  initGame();
}

function createButtons(options) {
  buttonContainer.innerHTML = '';
  options.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.onclick = () => handleClick(option);
    buttonContainer.appendChild(btn);
  });
}

function initGame(fromIncorrect = false) {
  const source = fromIncorrect && incorrectSentences.length > 0 ? incorrectSentences : config.questions;
  sentences = source.sort(() => 0.5 - Math.random()).slice(0, 10);
  current = null;
  y = 0;
  speed = window.innerHeight < 600 ? 0.2 : 0.4;
  active = true;
  paused = false;
  canAdvance = true;
  score = 0;
  total = 0;
  if (!fromIncorrect) incorrectSentences = [];
  reviewMode = fromIncorrect;
  restartButton.textContent = fromIncorrect ? '🔁 Review incorrect answers' : '🔁 Restart';
  restartButton.style.display = 'none';
  updateScore();
  nextSentence();
  draw();
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score} / ${total}`;
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
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.onend = () => callback && callback();
  speechSynthesis.speak(utterance);
}

function nextSentence() {
  if (sentences.length === 0) {
    showFeedback(`Final Score: ${score} / ${total}`, 'correct');
    active = false;
    restartButton.style.display = 'block';
    restartButton.onclick = () => {
      if (!reviewMode && incorrectSentences.length > 0) {
        initGame(true);
      } else {
        initGame(false);
      }
    };
    return;
  }
  current = sentences.shift();
  y = 0;
  canAdvance = true;
}

function draw() {
  if (!active || paused) return requestAnimationFrame(draw);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (current) {
    if (canAdvance) y += speed;
    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(current.sentence, 50, y);
    if (y > canvas.height) {
      showFeedback(`Answer: ${current.answer}`, 'incorrect');
      speak("The correct answer is " + current.answer + ".");
      total++;
      updateScore();
      nextSentence();
    }
  }
  requestAnimationFrame(draw);
}

function handleClick(userAnswer) {
  if (paused) {
    paused = false;
    pauseButton.textContent = 'Pause';
    draw();
  }
  checkAnswer(userAnswer);
}

function checkAnswer(userAnswer) {
  speak(userAnswer);
  if (current && userAnswer === current.answer) {
    showFeedback('✓ Correct!', 'correct');
    const fullSentence = current.sentence.replace("___", userAnswer);
    canAdvance = false;
    speak(fullSentence, () => {
      score++;
      total++;
      updateScore();
      nextSentence();
    });
  } else {
    showFeedback(`✗ Incorrect. Answer: ${current.answer}`, 'incorrect');
    canAdvance = false;
    const fullSentence = current.sentence.replace("___", current.answer);
    const explanation = `The correct answer is ${current.answer}. ${fullSentence}`;
    incorrectSentences.push({ ...current, userAnswer });
    speak(explanation, () => {
      total++;
      updateScore();
      nextSentence();
    });
  }
}

function togglePause() {
  paused = !paused;
  pauseButton.textContent = paused ? 'Resume' : 'Pause';
  if (!paused) draw();
}

function restartGame() {
  initGame();
}

loadConfig();
