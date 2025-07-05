// ==== Global Variables ====
const board = document.getElementById("board");
const playerDisplay = document.getElementById("current-player");
const modeSelector = document.getElementById("game-mode");
const restartBtn = document.getElementById("restart-button");
const messageBox = document.getElementById("game-message");
const aiSideSelector = document.getElementById("ai-side");
const aiChoiceContainer = document.getElementById("ai-choice-container");

let currentPlayer = "X";
let gameMode = "2p";
let activeBoard = -1;
let gameState = Array(9).fill().map(() => Array(9).fill(null));
let boardWinners = Array(9).fill(null);
let humanPlaysAs = "X"; // User preference
let aiPlaysAs = "O";

// ==== Event Listeners ====
modeSelector.addEventListener("change", () => {
  gameMode = modeSelector.value;
  aiChoiceContainer.style.display = (gameMode !== "2p") ? "inline-block" : "none";
  resetGame();
});

aiSideSelector.addEventListener("change", () => {
  humanPlaysAs = aiSideSelector.value;
  aiPlaysAs = humanPlaysAs === "X" ? "O" : "X";
  resetGame();
});

restartBtn.addEventListener("click", resetGame);

// ==== Reset Game ====
function resetGame() {
  currentPlayer = "X"; // Always start with X
  activeBoard = -1;
  gameState = Array(9).fill().map(() => Array(9).fill(null));
  boardWinners = Array(9).fill(null);
  messageBox.style.display = "none";
  drawBoard();

  // Let AI move first if it's assigned X
  if (gameMode !== "2p") {
    aiPlaysAs = humanPlaysAs === "X" ? "O" : "X";
    if (currentPlayer === aiPlaysAs) {
      setTimeout(aiMove, 300);
    }
  }
}

// ==== Draw Board ====
function drawBoard() {
  board.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const subBoard = document.createElement("div");
    subBoard.className = "sub-board";
    subBoard.style.opacity = activeBoard === -1 || activeBoard === i ? "3" : "0.35";

    for (let j = 0; j < 9; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const value = gameState[i][j];
      cell.textContent = value || "";

      const isCellPlayable =
        !value && !boardWinners[i] && (activeBoard === -1 || activeBoard === i);

      if (isCellPlayable) {
        cell.onclick = () => {
          if (
            gameMode === "2p" ||
            (gameMode !== "2p" && currentPlayer === humanPlaysAs)
          ) {
            makeMove(i, j);
          }
        };
      } else {
        cell.style.cursor = "not-allowed";
      }

      cell.style.border = "1px solid #fdec51";

      const isLastColInSubBoard = (j + 1) % 3 === 0;
      const isLastRowInSubBoard = j >= 6;
      const isRightmostSubBoard = i % 3 === 2;
      const isBottomSubBoard = i >= 6;

      if (isLastColInSubBoard && !isRightmostSubBoard) {
        cell.style.borderRight = "none";
      }
      if (isLastRowInSubBoard && !isBottomSubBoard) {
        cell.style.borderBottom = "none";
      }

      subBoard.appendChild(cell);
    }

    if (boardWinners[i]) {
      const overlay = document.createElement("div");
      overlay.className = "sub-board-winner";
      overlay.textContent = boardWinners[i];
      subBoard.appendChild(overlay);
    }

    board.appendChild(subBoard);
  }

  if (gameMode === "2p") {
    playerDisplay.textContent = `${currentPlayer}'s Turn`;
  } else {
    playerDisplay.textContent =
      currentPlayer === humanPlaysAs ? "Your Turn" : "AI's Turn";
  }
}

// ==== Game Logic ====
function makeMove(i, j) {
  if (gameState[i][j]) return;

  gameState[i][j] = currentPlayer;

  const winner = checkWin(gameState[i]);
  if (winner) boardWinners[i] = winner;

  const gameWinner = checkWin(boardWinners);
  const isStalemate = !gameWinner && boardWinners.every((w, idx) =>
    w || isBoardFull(gameState[idx])
  );

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  activeBoard = isBoardFull(gameState[j]) || boardWinners[j] ? -1 : j;

  drawBoard();

  // Wait until redraw to show message
  if (gameWinner || isStalemate) {
    setTimeout(() => {
      if (gameWinner) {
        showGameWinner(gameWinner);
      } else {
        showGameWinner("draw");
      }
    }, 0);
    return;
  }

  if ((gameMode !== "2p") && currentPlayer === aiPlaysAs) {
    setTimeout(aiMove, 300);
  }
}

// ==== Helpers ====
function isBoardFull(cells) {
  return cells.every(cell => cell !== null);
}

function checkWin(cells) {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let [a, b, c] of wins) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }
  return null;
}

function showGameWinner(winner) {
  let message = "";
  if (winner === "draw") {
    message = "Draw!";
  } else if (gameMode === "2p") {
    message = `${winner} wins!`;
  } else {
    message = winner === aiPlaysAs ? "AI wins!" : "You win!";
  }

  messageBox.textContent = message;
  messageBox.style.display = "block";
  playerDisplay.textContent = "";
}

// ==== AI Logic ====
function aiMove() {
  if (gameMode === "easy") {
    randomAIMove();
  } else if (gameMode === "medium") {
    basicMinimaxAIMove();
  } else if (gameMode === "hard") {
    smarterMinimaxAIMove();
  }
}

function randomAIMove() {
  let moves = getValidMoves();
  if (moves.length === 0) return;
  const { i, j } = moves[Math.floor(Math.random() * moves.length)];
  makeMove(i, j);
}

function basicMinimaxAIMove() {
  let bestScore = -Infinity;
  let bestMove;
  for (const { i, j } of getValidMoves()) {
    gameState[i][j] = aiPlaysAs;
    const score = minimax(gameState, boardWinners, 0, false);
    gameState[i][j] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = { i, j };
    }
  }
  if (bestMove) makeMove(bestMove.i, bestMove.j);
}

function smarterMinimaxAIMove() {
  let bestScore = -Infinity;
  let bestMove;
  for (const { i, j } of getValidMoves()) {
    gameState[i][j] = aiPlaysAs;
    const score = minimax(gameState, boardWinners, 3, false); // depth limit
    gameState[i][j] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = { i, j };
    }
  }
  if (bestMove) makeMove(bestMove.i, bestMove.j);
}

function minimax(state, winners, depth, isMaximizing) {
  const overallWinner = checkWin(winners);
  if (overallWinner === aiPlaysAs) return 10 - depth;
  if (overallWinner && overallWinner !== aiPlaysAs) return depth - 10;

  const moves = getValidMoves();
  if (moves.length === 0 || depth === 0) return 0;

  let bestScore = isMaximizing ? -Infinity : Infinity;
  for (const { i, j } of moves) {
    state[i][j] = isMaximizing ? aiPlaysAs : (aiPlaysAs === "X" ? "O" : "X");
    const newWinners = [...winners];
    const subWin = checkWin(state[i]);
    if (subWin) newWinners[i] = subWin;
    const score = minimax(state, newWinners, depth - 1, !isMaximizing);
    state[i][j] = null;
    bestScore = isMaximizing
      ? Math.max(bestScore, score)
      : Math.min(bestScore, score);
  }
  return bestScore;
}

function getValidMoves() {
  let moves = [];
  for (let i = 0; i < 9; i++) {
    if ((activeBoard !== -1 && i !== activeBoard) || boardWinners[i]) continue;
    for (let j = 0; j < 9; j++) {
      if (!gameState[i][j]) moves.push({ i, j });
    }
  }
  return moves;
}

drawBoard();
