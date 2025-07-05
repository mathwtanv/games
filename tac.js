// ==== Global Variables ====
const board = document.getElementById("board");
const modeSelector = document.getElementById("game-mode");
const restartBtn = document.getElementById("restart-button");
const messageBox = document.getElementById("game-message");

let currentPlayer = "X";
let gameMode = "2p";
let activeBoard = -1;
let gameState = Array(9).fill().map(() => Array(9).fill(null));
let boardWinners = Array(9).fill(null);

// ==== Event Listeners ====
modeSelector.addEventListener("change", () => {
  gameMode = modeSelector.value;
  resetGame();
});

restartBtn.addEventListener("click", resetGame);

// ==== Reset Game ====
function resetGame() {
  currentPlayer = "X";
  activeBoard = -1;
  gameState = Array(9).fill().map(() => Array(9).fill(null));
  boardWinners = Array(9).fill(null);
  messageBox.style.display = "none"; // hide message box
  drawBoard();
}

// ==== Draw Board ====
function drawBoard() {
  board.innerHTML = "";

  for (let i = 0; i < 9; i++) {
    const subBoard = document.createElement("div");
    subBoard.className = "sub-board";
    subBoard.style.opacity = activeBoard === -1 || activeBoard === i ? "2.5" : "0.5";

    for (let j = 0; j < 9; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const value = gameState[i][j];
      cell.textContent = value || "";

      const isCellPlayable =
        !value && !boardWinners[i] && (activeBoard === -1 || activeBoard === i);

      if (isCellPlayable) {
        cell.onclick = () => {
          gameState[i][j] = currentPlayer;

          const winner = checkWin(gameState[i]);
          if (winner) boardWinners[i] = winner;

          // Check if someone won the whole game
          const gameWinner = checkWin(boardWinners);
          if (gameWinner) {
            showGameWinner(gameWinner);
          }

          currentPlayer = currentPlayer === "X" ? "O" : "X";

          if (isBoardFull(gameState[j]) || boardWinners[j]) {
            activeBoard = -1;
          } else {
            activeBoard = j;
          }

          drawBoard();

          if ((gameMode === "easy" || gameMode === "hard") && currentPlayer === "O") {
            setTimeout(aiMove, 300);
          }
        };
      } else {
        cell.style.cursor = "not-allowed";
      }

      // Yellow Borders
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

    // Sub-board winner overlay
    if (boardWinners[i]) {
      const overlay = document.createElement("div");
      overlay.className = "sub-board-winner";
      overlay.textContent = boardWinners[i];
      subBoard.appendChild(overlay);
    }

    board.appendChild(subBoard);
  }
}

// ==== Helper Functions ====
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
  messageBox.textContent = `${winner} wins!`;
  messageBox.style.display = "block";
}

// ==== AI ====
function aiMove() {
  if (gameMode === "easy") {
    randomAIMove();
  } else if (gameMode === "hard") {
    minimaxAIMove();
  }
}

function randomAIMove() {
  let moves = [];
  for (let i = 0; i < 9; i++) {
    if ((activeBoard !== -1 && i !== activeBoard) || boardWinners[i]) continue;
    for (let j = 0; j < 9; j++) {
      if (!gameState[i][j]) moves.push({ i, j });
    }
  }
  if (moves.length === 0) return;
  const { i, j } = moves[Math.floor(Math.random() * moves.length)];
  gameState[i][j] = "O";

  const winner = checkWin(gameState[i]);
  if (winner) boardWinners[i] = winner;

  const gameWinner = checkWin(boardWinners);
  if (gameWinner) {
    showGameWinner(gameWinner);
  }

  currentPlayer = "X";
  activeBoard = isBoardFull(gameState[j]) || boardWinners[j] ? -1 : j;
  drawBoard();
}

function minimaxAIMove() {
  // Placeholder for real minimax
  randomAIMove();
}

drawBoard();
