
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("start");

canvas.width = 500;
canvas.height = 350;

let player = { x: 250, y: 310 };
let bullets = [];
let enemies = [];
let score = 0;
let running = false;
let animation;

function drawPlayer() {
  ctx.fillStyle = "#00e5ff";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 20);
  ctx.lineTo(player.x - 20, player.y + 15);
  ctx.lineTo(player.x + 20, player.y + 15);
  ctx.closePath();
  ctx.fill();
}

function startGame() {
  cancelAnimationFrame(animation);

  score = 0;
  bullets = [];
  enemies = [];
  player.x = 250;
  running = true;

  gameLoop();
}

function shoot() {
  if (running) {
    bullets.push({
      x: player.x,
      y: player.y - 20
    });
  }
}

function moveLeft() {
  player.x = Math.max(20, player.x - 20);
}

function moveRight() {
  player.x = Math.min(480, player.x + 20);
}

function gameLoop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();

  ctx.fillStyle = "yellow";

  bullets.forEach((bullet, i) => {
    bullet.y -= 6;
    ctx.fillRect(bullet.x - 3, bullet.y, 6, 12);
  });

  bullets = bullets.filter(b => b.y > 0);

  if (Math.random() < 0.025) {
    enemies.push({
      x: Math.random() * 460 + 20,
      y: 0
    });
  }

  ctx.fillStyle = "red";

  enemies.forEach(enemy => {
    enemy.y += 2;
    ctx.fillRect(enemy.x - 12, enemy.y - 12, 24, 24);
  });

  enemies = enemies.filter(enemy => enemy.y < 350);

  bullets = bullets.filter(bullet => {
    const hit = enemies.some(enemy =>
      Math.abs(bullet.x - enemy.x) < 18 &&
      Math.abs(bullet.y - enemy.y) < 18
    );

    if (hit) score += 10;
    return !hit;
  });

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 25);

  animation = requestAnimationFrame(gameLoop);
}

startButton.addEventListener("click", startGame);

canvas.addEventListener("pointerdown", shoot);

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") moveLeft();
  if (event.key === "ArrowRight") moveRight();
  if (event.code === "Space") shoot();
});

// Mobile game controls
window.moveLeft = moveLeft;
window.moveRight = moveRight;
window.shoot = shoot;

