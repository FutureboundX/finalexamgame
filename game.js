// Get Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
let score = 0;
const keys = {};
const gameWidth = canvas.width;
const gameHeight = canvas.height;

// Load Images
const spaceshipImg = new Image();
spaceshipImg.src = 'assets/images/spaceship.png';

const gemImg = new Image();
gemImg.src = 'assets/images/gem.png';

const asteroidImg = new Image();
asteroidImg.src = 'assets/images/asteroid.png';

// Load Sounds
const backgroundMusic = document.getElementById('background-music');
const collectSound = document.getElementById('collect-sound');
const collisionSound = document.getElementById('collision-sound');

// Play Background Music
backgroundMusic.volume = 0.5;
backgroundMusic.play();

// Spaceship Object
const spaceship = {
    x: gameWidth / 2 - 25,
    y: gameHeight - 80,
    width: 50,
    height: 50,
    speed: 5,
    booster: false,
    boosterTimer: 0
};

// Gems Array
const gems = [];
const gemInterval = 2000; // Spawn gem every 2 seconds
let lastGemTime = Date.now();

// Asteroids Array
const asteroids = [];
const asteroidInterval = 1500; // Spawn asteroid every 1.5 seconds
let lastAsteroidTime = Date.now();

// Gem Constructor
function Gem() {
    this.x = Math.random() * (gameWidth - 30);
    this.y = -30;
    this.width = 30;
    this.height = 30;
    this.speed = 2 + Math.random() * 3;
}

Gem.prototype.update = function() {
    this.y += this.speed;
};

Gem.prototype.draw = function() {
    ctx.drawImage(gemImg, this.x, this.y, this.width, this.height);
};

// Asteroid Constructor
function Asteroid() {
    this.x = Math.random() * (gameWidth - 40);
    this.y = -40;
    this.width = 40;
    this.height = 40;
    this.speed = 3 + Math.random() * 2;
}

Asteroid.prototype.update = function() {
    this.y += this.speed;
};

Asteroid.prototype.draw = function() {
    ctx.drawImage(asteroidImg, this.x, this.y, this.width, this.height);
};

// Handle Keyboard Input
window.addEventListener('keydown', function(e) {
    keys[e.code] = true;
});

window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
});

// Collision Detection
function isColliding(a, b) {
    return !(
        a.x > b.x + b.width ||
        a.x + a.width < b.x ||
        a.y > b.y + b.height ||
        a.y + a.height < b.y
    );
}

// Update Game Objects
function update() {
    // Move Spaceship
    if (keys['ArrowLeft'] && spaceship.x > 0) {
        spaceship.x -= spaceship.speed;
    }
    if (keys['ArrowRight'] && spaceship.x < gameWidth - spaceship.width) {
        spaceship.x += spaceship.speed;
    }
    if (keys['ArrowUp'] && spaceship.y > 0) {
        spaceship.y -= spaceship.speed;
    }
    if (keys['ArrowDown'] && spaceship.y < gameHeight - spaceship.height) {
        spaceship.y += spaceship.speed;
    }
    if (keys['Space'] && !spaceship.booster) {
        spaceship.booster = true;
        spaceship.speed *= 2;
        spaceship.boosterTimer = Date.now();
    }

    // Booster Duration
    if (spaceship.booster && Date.now() - spaceship.boosterTimer > 3000) {
        spaceship.booster = false;
        spaceship.speed /= 2;
    }

    // Spawn Gems
    if (Date.now() - lastGemTime > gemInterval) {
        gems.push(new Gem());
        lastGemTime = Date.now();
    }

    // Spawn Asteroids
    if (Date.now() - lastAsteroidTime > asteroidInterval) {
        asteroids.push(new Asteroid());
        lastAsteroidTime = Date.now();
    }

    // Update Gems
    gems.forEach((gem, index) => {
        gem.update();
        if (gem.y > gameHeight) {
            gems.splice(index, 1);
        }
        // Check Collision with Spaceship
        if (isColliding(spaceship, gem)) {
            score += 10;
            document.getElementById('score').innerText = score;
            collectSound.play();
            gems.splice(index, 1);
        }
    });

    // Update Asteroids
    asteroids.forEach((asteroid, index) => {
        asteroid.update();
        if (asteroid.y > gameHeight) {
            asteroids.splice(index, 1);
        }
        // Check Collision with Spaceship
        if (isColliding(spaceship, asteroid)) {
            collisionSound.play();
            // Reset Game
            score = 0;
            document.getElementById('score').innerText = score;
            gems.length = 0;
            asteroids.length = 0;
            spaceship.x = gameWidth / 2 - 25;
            spaceship.y = gameHeight - 80;
        }
    });
}

// Draw Game Objects
function draw() {
    // Clear Canvas
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // Draw Spaceship
    ctx.drawImage(spaceshipImg, spaceship.x, spaceship.y, spaceship.width, spaceship.height);

    // Draw Gems
    gems.forEach(gem => gem.draw());

    // Draw Asteroids
    asteroids.forEach(asteroid => asteroid.draw());
}

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the Game Once Images are Loaded
window.onload = function() {
    gameLoop();
};