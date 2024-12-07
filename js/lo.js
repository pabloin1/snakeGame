import { initializeGame } from "./game.js";
import { changeDirection, resetGame } from "./events.js";

window.onload = initializeGame;
document.addEventListener("keyup", changeDirection);
document.getElementById("restartButton").onclick = resetGame;
