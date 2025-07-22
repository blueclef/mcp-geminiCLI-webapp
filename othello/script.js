const boardElement = document.getElementById('board');
const blackScoreSpan = document.getElementById('black-score');
const whiteScoreSpan = document.getElementById('white-score');
const currentTurnSpan = document.getElementById('current-turn');

let board = [];
let currentPlayer = 'black'; // 'black' or 'white'

function initializeBoard() {
    board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Initial stones
    board[3][3] = 'white';
    board[3][4] = 'black';
    board[4][3] = 'black';
    board[4][4] = 'white';

    renderBoard();
    updateScores();
    updateTurnDisplay();
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => handleCellClick(r, c));

            if (board[r][c]) {
                const stone = document.createElement('div');
                stone.classList.add('stone', board[r][c]);
                cell.appendChild(stone);
            }
            boardElement.appendChild(cell);
        }
    }
}

function updateScores() {
    let blackCount = 0;
    let whiteCount = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === 'black') {
                blackCount++;
            } else if (board[r][c] === 'white') {
                whiteCount++;
            }
        }
    }
    blackScoreSpan.textContent = blackCount;
    whiteScoreSpan.textContent = whiteCount;
}

function updateTurnDisplay() {
    currentTurnSpan.textContent = `현재 턴: ${currentPlayer === 'black' ? '흑돌' : '백돌'}`;
}

function isValidMove(row, col, player) {
    if (board[row][col] !== null) return false; // Cell must be empty

    const opponent = player === 'black' ? 'white' : 'black';
    let isValid = false;

    // Check all 8 directions
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue; // Skip current cell

            let r = row + dr;
            let c = col + dc;
            let foundOpponent = false;

            while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
                foundOpponent = true;
                r += dr;
                c += dc;
            }

            if (foundOpponent && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) {
                isValid = true;
                break; // Found a valid line in this direction
            }
        }
        if (isValid) break;
    }
    return isValid;
}

function flipStones(row, col, player) {
    const opponent = player === 'black' ? 'white' : 'black';
    const flippedStones = [];

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;

            let r = row + dr;
            let c = col + dc;
            const stonesToFlipInDirection = [];

            while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
                stonesToFlipInDirection.push({ r, c });
                r += dr;
                c += dc;
            }

            if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) {
                flippedStones.push(...stonesToFlipInDirection);
            }
        }
    }

    flippedStones.forEach(pos => {
        board[pos.r][pos.c] = player;
    });
}

function handleCellClick(row, col) {
    if (!isValidMove(row, col, currentPlayer)) {
        console.log('Invalid move!');
        return;
    }

    board[row][col] = currentPlayer; // Place the stone
    flipStones(row, col, currentPlayer); // Flip opponent's stones

    renderBoard();
    updateScores();

    // Switch turn
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    updateTurnDisplay();

    // Check for game over or pass turn
    if (!hasValidMoves(currentPlayer)) {
        console.log(`${currentPlayer === 'black' ? '흑돌' : '백돌'}이 둘 곳이 없습니다. 턴을 넘깁니다.`);
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black'; // Pass turn
        updateTurnDisplay();
        if (!hasValidMoves(currentPlayer)) {
            console.log('양쪽 모두 둘 곳이 없습니다. 게임 종료!');
            endGame();
        }
    }
}

function hasValidMoves(player) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (isValidMove(r, c, player)) {
                return true;
            }
        }
    }
    return false;
}

function endGame() {
    let blackCount = parseInt(blackScoreSpan.textContent);
    let whiteCount = parseInt(whiteScoreSpan.textContent);
    let winner = '';

    if (blackCount > whiteCount) {
        winner = '흑돌 승리!';
    } else if (whiteCount > blackCount) {
        winner = '백돌 승리!';
    } else {
        winner = '무승부!';
    }
    alert(`게임 종료! ${winner}`);
}

initializeBoard();