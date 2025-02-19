// Full screen toggle function
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Default player names and scores
const defaultP1Name = "Player 1";
const defaultP2Name = "Player 2";
let p1Name = defaultP1Name;
let p2Name = defaultP2Name;
let p1Score = 0, p2Score = 0;

// Set initial labels (DOM elements)
document.querySelector('.p1-label').textContent = "🟦 " + p1Name;
document.querySelector('.p2-label').textContent = "🟥 " + p2Name;

// Game state variables
const speed = 5;
let gameRunning = false;
let gamePaused = false;

// Audio elements
const shootSound = document.getElementById("shootSound");
const hitSound = document.getElementById("hitSound");

// Player objects with positions and stats
const player1 = {
  x: 100,
  y: 0,
  width: 40,
  height: 40,
  color: "blue",
  health: 100,
  shield: 100,
  shieldActive: false,
  message: "",
  canShoot: true
};
const player2 = {
  x: 600,
  y: 0,
  width: 40,
  height: 40,
  color: "red",
  health: 100,
  shield: 100,
  shieldActive: false,
  message: "",
  canShoot: true
};

let bullets = [];

// Keys for movement, shooting, shield and pause (P)
const keys = {
  w: false, a: false, s: false, d: false,
  ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false,
  " ": false, q: false, Enter: false, m: false, p: false
};

// Event listeners for keydown and keyup
document.addEventListener("keydown", (e) => {
  if (e.key === "CapsLock") {
    e.preventDefault();
    return;
  }
  if (keys.hasOwnProperty(e.key)) {
    // Toggle pause/resume with P key
    if (e.key === "p") {
      togglePause();
      return;
    }
    // Handle shooting when game is running and not paused
    if (e.key === " " && player1.canShoot && gameRunning && !gamePaused) {
      shootBullet(player1, 1);
      player1.canShoot = false;
    } else if (e.key === "Enter" && player2.canShoot && gameRunning && !gamePaused) {
      shootBullet(player2, 2);
      player2.canShoot = false;
    }
    keys[e.key] = true;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "CapsLock") {
    e.preventDefault();
    return;
  }
  if (keys.hasOwnProperty(e.key)) {
    keys[e.key] = false;
    if (e.key === " ") player1.canShoot = true;
    if (e.key === "Enter") player2.canShoot = true;
  }
});

// Move players based on keys pressed
function movePlayers() {
  if (keys.a && player1.x > 0) player1.x -= speed;
  if (keys.d && player1.x + player1.width < canvas.width) player1.x += speed;
  if (keys.w && player1.y > 0) player1.y -= speed;
  if (keys.s && player1.y + player1.height < canvas.height) player1.y += speed;

  if (keys.ArrowLeft && player2.x > 0) player2.x -= speed;
  if (keys.ArrowRight && player2.x + player2.width < canvas.width) player2.x += speed;
  if (keys.ArrowUp && player2.y > 0) player2.y -= speed;
  if (keys.ArrowDown && player2.y + player2.height < canvas.height) player2.y += speed;

  // Update shield activation
  player1.shieldActive = keys.q;
  player2.shieldActive = keys.m;
}

// Draw shield percentages at the top of the canvas
function drawTopStatus() {
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.textAlign = "left";
  ctx.fillText("🛡️ " + player1.shield + "%", 10, 25);
  ctx.textAlign = "right";
  ctx.fillText("🛡️ " + player2.shield + "%", canvas.width - 10, 25);
  ctx.textAlign = "left";
}

// Always display control instructions on canvas
function drawControls() {
  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("P1: WASD move | SPACE shoot | Q shield", 10, canvas.height - 20);
  ctx.textAlign = "right";
  ctx.fillText("P2: Arrow keys move | ENTER shoot | M shield", canvas.width - 10, canvas.height - 20);
  ctx.textAlign = "left";
}

// Main game loop
function gameLoop() {
  if (!gameRunning || gamePaused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTopStatus();
  movePlayers();
  updateBullets();
  drawPlayer(player1);
  drawPlayer(player2);
  drawMessage(player1);
  drawMessage(player2);
  drawControls();
  checkGameOver();
  requestAnimationFrame(gameLoop);
}

// Draw a player on the canvas
function drawPlayer(player) {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  if (player.shieldActive) {
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Draw a message above the player
function drawMessage(player) {
  if (player.message) {
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText(player.message, player.x - 10, player.y - 10);
  }
}

// Shoot bullet with sound effect
function shootBullet(player, owner) {
  if (shootSound) {
    shootSound.currentTime = 0;
    shootSound.play();
  }
  const bullet = {
    x: owner === 1 ? player.x + player.width : player.x - 10,
    y: player.y + player.height / 2 - 2,
    width: 10,
    height: 4,
    speedX: owner === 1 ? 10 : -10,
    speedY: 0,
    owner: owner
  };
  bullets.push(bullet);
}

// Update bullet positions, draw them, and check collisions
function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.x += bullet.speedX;
    bullet.y += bullet.speedY;
    
    ctx.fillStyle = bullet.owner === 1 ? "cyan" : "orange";
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    
    if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
      bullets.splice(i, 1);
      continue;
    }
    
    if (bullet.owner === 1 && rectCollision(bullet, player2)) {
      applyHit(player2);
      bullets.splice(i, 1);
      updateHealthBars();
      continue;
    } else if (bullet.owner === 2 && rectCollision(bullet, player1)) {
      applyHit(player1);
      bullets.splice(i, 1);
      updateHealthBars();
      continue;
    }
  }
}

