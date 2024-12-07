const eatSound = new Audio("./assets/Efecto de sonido - Moneda de Mario (HD).mp3");
const gameOverSound = new Audio("./assets/mario-bros game over.mp3");
const backgroundMusic = document.getElementById("backgroundMusic");

function playBackgroundMusic() {
  if (backgroundMusic) {
    backgroundMusic.volume = 0.2;
    backgroundMusic.play();
  }
}

function pauseBackgroundMusic() {
  if (backgroundMusic) backgroundMusic.pause();
}

export { eatSound, gameOverSound, playBackgroundMusic, pauseBackgroundMusic };
