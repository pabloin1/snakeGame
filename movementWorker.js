var snakeBody = [];

self.onmessage = function (event) {
    var { snakeX, snakeY, velocityX, velocityY, blockSize } = event.data;

    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }

    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;

    self.postMessage({ snakeX, snakeY, snakeBody });
};