// Apply hit to a player with sound effect
function applyHit(player) {
  if (hitSound) {
    hitSound.currentTime = 0;
    hitSound.play();
  }
  if (player.shieldActive && player.shield > 0) {
    player.shield -= 10;
    if (player.shield < 0) player.shield = 0;
  } else {
    player.health -= 10;
    if (player.health < 0) player.health = 0;
  }
}

// Helper: rectangle collision detection
function rectCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

// Update health bars in the DOM
function updateHealthBars() {
  document.getElementById("p1HealthBar").style.width = player1.health + "%";
  document.getElementById("p2HealthBar").style.width = player2.health + "%";
  document.getElementById("p1HealthText").textContent = player1.health + "%";
  document.getElementById("p2HealthText").textContent = player2.health + "%";
}

// Check for game over and update scoreboard
function checkGameOver() {
  if (player1.health <= 0 || player2.health <= 0) {
    gameRunning = false;
    let winnerText = "";
    if (player1.health <= 0 && player2.health <= 0) {
      winnerText = "It's a draw!";
    } else if (player1.health <= 0) {
      winnerText = "Player 2 wins!";
      p2Score++;
    } else if (player2.health <= 0) {
      winnerText = "Player 1 wins!";
      p1Score++;
    }
    document.getElementById("winnerText").textContent = winnerText;
    updateScoreboard();
    showGameOverScreen();
  }
}

// Update scoreboard UI
function updateScoreboard() {
  document.getElementById("p1Score").textContent = "Player 1: " + p1Score;
  document.getElementById("p2Score").textContent = "Player 2: " + p2Score;
}

// Toggle pause state and show/hide pause overlay
function togglePause() {
  gamePaused = !gamePaused;
  document.getElementById("pauseScreen").classList.toggle("hidden", !gamePaused);
  if (!gamePaused && gameRunning) {
    gameLoop();
  }
}

// Show Game Over overlay
function showGameOverScreen() {
  document.getElementById("gameOverScreen").classList.remove("hidden");
}

// Restart game: reset players, health, positions, and show start screen
function restartGame() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
  document.getElementById("gameOverScreen").classList.add("hidden");
  document.getElementById("pauseScreen").classList.add("hidden");
  document.getElementById("startScreen").classList.remove("hidden");
  
  player1.x = 100; player1.y = 0;
  player2.x = 600; player2.y = 0;
  player1.health = 100; player2.health = 100;
  player1.shield = 100; player2.shield = 100;
  bullets = [];
  updateHealthBars();
  
  document.getElementById("p1Name").value = "";
  document.getElementById("p2Name").value = "";
  p1Name = defaultP1Name; p2Name = defaultP2Name;
  document.querySelector('.p1-label').textContent = "🟦 " + p1Name;
  document.querySelector('.p2-label').textContent = "🟥 " + p2Name;
  gameRunning = false;
  // Hide control buttons until next game start
  document.getElementById("fullScreenContainer").style.display = "none";
  document.getElementById("pauseContainer").style.display = "none";
  document.getElementById("restartContainer").style.display = "none";
}

// Drop players with a countdown before the round starts
function dropPlayers() {
  let dropSpeed = 5;
  let countdown = 3;
  let countdownInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
    countdown--;
    if (countdown < 0) {
      clearInterval(countdownInterval);
      animateDrop();
    }
  }, 1000);
  
  function animateDrop() {
    function dropAnimation() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (player1.y < 300) player1.y += dropSpeed;
      if (player2.y < 300) player2.y += dropSpeed;
      drawPlayer(player1);
      drawPlayer(player2);
      if (player1.y >= 300 && player2.y >= 300) {
        // Show player names on canvas after drop animation for 2 seconds
        player1.message = "🟦 " + p1Name;
        player2.message = "🟥 " + p2Name;
        drawMessage(player1);
        drawMessage(player2);
        setTimeout(() => {
          player1.message = "";
          player2.message = "";
          // Display each control button separately after game starts
          document.getElementById("fullScreenContainer").style.display = "block";
          document.getElementById("pauseContainer").style.display = "block";
          document.getElementById("restartContainer").style.display = "block";
          gameRunning = true;
          gameLoop();
        }, 2000);
        return;
      }
      requestAnimationFrame(dropAnimation);
    }
    dropAnimation();
  }
}

// Start game from the start screen: set names and begin drop animation
function startGame() {
  let inputP1 = document.getElementById("p1Name").value.trim();
  let inputP2 = document.getElementById("p2Name").value.trim();
  p1Name = inputP1 ? inputP1 : defaultP1Name;
  p2Name = inputP2 ? inputP2 : defaultP2Name;
  document.querySelector('.p1-label').textContent = "🟦 " + p1Name;
  document.querySelector('.p2-label').textContent = "🟥 " + p2Name;
  document.getElementById("startScreen").classList.add("hidden");
  dropPlayers();
}

// Automatic Name Update on Input
document.getElementById("p1Name").addEventListener("input", function() {
  let newName = this.value.trim();
  if(newName === "") newName = defaultP1Name;
  document.querySelector('.p1-label').textContent = "🟦 " + newName;
});
document.getElementById("p2Name").addEventListener("input", function() {
  let newName = this.value.trim();
  if(newName === "") newName = defaultP2Name;
  document.querySelector('.p2-label').textContent = "🟥 " + newName;
});
