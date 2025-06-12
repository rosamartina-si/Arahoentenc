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

// Inicialització del joc
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

// Resta de funcions del joc (renderModal, createButtons, updateScore, etc.)
// ... (inclou totes les altres funcions que teníem abans)

// Exporta la funció initGame perquè pugui ser cridada des dels fitxers HTML
window.initGame = initGame;

// Gestió de redimensionament
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
