//collisionWorker.js
self.onmessage = function (event) {
    const { snakeX, snakeY, snakeBody, cols, rows, blockSize, foodX, foodY } = event.data;

    let gameOver = false;
    let eatFood = false;

    // Colisión con bordes
    if (snakeX < 0 || snakeX >= cols * blockSize || snakeY < 0 || snakeY >= rows * blockSize) {
        gameOver = true;
    }

    // Colisión con el propio cuerpo
    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
            gameOver = true;
        }
    }

    // Comprobación de si la serpiente come la comida
    if (snakeX === foodX && snakeY === foodY) {
        eatFood = true;
    }

    // Enviar el estado del juego y si comió la comida
    self.postMessage({ gameOver, eatFood });
};
