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

const translations = {
  ca: {
    startButton: "Entesos! Comencem",
    explanationTitle: "📘 Explicació gramatical",
    introMessage: "🔄 Cada vegada l'exercici és diferent.",
    finalScore: "Puntuació final",
    correct: "✓ Correcte!",
    incorrect: "✗ Incorrecte. Resposta:",
    score: "Puntuació",
    restart: "🔁 Reinicia",
    inputPlaceholder: "Escriu la resposta...",
    hearAgain: "🔊 Torna a escoltar"
  },
  en: {
    startButton: "Got it! Let's start",
    explanationTitle: "📘 Explanation",
    introMessage: "🔄 Each time the exercise is different.",
    finalScore: "Final score",
    correct: "✓ Correct!",
    incorrect: "✗ Incorrect. Answer:",
    score: "Score",
    restart: "🔁 Restart",
    inputPlaceholder: "Type your answer...",
    hearAgain: "🔊 Hear again"
  },
  pl: {
    startButton: "Rozumiem! Zacznijmy",
    explanationTitle: "📘 Wyjaśnienie gramatyczne",
    introMessage: "🔄 Za każdym razem ćwiczenie jest inne.",
    finalScore: "Wynik końcowy",
    correct: "✓ Poprawnie!",
    incorrect: "✗ Niepoprawnie. Odpowiedź:",
    score: "Wynik",
    restart: "🔁 Zacznij od nowa",
    inputPlaceholder: "Wpisz odpowiedź...",
    hearAgain: "🔊 Odtwórz ponownie"
  }
};

const uiLangMap = {
  pl: "ca",
  en: "en",
  ca: "ca",
  default: "ca"
};

const voiceLangMap = {
  ca: "ca-ES",
  en: "en-US",
  pl: "pl-PL",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE"
};

let sentences = [], current = null;
let y = 0, active = false, paused = false, canAdvance = true;
let score = 0, total = 0, incorrectSentences = [];
let animationFrameId;
let voicesLoaded = false;

function getUILang() {
  const langCode = (config.lang || '').split('-')[0];
  return uiLangMap[langCode] || uiLangMap.default;
}

function getVoiceLang() {
  const langCode = (config.lang || '').split('-')[0];
  return voiceLangMap[langCode] || config.lang;
}

function loadVoices() {
  return new Promise(resolve => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      voicesLoaded = true;
      resolve();
    } else {
      speechSynthesis.onvoiceschanged = () => {
        voicesLoaded = true;
        resolve();
      };
    }
  });
}

function showFeedback(message, className) {
  const t = translations[getUILang()];
  feedback.innerHTML = message;
  feedback.className = className;
  feedback.style.display = 'block';

  if (config?.enableRepeatButton && current?.sentence) {
    const repeatBtn = document.createElement('button');
    repeatBtn.textContent = t.hearAgain;
    repeatBtn.style.marginTop = '10px';
    repeatBtn.onclick = () => speakSentence(current.sentence.replace('___', current.answer));
    feedback.appendChild(document.createElement('br'));
    feedback.appendChild(repeatBtn);
  }

  paused = true;
  const displayTime = (config?.noteDisplayTime || 3) * 1000;

  setTimeout(() => {
    feedback.style.display = 'none';
    paused = false;
  }, displayTime);
}

function renderModal() {
  const t = translations[getUILang()];
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

  if (config.mode === 'pluja_botons') {
    config.buttons.forEach(option => {
      const btn = document.createElement('button');
      btn.textContent = option;
      btn.onclick = () => handleClick(option, btn);
      buttonContainer.appendChild(btn);
    });
  } else if (config.mode === 'pluja_text') {
    const form = document.createElement('div');
    form.style.display = 'flex';
    form.style.gap = '10px';
    form.style.alignItems = 'center';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'answerInput';
    input.placeholder = translations[getUILang()].inputPlaceholder;
    input.style.fontSize = '18px';
    input.style.padding = '10px';
    input.style.borderRadius = '8px';
    input.style.border = '1px solid #ccc';
    input.style.minWidth = '200px';
    input.style.flexGrow = '1';
    input.autofocus = true;

    const submitBtn = document.createElement('button');
    submitBtn.textContent = '✅ ' + (translations[getUILang()].submitButton || 'Envia');
    submitBtn.onclick = () => {
      const userAnswer = input.value.trim();
      if (userAnswer) {
        handleClick(userAnswer, submitBtn);
        input.value = '';
      }
    };

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitBtn.click();
      }
    });

    form.appendChild(input);
    form.appendChild(submitBtn);
    buttonContainer.appendChild(form);

    setTimeout(() => input.focus(), 100);
  }
}

