const canvas = document.getElementById('phing');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 7;
const PADDLE_HEIGHT = 75;
const BALL_RADIUS = 9;
const PADDLE_SPEED = 5;
const AI_SPEED = 6;
const BALL_SPEED = 8;

// Game objects
let player = {
    x: 12,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};
let ai = {
    x: canvas.width - PADDLE_WIDTH - 12,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT
};
let ball = (function() {
    // Random angle between -45 and 45 degrees, or between 135 and 225 degrees
    let angleRanges = [
        [Math.PI / 4, -Math.PI / 4], // right
        [3 * Math.PI / 4, 5 * Math.PI / 4] // left
    ];
    let range = angleRanges[Math.random() > 0.5 ? 0 : 1];
    let angle = range[0] + (range[1] - range[0]) * Math.random();
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: BALL_SPEED * Math.cos(angle),
        vy: BALL_SPEED * Math.sin(angle),
        radius: BALL_RADIUS
    };
})();

// Score
let playerScore = 0;
let aiScore = 0;

// High score usando localStorage
let highScore = localStorage.getItem('phingHighScore') || 0;

// Mouse control: Move the player's paddle to follow the mouse's vertical position,
// and clamp the paddle so it stays within the canvas bounds.
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height / 2;

    // Clamp paddle within canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});
function update() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Ball collision with top/bottom
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -1;
    }

    // Ball collision with paddles
    // Player paddle
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.x = player.x + player.width + ball.radius;
        ball.vx *= -1;

        // Add a bit of "spin"
        let hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.vy += hitPos * 2;
    }

    // AI paddle
    if (
        ball.x + ball.radius > ai.x &&
        ball.y > ai.y &&
        ball.y < ai.y + ai.height
    ) {
        ball.x = ai.x - ball.radius;
        ball.vx *= -1;

        // Add a bit of "spin"
        let hitPos = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
        ball.vy += hitPos * 2;
    }

    // Score check
    if (ball.x - ball.radius < 0) {
        aiScore++;
        // Reseta o jogo quando o jogador morre
        playerScore = 0;
        aiScore = 0;
        resetBall(-1);
        updateHighScoreDisplay(highScore); // Atualiza o high score na tela
        return; // Evita que o resto do update rode nesse frame
    }
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        // Atualiza high score se necessário
        if (playerScore > highScore) {
            highScore = playerScore;
            localStorage.setItem('phingHighScore', highScore);
            updateHighScoreDisplay(highScore);
        }
        resetBall(1);
    }

    // AI movement: follow the ball
    let aiCenter = ai.y + ai.height / 2;
    let distance = ball.y - aiCenter;

    // Use proportional speed for smoother movement
    ai.y += Math.sign(distance) * Math.min(Math.abs(distance) * 0.16, AI_SPEED);

    // Clamp AI paddle
    if (ai.y < 0) ai.y = 0;

    // Clamp AI paddle to keep it within the canvas bounds
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

function resetBall(direction) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Random angle between -45 and 45 degrees
    let angle = (Math.random() - 0.5) * (Math.PI / 2);
    ball.vx = BALL_SPEED * Math.cos(angle) * direction;
    ball.vy = BALL_SPEED * Math.sin(angle);
}

function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#fff2';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillRect(ai.x, ai.y, ai.width, ai.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#f5f5f5';
    ctx.fill();

    // Draw score
    ctx.font = '32px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(playerScore, canvas.width / 4, 40);
    ctx.fillText(aiScore, 3 * canvas.width / 4, 40);
}
//Passei muito tempo nisso. so não foi pior que arrumar a div
function updateHighScoreDisplay(score) {
    document.getElementById('highScoreDisplay').textContent = 'High Score: ' + score;
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();

// Alguem vai ler essa porra?
// Esse codigo é 99% IA e (talvez) 1% humano
// Escute: End Of Summer - Tame Impala