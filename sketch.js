class ImageManager {
  constructor() {
    this.images = {};
  }

  preload(images) {
    for (const name of images) {
      const image = loadImage(`assets/images/${name}`,
        () => {
          console.info(`Image ${name} fully loaded!`);
          this.addImage(name, image);
        },
        err => console.warn(`Image ${name} load failed:`, err)
      );
    }
  }

  addImage(name, image) {
    if (this.images[name]) {
      console.warn(`Image "${name}" already exists. Overwriting.`);
    }
    this.images[name] = image;
  }

  getImage(name) {
    return this.images[name];
  }
}


class SfxManager {
  constructor() {
    this.sfx = {};
    this.volume = 100;
  }

  preload(sfx) {
    for (const name of sfx) {
      const soundEffect = loadSound(`assets/sounds/${name}`,
        () => {
          console.info(`🎵 ${name} fully loaded!`);
          this.addSfx(name, soundEffect);
        },
        err => console.warn(`🎵 ${name} load failed:`, err)
      );
    }
  }

  addSfx(name, sound) {
    if (this.sfx[name]) {
      console.warn(`Sound effect "${name}" already exists. Overwriting.`);
    }
    this.sfx[name] = sound;
  }
  playSfx(name) {
    if (this.sfx[name]) {
      this.sfx[name].play();
    } else {
      console.error(`Sound effect "${name}" does not exist.`);
    }
  }
  removeSfx(name) {
    if (this.sfx[name]) {
      delete this.sfx[name];
    } else {
      console.error(`Sound effect "${name}" does not exist.`);
    }
  }
}


class MusicManager {
  constructor() {
    this.music = {};
    this.volume = 100;
  }

  preload(music) {
    for (const name of music) {
      const sound = loadSound(`assets/music/${name}`,
        () => {
          console.info(`🎵 ${name} fully loaded!`);
          this.addMusic(name, sound);
        },
        err => console.warn(`🎵 ${name} load failed:`, err)
      );
    }
  }

  addMusic(name, sound) {
    if (this.music[name]) {
      console.warn(`Music "${name}" already exists. Overwriting.`);
    }
    this.music[name] = sound;
  }

  playMusic(name, loop = false) {
    if (this.music[name]) {
      if (!loop) {
        this.music[name].play();
      } else {
        this.music[name].loop();
      }
    } else {
      console.error(`Music "${name}" does not exist.`);
    }
  }
  
  pauseMusic(name) {
    if (this.music[name] && this.music[name].isPlaying()) {
      this.music[name].pause();
    } else {
      console.error(`Music "${name}" does not exist or is not playing.`);
    }
  }
  
  stopMusic(name) {
    if (this.music[name] && this.music[name].isPlaying()) {
      this.music[name].stop();
    } else {
      console.error(`Music "${name}" does not exist or is not playing.`);
    }
  }
}


class Screen {
  constructor(name) {
    this.name = name;
  }
  
  onActivation(properties) {};          // Method that should be called when the screen is becoming active
  onDeactivation() {};                  // Method that should be called when the screen is becoming inactive
  draw() {};                            // Method that handles drawing of the screen
  keyPressed(keyCode) {};               // Method that handles key presses 
  mousePressed() {};                    // Method that handles mouse presses
  
  // Note: You can add more custom methods as needed for your screens
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

  mousePressed() {
    this.activeScreen.mousePressed();
  }
}


class WebpageLoaded extends Screen {
  constructor() {
    super('webpageLoaded');
  }

  draw() {
    background('white');
    // imageMode(CENTER);
    image(
      imageManager.getImage('catFaceRight.png'),
      width/2-50, height/2-50,
      100, 100
    );
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(
      "Click to start!",
      width/2, height/2 + 75
    );
  }
  
  keyPressed(keyCode) {
    // saddly does not activate the user audio
    // this.mousePressed();
  }

  mousePressed() {
    screenManager.setActiveScreen('mainMenu'); // Transition to the main menu
  }
}

class MainMenu extends Screen {
  constructor() {
    super('mainMenu');
    this.options = ['Start game', 'Instructions', 'Credits', 'Exit'];
    this.optionSelected = 0; // Index of the currently selected option
  }

  onActivation() {
    musicManager.playMusic('mainMenu', true); // Play the main menu music in a loop
  }

  onDeactivation() {
    musicManager.stopMusic('mainMenu'); // Stop the main menu music when leaving the screen
  }
  
