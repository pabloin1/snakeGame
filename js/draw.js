function drawFood(context, foodX, foodY, blockSize) {
    context.beginPath();
    context.arc(foodX + blockSize / 2, foodY + blockSize / 2, blockSize / 2, 0, Math.PI * 2);
    context.fillStyle = "#ff6347";
    context.fill();
    context.shadowBlur = 10;
    context.shadowColor = "white";
    context.strokeStyle = "#f0e68c";
    context.lineWidth = 2;
    context.stroke();
    context.shadowBlur = 0;
  }
  
  function drawSnake(context, snakeX, snakeY, snakeBody, blockSize) {
    snakeBody.forEach(([x, y]) => {
      context.fillStyle = "lime";
      context.fillRect(x, y, blockSize, blockSize);
    });
    context.fillStyle = "lime";
    context.fillRect(snakeX, snakeY, blockSize, blockSize);
  }
  
  export { drawFood, drawSnake };
  