function generaExercici(frases) {
  const contenidor = document.getElementById('exercici');
  contenidor.innerHTML = '';  // Neteja contingut anterior

  frases.forEach((f, i) => {
    const [cat, eng, icona] = f;  // Extraient les parts
    const bloc = document.createElement('div');
    bloc.className = 'phrase-block';

    bloc.innerHTML = `
      <p>${i + 1}. ${cat} ${icona ? `<span class="icona">${icona}</span>` : ''}</p>
      <input type="text"
             data-index="${i}"
             data-state="unchecked"
             data-correct="${JSON.stringify(eng).replace(/"/g, '&quot;').replace(/'/g, '&#39;')}"
      >
      <button>Comprova</button>
      <div class="correction"></div>
    `;
    contenidor.appendChild(bloc);

    const btn = bloc.querySelector('button');
    btn.addEventListener('click', () => comprovaIndividual(btn));

    const input = bloc.querySelector('input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        comprovaIndividual(btn);
      }
    });
  });

  // Controls generals
  const controls = document.getElementById('controls');
  controls.innerHTML = `
    <button onclick="comprovaTotes()">Comprova-ho tot</button>
    <button onclick="reinicia()">Esborra-ho tot</button>
    <button onclick="reiniciaAleatori()">🔁 Frases noves</button>
    <div id="resultat"></div>
  `;
}
