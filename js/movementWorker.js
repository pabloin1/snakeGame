var snakeBody = [];

self.onmessage = function (event) {
    var { snakeX, snakeY, velocityX, velocityY, blockSize, snakeBody: newSnakeBody } = event.data;

    // Actualizar el snakeBody desde el mensaje si es proporcionado
    if (newSnakeBody) {
        snakeBody = newSnakeBody;
    }

    // Actualizar la posición del cuerpo
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];  // Mover cada segmento al lugar del anterior
    }

    if (snakeBody.length > 0) {
        snakeBody[0] = [snakeX, snakeY];  // Actualizar la cabeza
    }

    // Mover la cabeza de la serpiente
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;

    self.postMessage({ snakeX, snakeY, snakeBody });
};
