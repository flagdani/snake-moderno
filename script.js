const gameContainer = document.getElementById('gameContainer');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'));
const finalScoreElement = document.getElementById('finalScore');
const playAgainButton = document.getElementById('playAgain');
const themeToggle = document.getElementById('themeToggle');

let containerSize;
const unit = 20;
let snake = [{x: 5, y: 5}];
let direction = {x: 1, y: 0};
let food = {};
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
highScoreElement.textContent = highScore;
let gameInterval;
let gameSpeed = 200;
let isPaused = false;
let isGameRunning = false;

function updateContainerSize() {
  const container = document.getElementById('gameContainer');
  const rect = container.getBoundingClientRect();
  containerSize = Math.floor(Math.min(rect.width, rect.height));
}

window.addEventListener('resize', () => {
  updateContainerSize();
  render();
});

function startGame() {
  if (isGameRunning) return;
  isGameRunning = true;
  isPaused = false;
  startButton.disabled = true;
  pauseButton.disabled = false;
  resetButton.disabled = false;
  direction = {x: 1, y: 0};
  snake = [{x: 5, y: 5}];
  score = 0;
  scoreElement.textContent = score;
  generateFood();
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, gameSpeed);
}

function pauseGame() {
  if (!isGameRunning) return;
  if (isPaused) {
    gameInterval = setInterval(gameLoop, gameSpeed);
    pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pausar';
    isPaused = false;
  } else {
    clearInterval(gameInterval);
    pauseButton.innerHTML = '<i class="fas fa-play"></i> Continuar';
    isPaused = true;
  }
}

function resetGame() {
  clearInterval(gameInterval);
  isGameRunning = false;
  isPaused = false;
  startButton.disabled = false;
  pauseButton.disabled = true;
  resetButton.disabled = true;
  pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pausar';
  gameContainer.innerHTML = '';
  score = 0;
  scoreElement.textContent = score;
  render();
}

function gameLoop() {
  const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

  // Ajuste na lógica de detecção de colisão
  const maxUnits = Math.floor(containerSize / unit) - 1;

  if (
    head.x < 0 ||
    head.x > maxUnits ||
    head.y < 0 ||
    head.y > maxUnits ||
    collision(head, snake)
  ) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = score;
    generateFood();
    if (score % 50 === 0 && gameSpeed > 50) {
      clearInterval(gameInterval);
      gameSpeed -= 20;
      gameInterval = setInterval(gameLoop, gameSpeed);
    }
  } else {
    snake.pop();
  }

  render();
}

function endGame() {
  clearInterval(gameInterval);
  isGameRunning = false;
  isPaused = false;
  pauseButton.disabled = true;
  startButton.disabled = false;
  resetButton.disabled = true;
  pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pausar';
  finalScoreElement.textContent = score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    highScoreElement.textContent = highScore;
  }
  gameOverModal.show();
}

function collision(head, snakeBody) {
  for (let segment of snakeBody) {
    if (head.x === segment.x && head.y === segment.y) {
      return true;
    }
  }
  return false;
}

function generateFood() {
  const maxUnits = Math.floor(containerSize / unit) - 1;
  food = {
    x: Math.floor(Math.random() * (maxUnits + 1)),
    y: Math.floor(Math.random() * (maxUnits + 1))
  };
  if (collision(food, snake)) {
    generateFood();
  }
}

function render() {
  gameContainer.innerHTML = '';

  snake.forEach((segment, index) => {
    const snakeElement = document.createElement('div');
    snakeElement.style.left = (segment.x * unit) + 'px';
    snakeElement.style.top = (segment.y * unit) + 'px';
    snakeElement.classList.add('snake');
    if (index === 0) {
      snakeElement.classList.add('head');
    }
    gameContainer.appendChild(snakeElement);
  });

  const foodElement = document.createElement('div');
  foodElement.style.left = (food.x * unit) + 'px';
  foodElement.style.top = (food.y * unit) + 'px';
  foodElement.classList.add('food');
  gameContainer.appendChild(foodElement);
}

document.addEventListener('keydown', event => {
  const key = event.key;
  switch(key) {
    case 'ArrowUp':
      if (direction.y === 0) {
        direction = {x: 0, y: -1};
      }
      event.preventDefault();
      break;
    case 'ArrowDown':
      if (direction.y === 0) {
        direction = {x: 0, y: 1};
      }
      event.preventDefault();
      break;
    case 'ArrowLeft':
      if (direction.x === 0) {
        direction = {x: -1, y: 0};
      }
      event.preventDefault();
      break;
    case 'ArrowRight':
      if (direction.x === 0) {
        direction = {x: 1, y: 0};
      }
      event.preventDefault();
      break;
    case ' ':
      pauseGame();
      event.preventDefault();
      break;
  }
});

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
resetButton.addEventListener('click', resetGame);
playAgainButton.addEventListener('click', () => {
  gameOverModal.hide();
  startGame();
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  if (document.body.classList.contains('light-mode')) {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
});

window.onload = () => {
  updateContainerSize();
  render();
};
