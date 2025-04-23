<!-- Guarda'l com script.js al mateix nivell que joc.html -->
<script>
/* ───────────────────── CONFIGURACIÓ DEL CANVAS ───────────────────── */
const canvas = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
});

/* ───────────────────── ELEMENTS DEL DOM ───────────────────── */
const scoreDisplay   = document.getElementById('scoreDisplay');
const restartButton  = document.getElementById('restartButton');
const feedback       = document.getElementById('feedback');
const buttonContainer= document.getElementById('buttonContainer');
const modalOverlay   = document.getElementById('modalOverlay');

/* ───────────────────── VARIABLES GLOBALS ───────────────────── */
let config      = null;
let sentences   = [];
let current     = null;
let y           = 0;
let speed       = 0.4;
let active      = false;
let paused      = false;
let canAdvance  = true;
let score       = 0;
let total       = 0;
let incorrect   = [];
let animationId;
let useAudio    = true;     // es config. per fitxa

/* ───────────────────── PARÀMETRES URL ───────────────────── */
function getParams() {
  const q = new URLSearchParams(window.location.search);
  return {
    tipus : q.get('tipus') || 'fitxes/angles',
    fitxa : q.get('fitxa') || 'nowhere_anywhere_everywhere'
  };
}

/* ───────────────────── CARREGA DEL JSON ───────────────────── */
async function loadConfig() {
  const { tipus, fitxa } = getParams();
  const url = `${tipus}/${fitxa}.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    config   = await res.json();
    useAudio = config.audio !== false;           // true per defecte
    renderModal();
  } catch (e) {
    alert(`Error carregant la fitxa:\n${url}\n${e.message}`);
    console.error(e);
  }
}

/* ───────────────────── MODAL D’INICI ───────────────────── */
function renderModal() {
  const { title, objective, explanation } = config;
  const startTxt = config.lang === 'ca' ? 'Entesos! Comencem' : 'Got it! Start';
  modalOverlay.innerHTML = `
    <h2>🎯 ${title}</h2>
    <p>${objective}</p>
    <hr style="margin:20px 0;width:80%">
    <h3>📘 ${config.lang === 'ca' ? 'Explicació' : 'Explanation'}</h3>
    ${explanation.map(p => `<p>${p}</p>`).join('')}
    <hr style="margin:20px 0;width:80%">
    <button id="startButton">${startTxt}</button>
  `;
  document.getElementById('startButton').addEventListener('click', () => {
    modalOverlay.style.display = 'none';
    createButtons();
    initGame();
  });
}

/* ───────────────────── BOTONS DINÀMICS ───────────────────── */
function createButtons() {
  buttonContainer.innerHTML = '';
  config.buttons.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => handleClick(opt, btn);
    buttonContainer.appendChild(btn);
  });
}

/* ───────────────────── INICI / REINICI DEL JOC ───────────────────── */
function initGame() {
  cancelAnimationFrame(animationId);
  sentences = config.questions.sort(() => 0.5 - Math.random()).slice(0, 10);
  current   = null;
  y         = 0;
  active    = true;
  paused    = false;
  canAdvance= true;
  score     = 0;
  total     = 0;
  incorrect = [];
  restartButton.style.display = 'none';
  updateScore();
  nextSentence();
  draw();
}

function updateScore() {
  scoreDisplay.textContent =
    (config.lang === 'ca' ? 'Puntuació' : 'Score') + `: ${score} / 10`;
}

/* ───────────────────── FEEDBACK I ÀUDIO ───────────────────── */
function showFeedback(msg, cls) {
  feedback.textContent = msg;
  feedback.className   = cls;
  feedback.style.display = 'block';
  setTimeout(() => feedback.style.display='none', 2000);
}

function speak(text, cb) {
  if (!useAudio) { if (cb) cb(); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang  = config.lang === 'ca' ? 'ca-ES' : 'en-US';
  u.onend = () => cb && cb();
  speechSynthesis.speak(u);
}

/* ───────────────────── FLUX DEL JOC ───────────────────── */
function nextSentence() {
  if (sentences.length === 0) {
    showFeedback(
      `${config.lang === 'ca' ? 'Puntuació final' : 'Final score'}: ${score} / 10`,
      'correct'
    );
    active = false;
    restartButton.style.display = 'block';
    restartButton.onclick = () => initGame();
    return;
  }
  current    = sentences.shift();
  y          = 0;
  canAdvance = true;
  setButtonsEnabled(true);
}

function draw() {
  if (!active || paused) { animationId = requestAnimationFrame(draw); return; }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (current) {
    if (canAdvance) y += speed;
    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    wrapText(ctx, current.sentence, y, canvas.width*0.8, 30);

    if (y > canvas.height && canAdvance) {
      canAdvance = false;
      const ansText = config.lang === 'ca' ? 'Resposta' : 'Answer';
      showFeedback(`${ansText}: ${current.answer}`, 'incorrect');
      const full = current.sentence.replace('___', current.answer);
      speak(
        `${config.lang === 'ca' ? 'La resposta correcta és' : 'The correct answer is'} ${current.answer}.`,
        () => speak(full, () => { total++; updateScore(); nextSentence(); })
      );
    }
  }
  animationId = requestAnimationFrame(draw);
}

function handleClick(ans, btn) {
  setButtonsEnabled(false);
  animateButton(btn);
  checkAnswer(ans);
}

function checkAnswer(ans) {
  speak(ans);
  if (current && ans === current.answer) {
    showFeedback(config.lang==='ca'?'✓ Correcte!':'✓ Correct!', 'correct');
    const full = current.sentence.replace('___', ans);
    canAdvance = false;
    speak(full, () => { score++; total++; updateScore(); nextSentence(); });
  } else {
    const wrongTxt = config.lang==='ca'
      ? `✗ Incorrecte. Resposta: ${current.answer}`
      : `✗ Incorrect. Answer: ${current.answer}`;
    showFeedback(wrongTxt, 'incorrect');
    canAdvance = false;
    incorrect.push({ ...current, userAnswer: ans });
    const full = current.sentence.replace('___', current.answer);
    speak(
      `${config.lang==='ca'?'La resposta correcta és':'The correct answer is'} ${current.answer}. ${full}`,
      () => { total++; updateScore(); nextSentence(); }
    );
  }
}

/* ───────────────────── UTILITATS ───────────────────── */
function animateButton(btn) {
  btn.style.transition      = 'transform 0.1s, background-color 0.3s';
  btn.style.transform       = 'scale(0.95)';
  btn.style.backgroundColor = '#ffc107';
  setTimeout(()=>{btn.style.transform='scale(1)';btn.style.backgroundColor='';},150);
}
function setButtonsEnabled(e) {
  buttonContainer.querySelectorAll('button').forEach(b=>b.disabled=!e);
}
function wrapText(ctx, txt, y, maxW, lh) {
  const words = txt.split(' ');
  let line = '';
  for (let w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, (canvas.width-ctx.measureText(line).width)/2, y);
      line = w + ' ';
      y += lh;
    } else line = test;
  }
  ctx.fillText(line, (canvas.width-ctx.measureText(line).width)/2, y);
}

/* ───────────────────── INICI ───────────────────── */
loadConfig();
</script>
