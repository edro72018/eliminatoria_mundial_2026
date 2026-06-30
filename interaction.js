/* ---------- DATOS: equipos del round de 32 (8 llaves por lado) ---------- */
const initialMatches = [
  ["🇩🇪 Alemania","🇵🇾 Paraguay"],
  ["🇫🇷 Francia","🇸🇪 Suecia"],
  ["🇿🇦 Sudáfrica","🇨🇦 Canadá"],
  ["🇳🇱 Países Bajos","🇲🇦 Marruecos"],
  ["🇵🇹 Portugal","🇭🇷 Croacia"],
  ["🇪🇸 España","🇦🇹 Austria"],
  ["🇺🇸 Estados Unidos","🇧🇦 Bosnia"],
  ["🇧🇪 Bélgica","🇸🇳 Senegal"],
  ["🇧🇷 Brasil","🇯🇵 Japón"],
  ["🇨🇮 Costa de Marfil","🇳🇴 Noruega"],
  ["🇲🇽 México","🇪🇨 Ecuador"],
  ["🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra","🇨🇩 RD Congo"],
  ["🇦🇷 Argentina","🇨🇻 Cabo Verde"],
  ["🇦🇺 Australia","🇪🇬 Egipto"],
  ["🇨🇭 Suiza","🇩🇿 Argelia"],
  ["🇨🇴 Colombia","🇬🇭 Ghana"]
];

/* ---------- Construcción del árbol ----------
   roundCount = log2(numMatches en ronda1) + 1
   16 partidos -> rondas: 16,8,4,2,1 (5 rondas) */
function buildRounds(matches){
  const rounds = [];
  let current = matches.map(m => ({teams:[...m], winner:null}));
  rounds.push(current);
  let size = current.length;
  while(size > 1){
    size = size/2;
    const next = [];
    for(let i=0;i<size;i++){
      next.push({teams:[null,null], winner:null});
    }
    rounds.push(next);
  }
  return rounds;
}

let rounds = buildRounds(initialMatches);

const roundNames = ["Dieciseisavos","Octavos","Cuartos","Semifinal","Final"];

function nameOf(t){ return t || null; }

function render(){
  const container = document.getElementById('bracket');
  container.innerHTML = '';

  rounds.forEach((round, rIdx) => {
    const colDiv = document.createElement('div');
    colDiv.className = 'round';

    const title = document.createElement('div');
    title.className = 'round-title';
    title.textContent = roundNames[rIdx] || ('Ronda '+(rIdx+1));
    colDiv.appendChild(title);

    round.forEach((match, mIdx) => {
      const matchDiv = document.createElement('div');
      matchDiv.className = 'match';

      match.teams.forEach((team, tIdx) => {
        const teamDiv = document.createElement('div');
        let cls = 'team';
        if(!team){
          cls += ' empty';
        } else if(match.winner === team){
          cls += ' winner';
        } else if(match.winner && match.winner !== team){
          cls += ' loser';
        }
        teamDiv.className = cls;

        if(team){
          const parts = team.split(' ');
          const flag = parts[0];
          const name = parts.slice(1).join(' ');
          teamDiv.innerHTML = `<span class="flag">${flag}</span><span class="name">${name}</span>`;
          teamDiv.addEventListener('click', () => selectWinner(rIdx, mIdx, tIdx));
        } else {
          teamDiv.innerHTML = `<span class="name">?</span>`;
        }
        matchDiv.appendChild(teamDiv);
      });

      colDiv.appendChild(matchDiv);
    });

    container.appendChild(colDiv);
  });

  // Caja de campeón
  const champWrap = document.createElement('div');
  champWrap.className = 'round champion-box';
  const champTitle = document.createElement('div');
  champTitle.className = 'round-title';
  champTitle.textContent = 'Campeón';
  champWrap.appendChild(champTitle);

  const champCard = document.createElement('div');
  champCard.className = 'champion-card';
  const finalRound = rounds[rounds.length-1];
  const champion = finalRound[0].winner;
  if(champion){
    const parts = champion.split(' ');
    champCard.innerHTML = `<span class="flag">${parts[0]}</span><span class="name">${parts.slice(1).join(' ')}</span>`;
  } else {
    champCard.innerHTML = `<span class="flag">🏆</span><span class="name">?</span>`;
  }
  champWrap.appendChild(champCard);
  container.appendChild(champWrap);
}

function selectWinner(rIdx, mIdx, tIdx){
  const match = rounds[rIdx][mIdx];
  const team = match.teams[tIdx];
  if(!team) return;

  match.winner = team;

  // Propagar a la siguiente ronda si existe
  if(rIdx + 1 < rounds.length){
    const nextMatchIdx = Math.floor(mIdx/2);
    const slot = mIdx % 2; // 0 o 1 dentro del próximo partido
    const nextMatch = rounds[rIdx+1][nextMatchIdx];

    nextMatch.teams[slot] = team;

    // Si cambia un ganador anterior y ese equipo ya había avanzado, hay que
    // limpiar las rondas siguientes para evitar inconsistencias
    clearForward(rIdx+1, nextMatchIdx);
    nextMatch.teams[slot] = team;
  }

  render();
}

// Limpia el resultado de un partido y de todo lo que dependía de él hacia adelante
function clearForward(rIdx, mIdx){
  if(rIdx >= rounds.length) return;
  const match = rounds[rIdx][mIdx];
  match.winner = null;

  if(rIdx + 1 < rounds.length){
    const nextMatchIdx = Math.floor(mIdx/2);
    const slot = mIdx % 2;
    const nextMatch = rounds[rIdx+1][nextMatchIdx];
    if(nextMatch.teams[slot]){
      nextMatch.teams[slot] = null;
      clearForward(rIdx+1, nextMatchIdx);
    }
  }
}

document.getElementById('resetBtn').addEventListener('click', () => {
  rounds = buildRounds(initialMatches);
  render();
});

render();
