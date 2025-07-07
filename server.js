









































// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

let players = [];
let gameStarted = false;

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  console.log(`🔌 ${socket.id} connected`);

  socket.on('join', ({ name, character }) => {
    if (gameStarted) {
      socket.emit('gameInProgress');
      return;
    }
    players.push({ id: socket.id, name, character, ready: false });
    io.emit('updatePlayers', players);
  });

  socket.on('ready', (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      player.ready = true;
    }

    if (players.filter(p => p.ready).length >= 3) {
      const spy = players[Math.floor(Math.random() * players.length)];
      gameStarted = true;
      io.emit('startGame', { players, spyName: spy.name });
    } else {
      io.emit('updatePlayers', players);
    }
  });

  socket.on('chat', ({ name, character, text }) => {
    io.emit('chatMessage', { name, character, text });
  });

  socket.on('vote', ({ voter, target }) => {
    socket.broadcast.emit('playerVoted', { voter, target });
  });

  socket.on('disconnect', () => {
    players = players.filter(p => p.id !== socket.id);
    if (!gameStarted) {
      io.emit('updatePlayers', players);
    }
    console.log(`❌ ${socket.id} disconnected`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