async function initGame() {
  if (!voicesLoaded) await loadVoices();
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
  restartButton.textContent = translations[getUILang()].restart;
  updateScore();
  nextSentence();
  draw();
}

function updateScore() {
  scoreDisplay.textContent = `${translations[getUILang()].score}: ${score} / 10`;
}

function nextSentence() {
  if (sentences.length === 0) {
    showFeedback(`${translations[getUILang()].finalScore}: ${score} / 10`, 'correct');
    active = false;
    restartButton.style.display = 'block';
    restartButton.onclick = () => initGame();
    return;
  }
  current = sentences.shift();
  y = 0;
  canAdvance = true;
  setAnswerButtonsEnabled(true);

  if (config.playAudioAtStart && current) {
    speakSentence(current.sentence.replace('___', current.answer));
  }

  const input = document.getElementById('answerInput');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 50);
  }
}

function draw() {
  if (!active || paused) {
    animationFrameId = requestAnimationFrame(draw);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (current) {
    if (canAdvance) y += config.speed;

    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    wrapText(ctx, current.sentence, y, canvas.width * 0.8, 30);

    if (y > canvas.height && canAdvance) {
      canAdvance = false;
      let feedbackMessage = `${translations[getUILang()].incorrect} ${current.answer}`;
      if (current.notes) {
        feedbackMessage += `<div class="feedback-notes">${current.notes}</div>`;
      }
      showFeedback(feedbackMessage, 'incorrect');
      total++;
      updateScore();
      if (!config.playAudioAtStart) {
        speakSentence(current.sentence.replace('___', current.answer));
      }
      setTimeout(nextSentence, (config?.noteDisplayTime || 3) * 1000);
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
  const t = translations[getUILang()];
  const fullSentence = current.sentence.replace('___', userAnswer);

  const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ');
  const correctAnswers = Array.isArray(current.answer) ? current.answer : [current.answer];
  const isCorrect = correctAnswers.some(ans => normalize(ans) === normalize(userAnswer));

  let feedbackMessage = isCorrect ? t.correct : `${t.incorrect} ${current.answer}`;

  if (current.notes) {
    feedbackMessage += `<div class="feedback-notes">${current.notes}</div>`;
  }

  if (isCorrect) {
    showFeedback(feedbackMessage, 'correct');
    canAdvance = false;
    score++;
    total++;
    updateScore();
    speakSentence(fullSentence);
    setTimeout(nextSentence, (config?.noteDisplayTime || 3) * 1000);
  } else {
    showFeedback(feedbackMessage, 'incorrect');
    canAdvance = false;
    incorrectSentences.push({ ...current, userAnswer });
    total++;
    updateScore();
    speakSentence(current.sentence.replace('___', current.answer));
    setTimeout(nextSentence, (config?.noteDisplayTime || 3) * 1000);
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

function speakSentence(sentence) {
  if (!config.audio || !voicesLoaded || typeof speechSynthesis === 'undefined') return;

  const utterance = new SpeechSynthesisUtterance(sentence);
  utterance.lang = getVoiceLang();
  utterance.rate = config.speechRate || 1;
  utterance.pitch = 1;

  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v =>
    v.lang.startsWith(config.lang) ||
    v.lang.startsWith(getVoiceLang()) ||
    v.name.toLowerCase().includes(config.lang.toLowerCase())
  );

  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

loadVoices().then(() => {
  voicesLoaded = true;
  renderModal();
});
