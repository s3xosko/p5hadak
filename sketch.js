class Screen {
  constructor(subScreens = {}) {
    this.screen = 0; // 0 to display this screen, other indices for subscreens
    this.subScreens = subScreens; 
  }

  keyPressed(keyCode) {
    if (this.subScreens[this.screen] && typeof this.subScreens[this.screen].keyPressed === 'function') {
      this.subScreens[this.screen].keyPressed(keyCode);
    }
  }

  draw() {
    if (this.subScreens[this.screen] && typeof this.subScreens[this.screen].draw === 'function') {
      this.subScreens[this.screen].draw();
    }
  }
}

let lastMoveTime = 0;
let moveInterval = 100;

const game = {  
  landscape: true, // Landscape mode (true) or portrait mode (false)
  size: 0, // Size of the game area (are is a square => just one dimension needed)
  offset: 0, // Offset for centering the game area
  tileSize: 0, // Size of each tile in the grid

  screen: 1, // 1: main menu, 2: gameplay, 3: game over
  screens: {
    1: {
      options: ['Start game', 'Instructions', 'Credits', 'Exit'],
      optionSelected: 0, // Index of the currently selected option
      selectOption: function () {
        switch (this.optionSelected) {
          case 0: // Start game
            game.reset();
            game.screen = 2;
            break;
          case 1: // Instructions
            alert('Use arrow keys to control the snake. Eat food to grow and avoid walls and your own body.');
            break;
          case 2: // Credits
            alert('Enjoy!');
            break;
          case 3: // Exit
            window.close(); // Close the window (may not work in all browsers)
            break;
        }
      },
      
      draw: function () {
        background('white');
        const options = this.options;
        const optionSelected = this.optionSelected;

        for (let i = 0; i < options.length; i++) {
          const yPosition = height / 2 - (options.length / 2 - i) * 50; // Adjust spacing between options
          fill(i === optionSelected ? 'blue' : 'black'); // Highlight selected option
          text(options[i], width / 2, yPosition);
        }
      },

      keyPressed: function (keyCode) {
        switch (keyCode) {
          case UP_ARROW:
            this.optionSelected = (this.optionSelected - 1 + this.options.length) % this.options.length; // Move up in the menu
            break;
          case DOWN_ARROW:
            this.optionSelected = (this.optionSelected + 1) % this.options.length; // Move down in the menu
            break;
          case ENTER:
            this.selectOption();
            break;
        }
      }
    },

    2: {
      draw: function () {
        // background(Math.random()*255, Math.random()*255, Math.random()*255); -> get MDMA effect

        if (millis() - lastMoveTime > moveInterval) {
          lastMoveTime = millis();
          game.snake.move(); // Move the snake

          // draw walls (game area)
          game.drawWalls(); 
          // draw snake
          for (let i = 0; i < game.snake.length-1; i++) {
            const segment = game.snake.body[i];
            if (game.landscape) {
              rect(game.offset+segment.x*game.tileSize, segment.y*game.tileSize, game.tileSize, game.tileSize);
            } else {
              rect(segment.x*game.tileSize, game.offset+segment.y*game.tileSize, game.tileSize, game.tileSize);
            }
          }
          // draw snake's head
          const head = game.snake.head;
          if (game.landscape) {
            image(img, game.offset+head.x*game.tileSize, head.y*game.tileSize, game.tileSize, game.tileSize);
          } else {
            image(img, head.x*game.tileSize, game.offset+head.y*game.tileSize, game.tileSize, game.tileSize);
          }
          // draw food
          if (game.landscape) {
            circle(game.offset+game.food.position.x*game.tileSize+game.tileSize/2, game.food.position.y*game.tileSize+game.tileSize/2, game.tileSize)
          } else {
            circle(game.food.position.x*game.tileSize+game.tileSize/2, game.offset+game.food.position.y*game.tileSize+game.tileSize/2, game.tileSize);
          }
        }
      
        
      }
    },

    3: {
      draw: function () {
        background('red');
        text('You lost :((. Your score was ' + game.score, game.offset+game.size/2, game.size/2);
      }
    }
  },

  score: 0, // Player's score
  snake: null, // Snake object
  food: null, // Food object
  walls: null, // Walls object (not implemented yet)
  drawWalls: function () {
    let gameGrid;
    strokeWeight(5);
    if (this.landscape) {
      gameGrid = rect(this.offset, 0, this.size, this.size);
    } else {
      gameGrid = rect(0, this.offset, this.size, this.size); 
    }
    gameGrid.fill('white'); 
    strokeWeight(1);
  },
  
  over: function() {

    this.screen = 3; // Switch to game over screen
  },
  
  reset: function () {
    initializeGameDimensions();
    this.screen = 1;
    this.score = 0;
    initializeSnake();
    initializeFood();
  }
};

function initializeGameDimensions() {
  game.landscape = width > height;
  game.size = game.landscape ? height : width;
  game.offset = game.landscape ? (width - height) / 2 : (height - width) / 2; // Calculate the offset for centering the game area
  game.tileSize = game.size / 30;

  // handle user's viewport being almost a square
  if (abs(width - height) < game.tileSize * 2) {
    alert("The screen should not be squarish for a proper game experience. Please use landscape or portrait mode and restart the page.");
    throw new Error("Invalid screen size for the game!");
  }
}

function initializeSnake() {
  tileSize = game.tileSize;
  const head = {x: 8, y: 15};
  game.snake = {
    body: [{x: 6, y: 15}, {x: 7, y: 15}, head], // Snake's body segments
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
          newHead.y -= 1;
          break;
        case 'down':
          newHead.y += 1;
          break;
        case 'left':
          newHead.x -= 1;
          break;
        case 'right':
          newHead.x += 1;
          break;
      }
      
      this.direction = this.newDirection; 
      this.body.push(newHead); // Add newHead to the body
      this.head = newHead; // Set the new head

      // Check for collision with walls
      if (this.head.x*game.tileSize < 0 || this.head.x*game.tileSize >= game.size 
        || this.head.y*game.tileSize < 0 || this.head.y*game.tileSize >= game.size) {
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
        this.position.x = Math.floor(Math.random() * (game.size / game.tileSize));
        this.position.y = Math.floor(Math.random() * (game.size / game.tileSize));
      }
    }
  };
  
  game.food.spawn(); // Initial spawn of food
}

let img;
function preload() {
  // Load any assets here if needed
  img = loadImage('./assets/images/catFaceRight.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background('red');
  console.log('w,h', windowWidth, windowHeight);

  initializeGameDimensions(); 
  initializeSnake();
  initializeFood();

  textSize(32);
  textAlign(CENTER, CENTER);
}

function draw() {
  game.screens[game.screen].draw();
}

// keyBoard events
function keyPressed() {
  switch (game.screen) {
    case 1:
      game.screens[1].keyPressed(keyCode); // delegate keyPress event to the main menu screen
      break;

    case 2:
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
          console.info('Stopping the game');
          noLoop(); // Stop the draw loop
          break;
        case 82: // 'r' key
          console.info('Resuming the game');
          loop(); // Resume the draw loop
          break
      };
      break;
    case 3:
      switch (keyCode) {
        case ESCAPE:
          game.reset();
          game.screen = 1;
          break;
        case ENTER:
          game.reset();
          game.screen = 2;
          break;
      }
  }
  // return false;
}