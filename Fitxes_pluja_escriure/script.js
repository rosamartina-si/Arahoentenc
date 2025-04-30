let config, current, queue = [], score = 0, y = 0;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

async function loadConfig() {
  const res = await fetch('fitxa.json');
  config = await res.json();
  queue = config.questions.slice();
  startNext();
  updateScore();
  renderInteraction();
  requestAnimationFrame(draw);
}

function renderInteraction() {
  const container = document.getElementById('interaction');
  container.innerHTML = '';

  if (config.inputType === 'buttons') {
    config.buttons.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.onclick = () => checkAnswer(opt);
      container.appendChild(btn);
    });
  } else {
    const input = document.createElement('input');
    input.placeholder = 'Type your answer';
    input.id = 'textInput';
    const send = document.createElement('button');
    send.textContent = 'Send';
    send.onclick = () => checkAnswer(input.value.trim().toLowerCase());
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkAnswer(input.value.trim().toLowerCase());
    });
    container.appendChild(input);
    container.appendChild(send);
    input.focus();
  }
}

function checkAnswer(userAnswer) {
  if (!current) return;
  const correct = current.answer.toLowerCase();
  const feedback = document.getElementById('feedback');

  if (userAnswer === correct) {
    score++;
    feedback.textContent = "✓ Correct!";
    feedback.className = "correct";
  } else {
    feedback.textContent = `✗ Incorrect! It was: ${correct}`;
    feedback.className = "incorrect";
  }

  feedback.style.display = 'block';
  setTimeout(() => {
    feedback.style.display = 'none';
    startNext();
    updateScore();
    if (config.inputType === 'text') {
      document.getElementById('textInput').value = '';
      document.getElementById('textInput').focus();
    }
  }, 1500);
}

function startNext() {
  if (queue.length === 0) {
    current = null;
    return;
  }
  current = queue.shift();
  y = 0;
}

function updateScore() {
  document.getElementById('score').textContent = `Score: ${score}`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (current) {
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    const sentence = current.sentence;
    ctx.fillText(sentence, canvas.width / 2 - ctx.measureText(sentence).width / 2, y);
    y += 0.5;
    if (y > canvas.height) {
      checkAnswer("⏱");
    }
  }
  requestAnimationFrame(draw);
}

loadConfig();
