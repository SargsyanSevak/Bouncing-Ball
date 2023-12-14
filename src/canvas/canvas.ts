const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const sizeInput = document.getElementById('size') as HTMLInputElement;
const elasticInput = document.getElementById('elastic') as HTMLInputElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.background = 'url(https://wallpaperset.com/w/full/4/f/0/24273.jpg)';
canvas.style.backgroundSize = 'cover';


const introText = document.createElement('div');
introText.innerHTML = `
<div>
<h1>Welcome to the Game! </h1><br/>
Tap the screen to see the magic
</div>`;
introText.style.position = 'absolute';
introText.style.top = '50%';
introText.style.left = '50%';
introText.style.transform = 'translate(-50%, -50%)';
introText.style.color='white'
introText.style.padding='24px'
introText.style.textAlign='center'
introText.style.alignItems='center'
introText.style.borderRadius='24px'
introText.style.background = 'linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(29,29,47,1) 52%, rgba(68,40,48,1) 100%)';
introText.style.fontSize = '2em';
document.body.appendChild(introText);

// Show the intro text for 5 seconds
setTimeout(() => {
  introText.style.display = 'none';
}, 5000);

const c = canvas.getContext('2d') as CanvasRenderingContext2D;

let mouse = {
  x: innerWidth / 2 as number,
  y: innerHeight / 2 as number,
};

window.addEventListener('mousemove', (e: MouseEvent) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth as number;
  canvas.height = window.innerHeight as number;
});

class Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  image: HTMLImageElement;
  angularVelocity: number;
  rotation: number;

  constructor(x: number, y: number, dx: number, dy: number, radius: number, image: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.image = image;
    this.angularVelocity = 0;
    this.rotation = 0;
  }

  draw(): void {
    // Draw the ball image with rotation
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.rotation);
    c.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
    c.restore();
  }

  checkCollision(otherBall: Ball): void {
    const dx = this.x - otherBall.x;
    const dy = this.y - otherBall.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.radius + otherBall.radius) {
      const angle = Math.atan2(dy, dx);
      const overlap = this.radius + otherBall.radius - distance;

      // Move the balls away to avoid overlap
      this.x += (overlap / 2) * Math.cos(angle);
      this.y += (overlap / 2) * Math.sin(angle);
      otherBall.x -= (overlap / 2) * Math.cos(angle);
      otherBall.y -= (overlap / 2) * Math.sin(angle);

      // Update velocities after collision
      const thisSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      const otherSpeed = Math.sqrt(otherBall.dx * otherBall.dx + otherBall.dy * otherBall.dy);

      const thisNewSpeed = otherSpeed;
      const otherNewSpeed = thisSpeed;

      this.dx = thisNewSpeed * Math.cos(angle);
      this.dy = thisNewSpeed * Math.sin(angle);
      otherBall.dx = otherNewSpeed * Math.cos(angle + Math.PI);
      otherBall.dy = otherNewSpeed * Math.sin(angle + Math.PI);

      // Adjust rotational velocities
      this.angularVelocity = this.dx / this.radius;
      otherBall.angularVelocity = otherBall.dx / otherBall.radius;
    }
  }

  update(deltaTime: number): void {
    if (this.y + this.radius + this.dy > canvas.height) {
      // Damping effect when hitting the bottom
      this.dy = -this.dy * 0.9;
    } else {
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
    } else {
      // Otherwise, simulate air resistance for rotation
      this.angularVelocity *= airResistance;
    }

    // Update rotation
    this.rotation += this.angularVelocity;

    this.x += this.dx * deltaTime;
    this.y += this.dy * deltaTime;

    // Check collision with other balls
    for (const otherBall of ballArray) {
      if (otherBall !== this) {
        this.checkCollision(otherBall);
      }
    }

    // Apply air resistance to simulate more realistic motion
    this.dx *= airResistance;
    this.dy *= airResistance;
  }
}

let gravity = 0.3; // Adjust gravity
let friction = 0.95; // Adjust friction
let airResistance = 0.99; // Adjust air resistance
let lastClickTime = 0;
const clickDelay = 300; // 500 milliseconds delay between clicks

let lastTime = 0;

// Implementation
let ballArray: Ball[] = [];

// Load the ball image
const ballImage = new Image();
ballImage.src = 'https://clipart-library.com/img/1775798.png'; // Replace with the actual path to your ball image

// Wait for the image to load before using it
ballImage.onload = () => {
  // Create a new ball on mouse click with delay
  canvas.addEventListener('click', (e: MouseEvent) => {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime > clickDelay) {
      let radius = parseInt(sizeInput.value, 10);
      let x = e.x;
      let y = e.y;
      let dx = (Math.random() - 0.5) * 4;
      let newBall = new Ball(x, y, dx, parseFloat(elasticInput.value), radius, ballImage);
      ballArray.push(newBall);
      lastClickTime = currentTime;
    }
  });

  tick(0);
};

// Tick function
function tick(currentTime: number): void {

  const deltaTime = (currentTime - lastTime) / 10;
  lastTime = currentTime;
  c.clearRect(0, 0, innerWidth, innerHeight);

  ballArray.forEach((ball: Ball) => {
    ball.draw();
    ball.update(deltaTime);
  });

  requestAnimationFrame(tick);
}
