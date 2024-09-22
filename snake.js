// Variables del juego
var blockSize = 25;
var rows = 20;
var cols = 20;
var board;
var context;

var snakeX = blockSize * 5;
var snakeY = blockSize * 5;
var velocityX = 0;
var velocityY = 0;
var snakeBody = [];

var foodX;
var foodY;

var gameOver = false;
var score = 0;

// Inicialización de los Web Workers
var movementWorker = new Worker("movementWorker.js");
var collisionWorker = new Worker("collisionWorker.js");
var foodWorker = new Worker("foodWorker.js");

window.onload = function () {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    context = board.getContext("2d");

    placeFood();  // Generar la comida inicial
    document.addEventListener("keyup", changeDirection);

    // Asignar los manejadores de mensajes para los workers
    movementWorker.onmessage = handleMovementWorkerMessage;
    collisionWorker.onmessage = handleCollisionWorkerMessage;
    foodWorker.onmessage = handleFoodWorkerMessage;

    // Actualizar el estado del juego cada 100 milisegundos
    setInterval(update, 1000 / 10);
};

function update() {
    if (gameOver) return;

    // Limpiar el canvas
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);

    // Dibujar la comida
    context.fillStyle = "red";
    context.fillRect(foodX, foodY, blockSize, blockSize);

    // Enviar el estado actual al movementWorker
    movementWorker.postMessage({ snakeX, snakeY, velocityX, velocityY, blockSize });
}

function handleMovementWorkerMessage(event) {
    var data = event.data;
    snakeX = data.snakeX;
    snakeY = data.snakeY;
    snakeBody = data.snakeBody;

    // Dibujar la serpiente
    context.fillStyle = "lime";
    context.fillRect(snakeX, snakeY, blockSize, blockSize);
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    // Enviar la posición de la serpiente y la comida al collisionWorker
    collisionWorker.postMessage({
        snakeX, snakeY, snakeBody, cols, rows, blockSize,
        foodX, foodY
    });
}

function handleCollisionWorkerMessage(event) {
    var collisionData = event.data;

    // Verificar si el juego terminó
    if (collisionData.gameOver) {
        gameOver = true;
        alert("Game Over! Score: " + score);
    } 

    // Verificar si la serpiente comió la comida
    if (collisionData.eatFood) {
        snakeBody.push([foodX, foodY]);  // Extender el cuerpo de la serpiente
        score++;  // Incrementar el puntaje

        // Generar una nueva comida
        foodWorker.postMessage({ cols: cols, rows: rows, blockSize: blockSize });
    }
}

function handleFoodWorkerMessage(event) {
    var foodData = event.data;
    foodX = foodData.foodX;
    foodY = foodData.foodY;
}

// Controlar la dirección de la serpiente
function changeDirection(e) {
    if (e.code == "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.code == "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.code == "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.code == "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}
//add functional work

// Inicializar la comida al principio del juego
function placeFood() {
    foodWorker.postMessage({ cols: cols, rows: rows, blockSize: blockSize });
}
