var canvas = document.querySelector('canvas');
var sizeInput = document.getElementById('size');
var elasticInput = document.getElementById('elastic');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.background = 'url(https://wallpaperset.com/w/full/4/f/0/24273.jpg)';
canvas.style.backgroundSize = 'cover';
var introText = document.createElement('div');
introText.innerHTML = "\n<div>\n<h1>Welcome to the Game! </h1><br/>\nTap the screen to see the magic\n</div>";
introText.style.position = 'absolute';
introText.style.top = '50%';
introText.style.left = '50%';
introText.style.transform = 'translate(-50%, -50%)';
introText.style.color = 'white';
introText.style.padding = '24px';
introText.style.textAlign = 'center';
introText.style.alignItems = 'center';
introText.style.borderRadius = '24px';
introText.style.background = 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(29,29,47,1) 52%, rgba(68,40,48,1) 100%)';
introText.style.fontSize = '2em';
document.body.appendChild(introText);
// Show the intro text for 5 seconds
setTimeout(function () {
    introText.style.display = 'none';
}, 5000);
var c = canvas.getContext('2d');
var mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2,
};
window.addEventListener('mousemove', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
var Ball = /** @class */ (function () {
    function Ball(x, y, dx, dy, radius, image) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;
        this.image = image;
        this.angularVelocity = 0;
        this.rotation = 0;
    }
    Ball.prototype.draw = function () {
        // Draw the ball image with rotation
        c.save();
        c.translate(this.x, this.y);
        c.rotate(this.rotation);
        c.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
        c.restore();
    };
    Ball.prototype.checkCollision = function (otherBall) {
        var dx = this.x - otherBall.x;
        var dy = this.y - otherBall.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.radius + otherBall.radius) {
            var angle = Math.atan2(dy, dx);
            var overlap = this.radius + otherBall.radius - distance;
            // Move the balls away to avoid overlap
            this.x += (overlap / 2) * Math.cos(angle);
            this.y += (overlap / 2) * Math.sin(angle);
            otherBall.x -= (overlap / 2) * Math.cos(angle);
            otherBall.y -= (overlap / 2) * Math.sin(angle);
            // Update velocities after collision
            var thisSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            var otherSpeed = Math.sqrt(otherBall.dx * otherBall.dx + otherBall.dy * otherBall.dy);
            var thisNewSpeed = otherSpeed;
            var otherNewSpeed = thisSpeed;
            this.dx = thisNewSpeed * Math.cos(angle);
            this.dy = thisNewSpeed * Math.sin(angle);
            otherBall.dx = otherNewSpeed * Math.cos(angle + Math.PI);
            otherBall.dy = otherNewSpeed * Math.sin(angle + Math.PI);
            // Adjust rotational velocities
            this.angularVelocity = this.dx / this.radius;
            otherBall.angularVelocity = otherBall.dx / otherBall.radius;
        }
    };
    Ball.prototype.update = function (deltaTime) {
        if (this.y + this.radius + this.dy > canvas.height) {
            // Damping effect when hitting the bottom
            this.dy = -this.dy * 0.9;
        }
        else {
            this.dy += gravity; // Gravity effect
        }
        if (this.x + this.radius + this.dx > canvas.width || this.x - this.radius + this.dx < 0) {
            // Damping effect when hitting the sides
            this.dx = -this.dx * friction;
        }
        // Apply rotational motion
        if (this.y + this.radius + this.dy > canvas.height) {
            // If the ball is on the ground, simulate rolling motion
            this.angularVelocity = this.dx / this.radius;
        }
        else {
            // Otherwise, simulate air resistance for rotation
            this.angularVelocity *= airResistance;
        }
        // Update rotation
        this.rotation += this.angularVelocity;
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
        // Check collision with other balls
        for (var _i = 0, ballArray_1 = ballArray; _i < ballArray_1.length; _i++) {
            var otherBall = ballArray_1[_i];
            if (otherBall !== this) {
                this.checkCollision(otherBall);
            }
        }
        // Apply air resistance to simulate more realistic motion
        this.dx *= airResistance;
        this.dy *= airResistance;
    };
    return Ball;
}());
var gravity = 0.3; // Adjust gravity
var friction = 0.95; // Adjust friction
var airResistance = 0.99; // Adjust air resistance
var lastClickTime = 0;
var clickDelay = 300; // 500 milliseconds delay between clicks
var lastTime = 0;
// Implementation
var ballArray = [];
// Load the ball image
var ballImage = new Image();
ballImage.src = 'https://clipart-library.com/img/1775798.png'; // Replace with the actual path to your ball image
// Wait for the image to load before using it
ballImage.onload = function () {
    // Create a new ball on mouse click with delay
    canvas.addEventListener('click', function (e) {
        var currentTime = new Date().getTime();
        if (currentTime - lastClickTime > clickDelay) {
            var radius = parseInt(sizeInput.value, 10);
            var x = e.x;
            var y = e.y;
            var dx = (Math.random() - 0.5) * 4;
            var newBall = new Ball(x, y, dx, parseFloat(elasticInput.value), radius, ballImage);
            ballArray.push(newBall);
            lastClickTime = currentTime;
        }
    });
    tick(0);
};
// Tick function
function tick(currentTime) {
    var deltaTime = (currentTime - lastTime) / 10;
    lastTime = currentTime;
    c.clearRect(0, 0, innerWidth, innerHeight);
    ballArray.forEach(function (ball) {
        ball.draw();
        ball.update(deltaTime);
    });
    requestAnimationFrame(tick);
}
