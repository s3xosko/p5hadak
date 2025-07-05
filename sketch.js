let screens = {};
class Screen {
  constructor(name, subScreens = {}, sounds = {}) {
    this.name = name;
    this.activeScreenIndex = -1;          // -1 = not active, 0 = display this screen, x = display sub-screen with index x
    this.subScreens = subScreens;

    this.draw = () => {};                 // Function that handles drawing of this screen
    this.keyPressed = (keyCode) => {};    // Function that handles key presses when this screen is active

    this.sounds = sounds;
    this.playSound = (soundName) => {};
    this.backgroundSound = null;
    this.playBackgroundSound = (soundName) => {};
  }
}

class MainMenu extends Screen {
  constructor() {
    super('Main Menu');
    this.options = ['Start game', 'Instructions', 'Credits', 'Exit'];
    this.optionSelected = 0; // Index of the currently selected option

    this.selectOption = () => {
      switch (this.optionSelected) {
        case 0: // Start game
          game.activeScreenIndex = 2;
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

    this.draw = () => {
      background('white');
      const options = this.options;
      const optionSelected = this.optionSelected;

      for (let i = 0; i < options.length; i++) {
        const yPosition = height / 2 - (options.length / 2 - i) * 50; // Adjust spacing between options
        fill(i === optionSelected ? 'blue' : 'black'); // Highlight selected option
        text(options[i], width / 2, yPosition);
      }
    };

    this.keyPressed = (keyCode) => {
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
}

class Gameplay extends Screen {
  constructor() {
    super('Gameplay');

    this.draw = () => {
      // background(Math.random()*255, Math.random()*255, Math.random()*255); -> get MDMA effect

      if (millis() - lastMoveTime > moveInterval) {
        background(255);

        lastMoveTime = millis();
        const alive = game.snake.move(); // Move the snake
        if (!alive) {
          game.over();
        }

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
    };
  }
}

class GameOver extends Screen {
  constructor() {
    super('Game Over');

    this.draw = () => {
      background('red');
      text('You lost :((. Your score was ' + game.score, game.offset+game.size/2, game.size/2);
    };
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

    // game screens
    this.activeScreenIndex = 1; // 1: main menu, 2: gameplay, 3: game over
    this.subScreens = {};

    this.reset(); // Initialize game dimensions, snake, and food
  }

  reset() {
    this._initializeDimensions();
    this._initializeSnake();
    this._initializeFood();
    this._initializeSubScreens();

    this.score = 0;
    this.activeScreenIndex = 1;
  }

  over() {
    this.activeScreenIndex = 3; // Switch to game over screen
  }

  draw() {
    this.subScreens[this.activeScreenIndex].draw(); // delegate draw event to the active screen
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
    switch (this.activeScreenIndex) {
      case 1:
        this.subScreens[1].keyPressed(keyCode); // delegate keyPress event to the main menu screen
        break;

      case 2:
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
        break;
      case 3:
        switch (keyCode) {
          case ESCAPE:
            this.reset();
            this.activeScreenIndex = 1;
            break;
          case ENTER:
            this.reset();
            this.activeScreenIndex = 2;
            break;
        }
    }
    // return false;
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
    this.snake = new Snake(this.numOfTiles, () => {
      this.score++; // Update score when the snake eats food
    });

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
    this.food = new Food(this.numOfTiles);
    this.food.spawn(this.snake.head, this.snake.body); // Initial spawn of food
  }

  _initializeSubScreens() {
    this.subScreens[1] = new MainMenu();
    this.subScreens[2] = new Gameplay();
    this.subScreens[3] = new GameOver();
  }
}

class Snake {
  constructor(gridSize, updateScore) {
    this.gridSize = gridSize; // Number of tiles in the grid (grid is square => just one dimension needed)
    this.updateScore = updateScore; // Callback to update the game score when the snake eats food

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
    const food = game.food;
    if (this.head.x === food.position.x && this.head.y === food.position.y) {
      this.length++;
      this.updateScore();
      food.spawn(this.head, this.body); // Respawn food
    } else {
      this.body.shift(); // Remove the tail segment if the snake hasn't eaten
    }

    return true; // Snake is still alive
  }
}

class Food {
  constructor(gridSize) {
    this.gridSize = gridSize; // Number of tiles in the grid (grid is square => just one dimension needed)
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

let game = {};
let lastMoveTime = 0;
let moveInterval = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
  console.log('w,h', windowWidth, windowHeight);

  game = new Game();

  textSize(32);
  textAlign(CENTER, CENTER);

  angleMode(DEGREES);

  getRotationPermission();
}

const rotationThreshold = 20;

let rotationWorks = false;
let defaultRotationX = undefined;
let lastRotationPress = undefined;

function draw() {
  if (rotationWorks) {
    const adjRotX = rotationX - defaultRotationX;
    const adjRotY = rotationY;

    let rotationPress = undefined;

    const rotationDist = sqrt(adjRotX * adjRotX + adjRotY * adjRotY);

    if (rotationDist >= rotationThreshold) {
      if (adjRotX < 0 && -adjRotX > abs(adjRotY)) {
        rotationPress = 'up'
      } else if (adjRotX > 0 && adjRotX > abs(adjRotY)) {
        rotationPress = 'down'
      }
      if (adjRotY < 0 && -adjRotY > abs(adjRotX)) {
        rotationPress = 'left'
      } else if (adjRotY > 0 && adjRotY > abs(adjRotX)) {
        rotationPress = 'right'
      }

      if (rotationPress !== lastRotationPress) {
        if (rotationPress === 'up') {
          game.keyPressed(UP_ARROW);
        } else if (rotationPress === 'down') {
          game.keyPressed(DOWN_ARROW);
        } else if (rotationPress === 'left') {
          game.keyPressed(LEFT_ARROW);
        } else if (rotationPress === 'right') {
          game.keyPressed(RIGHT_ARROW);
        }
      }

      lastRotationPress = rotationPress;
    } else {
      lastRotationPress = undefined;
    }
  }

  game.draw(); // delegate draw call to the game object

  if (rotationWorks) {
    push();

    const adjRotX = rotationX - defaultRotationX;
    const adjRotY = rotationY;

    const rotationDist = sqrt(adjRotX * adjRotX + adjRotY * adjRotY);

    const cx = windowWidth / 2;
    const cy = windowHeight * 0.8;
    const r = 50;

    const dx = r * (adjRotX / rotationThreshold);
    const dy = r * (adjRotY / rotationThreshold);

    stroke(150);
    strokeWeight(5);
    noFill()
    circle(cx, cy, r * 2);

    noStroke();
    if (rotationDist >= rotationThreshold) {
      fill(100, 225, 150);
    } else {
      fill(150);
    }

    circle(cx + dy, cy + dx, r * 0.2);

    // if (lastRotationPress !== undefined) {
    //   text(lastRotationPress, windowWidth / 2, windowHeight * 0.8 - 25);
    // }
    // text(round(defaultRotationX), windowWidth / 2, windowHeight * 0.8);
    // text(round(rotationY), windowWidth / 2, windowHeight * 0.8 + 25);

    pop();
  }
}

// keyBoard events
function keyPressed() {
  game.keyPressed(keyCode); // delegate keyPress event to the game object
}

function touchEnded() {
  game.keyPressed(ENTER);
}

// toto nie je moj kod, niektore casti nechapem
// je odtialto: https://editor.p5js.org/ambikajo/sketches/5_HWA0Wzv
function getRotationPermission() {
  let button = createButton("klikni sem pls");
  button.style("font-size", "24px");
  button.center();
  button.mousePressed(requestAccess);
}

function requestAccess() {
  text('debug 1', windowWidth / 2, windowHeight * 0.1);
  DeviceOrientationEvent.requestPermission()
    .then(response => {
      text('debug 2 ' + response, windowWidth / 2, windowHeight * 0.3);
      if (response == 'granted') {
        rotationWorks = true;
        defaultRotationX = rotationX;
      } else {
        rotationWorks = false;
      }
    })
    .catch(console.error);

  this.remove();
}