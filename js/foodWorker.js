self.onmessage = function (event) {
    const { cols, rows, blockSize } = event.data;
    const foodX = Math.floor(Math.random() * cols) * blockSize;
    const foodY = Math.floor(Math.random() * rows) * blockSize;

    self.postMessage({ foodX, foodY });
};
