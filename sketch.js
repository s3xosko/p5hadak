class Screen {
  constructor(name, sounds = {}) {
    this.name = name;
    this.sounds = sounds;
    this.backgroundSound = null;
  }
  
  onActivation(properties) {};          // Method that should be called when the screen is becoming active
  onDeactivation() {};                  // Method that should be called when the screen is becoming inactive
  draw() {};                            // Method that handles drawing of the screen
  keyPressed(keyCode) {};               // Method that handles key presses 
  
  playSound(soundName) {};
  playBackgroundSound(soundName) {};
}

class ScreenManager {
  constructor() {
    this.screens = {};
    this.activeScreen = new Screen('dummy'); // First dummy screen - some screen should be active at all times
  }

  getScreen(name) {
    if (this.screens[name]) {
      return this.screens[name];
    } else {
      console.error(`Screen "${name}" does not exist.`);
      return null;
    }
  }

  addScreen(name, screen) {
    if (this.screens[name]) {
      console.warn(`Screen "${name}" already exists. Overwriting.`);
    }
    this.screens[name] = screen;
  }

  removeScreen(name) {
    if (this.screens[name]) {
      delete this.screens[name];
      if (this.activeScreen && this.activeScreen.name === name) {
        this.activeScreen.onDeactivation();
        this.activeScreen = null;
      }
    } else {
      console.error(`Screen "${name}" does not exist.`);
    }
  }

  setActiveScreen(name, activationProperties) {
    if (this.screens[name]) {
      if (this.activeScreen.name === name) {
        console.error(`Trying to activate already active screen "${name}".`)
      } else {
        this.activeScreen.onDeactivation();
      }

      this.activeScreen = this.screens[name];
      this.activeScreen.onActivation(activationProperties);
    } else {
      console.error(`Screen "${name}" does not exist.`);
    }
  }

  draw() {
    this.activeScreen.draw();
  }

  keyPressed(keyCode) {
    this.activeScreen.keyPressed(keyCode);
  }
}

class MainMenu extends Screen {
  constructor() {
    super('mainMenu');
    this.options = ['Start game', 'Instructions', 'Credits', 'Exit'];
    this.optionSelected = 0; // Index of the currently selected option
  }
  
  selectOption() {
    switch (this.optionSelected) {
      case 0: // Start game
        // game.activeScreenIndex = 2; // Switch to gameplay screen
        screenManager.setActiveScreen('gameplay');
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
  };

  draw() {
    background('white');
    const options = this.options;
    const optionSelected = this.optionSelected;

    for (let i = 0; i < options.length; i++) {
      const yPosition = height / 2 - (options.length / 2 - i) * 50; // Adjust spacing between options
      fill(i === optionSelected ? 'blue' : 'black'); // Highlight selected option
      text(options[i], width / 2, yPosition);
    }
  };

  keyPressed(keyCode) {
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
  };
}

class Gameplay extends Screen {
  constructor() {
    super('gameplay');

    this.game = new Game();
  }
  
  onActivation() {
    this.game.reset();
  }

  draw() {
    this.game.draw();
  }

  keyPressed(keyCode) {
    this.game.keyPressed(keyCode);
  }
}

class GameOver extends Screen {
  constructor() {
    super('gameOver');

    this.gainedScore = 0;
    this.textPosX = 0;
    this.textPosY = 0;
  }  

  onActivation(properties) {
    this.gainedScore = properties.score;
    this.textPosX = properties.x;
    this.textPosY = properties.y;
  }
  
  draw() {
    background('red');
    
    text('You lost :((. Your score was ' + this.gainedScore + '!', this.textPosX, this.textPosY);
  }

  keyPressed(keyCode) {
    switch (keyCode) {
      case ESCAPE:
        screenManager.setActiveScreen('mainMenu');
        break;
      case ENTER:
        screenManager.setActiveScreen('gameplay');
        break;
    }
  }
}

class Game {
  constructor() {
    // game dimensions properties
    this.landscape = true, // Landscape mode (true) or portrait mode (false)
    this.size = 0, // Size of the game area (area is a square => just one dimension needed)
    this.offset = 0, // Offset for centering the game area
    this.tileSize = 0, // Size of each tile in the grid
    
    // gameplay properties
    this.score = 0; // Player's score
    this.snake = null; // Snake object
    this.food = null; // Food object
    this.walls = null; // Walls object (not implemented yet)
  }

  reset() {
    this._initializeDimensions();
    this._initializeSnake();
    this._initializeFood();

    this.score = 0;
  }

  over() {
    screenManager.setActiveScreen('gameOver', {
      score: this.score,
      x: this.landscape ? this.offset+this.size/2 : this.size/2, 
      y: this.landscape ? this.size/2 : this.offset+this.size/2
    })
  }

  updateScore(number) {
    this.score += number;
  }

  draw() {
    // background(Math.random()*255, Math.random()*255, Math.random()*255); -> get MDMA effect

    if (millis() - lastMoveTime > moveInterval) {
      lastMoveTime = millis();
      const alive = this.snake.move(); // Move the snake
      if (!alive) {
        this.over(); 
      }

      // draw walls (game area)
      this.drawWalls(); 
      // draw snake
      for (let i = 0; i < this.snake.length-1; i++) {
        const segment = this.snake.body[i];
        if (this.landscape) {
          rect(this.offset+segment.x*this.tileSize, segment.y*this.tileSize, this.tileSize, this.tileSize);
        } else {
          rect(segment.x*this.tileSize, this.offset+segment.y*this.tileSize, this.tileSize, this.tileSize);
        }
      }
      // draw snake's head
      const head = this.snake.head;
      if (this.landscape) {
        image(img, this.offset+head.x*this.tileSize, head.y*this.tileSize, this.tileSize, this.tileSize);
      } else {
        image(img, head.x*this.tileSize, this.offset+head.y*this.tileSize, this.tileSize, this.tileSize);
      }
      // draw food
      if (this.landscape) {
        circle(this.offset+this.food.position.x*this.tileSize+this.tileSize/2, this.food.position.y*this.tileSize+this.tileSize/2, this.tileSize)
      } else {
        circle(this.food.position.x*this.tileSize+this.tileSize/2, this.offset+this.food.position.y*this.tileSize+this.tileSize/2, this.tileSize);
      }
    }
  }

