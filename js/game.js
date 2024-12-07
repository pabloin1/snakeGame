import { drawFood, drawSnake } from "./draw.js";
import { eatSound, gameOverSound, playBackgroundMusic, pauseBackgroundMusic } from "./audio.js";

const blockSize = 25;
const rows = 20;
const cols = 20;

let snakeX = blockSize * 5;
let snakeY = blockSize * 5;
let velocityX = 0;
let velocityY = 0;
let snakeBody = [];
let foodX;
let foodY;
let gameOver = false;
let score = 0;
let updateInterval = 100;
let gameInterval;

const board = document.getElementById("board");
const context = board.getContext("2d");

const movementWorker = new Worker("./js/movementWorker.js");
const collisionWorker = new Worker("./js/collisionWorker.js");
const foodWorker = new Worker("./js/foodWorker.js");

function initializeGame() {
  board.height = rows * blockSize;
  board.width = cols * blockSize;

  playBackgroundMusic();
  placeFood();
  gameInterval = setInterval(update, updateInterval);

  movementWorker.onmessage = handleMovementWorkerMessage;
  collisionWorker.onmessage = handleCollisionWorkerMessage;
  foodWorker.onmessage = handleFoodWorkerMessage;
}

function update() {
  if (gameOver) return;

  context.fillStyle = "black";
  context.fillRect(0, 0, board.width, board.height);

  drawFood(context, foodX, foodY, blockSize);
  drawSnake(context, snakeX, snakeY, snakeBody, blockSize);

  movementWorker.postMessage({
    snakeX,
    snakeY,
    velocityX,
    velocityY,
    blockSize,
    snakeBody,
  });
}

function handleMovementWorkerMessage(event) {
  const data = event.data;
  snakeX = data.snakeX;
  snakeY = data.snakeY;
  snakeBody = data.snakeBody;

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

  if (collisionData.eatFood) eatSound.play();
  if (collisionData.gameOver) {
    gameOverSound.play();
    gameOver = true;
    clearInterval(gameInterval);
    pauseBackgroundMusic();
    document.getElementById("gameOverModal").style.display = "block";
  }

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

function placeFood() {
  foodWorker.postMessage({ cols, rows, blockSize });
}

export { initializeGame, velocityX, velocityY, snakeBody, blockSize, placeFood };
