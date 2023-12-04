document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetrisCanvas');
    const context = canvas.getContext('2d');

    const ROWS = 20;
    const COLUMNS = 10;
    const BLOCK_SIZE = 30;
    const EMPTY = 'white';

    let board = [];
    let score = 0;
    let level = 1;

    // Define las piezas del Tetris
    const tetrominoes = [
        { color: 'cyan', shape: [[1, 1, 1, 1]] },
        { color: 'blue', shape: [[1, 1, 1], [1]] },
        { color: 'orange', shape: [[1, 1, 1], [0, 0, 1]] },
        { color: 'yellow', shape: [[1, 1, 1], [1, 0]] },
        { color: 'green', shape: [[1, 1, 1], [0, 1]] },
        { color: 'purple', shape: [[1, 1], [1, 1]] },
        { color: 'red', shape: [[1, 1, 0], [0, 1, 1]] }
    ];

    let currentTetromino = generateRandomTetromino();
    let currentRow = 0;
    let currentCol = Math.floor(COLUMNS / 2) - Math.floor(currentTetromino.shape[0].length / 2);

    function generateRandomTetromino() {
        const randomIndex = Math.floor(Math.random() * tetrominoes.length);
        return { ...tetrominoes[randomIndex] };
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

    function drawScoreAndLevel() {
        context.fillStyle = 'black';
        context.font = '20px Arial';
        context.fillText(`Puntos: ${score}`, 10, 30);
        context.fillText(`Nivel: ${level}`, 10, 60);
    }

    function drawTetromino() {
        currentTetromino.shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    drawSquare(currentCol + colIndex, currentRow + rowIndex, currentTetromino.color);
                }
            });
        });
    }

    function collision() {
        for (let rowIndex = 0; rowIndex < currentTetromino.shape.length; rowIndex++) {
            for (let colIndex = 0; colIndex < currentTetromino.shape[rowIndex].length; colIndex++) {
                if (
                    currentTetromino.shape[rowIndex][colIndex] &&
                    (board[currentRow + rowIndex] && board[currentRow + rowIndex][currentCol + colIndex]) !== EMPTY
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    function mergeTetromino() {
        currentTetromino.shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    board[currentRow + rowIndex][currentCol + colIndex] = currentTetromino.color;
                }
            });
        });
    }

    function checkRowFilled(row) {
        return board[row].every((cell) => cell !== EMPTY);
    }

    function removeFilledRows() {
        let rowsToRemove = [];
        for (let row = 0; row < ROWS; row++) {
            if (checkRowFilled(row)) {
                rowsToRemove.push(row);
            }
        }

        rowsToRemove.forEach((row) => {
            board.splice(row, 1);
            board.unshift(new Array(COLUMNS).fill(EMPTY));
        });

        score += rowsToRemove.length * 100;
        level = Math.floor(score / 500) + 1;
    }

    function rotateTetromino() {
        const originalShape = currentTetromino.shape;
        const rotatedShape = [];

        for (let colIndex = 0; colIndex < originalShape[0].length; colIndex++) {
            const newRow = originalShape.map((row) => row[colIndex]).reverse();
            rotatedShape.push(newRow);
        }

        currentTetromino.shape = rotatedShape;

        if (collision()) {
            currentTetromino.shape = originalShape;
        }
    }

    function moveTetrominoDown() {
        currentRow++;
        if (collision()) {
            currentRow--;
            mergeTetromino();
            removeFilledRows();
            currentTetromino = generateRandomTetromino();
            currentCol = Math.floor(COLUMNS / 2) - Math.floor(currentTetromino.shape[0].length / 2);
            if (collision()) {
                // Game over
                alert('Game Over');
                resetGame();
            }
        }
    }

    function moveTetrominoLeft() {
        currentCol--;
        if (collision()) {
            currentCol++;
        }
    }

    function moveTetrominoRight() {
        currentCol++;
        if (collision()) {
            currentCol--;
        }
    }

    function resetGame() {
        board = new Array(ROWS).fill(0).map(() => new Array(COLUMNS).fill(EMPTY));
        score = 0;
        level = 1;
    }

    function handleKeyPress(event) {
        switch (event.key) {
            case 'ArrowUp':
                rotateTetromino();
                break;
            case 'ArrowDown':
                moveTetrominoDown();
                break;
            case 'ArrowLeft':
                moveTetrominoLeft();
                break;
            case 'ArrowRight':
                moveTetrominoRight();
                break;
        }
    }

    document.addEventListener('keydown', handleKeyPress);

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBoard();
        drawTetromino();
        drawScoreAndLevel();
        moveTetrominoDown();
        requestAnimationFrame(draw);
    }

    draw();
});
