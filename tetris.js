document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetrisCanvas');
    const context = canvas.getContext('2d');

    const ROWS = 20;
    const COLUMNS = 10;
    const BLOCK_SIZE = 30;
    const EMPTY = 'white';
    const PIECE_COLORS = ['#FFD700', '#FF6347', '#00CED1', '#228B22', '#8A2BE2', '#FF4500', '#7CFC00'];

    const pieces = [
        [[1, 1, 1, 1]],         // I
        [[1, 1, 1], [1]],       // J
        [[1, 1, 1], [0, 0, 1]], // L
        [[1, 1, 1], [1, 0, 0]], // O
        [[1, 1], [1, 1]],       // S
        [[1, 1, 1], [0, 1]],    // T
        [[1, 1, 0], [0, 1, 1]]  // Z
    ];

    let board = [];
    let currentPiece, currentPieceColor, currentPieceRow, currentPieceCol;
    let score = 0;
    let level = 1;
    let gameSpeed = 500; // Tiempo en milisegundos entre caídas de piezas
    let gameInterval;

    function initBoard() {
        for (let row = 0; row < ROWS; row++) {
            board[row] = [];
            for (let col = 0; col < COLUMNS; col++) {
                board[row][col] = EMPTY;
            }
        }
    }

    function drawSquare(x, y, color) {
        context.fillStyle = color;
        context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        context.strokeStyle = 'black';
        context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }

    function drawBoard() {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLUMNS; col++) {
                drawSquare(col, row, board[row][col]);
            }
        }
    }

    function drawPiece() {
        for (let row = 0; row < currentPiece.length; row++) {
            for (let col = 0; col < currentPiece[row].length; col++) {
                if (currentPiece[row][col]) {
                    drawSquare(currentPieceCol + col, currentPieceRow + row, currentPieceColor);
                }
            }
        }
    }

    function clearPiece() {
        for (let row = 0; row < currentPiece.length; row++) {
            for (let col = 0; col < currentPiece[row].length; col++) {
                if (currentPiece[row][col]) {
                    drawSquare(currentPieceCol + col, currentPieceRow + row, EMPTY);
                }
            }
        }
    }

    function canMoveTo(row, col, piece) {
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                if (piece[i][j] && (board[row + i] && board[row + i][col + j]) !== EMPTY) {
                    return false;
                }
            }
        }
        return true;
    }

    function moveDown() {
        if (canMoveTo(currentPieceRow + 1, currentPieceCol, currentPiece)) {
            clearPiece();
            currentPieceRow++;
            drawPiece();
        } else {
            placePiece();
        }
    }

    function moveLeft() {
        if (canMoveTo(currentPieceRow, currentPieceCol - 1, currentPiece)) {
            clearPiece();
            currentPieceCol--;
            drawPiece();
        }
    }

    function moveRight() {
        if (canMoveTo(currentPieceRow, currentPieceCol + 1, currentPiece)) {
            clearPiece();
            currentPieceCol++;
            drawPiece();
        }
    }

    function rotatePiece() {
        const newPiece = currentPiece[0].map((_, i) => currentPiece.map(row => row[i])).reverse();
        if (canMoveTo(currentPieceRow, currentPieceCol, newPiece)) {
            clearPiece();
            currentPiece = newPiece;
            drawPiece();
        }
    }

    function placePiece() {
        for (let i = 0; i < currentPiece.length; i++) {
            for (let j = 0; j < currentPiece[i].length; j++) {
                if (currentPiece[i][j]) {
                    board[currentPieceRow + i][currentPieceCol + j] = currentPieceColor;
                }
            }
        }

        clearLines();
        spawnPiece();
    }

    function clearLines() {
        let linesCleared = 0;
        for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row].every(cell => cell !== EMPTY)) {
                board.splice(row, 1);
                board.unshift(new Array(COLUMNS).fill(EMPTY));
                linesCleared++;
            }
        }

        updateScore(linesCleared);
        updateLevel();
    }

    function updateScore(linesCleared) {
        const linePoints = [0, 40, 100, 300, 1200]; // Puntos por líneas completadas
        score += linePoints[linesCleared] * level;
        document.getElementById('score').innerText = `Puntos: ${score}`;
    }

    function updateLevel() {
        level = Math.floor(score / 1000) + 1;
        document.getElementById('level').innerText = `Nivel: ${level}`;
        updateGameSpeed();
    }

    function updateGameSpeed() {
        // Ajusta la velocidad del juego según el nivel
        gameSpeed = 500 - (level - 1) * 50;
        clearInterval(gameInterval);
        gameInterval = setInterval(moveDown, gameSpeed);
    }

    function spawnPiece() {
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        const randomColor = PIECE_COLORS[Math.floor(Math.random() * PIECE_COLORS.length)];

        currentPiece = randomPiece;
        currentPieceColor = randomColor;
        currentPieceRow = 0;
        currentPieceCol = Math.floor((COLUMNS - currentPiece[0].length) / 2);

        if (!canMoveTo(currentPieceRow, currentPieceCol, currentPiece)) {
            // Fin del juego
            gameOver();
        } else {
            drawPiece();
        }
    }

    function gameOver() {
        clearInterval(gameInterval);
        alert(`¡Fin del juego! Puntuación final: ${score}`);
        initBoard();
        score = 0;
        level = 1;
        updateScore(0);
        updateLevel();
        spawnPiece();
        gameInterval = setInterval(moveDown, gameSpeed);
    }

    function init() {
        initBoard();
        drawBoard();
        spawnPiece();
        gameInterval = setInterval(moveDown, gameSpeed);

        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    rotatePiece();
                    break;
                case 'ArrowDown':
                    moveDown();
                    break;
                case 'ArrowLeft':
                    moveLeft();
                    break;
                case 'ArrowRight':
                    moveRight();
                    break;
            }
        });
    }

    init();
});