  drawWalls() {
    let gameGrid;
    strokeWeight(5);
    if (this.landscape) {
      gameGrid = rect(this.offset, 0, this.size, this.size);
    } else {
      gameGrid = rect(0, this.offset, this.size, this.size); 
    }
    gameGrid.fill('white'); 
    strokeWeight(1);
  }
  
  keyPressed(keyCode) {
    switch (keyCode) {
      case LEFT_ARROW:
        if (this.snake.direction !== 'right' && this.snake.direction !== 'left') {
          this.snake.newDirection = 'left'; // Change direction to left
        }
        break;
      case RIGHT_ARROW:
        if (this.snake.direction !== 'left' && this.snake.direction !== 'right') {
          this.snake.newDirection = 'right'; // Change direction to right
        }
        break;
      case UP_ARROW:
        if (this.snake.direction !== 'down' && this.snake.direction !== 'up') {
          this.snake.newDirection = 'up'; // Change direction to up
        }
        break;
      case DOWN_ARROW:
        if (this.snake.direction !== 'up' && this.snake.direction !== 'down') {
          this.snake.newDirection = 'down'; // Change direction to down
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
    
    return false;
  }

  _initializeDimensions() {
    this.landscape = width > height;
    this.size = this.landscape ? height : width;
    this.offset = this.landscape ? (width - height) / 2 : (height - width) / 2; // Calculate the offset for centering the game area
    this.numOfTiles = 30;
    this.tileSize = this.size / this.numOfTiles;

    // handle user's viewport being almost a square
    if (abs(width - height) < this.tileSize * 2) {
      alert("The screen should not be squarish for a proper game experience. Please use landscape or portrait mode and restart the page.");
      throw new Error("Invalid screen size for the game!");
    }
  }

  _initializeSnake() {
    this.snake = new Snake(this);
    
    // Ensure the snake's head and body are initialized correctly
    this.snake.head = {x: 8, y: 15};
    this.snake.body = [{x: 6, y: 15}, {x: 7, y: 15}, this.snake.head];
    this.snake.length = 3;
    
    // Initialize the snake's direction
    this.snake.direction = 'right';
    this.snake.newDirection = 'right';
  }
  
  // must be called after this._initializeSnake()!
  _initializeFood() {
    this.food = new Food(this);
    this.food.spawn(this.snake.head, this.snake.body); // Initial spawn of food
  }
}

class Snake {
  constructor(game) {
    this.game = game;
    this.gridSize = game.tileSize; // Number of tiles in the grid (grid is square => just one dimension needed)
    
    this.head = {};
    this.body = [];
    this.length = 0;

    // two properties to prevent possibility of snake trying to move in the opposite direction as he is currently moving
    this.direction = '';
    this.newDirection = '';
  }

  move() {
    const newHead = {x: this.head.x, y: this.head.y};
    
    console.log('direction', this.newDirection);
    // move the head in the new direction
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
    if (this.head.x < 0 || this.head.x >= this.gridSize 
      || this.head.y < 0 || this.head.y >= this.gridSize) {
      return false;
    }
    // Check for collision with body
    if (this.body.slice(0, -1).some(segment => segment.x === this.head.x && segment.y === this.head.y)) {
      return false;
    }
    
    // Check for collision with food
    const food = this.game.food;
    if (this.head.x === food.position.x && this.head.y === food.position.y) {
      this.length++;
      this.game.updateScore(1);
      food.spawn(this.head, this.body); // Respawn food
    } else {
      this.body.shift(); // Remove the tail segment if the snake hasn't eaten
    }

    return true; // Snake is still alive
  }
}

class Food {
  constructor(game) {
    this.game = game
    this.gridSize = game.numOfTiles; // Number of tiles in the grid (grid is square => just one dimension needed)
    this.position = {x: 0, y: 0}; // Position of the food in the grid
  }

  spawn(snakeHead, snakeBody) {
    // Randomly place food in the grid, ensuring it doesn't overlap with the snake
    do {
      this.position.x = Math.floor(Math.random() * this.gridSize);
      this.position.y = Math.floor(Math.random() * this.gridSize);
    } while ((this.position.x === snakeHead.x && this.position.y === snakeHead.y) ||
             snakeBody.some(segment => segment.x === this.position.x && segment.y === this.position.y));
  }
}

let img;
function preload() {
  // Load any assets here if needed
  img = loadImage('./assets/images/catFaceRight.png');
}

let screenManager = null; // Global variable to manage screens
let game = {};
let lastMoveTime = 0;
let moveInterval = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log('Width =', width, 'Height =', height);

  screenManager = new ScreenManager();
  screenManager.addScreen('mainMenu', new MainMenu());
  screenManager.addScreen('gameplay', new Gameplay());
  screenManager.addScreen('gameOver', new GameOver());
  screenManager.setActiveScreen('mainMenu');

  textSize(32);
  textAlign(CENTER, CENTER);
}

function draw() {
  screenManager.draw();
}

// keyBoard events
function keyPressed() {
  screenManager.keyPressed(keyCode);
}