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
var updateInterval = 100; // Intervalo de actualización inicial (100 ms)
var gameInterval;

var eatSound = new Audio("./assets/Efecto de sonido - Moneda de Mario (HD).mp3");
var gameOverSound = new Audio("./assets/mario-bros game over.mp3");


// Elementos del modal
var modal = document.getElementById("gameOverModal");
var finalScoreElement = document.getElementById("finalScore");
var restartButton = document.getElementById("restartButton");
var closeModal = document.getElementById("closeModal");

// Inicialización de los Web Workers
var movementWorker = new Worker("./js/movementWorker.js");
var collisionWorker = new Worker("./js/collisionWorker.js");
var foodWorker = new Worker("./js/foodWorker.js");

window.onload = function () {
  // Obtener el audio y configurarlo
  var backgroundMusic = document.getElementById("backgroundMusic");

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
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};

function update() {
  if (gameOver) return;

  // Limpiar el canvas
  context.fillStyle = "black";
  context.fillRect(0, 0, board.width, board.height);

  // Dibujar la comida con un diseño más atractivo
  drawFood();

  // Dibujar la serpiente con sombra y color degradado
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
    let gradient = context.createLinearGradient(0, 0, blockSize, blockSize);
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
  var collisionData = event.data;

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
    var backgroundMusic = document.getElementById("backgroundMusic");
    if (backgroundMusic) {
      backgroundMusic.pause(); // Pausar la música al terminar el juego
    }

    var finalScoreElement = document.getElementById("finalScore");
    finalScoreElement.innerText = score;

    var modal = document.getElementById("gameOverModal");
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
    foodWorker.postMessage({ cols: cols, rows: rows, blockSize: blockSize });
  }
}

function handleFoodWorkerMessage(event) {
  var foodData = event.data;
  foodX = foodData.foodX;
  foodY = foodData.foodY;
}

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

// Inicializar la comida al principio del juego
function placeFood() {
  foodWorker.postMessage({ cols: cols, rows: rows, blockSize: blockSize });
}

// Reiniciar el juego cuando el jugador pierda
function resetGame() {
  var modal = document.getElementById("gameOverModal");
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
  var backgroundMusic = document.getElementById("backgroundMusic");
  if (backgroundMusic) {
    backgroundMusic.currentTime = 0; // Reiniciar la música desde el principio
    backgroundMusic.play();
  }
}