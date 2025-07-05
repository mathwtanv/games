// ==== Global Variables ====
const board = document.getElementById("board");
const modeSelector = document.getElementById("game-mode");

let currentPlayer = "X";
let gameMode = "2p";
let activeBoard = -1; // -1 means any board is allowed
let gameState = Array(9).fill().map(() => Array(9).fill(null));

modeSelector.addEventListener("change", () => {
  gameMode = modeSelector.value;
  resetGame();
});

const restartBtn = document.getElementById("restart-button");
restartBtn.addEventListener("click", resetGame);

function resetGame() {
  currentPlayer = "X";
  activeBoard = -1;
  gameState = Array(9).fill().map(() => Array(9).fill(null));
  drawBoard();
}

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

      const isCellPlayable = !value && (activeBoard === -1 || activeBoard === i);

      if (isCellPlayable) {
        cell.onclick = () => {
          if (gameState[i][j]) return;

          gameState[i][j] = currentPlayer;
          currentPlayer = currentPlayer === "X" ? "O" : "X";

          if (isBoardFull(gameState[j])) {
            activeBoard = -1;
          } else {
            activeBoard = j;
          }

          drawBoard();

          if ((gameMode === "easy" || gameMode === "hard") && currentPlayer === "O") {
            setTimeout(() => aiMove(), 300);
          }
        };
      } else {
        cell.style.cursor = "not-allowed";
      }

      // ✅ Add full border by default
      cell.style.border = "1px solid #fdec51";

      // 🧠 Inner overlap prevention:
      const isLastColInSubBoard = (j + 1) % 3 === 0;
      const isLastRowInSubBoard = j >= 6;

      const isRightmostSubBoard = i % 3 === 2;
      const isBottomSubBoard = i >= 6;

      // ❌ Remove right border *only* if not in rightmost sub-board
      if (isLastColInSubBoard && !isRightmostSubBoard) {
        cell.style.borderRight = "none";
      }

      // ❌ Remove bottom border *only* if not in bottom row of sub-boards
      if (isLastRowInSubBoard && !isBottomSubBoard) {
        cell.style.borderBottom = "none";
      }

      subBoard.appendChild(cell);
    }

    board.appendChild(subBoard);
  }
}

function isBoardFull(cells) {
  return cells.every(cell => cell !== null);
}

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
    if (activeBoard !== -1 && i !== activeBoard) continue;
    for (let j = 0; j < 9; j++) {
      if (!gameState[i][j]) moves.push({ i, j });
    }
  }
  if (moves.length === 0) return;
  const { i, j } = moves[Math.floor(Math.random() * moves.length)];
  gameState[i][j] = "O";
  currentPlayer = "X";
  activeBoard = isBoardFull(gameState[j]) ? -1 : j;
  drawBoard();
}

function minimaxAIMove() {
  // Placeholder: real minimax to be added later
  randomAIMove();
}

drawBoard();
