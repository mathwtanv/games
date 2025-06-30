const board = document.getElementById('board');
const status = document.getElementById('status');
const resetButton = document.getElementById('reset');
const modeSelector = document.getElementById('mode');
const difficultySelector = document.getElementById('difficulty');
const playerSelector = document.getElementById('player');

const xScoreDisplay = document.getElementById('xScore');
const oScoreDisplay = document.getElementById('oScore');
const drawsDisplay = document.getElementById('draws');

let currentPlayer = 'X';
let cells = Array(9).fill(null);
let gameActive = true;
let isVsAI = false;
let aiDifficulty = 'hard';
let playerSymbol = 'X';

let scores = { X: 0, O: 0, draws: 0 };

function createBoard() {
  board.innerHTML = '';
  cells.forEach((_, i) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', handleMove);
    board.appendChild(cell);
  });
  updateStatus();
  if (isVsAI && currentPlayer !== playerSymbol) {
    setTimeout(aiMove, 300);
  }
}

function handleMove(e) {
  const index = e.target.dataset.index;
  if (!gameActive || cells[index]) return;
  if (isVsAI && currentPlayer !== playerSymbol) return;

  makeMove(index, currentPlayer);
  if (checkGameOver()) return;

  if (isVsAI && currentPlayer !== playerSymbol) {
    setTimeout(aiMove, 300);
  }
}

function makeMove(index, player) {
  cells[index] = player;
  board.children[index].textContent = player;
  currentPlayer = player === 'X' ? 'O' : 'X';
  updateStatus();
}

function aiMove() {
  if (!gameActive) return;

  const move =
    aiDifficulty === 'hard' ? getBestMove() : getRandomMove();

  if (move !== null) {
    makeMove(move, currentPlayer);
    checkGameOver();
  }
}

function getRandomMove() {
  const available = cells
    .map((cell, idx) => (cell === null ? idx : null))
    .filter(idx => idx !== null);
  return available.length ? available[Math.floor(Math.random() * available.length)] : null;
}

function getBestMove() {
  let bestScore = -Infinity;
  let move = null;
  cells.forEach((cell, index) => {
    if (cell === null) {
      cells[index] = 'O';
      let score = minimax(cells, 0, false);
      cells[index] = null;
      if (score > bestScore) {
        bestScore = score;
        move = index;
      }
    }
  });
  return move;
}

function minimax(boardState, depth, isMaximizing) {
  const winner = evaluateWinner(boardState);
  if (winner !== null) {
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    return 0;
  }

  const scores = [];
  for (let i = 0; i < boardState.length; i++) {
    if (boardState[i] === null) {
      boardState[i] = isMaximizing ? 'O' : 'X';
      const score = minimax(boardState, depth + 1, !isMaximizing);
      boardState[i] = null;
      scores.push(score);
    }
  }

  return isMaximizing ? Math.max(...scores) : Math.min(...scores);
}

function evaluateWinner(boardState) {
  const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let [a, b, c] of winCombos) {
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a];
    }
  }

  if (boardState.every(cell => cell)) return 'draw';
  return null;
}

function checkGameOver() {
  const winner = evaluateWinner(cells);
  if (winner) {
    if (winner === 'draw') {
      status.textContent = "It's a draw!";
      scores.draws++;
    } else {
      status.textContent = `${winner} wins!`;
      scores[winner]++;
    }
    gameActive = false;
    updateScoreDisplay();
    return true;
  }
  return false;
}

function updateScoreDisplay() {
  xScoreDisplay.textContent = scores.X;
  oScoreDisplay.textContent = scores.O;
  drawsDisplay.textContent = scores.draws;
}

function updateStatus() {
  if (!gameActive) return;
  status.textContent = `Current turn: ${currentPlayer}`;
}

function resetGame() {
  cells = Array(9).fill(null);
  gameActive = true;
  currentPlayer = 'X';
  isVsAI = modeSelector.value === 'ai';
  aiDifficulty = difficultySelector.value;
  playerSymbol = playerSelector.value;
  createBoard();
}

resetButton.addEventListener('click', resetGame);
modeSelector.addEventListener('change', resetGame);
difficultySelector.addEventListener('change', resetGame);
playerSelector.addEventListener('change', resetGame);

// Initialize
resetGame();