  selectOption() {
    switch (this.optionSelected) {
      case 0: // Start game
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
    this.game = new Game(this);
  }
  
  onActivation() {
    background('white');
    this.game.reset();
    musicManager.playMusic('bomba32', true); // Play the background music in a loop
  }
  
  onDeactivation() {
    musicManager.stopMusic('bomba32'); // Stop the background music when leaving the screen
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
  constructor(screen) {
    this.screen = screen;

    // game dimensions properties
    this.landscape = true, // Landscape mode (true) or portrait mode (false)
    this.size = 0, // Size of the game area (area is a square => just one dimension needed)
    this.offset = 0, // Offset for centering the game area
    this.numOfTiles = 0, // Number of tiles in the grid (grid is square => just one dimension needed)
    this.tileSize = 0, // Size of each tile in the grid
    
    // gameplay properties
    this.score = 0; // Player's score
    this.snake = null; // Snake object
    this.food = null; // Food object
    this.walls = null; // Walls object (not implemented yet)
    this.lastMoveTime = 0;
    this.moveInterval = 100;
    
    this.drug = null; // Drug object
    this.effect = null; // Current effect of the drug
  }

  reset() {
    const currentTime = millis();
    this.lastMoveTime = currentTime;
    this._initializeDimensions();
    this._initializeSnake();
    this._initializeFood();
    this._initializeDrug(currentTime);

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
    const currentTime = millis();
    // handle the drug effects
    if (this.snake.drugged) {
      if (this.snake.drugEaten === 'mdma') {
        background(Math.random()*255, Math.random()*255, Math.random()*255);
      }

      if (currentTime - this.snake.drugEatenTime > 5000) {
        this.snake.sober();
        console.info('The snake is sober now.');
        background('white'); // reset background
      }
    } else {
      this.drug.spawn(this.snake.head, this.snake.body, this.food.position, currentTime); // Try to spawn drug
    }
    
    if (currentTime - this.lastMoveTime > this.moveInterval) {
      this.lastMoveTime = currentTime;
      const alive = this.snake.move(); // Move the snake
      if (!alive) {
        this.over(); 
        return; // if you want to show going into the wall remove this return
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
        image(imageManager.getImage('catFaceRight.png'), this.offset+head.x*this.tileSize, head.y*this.tileSize, this.tileSize, this.tileSize);
      } else {
        image(imageManager.getImage('catFaceRight.png'), head.x*this.tileSize, this.offset+head.y*this.tileSize, this.tileSize, this.tileSize);
      }
      // draw food
      if (this.landscape) {
        circle(this.offset+this.food.position.x*this.tileSize+this.tileSize/2, this.food.position.y*this.tileSize+this.tileSize/2, this.tileSize)
      } else {
        circle(this.food.position.x*this.tileSize+this.tileSize/2, this.offset+this.food.position.y*this.tileSize+this.tileSize/2, this.tileSize);
      }
      // draw drug
      if (this.drug.spawned) {
        if (this.landscape) {
          image(imageManager.getImage('pixelArtMdma.png'), this.offset+this.drug.position.x*this.tileSize, this.drug.position.y*this.tileSize, this.tileSize, this.tileSize);
        } else {
          image(imageManager.getImage('pixelArtMdma.png'), this.drug.position.x*this.tileSize, this.offset+this.drug.position.y*this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }
  }

  drawWalls() {
    let gameGrid;
    strokeWeight(5);
    fill('white');
    if (this.landscape) {
      gameGrid = rect(this.offset, 0, this.size, this.size);
    } else {
      gameGrid = rect(0, this.offset, this.size, this.size); 
    }
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
  
  // must be called after this._initializeSnake() to correctly spawn the food!
  _initializeFood() {
    this.food = new Food(this);
    this.food.spawn(this.snake.head, this.snake.body); // Initial spawn of food
  }

  _initializeDrug(initialTime) {
    this.drug = new Drug(this, initialTime);
  }
}

class Snake {
  constructor(game) {
    this.game = game;
    this.gridSize = game.numOfTiles; // Number of tiles in the grid (grid is square => just one dimension needed)
    
    this.head = {};
    this.body = [];
    this.length = 0;

    // two properties to prevent possibility of snake trying to move in the opposite direction as he is currently moving
    this.direction = '';
    this.newDirection = '';

    this.drugged = false;
    this.drugEaten = null;
    this.drugEatenTime = 0;
  }

  move() {
    const newHead = {x: this.head.x, y: this.head.y};
    
    // console.log('direction', this.newDirection);
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

    // console.log('this.head.x', this.head.x);
    // console.log('this.gridSize', this.gridSize);

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
      sfxManager.playSfx('robloxEating'); // Play eating sound effect
      this.length++;
      this.game.updateScore(1);
      food.spawn(this.head, this.body); // Respawn food
    } else {
      this.body.shift(); // Remove the tail segment if the snake hasn't eaten
    }

    // Check for collision with drug
    const drug = this.game.drug;
    if (drug.spawned && this.head.x === drug.position.x && this.head.y === drug.position.y) {
      if (drug.type === 'mdma') { 
        sfxManager.playSfx('eatingMinecraft');
      }
      this.drugged = true;
      this.drugEaten = drug.type;
      this.drugEatenTime = millis();
      drug.spawned = false; // Remove the drug from the game area
    }

    return true; // Snake is still alive
  }

  sober() {
    this.drugged = false;
    this.drugEaten = null;
    this.drugEatenTime = 0;
  }
}

class Food {
  constructor(game) {
    this.game = game
    this.gridSize = game.numOfTiles; // Number of tiles in the grid (grid is square => just one dimension needed)
    this.position = {x: -1, y: -1}; // Position of the food in the grid
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

class Drug {
  constructor(game, initialTime = 0) {
    this.game = game;
    this.gridSize = game.numOfTiles; // Number of tiles in the grid (grid is square => just one dimension needed)
    this.position = {x: -1, y: -1}; // Position of the food in the grid
    this.type = null; // Type of drug (e.g., 'mdma', 'lsd', etc.)
    this.spawnInterval = 15000; // Interval to spawn the drug (in milliseconds)
    this.lastSpawnTime = initialTime;
    this.spawned = false;
  }

  spawn(snakeHead, snakeBody, foodPosition, currentTime) {
    if (this.spawned || currentTime - this.lastSpawnTime < this.spawnInterval) {
      return; // Not time to spawn yet
    }

    // Randomly place drug in the grid, ensuring it doesn't overlap with the snake or food
    do {
      this.position.x = Math.floor(Math.random() * this.gridSize);
      this.position.y = Math.floor(Math.random() * this.gridSize);
    } while ((this.position.x === snakeHead.x && this.position.y === snakeHead.y) ||
             snakeBody.some(segment => segment.x === this.position.x && segment.y === this.position.y) ||
             (this.position.x === foodPosition.x && this.position.y === foodPosition.y));
    
    this.spawned = true;
    this.type = this._randomDrugType();
    this.lastSpawnTime = currentTime;
  }

  _randomDrugType() {
    const drugTypes = ['mdma'];//, 'lsd', 'marihuana', 'mushrooms'];
    const randomIndex = Math.floor(Math.random() * drugTypes.length);
    return drugTypes[randomIndex];
  }
}


let imageManager;             // Global variable to manage images
let sfxManager, musicManager; // Global variables to manage sound effects and music
function preload() {
  const images = ['catFaceRight.png', 'pixelArtMdma.png'];
  imageManager = new ImageManager();
  imageManager.preload(images);
  
  soundFormats('mp3'); // supported formats
  const sfx = ['robloxEating', 'eatingMinecraft'];
  sfxManager = new SfxManager();
  sfxManager.preload(sfx);
  
  const music = ['bomba32', 'mainMenu'];
  musicManager = new MusicManager(); 
  musicManager.preload(music);
}


let canvas;
let screenManager; // Global variable to manage screens
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  console.info('Width =', width, 'Height =', height);
  console.info('User is an iphone -' + /iPhone/i.test(navigator.userAgent));
  console.info('User is an android -' + /Android/i.test(navigator.userAgent));
  console.info('User is a mobile phone -' + /Mobile/i.test(navigator.userAgent)); // didn't work with Ipad


  screenManager = new ScreenManager();
  screenManager.addScreen('webpageLoaded', new WebpageLoaded());
  screenManager.addScreen('mainMenu', new MainMenu());
  screenManager.addScreen('gameplay', new Gameplay());
  screenManager.addScreen('gameOver', new GameOver());
  screenManager.setActiveScreen('webpageLoaded');
  

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

// mouse events
function mousePressed() {
  screenManager.mousePressed();
}