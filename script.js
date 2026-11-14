
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("start");

canvas.width = 500;
canvas.height = 350;

let player = { x: 250, y: 310, lives: 3 };
let bullets = [];
let enemies = [];
let boss = null;
let score = 0;
let level = 1;
let running = false;

let held = {
  left: false,
  right: false,
  up: false,
  down: false,
  fire: false
};

let lastShot = 0;
let bossLevel = 0;

function drawPlayer() {
  ctx.fillStyle = "#00e5ff";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y - 20);
  ctx.lineTo(player.x - 20, player.y + 15);
  ctx.lineTo(player.x + 20, player.y + 15);
  ctx.closePath();
  ctx.fill();
}

function drawHUD() {
  ctx.fillStyle = "white";
  ctx.font = "15px Arial";
  ctx.fillText("Score: " + score, 10, 22);
  ctx.fillText("Level: " + level, 210, 22);

  ctx.fillText("LIVES", 380, 22);

  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < player.lives ? "#00ff66" : "#555";
    ctx.fillRect(380 + i * 32, 30, 25, 10);
  }

  if (boss) {
    ctx.fillStyle = "white";
    ctx.fillText("BOSS HEALTH", 180, 50);
    ctx.fillStyle = "red";
    ctx.fillRect(180, 58, 140, 10);
    ctx.fillStyle = "#00ff66";
    ctx.fillRect(180, 58, 140 * boss.hp / boss.maxHp, 10);
  }
}

function startGame() {
  player = { x: 250, y: 310, lives: 3 };
  bullets = [];
  enemies = [];
  boss = null;
  score = 0;
  level = 1;
  bossLevel = 0;
  running = true;

  held.left = false;
  held.right = false;
  held.up = false;
  held.down = false;
  held.fire = false;

  gameLoop();
}

function shoot() {
  if (!running) return;

  bullets.push({
    x: player.x,
    y: player.y - 20
  });
}

function updateControls() {
  if (held.left) player.x -= 4;
  if (held.right) player.x += 4;
  if (held.up) player.y -= 4;
  if (held.down) player.y += 4;

  player.x = Math.max(20, Math.min(480, player.x));
  player.y = Math.max(25, Math.min(330, player.y));

  if (held.fire && Date.now() - lastShot > 250) {
    shoot();
    lastShot = Date.now();
  }
}

function createBoss() {
  boss = {
    x: 250,
    y: 65,
    hp: 25 + level * 5,
    maxHp: 25 + level * 5,
    direction: 1
  };
}

function gameLoop() {
  if (!running) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateControls();
  drawPlayer();

  // Move and draw bullets
  bullets.forEach(b => {
    b.y -= 7;
    ctx.fillStyle = "yellow";
    ctx.fillRect(b.x - 3, b.y, 6, 12);
  });

  bullets = bullets.filter(b => b.y > 0);

  // Increase level every 100 points
  const newLevel = Math.floor(score / 100) + 1;

  if (newLevel > level) {
    level = newLevel;
  }

  // Spawn a boss every fifth level
  if (level % 5 === 0 && bossLevel !== level) {
    bossLevel = level;
    createBoss();
    enemies = [];
  }

  // Spawn normal enemies when there is no boss
  if (!boss && Math.random() < 0.025 + level * 0.002) {
    enemies.push({
      x: Math.random() * 460 + 20,
      y: 0
    });
  }

  // Move normal enemies
  enemies.forEach(enemy => {
    enemy.y += 1.5 + level * 0.2;

    ctx.fillStyle = "red";
    ctx.fillRect(enemy.x - 12, enemy.y - 12, 24, 24);

    // Enemy hits the player
    if (
      Math.abs(enemy.x - player.x) < 25 &&
      Math.abs(enemy.y - player.y) < 25
    ) {
      enemy.y = 400;
      player.lives--;
    }

    // Enemy reaches the bottom
    if (enemy.y > 350) {
      enemy.y = 400;
      player.lives--;
    }
  });

  enemies = enemies.filter(enemy => enemy.y < 350);

  // Bullets destroy normal enemies
  bullets = bullets.filter(bullet => {
    const hitIndex = enemies.findIndex(enemy =>
      Math.abs(bullet.x - enemy.x) < 18 &&
      Math.abs(bullet.y - enemy.y) < 18
    );

    if (hitIndex !== -1) {
      enemies.splice(hitIndex, 1);
      score += 10;
      return false;
    }

    return true;
  });

  // Boss movement and health
  if (boss) {
    boss.x += 2 * boss.direction;

    if (boss.x > 440 || boss.x < 60) {
      boss.direction *= -1;
    }

    ctx.fillStyle = "#a000ff";
    ctx.fillRect(boss.x - 35, boss.y - 25, 70, 50);

    bullets = bullets.filter(bullet => {
      const hit =
        Math.abs(bullet.x - boss.x) < 40 &&
        Math.abs(bullet.y - boss.y) < 30;

      if (hit) {
        boss.hp--;
        score += 10;

        if (boss.hp <= 0) {
          boss = null;
          score += 100;
        }

        return false;
      }

      return true;
    });
  }

  drawHUD();

  if (player.lives <= 0) {
    running = false;
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("GAME OVER", 155, 180);
    ctx.font = "17px Arial";
    ctx.fillText("Press START GAME to try again", 115, 210);
    return;
  }

  requestAnimationFrame(gameLoop);
}

// Connect the movement buttons
function connectHoldButton(id, control) {
  const button = document.getElementById(id);

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    held[control] = true;
  });

  ["pointerup", "pointerleave", "pointercancel"].forEach(type => {
    button.addEventListener(type, () => {
      held[control] = false;
    });
  });
}

connectHoldButton("left", "left");
connectHoldButton("right", "right");
connectHoldButton("up", "up");
connectHoldButton("down", "down");
connectHoldButton("fire", "fire");

startButton.addEventListener("click", startGame);

// Keyboard controls
document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") held.left = true;
  if (event.key === "ArrowRight") held.right = true;
  if (event.key === "ArrowUp") held.up = true;
  if (event.key === "ArrowDown") held.down = true;
  if (event.code === "Space") held.fire = true;
});

document.addEventListener("keyup", event => {
  if (event.key === "ArrowLeft") held.left = false;
  if (event.key === "ArrowRight") held.right = false;
  if (event.key === "ArrowUp") held.up = false;
  if (event.key === "ArrowDown") held.down = false;
  if (event.code === "Space") held.fire = false;
});
alert("JavaScript is working!");





