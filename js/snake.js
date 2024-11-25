// Variables del juego
const blockSize = 25; // Tamaño del bloque
const rows = 20; // Número de filas
const cols = 20; // Número de columnas
let board;
let context;

let snakeX = blockSize * 5;
let snakeY = blockSize * 5;
let velocityX = 0;
let velocityY = 0;
let snakeBody = [];

let foodX;
let foodY;

let gameOver = false;
let score = 0;
let updateInterval = 100; // Intervalo de actualización inicial (100 ms)
let gameInterval;

const eatSound = new Audio("./assets/Efecto de sonido - Moneda de Mario (HD).mp3");
const gameOverSound = new Audio("./assets/mario-bros game over.mp3");

// Elementos del modal
const modal = document.getElementById("gameOverModal");
const finalScoreElement = document.getElementById("finalScore");
const restartButton = document.getElementById("restartButton");
const closeModal = document.getElementById("closeModal");

// Inicialización de los Web Workers
const movementWorker = new Worker("./js/movementWorker.js");
const collisionWorker = new Worker("./js/collisionWorker.js");
const foodWorker = new Worker("./js/foodWorker.js");

window.onload = function () {
  // Obtener el audio y configurarlo
  const backgroundMusic = document.getElementById("backgroundMusic");

  if (backgroundMusic) {
    backgroundMusic.volume = 0.2; // Ajustar el volumen (0.0 a 1.0)
    backgroundMusic.play(); // Iniciar la música de fondo
  } else {
    console.error("No se pudo encontrar el elemento #backgroundMusic.");
  }

  // Código existente para inicializar el juego
  board = document.getElementById("board");
  board.height = rows * blockSize;
  board.width = cols * blockSize;
  context = board.getContext("2d");

  placeFood(); // Generar la comida inicial
  document.addEventListener("keyup", changeDirection);

  movementWorker.onmessage = handleMovementWorkerMessage;
  collisionWorker.onmessage = handleCollisionWorkerMessage;
  foodWorker.onmessage = handleFoodWorkerMessage;

  gameInterval = setInterval(update, updateInterval);

  restartButton.onclick = resetGame;

  closeModal.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
};

function update() {
  if (gameOver) return;

  // Limpiar el canvas
  context.fillStyle = "black";
  context.fillRect(0, 0, board.width, board.height);

  // Dibujar la comida
  drawFood();

  // Dibujar la serpiente
  drawSnake();

  // Enviar el estado actual al movementWorker
  movementWorker.postMessage({
    snakeX,
    snakeY,
    velocityX,
    velocityY,
    blockSize,
    snakeBody,
  });
}

function drawFood() {
  context.beginPath();
  context.arc(
    foodX + blockSize / 2,
    foodY + blockSize / 2,
    blockSize / 2,
    0,
    Math.PI * 2
  );
  context.fillStyle = "#ff6347"; // Color tomate para la comida
  context.fill();

  // Sombra o brillo en la comida
  context.shadowBlur = 10;
  context.shadowColor = "white";

  context.strokeStyle = "#f0e68c"; // Borde amarillo claro
  context.lineWidth = 2;
  context.stroke();

  context.shadowBlur = 0; // Eliminar la sombra después de dibujar la comida
}

function drawSnake() {
  for (let i = 0; i < snakeBody.length; i++) {
    const gradient = context.createLinearGradient(0, 0, blockSize, blockSize);
    gradient.addColorStop(0, "#00FF00"); // Verde claro
    gradient.addColorStop(1, "#006400"); // Verde oscuro

    // Dibujar el cuerpo de la serpiente con un degradado
    context.fillStyle = gradient;
    context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);

    // Sombra en cada segmento de la serpiente
    context.shadowBlur = 10;
    context.shadowColor = "rgba(0, 255, 0, 0.6)";
    context.strokeStyle = "#003300"; // Borde verde oscuro
    context.lineWidth = 2;
    context.strokeRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
  }

  // Dibujar la cabeza de la serpiente de forma diferente
  context.fillStyle = "lime";
  context.fillRect(snakeX, snakeY, blockSize, blockSize);
  context.shadowBlur = 15;
  context.shadowColor = "rgba(0, 255, 0, 0.8)";
  context.strokeStyle = "#003300";
  context.strokeRect(snakeX, snakeY, blockSize, blockSize);
}

function handleMovementWorkerMessage(event) {
  const data = event.data;
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
    snakeX,
    snakeY,
    snakeBody,
    cols,
    rows,
    blockSize,
    foodX,
    foodY,
  });
}

function handleCollisionWorkerMessage(event) {
  const collisionData = event.data;

  if (collisionData.eatFood) {
    eatSound.play(); // Reproducir sonido cuando come
  }

  if (collisionData.gameOver) {
    gameOverSound.play(); // Reproducir sonido al perder
  }

  if (collisionData.gameOver) {
    gameOver = true;
    clearInterval(gameInterval); // Detener el juego

    // Pausar la música de fondo
    const backgroundMusic = document.getElementById("backgroundMusic");
    if (backgroundMusic) {
      backgroundMusic.pause(); // Pausar la música al terminar el juego
    }

    finalScoreElement.innerText = score;

    modal.style.display = "block";

    return;
  }

  // Comprobar si comió comida
  if (collisionData.eatFood) {
    snakeBody.push([snakeX, snakeY]);
    score++;
    updateInterval = Math.max(50, 100 - score * 5);
    clearInterval(gameInterval);
    gameInterval = setInterval(update, updateInterval);
    foodWorker.postMessage({ cols, rows, blockSize });
  }
}

function handleFoodWorkerMessage(event) {
  const foodData = event.data;
  foodX = foodData.foodX;
  foodY = foodData.foodY;
}

function changeDirection(e) {
  if (e.code === "ArrowUp" && velocityY !== 1) {
    velocityX = 0;
    velocityY = -1;
  } else if (e.code === "ArrowDown" && velocityY !== -1) {
    velocityX = 0;
    velocityY = 1;
  } else if (e.code === "ArrowLeft" && velocityX !== 1) {
    velocityX = -1;
    velocityY = 0;
  } else if (e.code === "ArrowRight" && velocityX !== -1) {
    velocityX = 1;
    velocityY = 0;
  }
}

// Inicializar la comida al principio del juego
function placeFood() {
  foodWorker.postMessage({ cols, rows, blockSize });
}

// Reiniciar el juego cuando el jugador pierda
function resetGame() {
  modal.style.display = "none";

  snakeX = blockSize * 5;
  snakeY = blockSize * 5;
  velocityX = 0;
  velocityY = 0;
  snakeBody = [];
  score = 0;
  gameOver = false;

  placeFood();
  clearInterval(gameInterval);
  gameInterval = setInterval(update, updateInterval);

  // Reproducir la música nuevamente al reiniciar el juego
  const backgroundMusic = document.getElementById("backgroundMusic");
  if (backgroundMusic) {
    backgroundMusic.currentTime = 0; // Reiniciar la música desde el principio
    backgroundMusic.play();
  }
}
