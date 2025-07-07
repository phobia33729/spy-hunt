
// client.js – multiplayer-enhanced for your full anime UI
const socket = io('https://your-app-name.onrender.com');


let currentPlayer = {};
let players = [];
let spyName = null;
let votes = {};

// DOM Elements
const usernameInput = document.getElementById('username');
const enterBtn = document.querySelector('[onclick="enterLobby()"]');
const playerList = document.getElementById('playerList');
const chatBox = document.getElementById('chat');
const chatInput = document.getElementById('chatInput');
const voteBox = document.getElementById('voteBox');
const clueBox = document.getElementById('clueBox');
const resultText = document.getElementById('resultText');

// Replacing local enterLobby with multiplayer
function enterLobby() {
  const name = usernameInput.value.trim();
  const character = document.getElementById('character').value;
  if (!name || !character) return alert("Please enter name and choose character");

  currentPlayer = { name, character };
  socket.emit('join', currentPlayer);

  document.getElementById('entry').classList.remove('active');
  document.getElementById('lobby').classList.add('active');
}

function readyUp() {
  socket.emit('ready', socket.id);
}

function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  socket.emit('chat', { name: currentPlayer.name, character: currentPlayer.character, text });
  chatInput.value = '';
}

function submitVote() {
  const target = voteBox.value;
  if (!target) return alert("Please select someone to vote");
  votes[currentPlayer.name] = target;
  socket.emit('vote', { voter: currentPlayer.name, target });
  if (Object.keys(votes).length === players.length) {
    showResults();
  }
}

function showResults() {
  let tally = {};
  Object.values(votes).forEach(v => tally[v] = (tally[v] || 0) + 1);
  let eliminated = Object.entries(tally).sort((a,b) => b[1]-a[1])[0][0];

  if (eliminated === spyName) {
    resultText.innerHTML = `🎉 <strong>${eliminated}</strong> was the spy!<br>🏆 Agents win!`;
  } else {
    resultText.innerHTML = `💀 <strong>${eliminated}</strong> was innocent.<br>The real spy was <strong>${spyName}</strong>. 🔥 Spy wins!`;
  }

  document.getElementById('game').classList.remove('active');
  document.getElementById('result').classList.add('active');
}

function updateVoteOptions() {
  voteBox.innerHTML = '';
  players.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = p.name;
    voteBox.appendChild(opt);
  });
}

// Socket events
socket.on('updatePlayers', (data) => {
  players = data;
  playerList.innerHTML = '';
  data.forEach(p => {
    const div = document.createElement('div');
    div.className = 'player-card';
    div.innerHTML = `<span class="character-emoji">${getCharacterEmoji(p.character)}</span><div><strong>${p.name}</strong><br><em>${p.character}</em></div>`;
    playerList.appendChild(div);
  });
});

socket.on('startGame', ({ players: allPlayers, spyName: selectedSpy }) => {
  spyName = selectedSpy;
  players = allPlayers;
  document.getElementById('lobby').classList.remove('active');
  document.getElementById('game').classList.add('active');
  updateVoteOptions();
  clueBox.innerHTML = `🔍 <strong>Intelligence Report:</strong> The spy's codename begins with "<span style="color:#ff6b6b">${spyName[0]}</span>".`;
});

socket.on('chatMessage', ({ name, character, text }) => {
  const msg = document.createElement('div');
  msg.innerHTML = `<strong>${getCharacterEmoji(character)} ${name}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('playerVoted', ({ voter, target }) => {
  const msg = document.createElement('div');
  msg.innerHTML = `🗳️ <strong>${voter}</strong> voted for <strong>${target}</strong>`;
  msg.style.color = '#f9ca24';
  chatBox.appendChild(msg);
});

function restartGame() {
  window.location.reload();
}

function getCharacterEmoji(character) {
  const emojiMap = {
    'granny': '🧓','sahib': '🧑‍💼','sasuke': '👧','uncle eren': '👨','bocchi': '🌌',
    'anya': '🍼','someone': '✨','madara': '😈','car': '🐱🚗','DPS': '🧑‍💻',
    'nour': '🎮','depresso': '😴','amna-chan': '💮','bts-girl': '🎤','akansha': '🦋','nihila': '🌑','new member': '➕'
  };
  return emojiMap[character] || '❓';
}


