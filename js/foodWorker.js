self.onmessage = function (event) {
    var { cols, rows, blockSize } = event.data;
    var foodX = Math.floor(Math.random() * cols) * blockSize;
    var foodY = Math.floor(Math.random() * rows) * blockSize;

    self.postMessage({ foodX, foodY });
};
