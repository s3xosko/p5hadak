const game = {
  width: 800, // Game width
  height: 800, // Game height
  tileSize: 25, // Size of each tile in the grid

  screen: 1, // 1: main menu, 2: gameplay, 3: game over
  score: 0, // Player's score
  snake: null, // Snake object
  food: null, // Food object
  walls: null, // Walls object (not implemented yet)
  drawWalls: function () {
    rect(0, 0, this.width, this.height); // Draw the game area
  },
  
  over: function() {
    this.screen = 3; // Switch to game over screen
    noLoop(); // Stop the draw loop
    alert("Game Over! Your score: " + this.score); // Display game over message
    this.reset(); // Reset the game state
  },
  reset: function () {

  }
};

function initializeSnake() {
  tileSize = game.tileSize;
  const head = {x: 15*tileSize, y: 15*tileSize};
  game.snake = {
    body: [{x: 13*tileSize, y: 15*tileSize}, {x: 14*tileSize, y: 15*tileSize}, head], // Snake's body segments
    length: 3,
    head: head, // Snake's head segment

    // two properties to prevent possibility of snake trying to move in the opposite direction as he is currently moving
    direction: 'right', // Current direction the snake moved
    newDirection: 'right', // New direction to be set by key presses 
    
    move: function() {
      const newHead = {x: this.head.x, y: this.head.y};
      console.log('direction', this.newDirection);
      // Move the head in the new direction

      switch (this.newDirection) {
        case 'up':
          newHead.y -= tileSize;
          break;
        case 'down':
          newHead.y += tileSize;
          break;
        case 'left':
          newHead.x -= tileSize;
          break;
        case 'right':
          newHead.x += tileSize;
          break;
      }
      
      this.direction = this.newDirection; 
      this.body.push(newHead); // Add newHead to the body
      this.head = newHead; // Set the new head

      // Check for collision with walls
      if (this.head.x < 0 || this.head.x >= game.width || this.head.y < 0 || this.head.y >= game.height) {
        game.over();
      }
      // Check for collision with body
      if (this.body.slice(0, -1).some(segment => segment.x === this.head.x && segment.y === this.head.y)) {
        game.over();
      }
      
      // Check for collision with food
      if (this.head.x === game.food.position.x && this.head.y === game.food.position.y) {
        this.length++;
        game.score++;
        game.food.spawn(); // Respawn food
      } else {
        this.body.shift(); // Remove the tail segment if the snake hasn't eaten 
      }
    }
  };
}

// must be called after initializeSnake() !
function initializeFood() {
  game.food = {
    position: {x: game.snake.head.x, y: game.snake.head.y},

    spawn: function() {
      // Randomly place food in the grid, ensuring it doesn't overlap with the snake
      while ((this.position.x === game.snake.head.x && this.position.y === game.snake.head.y) ||
             game.snake.body.some(segment => segment.x === this.position.x && segment.y === this.position.y)) {
        this.position.x = Math.floor(Math.random() * (game.width / game.tileSize)) * game.tileSize;
        this.position.y = Math.floor(Math.random() * (game.height / game.tileSize)) * game.tileSize;
      }
    }
  };
  
  game.food.spawn(); // Initial spawn of food
}



function preload() {
  // Load any assets here if needed

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  initializeSnake();
  initializeFood();
  background('red');

}


let lastMoveTime = 0;
let moveInterval = 100;
function draw() {
  //let a = circle(200,200,100);


  if (millis() - lastMoveTime > moveInterval) {
    lastMoveTime = millis();
    game.snake.move(); // Move the snake
  }

  game.drawWalls(); // Draw the walls (game area)
  for (let i = 0; i < game.snake.length; i++) {
    const segment = game.snake.body[i];
    rect(segment.x, segment.y, game.tileSize, game.tileSize);
  }
  circle(game.food.position.x+game.tileSize/2, game.food.position.y+game.tileSize/2, game.tileSize)
}

function keyPressed() {
  switch (keyCode) {
    case LEFT_ARROW:
      if (game.snake.direction !== 'right' && game.snake.direction !== 'left') {
        game.snake.newDirection = 'left'; // Change direction to left
      }
      break;
    case RIGHT_ARROW:
      if (game.snake.direction !== 'left' && game.snake.direction !== 'right') {
        game.snake.newDirection = 'right'; // Change direction to right
      }
      break;
    case UP_ARROW:
      if (game.snake.direction !== 'down' && game.snake.direction !== 'up') {
        game.snake.newDirection = 'up'; // Change direction to up
      }
      break;
    case DOWN_ARROW:
      if (game.snake.direction !== 'up' && game.snake.direction !== 'down') {
        game.snake.newDirection = 'down'; // Change direction to down
      }
      break;
    case 83: // 's' key
      console.warn('Stopping the game');
      noLoop(); // Stop the draw loop
      break;
    case 82: // 'r' key
      console.error('Resuming the game');
      loop(); // Resume the draw loop
      break
  }

  return false;
}