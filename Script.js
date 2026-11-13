
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 350;

let player = { x: 230, y: 290, size: 25 };
let bullets = [];
let enemies = [];
let score = 0;
let running = false;

function startGame() {
  score = 0;
  bullets = [];
  enemies = [];
  player.x = 230;
  running = true;
  gameLoop();
}

function drawPlayer() {
  ctx.fillStyle = "#00e5ff";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 20);
  ctx.lineTo(player.x - 20, player.y + 20);
  ctx.lineTo(player.x + 20, player.y + 20);
  ctx.closePath();
  ctx.fill();
}

function shoot() {
  if (running) {
    bullets.push({ x: player.x, y: player.y - 20 });
  }
}

function gameLoop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();

  ctx.fillStyle = "yellow";
  bullets.forEach((b, i) => {
    b.y -= 5;
    ctx.fillRect(b.x - 3, b.y, 6, 12);
    if (b.y < 0) bullets.splice(i, 1);
  });

  if (Math.random() < 0.025) {
    enemies.push({
      x: Math.random() * 460 + 20,
      y: 0
    });
  }

  ctx.fillStyle = "red";
  enemies.forEach((e, i) => {
    e.y += 2;
    ctx.fillRect(e.x - 12, e.y - 12, 24, 24);

    bullets.forEach((b, j) => {
      if (Math.abs(b.x - e.x) < 18 &&
          Math.abs(b.y - e.y) < 18) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
      }
    });

    if (e.y > canvas.height) enemies.splice(i, 1);
  });

  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Score: " + score, 10, 25);

  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && player.x > 25)
    player.x -= 15;
  if (e.key === "ArrowRight" && player.x < 475)
    player.x += 15;
  if (e.code === "Space") shoot();
});

canvas.addEventListener("touchstart", shoot);
canvas.addEventListener("click", shoot);

document.querySelector("button").addEventListener("click", startGame);
    
